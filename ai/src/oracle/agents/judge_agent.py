"""Judge agent for ORACLE."""
import logging

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from oracle.config import settings
from oracle.state.state import OracleState

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the JUDGE AGENT on the ORACLE deliberation council. You weigh all expert opinions and the deliberation consensus to issue the final balanced verdict.

The expert opinions and consensus are in the user message (state["expert_opinions"] and state["consensus"]).

Be critical, impartial, and decisive. Do not defer to any single expert. Acknowledge dissenting views and trade-offs explicitly, then reach a balanced conclusion that maximizes overall benefit and minimizes harm.

Produce your final answer through the required structured output schema:
- verdict: str — the final decision (e.g. "approve", "approve with conditions", "reject")
- reasoning: str — transparent justification for the verdict
- trade_offs: list[str] — key trade-offs considered
- confidence: float — 0.0 to 1.0
- dissenting_views: list[str] — minority expert views and why they were weighed as they were
- final_recommendation: str — actionable summary of what should happen next"""


class JudgeVerdict(BaseModel):
    """Structured output schema for the judge agent."""
    verdict: str
    reasoning: str
    trade_offs: list[str]
    confidence: float
    dissenting_views: list[str]
    final_recommendation: str


def _fallback_verdict() -> dict:
    """Return a neutral verdict when the model is unreachable."""
    return {
        "verdict": "pending",
        "reasoning": "Verdict unavailable because the deliberation could not be completed.",
        "trade_offs": [],
        "confidence": 0.0,
        "dissenting_views": [],
        "final_recommendation": "Re-run the deliberation once the model is reachable.",
    }


def judge_agent(state: OracleState) -> OracleState:
    """Produce the final verdict from expert opinions and consensus."""
    expert_opinions = state.get("expert_opinions", {})
    consensus = state.get("consensus", {})
    try:
        llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0)
        messages = [
            SystemMessage(SYSTEM_PROMPT),
            HumanMessage(
                f"Expert opinions (from state['expert_opinions']):\n{expert_opinions}\n\n"
                f"Deliberation consensus (from state['consensus']):\n{consensus}"
            ),
        ]
        verdict_model = llm.with_structured_output(JudgeVerdict)
        verdict = verdict_model.invoke(messages).model_dump()
    except Exception as e:
        logger.exception("Judge agent failed")
        verdict = _fallback_verdict()
    return {**state, "judge_verdict": verdict}
