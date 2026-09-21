export type StudentProfile = {
  gender: "female" | "male";
  race_ethnicity: "group A" | "group B" | "group C" | "group D" | "group E";
  parental_education:
    | "some high school"
    | "high school"
    | "some college"
    | "associate's degree"
    | "bachelor's degree"
    | "master's degree";
  lunch: "standard" | "free/reduced";
  test_prep: "none" | "completed";
};

export type PredictionResult = {
  predicted_score: number;
  grade: string;
  percentile: string;
};

export async function runPrediction(
  profile: StudentProfile
): Promise<PredictionResult> {
  const apiUrl = process.env.NEXT_PUBLIC_PREDICT_API_URL!;
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gender: profile.gender,
      race_ethnicity: profile.race_ethnicity,
      parental_education: profile.parental_education,
      lunch: profile.lunch,
      test_prep: profile.test_prep,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Prediction API error");
  }
  return res.json();
}
