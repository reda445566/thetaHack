# ORACLE — Agent Rules & Architecture Guide

> Source of truth for AI agents. Read before writing code.

## Current State (read first)

The repo is an **architecture-only scaffold** (README confirms: no business logic,
RAG, memory, evaluation, or agent internals implemented yet). `ai/src/oracle/` has
the folder layout, placeholder classes, and a working FastAPI health endpoint —
but the design below is the **TARGET architecture**, and most files it names DO NOT
exist yet and must be built.

What exists today:
- `api/main.py` — FastAPI app with `/health` and `/` endpoints
- `config.py` — `Settings` (loads root `.env` and `ai/.env`)
- `state/state.py` — empty placeholder `State(BaseModel)` (NOT the `OracleState` below)
- `graph/graph.py` — `build_graph()` raises `NotImplementedError`
- `agents/` — empty placeholder classes: climate, economy, health, citizen, ethics, judge
- Every package has `__init__.py` + `package_info.py` (a `DESCRIPTION` string only)

## Layout

The real package root is **`ai/src/oracle/`** (source lives under `ai/`, alongside the venv) — NOT `src/oracle/`.

- Every new file goes inside `ai/src/oracle/` in the correct subfolder
- Never create files in the repo root except config files (`.env`, `requirements.txt`, etc.)
- Never add a new top-level folder without asking first
- Keep the `package_info.py` / `__init__.py` `DESCRIPTION` convention when adding packages

## Tech Stack (LOCKED — do not substitute)

| Layer | Technology |
|---|---|
| Orchestration | LangGraph (StateGraph) |
| LLM | LangChain + OpenAI GPT-4o (`gpt-4o`) |
| API | FastAPI |
| State | TypedDict (OracleState) |
| Tools | LangChain `@tool` decorator |
| External APIs | OpenWeatherMap, Tavily Search (planned, not wired yet) |
| Config | python-dotenv via `config.py` |

Never use: CrewAI, AutoGen, raw OpenAI SDK (use the LangChain wrapper), hardcoded API keys.

## Commands

```bash
# venv lives INSIDE ai/
python -m venv ai/.venv && source ai/.venv/bin/activate
pip install -r requirements.txt    # requirements.txt is at repo ROOT

# dev server — ai/src must be on PYTHONPATH
PYTHONPATH=ai/src uvicorn oracle.api.main:app --reload --port 8000
```

No test/lint/typecheck tooling is configured yet (no pytest.ini, pyproject, ruff, etc.).
Smoke-check imports with: `PYTHONPATH=ai/src python -c "import oracle.api.main"`.

## Gotchas

- `config.py` does `from pydantic import BaseSettings` — **pydantic v1 only**. `requirements.txt` pins nothing; a fresh `pip install` can pull pydantic v2 and break startup. Pin `pydantic<2` (or migrate to `pydantic-settings`) before trusting installs.
- `config.py` loads both `.env` (root) and `ai/.env` (ai preferred). Access secrets only via `config.settings`, never `os.environ` directly.
- `.env.example` currently defines only `OPENAI_API_KEY`; `OPENWEATHER_API_KEY` and `TAVILY_API_KEY` are planned for the tools but not yet in the example.

## Target Architecture (to build — DO NOT change the order)

```
scenario_analyzer
  → [parallel via Send()] climate, economy, health, citizen, ethics, scientist
  → deliberation_engine
  → [conditional] needs_iteration AND iteration_count < max_iterations? → loop back, else continue
  → judge_agent
  → explainability_agent
```

Agents to create: `scenario_analyzer`, `deliberation_engine`, `scientist_agent`,
`explainability_agent` (missing), plus real logic in the existing placeholder files.

### Shared state

Every agent: `def agent_name(state: OracleState) -> OracleState` — returns the full state
with only its own field updated; never mutate the input.

```python
class OracleState(TypedDict):
    user_input: str
    scenario_analysis: dict        # set by Scenario Analyzer
    expert_opinions: dict          # keyed by agent name
    consensus: dict                # set by Deliberation Engine
    iteration_count: int
    max_iterations: int            # default: 3
    needs_iteration: bool
    judge_verdict: dict
    explanation: dict
    final_response: str
    messages: list
```

### Expert output contract

Every expert agent returns exactly:

```python
{
    "analysis": str,               # detailed analysis paragraph
    "key_risks": list[str],        # 3-5 bullets
    "recommendations": list[str],  # 3-5 actionable
    "confidence": float,           # 0.0 to 1.0
    "stance": str,                 # "support" | "oppose" | "neutral"
    "evidence_used": list[str],    # sources or tool results referenced
}
```

### Tools (planned)

- `tools/weather_tool.py` → `get_weather_data` (Climate Agent)
- `tools/search_tool.py` → `search_latest_data` (all experts)

Rules: return structured dicts (not raw strings); handle API failure with a graceful fallback string; keys from `config.py` only.

## Style

- Python 3.11+, type hints + one-line docstring on every function
- No `print` — use `logging`; no TODO comments in final code
- One responsibility per agent file
- ORACLE is a deliberation council, not a chatbot/Q&A — never skip the deliberation step
