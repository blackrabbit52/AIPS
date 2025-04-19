from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

class RecommendationRequest(BaseModel):
    user_id: int
    text: str

class OceanScores(BaseModel):
    openness: float
    conscientiousness: float
    extraversion: float
    agreeableness: float
    neuroticism: float

class RecommendationResponse(BaseModel):
    recommended_role: str
    confidence_score: float
    explanation: str
    mbti_type: str
    ocean_scores: OceanScores

class RecommendationHistory(BaseModel):
    id: int
    mbti_type: str
    ocean_scores: OceanScores
    recommended_role: str
    confidence_score: float
    created_at: datetime

    class Config:
        orm_mode = True 