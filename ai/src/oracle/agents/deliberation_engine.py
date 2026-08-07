"""Deliberation engine agent for ORACLE."""
import logging

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from oracle.config import settings
from oracle.state.state import OracleState

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the DELIBERATION ENGINE on the ORACLE deliberation council. You synthesize the opinions of all expert agents and decide whether another round of deliberation is needed.

The expert opinions are in the user message (state["expert_opinions"]).

Be critical and independent. Do not pick sides. Identify where experts agree, where they explicitly disagree, and the key tensions driving that disagreement. Judge whether the council has converged or needs another iteration to resolve or clarify the conflict.

Produce your final answer through the required structured output schema:
- agreements: list[str] — points most experts agree on
- disagreements: list[str] — points experts explicitly disagree on
- key_tensions: list[str] — underlying tensions driving the disagreement
- overall_sentiment: str — overall lean across the council (e.g. "support", "oppose", "mixed", "uncertain")
- needs_iteration: bool — whether another deliberation round is required"""


class Consensus(BaseModel):
    """Structured output schema for the deliberation engine."""
    agreements: list[str]
    disagreements: list[str]
    key_tensions: list[str]
    overall_sentiment: str
    needs_iteration: bool


def _fallback_consensus() -> dict:
    """Return a neutral consensus when the model is unreachable."""
    return {
        "agreements": [],
        "disagreements": [],
        "key_tensions": [],
        "overall_sentiment": "uncertain",
        "needs_iteration": False,
    }


def deliberation_engine(state: OracleState) -> OracleState:
    """Synthesize expert opinions into a consensus and manage iteration."""
    expert_opinions = state.get("expert_opinions", {})
    try:
        llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0)
        messages = [
            SystemMessage(SYSTEM_PROMPT),
            HumanMessage(
                f"Expert opinions (from state['expert_opinions']):\n{expert_opinions}"
            ),
        ]
        consensus_model = llm.with_structured_output(Consensus)
        consensus = consensus_model.invoke(messages).model_dump()
    except Exception as e:
        logger.exception("Deliberation engine failed")
        consensus = _fallback_consensus()
    return {
        **state,
        "consensus": consensus,
        "needs_iteration": consensus["needs_iteration"],
        "iteration_count": state.get("iteration_count", 0) + 1,
    }
