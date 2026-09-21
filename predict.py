# pyrefly: ignore [missing-import]
import joblib
import pandas as pd
import time

def predict_score(input_data):
    """
    Predicts the average score given a dictionary of input features.
    
    Args:
        input_data (dict): Dictionary with keys corresponding to the features.
                           Expected keys: 'gender', 'race/ethnicity', 
                           'parental level of education', 'lunch', 
                           'test preparation course'
    Returns:
        float: Predicted average score.
    """
    start_time = time.time()
    
    try:
        model = joblib.load("model.joblib")
    except FileNotFoundError:
        print("Model file not found. Please run train_model.py first.")
        return None
        
    df = pd.DataFrame([input_data])
    
    prediction = model.predict(df)[0]
    
    end_time = time.time()
    print(f"Prediction made in {end_time - start_time:.4f} seconds")
    
    return prediction

if __name__ == "__main__":
    sample_input = {
        'gender': 'female',
        'race/ethnicity': 'group B',
        'parental level of education': "bachelor's degree",
        'lunch': 'standard',
        'test preparation course': 'none'
    }
    
    pred = predict_score(sample_input)
    if pred is not None:
        print(f"Predicted Average Score: {pred:.2f}")
