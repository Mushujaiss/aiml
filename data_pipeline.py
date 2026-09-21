import pandas as pd
import numpy as np
import os

DATA_FILE = "StudentsPerformance.csv"

def generate_synthetic_data(num_samples=1000):
    """Generates synthetic dataset if the real one is not available."""
    np.random.seed(42)
    
    genders = ['female', 'male']
    races = ['group A', 'group B', 'group C', 'group D', 'group E']
    parents_ed = ["bachelor's degree", 'some college', "master's degree", "associate's degree", 'high school', 'some high school']
    lunches = ['standard', 'free/reduced']
    prep_courses = ['none', 'completed']
    
    data = {
        'gender': np.random.choice(genders, num_samples),
        'race/ethnicity': np.random.choice(races, num_samples),
        'parental level of education': np.random.choice(parents_ed, num_samples),
        'lunch': np.random.choice(lunches, num_samples),
        'test preparation course': np.random.choice(prep_courses, num_samples),
    }
    
    # Base score simulation based loosely on synthetic correlations
    base_scores = np.random.normal(loc=55, scale=5, size=num_samples)
    
    # Adjustments
    adj_lunch = np.where(data['lunch'] == 'standard', 15, 0)
    adj_prep = np.where(data['test preparation course'] == 'completed', 20, 0)
    adj_gender = np.where(data['gender'] == 'female', 5, 0)
    adj_parents = np.zeros(num_samples)
    for i, edu in enumerate(data['parental level of education']):
        if edu in ["master's degree", "bachelor's degree"]:
            adj_parents[i] = 10
        elif edu in ["associate's degree", "some college"]:
            adj_parents[i] = 5
            
    # Deterministic component
    math_scores = np.clip(base_scores + adj_lunch + adj_prep + adj_gender + adj_parents + np.random.normal(0, 2, num_samples), 0, 100).astype(int)
    reading_scores = np.clip(base_scores + adj_lunch + adj_prep + adj_gender + adj_parents + np.random.normal(0, 2, num_samples), 0, 100).astype(int)
    writing_scores = np.clip(base_scores + adj_lunch + adj_prep + adj_gender + adj_parents + np.random.normal(0, 2, num_samples), 0, 100).astype(int)
    
    data['math score'] = math_scores
    data['reading score'] = reading_scores
    data['writing score'] = writing_scores
    
    df = pd.DataFrame(data)
    df.to_csv(DATA_FILE, index=False)
    print(f"Generated synthetic dataset: {DATA_FILE}")
    return df

def load_and_preprocess_data():
    """Loads the dataset and prepares the target feature."""
    if not os.path.exists(DATA_FILE):
        print(f"{DATA_FILE} not found. Generating synthetic data...")
        df = generate_synthetic_data()
    else:
        df = pd.read_csv(DATA_FILE)
    
    # Create the target variable: average_score
    df['average_score'] = df[['math score', 'reading score', 'writing score']].mean(axis=1)
    
    # We will predict average_score, so we shouldn't use the individual scores as features
    X = df.drop(columns=['math score', 'reading score', 'writing score', 'average_score'])
    y = df['average_score']
    
    return X, y

if __name__ == "__main__":
    X, y = load_and_preprocess_data()
    print("Features shape:", X.shape)
    print("Target shape:", y.shape)
    print("Sample features:\n", X.head())
