"""Climate expert agent for ORACLE."""
import logging

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from oracle.config import settings
from oracle.state.state import OracleState
from oracle.tools import climate_tools

logger = logging.getLogger(__name__)

MAX_TOOL_ROUNDS = 2

SYSTEM_PROMPT = """You are the CLIMATE AGENT on the ORACLE deliberation council, an expert in climate science, environmental impact, emissions, and sustainability policy.

The scenario to analyze comes from state["scenario_analysis"] in the user message.

Be critical and independent. Do not defer to other experts. Quantify environmental risks, challenge weak assumptions, and only support a course of action when the evidence justifies it. Use the tools (get_weather_data, search_latest_data) to ground your analysis in real-world data when relevant.

Produce your final answer through the required structured output schema:
- analysis: str — detailed climate/environment analysis paragraph
- key_risks: list[str] — 3-5 risk bullets
- recommendations: list[str] — 3-5 actionable recommendations
- confidence: float — 0.0 to 1.0
- stance: str — "support" | "oppose" | "neutral"
- evidence_used: list[str] — sources or tool results you referenced"""


class ClimateOpinion(BaseModel):
    """Structured output schema for the climate agent."""
    analysis: str
    key_risks: list[str]
    recommendations: list[str]
    confidence: float
    stance: str
    evidence_used: list[str]


def _fallback_opinion(error: str) -> dict:
    """Return a neutral opinion when analysis fails."""
    return {
        "analysis": f"Climate analysis unavailable ({error}).",
        "key_risks": ["Unable to assess environmental risks."],
        "recommendations": ["Re-run deliberation once the model is reachable."],
        "confidence": 0.0,
        "stance": "neutral",
        "evidence_used": [],
    }


def climate_agent(state: OracleState) -> OracleState:
    """Analyze the scenario from a climate and environment perspective."""
    try:
        llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0)
        tool_model = llm.bind_tools(climate_tools)
        scenario = state.get("scenario_analysis", {})
        messages = [
            SystemMessage(SYSTEM_PROMPT),
            HumanMessage(f"Scenario (from state['scenario_analysis']):\n{scenario}"),
        ]
        response = tool_model.invoke(messages)
        for _ in range(MAX_TOOL_ROUNDS):
            if not response.tool_calls:
                break
            messages.append(response)
            for call in response.tool_calls:
                tool = next(t for t in climate_tools if t.name == call["name"])
                result = tool.invoke(call["args"])
                messages.append(
                    ToolMessage(content=str(result), tool_call_id=call["id"])
                )
            response = tool_model.invoke(messages)
        opinion_model = llm.with_structured_output(ClimateOpinion)
        opinion = opinion_model.invoke(messages).model_dump()
    except Exception as e:
        logger.exception("Climate agent failed")
        opinion = _fallback_opinion(str(e))
    return {
        **state,
        "expert_opinions": {**state.get("expert_opinions", {}), "climate": opinion},
    }
