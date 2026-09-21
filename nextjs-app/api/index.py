from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(title="EduPredict AI — ML Prediction API", version="1.0.0")

# CORS — allow Vercel frontend (and localhost for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten to your Vercel URL in production
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

# Load model once at startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")

@app.on_event("startup")
def load_model():
    global model
    model = joblib.load(MODEL_PATH)
    print(f"[EduPredict] Model loaded from {MODEL_PATH}")


class StudentProfile(BaseModel):
    gender: str
    race_ethnicity: str
    parental_education: str
    lunch: str
    test_prep: str


class PredictionResponse(BaseModel):
    predicted_score: float
    grade: str
    percentile: str


def score_to_grade(score: float) -> tuple[str, str]:
    if score >= 88:
        return "A+", "94th"
    if score >= 78:
        return "A-", "83rd"
    if score >= 65:
        return "B", "64th"
    return "C-", "38th"


@app.get("/")
def health():
    return {"status": "ok", "model": "loaded"}


@app.post("/predict", response_model=PredictionResponse)
def predict(profile: StudentProfile):
    try:
        df = pd.DataFrame([{
            "gender": profile.gender,
            "race/ethnicity": profile.race_ethnicity,
            "parental level of education": profile.parental_education,
            "lunch": profile.lunch,
            "test preparation course": profile.test_prep,
        }])
        prediction = float(model.predict(df)[0])
        grade, percentile = score_to_grade(prediction)
        return PredictionResponse(
            predicted_score=round(prediction, 2),
            grade=grade,
            percentile=percentile,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
