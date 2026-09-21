from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

# Load model relative to this file
model_path = os.path.join(os.path.dirname(__file__), "model.joblib")
try:
    model = joblib.load(model_path)
except Exception as e:
    model = None
    print("Error loading model:", e)

@app.route("/api/predict", methods=["POST"])
def predict():
    if not model:
        return jsonify({"error": "Model not loaded"}), 500
        
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    try:
        df = pd.DataFrame([data])
        prediction = model.predict(df)[0]
        return jsonify({"predicted_score": round(float(prediction), 2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Vercel needs this
def handler(event, context):
    return app(event, context)
