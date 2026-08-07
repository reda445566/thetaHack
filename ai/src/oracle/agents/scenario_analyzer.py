"""Scenario analysis agent for ORACLE."""
import logging
from typing import Literal

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from oracle.config import settings
from oracle.state.state import OracleState
from oracle.tools import search_latest_data

logger = logging.getLogger(__name__)

MAX_TOOL_ROUNDS = 2

SYSTEM_PROMPT = """You are the SCENARIO ANALYZER on the ORACLE deliberation council. Your job is to turn the raw user input into a structured scenario that the expert agents can deliberate on.

The raw user input is in the user message (state["user_input"]).

Be precise and independent. Use the search_latest_data tool to enrich the scenario with relevant background context when it helps.

Extract into the required structured output schema:
- topic: str — the core subject of the decision
- domain: str — the main field(s) at stake (e.g. environment, economy, public health, technology, social policy)
- key_entities: list[str] — people, organizations, places, or systems directly involved
- complexity: str — "low" | "medium" | "high"
- context_summary: str — concise factual summary the expert council can deliberate on"""


class ScenarioAnalysis(BaseModel):
    """Structured output schema for the scenario analyzer."""
    topic: str
    domain: str
    key_entities: list[str]
    complexity: Literal["low", "medium", "high"]
    context_summary: str


def _fallback_analysis(user_input: str) -> dict:
    """Return a minimal scenario analysis when the model is unreachable."""
    return {
        "topic": user_input[:120],
        "domain": "general",
        "key_entities": [],
        "complexity": "medium",
        "context_summary": user_input,
    }


def scenario_analyzer(state: OracleState) -> OracleState:
    """Extract a structured scenario from the raw user input."""
    user_input = state.get("user_input", "")
    try:
        llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY, temperature=0)
        tool_model = llm.bind_tools([search_latest_data])
        messages = [
            SystemMessage(SYSTEM_PROMPT),
            HumanMessage(f"User input (from state['user_input']):\n{user_input}"),
        ]
        response = tool_model.invoke(messages)
        for _ in range(MAX_TOOL_ROUNDS):
            if not response.tool_calls:
                break
            messages.append(response)
            for call in response.tool_calls:
                result = search_latest_data.invoke(call["args"])
                messages.append(
                    ToolMessage(content=str(result), tool_call_id=call["id"])
                )
            response = tool_model.invoke(messages)
        analysis_model = llm.with_structured_output(ScenarioAnalysis)
        analysis = analysis_model.invoke(messages).model_dump()
    except Exception as e:
        logger.exception("Scenario analyzer failed")
        analysis = _fallback_analysis(user_input)
    return {**state, "scenario_analysis": analysis}
