from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import requests
import json
import os

from . import models, schemas
from .database import engine, get_db
from .recommender import TeamRoleRecommender

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AIPS Recommendation Service")
recommender = TeamRoleRecommender()

@app.get("/api/health/")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/recommend/", response_model=schemas.RecommendationResponse)
async def get_recommendation(
    request: schemas.RecommendationRequest,
    db: Session = Depends(get_db)
):
    try:
        # Get personality analysis from analysis service
        analysis_response = requests.post(
            f"{os.getenv('ANALYSIS_API_URL')}/api/analyze/",
            json={"text": request.text}
        )
        analysis_response.raise_for_status()
        analysis_data = analysis_response.json()

        # Extract MBTI and OCEAN scores
        mbti_type = analysis_data["mbti_type"]
        ocean_scores = analysis_data["ocean_scores"]

        # Get role recommendation
        recommended_role, confidence_score = recommender.recommend_role(
            mbti_type, ocean_scores
        )

        # Create recommendation record
        db_recommendation = models.Recommendation(
            user_id=request.user_id,
            mbti_type=mbti_type,
            ocean_scores=json.dumps(ocean_scores),
            recommended_role=recommended_role,
            confidence_score=confidence_score
        )
        db.add(db_recommendation)
        db.commit()
        db.refresh(db_recommendation)

        return {
            "recommended_role": recommended_role,
            "confidence_score": confidence_score,
            "explanation": recommender.get_role_explanation(recommended_role),
            "mbti_type": mbti_type,
            "ocean_scores": ocean_scores
        }

    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail="Analysis service unavailable")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendations/{user_id}", response_model=List[schemas.RecommendationHistory])
async def get_recommendation_history(
    user_id: int,
    db: Session = Depends(get_db)
):
    recommendations = db.query(models.Recommendation).filter(
        models.Recommendation.user_id == user_id
    ).order_by(models.Recommendation.created_at.desc()).all()
    
    return [
        {
            "id": rec.id,
            "mbti_type": rec.mbti_type,
            "ocean_scores": json.loads(rec.ocean_scores),
            "recommended_role": rec.recommended_role,
            "confidence_score": rec.confidence_score,
            "created_at": rec.created_at
        }
        for rec in recommendations
    ] 