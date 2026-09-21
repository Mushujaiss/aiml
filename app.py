import streamlit as st
import pandas as pd
from predict import predict_score

st.set_page_config(page_title="Student Score Predictor", layout="centered")

st.title("🎓 Student Score Predictor")
st.markdown("""
This app predicts a student's average exam score based on demographic and preparation factors.
Select the student's profile below to see the live prediction!
""")

st.sidebar.header("Student Profile")

# Categorical Inputs
gender = st.sidebar.selectbox("Gender", ['female', 'male'])
race = st.sidebar.selectbox("Race/Ethnicity", ['group A', 'group B', 'group C', 'group D', 'group E'])
parent_education = st.sidebar.selectbox(
    "Parental Level of Education", 
    ["bachelor's degree", 'some college', "master's degree", "associate's degree", 'high school', 'some high school']
)
lunch = st.sidebar.selectbox("Lunch Type", ['standard', 'free/reduced'])
test_prep = st.sidebar.selectbox("Test Preparation Course", ['none', 'completed'])

input_data = {
    'gender': gender,
    'race/ethnicity': race,
    'parental level of education': parent_education,
    'lunch': lunch,
    'test preparation course': test_prep
}

st.subheader("Selected Profile")
st.write(pd.DataFrame([input_data]))

# Make Prediction
prediction = predict_score(input_data)

st.markdown("---")
if prediction is not None:
    st.subheader("Predicted Average Score")
    st.metric(label="Score", value=f"{prediction:.2f} / 100")
    
    # Simple logic to add some color/insight based on the score
    if prediction >= 80:
        st.success("High expected performance!")
    elif prediction >= 60:
        st.info("Average expected performance.")
    else:
        st.warning("Needs improvement. Consider test prep courses or additional support.")
else:
    st.error("Model not found. Please train the model first by running `python train_model.py`.")
