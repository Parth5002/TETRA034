"""Pydantic v2 schemas matching the NexusEd AI frontend JSON contract."""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class Node(BaseModel):
    """Force-graph node representing an academic module or industry skill."""

    id: str
    name: str
    group: int = Field(
        ...,
        description="1 = academic_module, 2 = industry_skill",
    )
    type: Literal["academic_module", "industry_skill"]
    val: int = 15
    gap_score: Optional[float] = None


class Link(BaseModel):
    """Force-graph edge between academic modules and industry skills."""

    source: str
    target: str
    relationship: Literal["COVERS", "MISSING_SKILL"]
    strength: float


class AIRecommendation(BaseModel):
    """Actionable curriculum update produced by Gemini."""

    summary: str
    actionable_update: str


class AnalysisResponse(BaseModel):
    """Full analysis payload consumed by the React force-graph UI."""

    nodes: List[Node]
    links: List[Link]
    ai_recommendation: AIRecommendation
    is_mock: bool = False


class AnalysisRequest(BaseModel):
    """Request body for syllabus gap analysis."""

    syllabus_text: Optional[str] = None
