import logging

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from oracle.config import settings
from oracle.graph.graph import get_graph
from oracle.state.state import OracleState

logger = logging.getLogger(__name__)

app = FastAPI(title="ORACLE", version="0.1.0")


class AnalyzeRequest(BaseModel):
    """Request body for the ORACLE analysis endpoint."""
    query: str


@app.get("/health")
async def health() -> dict:
    """Health-check endpoint for production readiness monitoring."""
    return {"status": "ok"}


@app.get("/")
async def root() -> dict:
    return {"service": "ORACLE", "ready": True if settings.OPENAI_API_KEY else False}


@app.post("/analyze")
async def analyze(request: AnalyzeRequest) -> dict:
    """Run the ORACLE deliberation pipeline on a query."""
    try:
        state: OracleState = {
            "user_input": request.query,
            "scenario_analysis": {},
            "expert_opinions": {},
            "consensus": {},
            "iteration_count": 0,
            "max_iterations": 3,
            "needs_iteration": False,
            "judge_verdict": {},
            "explanation": {},
            "final_response": "",
            "messages": [],
        }
        graph = get_graph()
        result = await graph.ainvoke(state)
        return result
    except Exception as e:
        logger.exception("ORACLE analysis failed")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}") from e
