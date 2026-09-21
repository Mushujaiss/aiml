# EduPredict AI — Student Score Predictor

A full-stack ML application predicting student exam scores based on demographic and preparation factors.

## Architecture

```
Stitch UI Design
      ↓
Next.js App  →  FastAPI on Render  →  sklearn model (model.joblib)
      ↓
Vercel (hosting)
      ↓
Supabase (PostgreSQL — prediction history)
```

## Repo Structure

```
aiml/
├── data_pipeline.py         # Generates/loads the dataset
├── train_model.py           # Trains LR + RF, saves best model
├── predict.py               # Quick CLI prediction test
├── model.joblib             # Saved trained model (R² = 0.86)
├── StudentsPerformance.csv  # Synthetic training dataset
├── supabase_schema.sql      # Run in Supabase SQL Editor
│
├── backend/                 # FastAPI ML serving service (→ Render)
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── model.joblib
│
└── nextjs-app/              # Next.js 15 frontend (→ Vercel)
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx           # Predict page
    │   │   └── insights/page.tsx  # Insights + history page
    │   ├── components/
    │   │   └── BottomNav.tsx
    │   └── lib/
    │       ├── supabase.ts        # Supabase browser client
    │       └── predict.ts         # FastAPI client
    ├── .env.local             # Fill in your credentials
    └── vercel.json
```

## Setup

### 1. Train the Model (already done)
```bash
python train_model.py
# Outputs: model.joblib  (R² = 0.86)
```

### 2. Supabase Database
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/etlqfvzkuwblxkwpdbad) → SQL Editor
2. Run the contents of `supabase_schema.sql`
3. Copy your **Anon Key** from Project Settings → API

### 3. FastAPI Backend (Render)
1. Push `backend/` to GitHub
2. Create a new **Web Service** on [Render](https://render.com) using the `Dockerfile`
3. Set the `PORT` to `8000`
4. Note your service URL (e.g. `https://edupredict-api.onrender.com`)

### 4. Next.js Frontend (Vercel)
1. Fill in `nextjs-app/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://etlqfvzkuwblxkwpdbad.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
   NEXT_PUBLIC_PREDICT_API_URL=https://<your-render-url>/predict
   ```
2. Run locally:
   ```bash
   cd nextjs-app
   npm run dev
   ```
3. Deploy to Vercel:
   ```bash
   npx vercel --prod
   ```
   Set the three environment variables in Vercel Dashboard → Project Settings → Environment Variables.

## Model Evaluation

| Model | R² | MAE | RMSE |
|---|---|---|---|
| Linear Regression ✅ | 0.863 | 4.05 pts | 5.01 pts |
| Random Forest | 0.838 | 4.49 pts | 5.45 pts |

## Resume Summary

> Built a full-stack ML application with a **Next.js 15** frontend (UI designed via Google Stitch), **Supabase** for prediction history storage (PostgreSQL + RLS), a **FastAPI** model-serving backend on Render, and CI/CD deployment on **Vercel**. ML model achieved R² = 0.86.
