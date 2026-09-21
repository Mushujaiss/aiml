-- ============================================================
-- EduPredict AI — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- Project: etlqfvzkuwblxkwpdbad
-- ============================================================

-- Predictions history
CREATE TABLE IF NOT EXISTS predictions (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  gender              TEXT NOT NULL,
  race_ethnicity      TEXT NOT NULL,
  parental_education  TEXT NOT NULL,
  lunch               TEXT NOT NULL,
  test_prep           TEXT NOT NULL,
  predicted_score     FLOAT NOT NULL,
  grade               TEXT,
  percentile          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (required for all public-schema tables)
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Guest users can insert and read all predictions
CREATE POLICY "anon_insert" ON predictions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select" ON predictions
  FOR SELECT TO anon
  USING (true);

-- Authenticated users see only their own predictions
CREATE POLICY "auth_select_own" ON predictions
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "auth_insert_own" ON predictions
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS predictions_user_id_idx ON predictions (user_id);
CREATE INDEX IF NOT EXISTS predictions_created_at_idx ON predictions (created_at DESC);
