import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type Prediction = {
  id: string;
  gender: string;
  race_ethnicity: string;
  parental_education: string;
  lunch: string;
  test_prep: string;
  predicted_score: number;
  grade: string | null;
  percentile: string | null;
  created_at: string;
};
