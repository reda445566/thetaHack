"""State models for ORACLE.

Define global state representations used by agents and the graph.
"""
from typing import TypedDict, Annotated
import operator


class OracleState(TypedDict):
    user_input: str
    scenario_analysis: dict
    expert_opinions: Annotated[dict, operator.or_]
    consensus: dict
    iteration_count: int
    max_iterations: int
    needs_iteration: bool
    judge_verdict: dict
    explanation: dict
    final_response: str
    messages: list
