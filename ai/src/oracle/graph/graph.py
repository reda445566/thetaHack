"""LangGraph graph definition for ORACLE.

Orchestrates the deliberation council: scenario analysis, parallel expert
opinions, deliberation with iteration, final judge verdict, and explanation.
"""
import logging

from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, Send

from oracle.agents.citizen_agent import citizen_agent
from oracle.agents.climate_agent import climate_agent
from oracle.agents.deliberation_engine import deliberation_engine
from oracle.agents.economy_agent import economy_agent
from oracle.agents.ethics_agent import ethics_agent
from oracle.agents.health_agent import health_agent
from oracle.agents.judge_agent import judge_agent
from oracle.agents.scenario_analyzer import scenario_analyzer
from oracle.agents.scientist_agent import scientist_agent
from oracle.state.state import OracleState

logger = logging.getLogger(__name__)

EXPERTS = [
    climate_agent,
    economy_agent,
    health_agent,
    citizen_agent,
    ethics_agent,
    scientist_agent,
]

EXPERT_NODES = {
    agent.__name__: {
        "agent": agent,
        "opinion_key": agent.__name__.replace("_agent", ""),
    }
    for agent in EXPERTS
}


def fan_out(state: OracleState) -> Command:
    """Fan out to all expert agents in parallel via Send."""
    return Command(goto=[Send(name, state) for name in EXPERT_NODES])


def _make_expert_node(name: str, agent):
    """Wrap an expert agent to return only its own opinion for parallel merge."""
    opinion_key = EXPERT_NODES[name]["opinion_key"]

    def expert_node(state: OracleState) -> dict:
        result = agent(state)
        return {"expert_opinions": {opinion_key: result["expert_opinions"][opinion_key]}}

    expert_node.__name__ = name
    return expert_node


def should_continue(state: OracleState) -> str:
    """Route back to the experts when another deliberation round is needed."""
    if state["needs_iteration"] and state["iteration_count"] < state["max_iterations"]:
        return "fan_out"
    return "judge_agent"


def explainability_agent(state: OracleState) -> OracleState:
    """Format the judge verdict and consensus into the final response."""
    verdict = state.get("judge_verdict", {})
    consensus = state.get("consensus", {})
    sections = [
        f"Verdict: {verdict.get('verdict', 'N/A')}",
        f"Confidence: {verdict.get('confidence', 0.0):.0%}",
        "",
        "Reasoning:",
        verdict.get("reasoning", ""),
        "",
        "Trade-offs:",
        *[f"- {item}" for item in verdict.get("trade_offs", [])],
        "",
        "Dissenting views:",
        *[f"- {item}" for item in verdict.get("dissenting_views", [])],
        "",
        "Final recommendation:",
        verdict.get("final_recommendation", ""),
        "",
        "Council consensus:",
        *[f"- {item}" for item in consensus.get("agreements", [])],
    ]
    return {**state, "final_response": "\n".join(sections)}


def build_graph():
    """Construct and compile the ORACLE LangGraph."""
    builder = StateGraph(OracleState)
    builder.add_node("scenario_analyzer", scenario_analyzer)
    builder.add_node("fan_out", fan_out)
    for name, entry in EXPERT_NODES.items():
        builder.add_node(name, _make_expert_node(name, entry["agent"]))
    builder.add_node("deliberation_engine", deliberation_engine)
    builder.add_node("judge_agent", judge_agent)
    builder.add_node("explainability_agent", explainability_agent)

    builder.add_edge(START, "scenario_analyzer")
    builder.add_edge("scenario_analyzer", "fan_out")
    builder.add_edge("fan_out", "deliberation_engine")
    builder.add_conditional_edges(
        "deliberation_engine",
        should_continue,
        {"fan_out": "fan_out", "judge_agent": "judge_agent"},
    )
    builder.add_edge("judge_agent", "explainability_agent")
    builder.add_edge("explainability_agent", END)

    return builder.compile()


_graph = None


def get_graph():
    """Return the compiled ORACLE graph, building it once on first call."""
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


__all__ = ["build_graph", "get_graph"]
