"use client";

import { useState, useCallback } from "react";
import { runPrediction, type StudentProfile, type PredictionResult } from "@/lib/predict";
import { createClient } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
type Preset = "baseline" | "prepGraduate" | "firstGen" | "maxSupport";

const PRESETS: Record<Preset, StudentProfile> = {
  baseline:     { gender: "female", race_ethnicity: "group C", parental_education: "some college",       lunch: "standard",    test_prep: "none"      },
  prepGraduate: { gender: "female", race_ethnicity: "group C", parental_education: "bachelor's degree",  lunch: "standard",    test_prep: "completed" },
  firstGen:     { gender: "male",   race_ethnicity: "group B", parental_education: "some high school",   lunch: "free/reduced",test_prep: "completed" },
  maxSupport:   { gender: "female", race_ethnicity: "group D", parental_education: "master's degree",    lunch: "standard",    test_prep: "completed" },
};

const PARENT_OPTIONS: StudentProfile["parental_education"][] = [
  "some high school", "high school", "some college",
  "associate's degree", "bachelor's degree", "master's degree",
];
const PARENT_LABELS: Record<string, string> = {
  "some high school": "Some HS", "high school": "High School", "some college": "Some College",
  "associate's degree": "Associate's", "bachelor's degree": "Bachelor's", "master's degree": "Master's",
};

function scoreToRisk(score: number) {
  if (score >= 88) return { label: "Exceptional Standing", color: "bg-[#6ffbbe] text-[#002113]", icon: "verified" };
  if (score >= 78) return { label: "On Track to Target",   color: "bg-[#6ffbbe] text-[#002113]", icon: "check_circle" };
  if (score >= 65) return { label: "Moderate Support Needed", color: "bg-[#e2dfff] text-[#0f0069]", icon: "help_outline" };
  return { label: "Intervention Advised", color: "bg-[#ffdad6] text-[#93000a]", icon: "warning" };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PredictPage() {
  const [profile, setProfile] = useState<StudentProfile>(PRESETS.prepGraduate);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<string>("—");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [activePreset, setActivePreset] = useState<Preset | null>("prepGraduate");

  const update = useCallback((patch: Partial<StudentProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((key: Preset) => {
    setProfile(PRESETS[key]);
    setActivePreset(key);
  }, []);

  const predict = useCallback(async () => {
    setLoading(true);
    const t0 = performance.now();
    try {
      const res = await runPrediction(profile);
      setLatency((performance.now() - t0).toFixed(0) + "ms");
      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      alert("Prediction error: " + msg);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const save = useCallback(async () => {
    if (!result) { alert("Run a prediction first!"); return; }
    setSaveStatus("saving");
    setSaveMessage("Connecting to Supabase...");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("predictions").insert([{
        gender: profile.gender,
        race_ethnicity: profile.race_ethnicity,
        parental_education: profile.parental_education,
        lunch: profile.lunch,
        test_prep: profile.test_prep,
        predicted_score: result.predicted_score,
        grade: result.grade,
        percentile: result.percentile,
      }]);
      if (error) throw error;
      setSaveStatus("saved");
      setSaveMessage("✅ Saved to Supabase!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown";
      setSaveStatus("error");
      setSaveMessage("❌ " + msg);
    }
  }, [profile, result]);

  // Derived attribution weights (heuristic matching training data)
  const prepPts   = profile.test_prep === "completed" ? 20 : 0;
  const lunchPts  = profile.lunch === "standard" ? 15 : 0;
  const parentPts = { "master's degree": 10, "bachelor's degree": 10, "associate's degree": 5, "some college": 5, "high school": 0, "some high school": 0 }[profile.parental_education] ?? 0;
  const circumference = 226.19;
  const score = result?.predicted_score ?? 0;
  const offset = result ? circumference - (score / 100) * circumference : circumference;
  const risk = result ? scoreToRisk(score) : null;

  return (
    <div className="flex flex-col gap-4 px-5 py-4 max-w-lg mx-auto w-full">

      {/* ── Score Hero Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-md flex flex-col gap-4">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#e2dfff] opacity-40 blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-[#6ffbbe] opacity-30 blur-xl pointer-events-none" />

        {/* Live badge + latency */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006c49] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#006c49]" />
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#464555]">Live Model Inference</span>
          </div>
          <div className="flex items-center gap-1 bg-[#eaedff] px-2 py-0.5 rounded-full">
            <span className="material-symbols-outlined text-[#3525cd] text-[14px]">bolt</span>
            <span className="text-[10px] text-[#131b2e]">{latency}</span>
          </div>
        </div>

        {/* Score + Ring */}
        <div className="flex items-center justify-between gap-4 z-10">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[40px] font-black text-[#131b2e] tracking-tight leading-none">
                {result ? score.toFixed(1) : "—"}
              </span>
              <span className="text-[18px] font-bold text-[#464555]">/ 100</span>
            </div>
            <p className="text-[11px] text-[#464555] mt-1">
              Confidence: <span className="font-bold text-[#3525cd]">{result ? "± 2.4 pts" : "—"}</span>
            </p>
          </div>
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="transparent" className="text-[#e2e7ff]" stroke="currentColor" strokeWidth="8" />
              <circle cx="44" cy="44" r="36" fill="transparent" className="text-[#3525cd] transition-all duration-700 ease-out" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[22px] font-black text-[#131b2e] leading-none">{result?.grade ?? "—"}</span>
              <span className="text-[10px] text-[#464555] mt-0.5">{result ? result.percentile + "th %" : "—"}</span>
            </div>
          </div>
        </div>

        {/* Risk pill */}
        {risk ? (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${risk.color} w-fit z-10`}>
            <span className="material-symbols-outlined text-[16px]">{risk.icon}</span>
            <span className="text-[12px] font-bold">{risk.label}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eaedff] text-[#464555] w-fit z-10">
            <span className="material-symbols-outlined text-[16px]">pending</span>
            <span className="text-[12px] font-bold">Select inputs & run prediction</span>
          </div>
        )}
      </div>

      {/* ── Quick Scenarios ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-bold text-[#131b2e]">Quick Scenarios</span>
          <span className="text-[10px] text-[#464555]">Tap to simulate</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
          {([["baseline", "Standard Baseline"], ["prepGraduate", "Prep Graduate ⭐"], ["firstGen", "First-Gen Student"], ["maxSupport", "High Intervention 🚀"]] as [Preset, string][]).map(([key, label]) => (
            <button key={key} onClick={() => applyPreset(key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all active:scale-95 ${activePreset === key ? "bg-[#3525cd] text-white" : "bg-[#e2e7ff] text-[#131b2e]"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Profile Form ── */}
      <div className="rounded-2xl bg-white p-5 shadow-md flex flex-col gap-4">
        <h2 className="text-[18px] font-bold text-[#131b2e]">Student Profile</h2>

        {/* Gender */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#464555] uppercase tracking-wide">Gender</label>
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#e2e7ff] gap-1">
            {(["female", "male"] as const).map((g) => (
              <button key={g} onClick={() => update({ gender: g })}
                className={`py-2 rounded-lg text-[12px] font-semibold capitalize transition-all ${profile.gender === g ? "bg-white text-[#3525cd] font-bold shadow-sm" : "text-[#464555]"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Parental Education */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#464555] uppercase tracking-wide">Parental Education</label>
          <div className="grid grid-cols-3 gap-1.5">
            {PARENT_OPTIONS.map((opt) => (
              <button key={opt} onClick={() => update({ parental_education: opt })}
                className={`py-2 px-1 rounded-lg text-center text-[10px] font-semibold transition-all ${profile.parental_education === opt ? "bg-[#3525cd] text-white shadow-sm" : "bg-[#e2e7ff] text-[#131b2e]"}`}>
                {PARENT_LABELS[opt]}
              </button>
            ))}
          </div>
        </div>

        {/* Lunch */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#464555] uppercase tracking-wide">Lunch Program</label>
          <div className="grid grid-cols-2 gap-2">
            {([["standard", "restaurant", "Standard Meal", "Full nutrition"], ["free/reduced", "health_and_safety", "Free / Reduced", "Subsidized"]] as const).map(([val, icon, title, sub]) => (
              <button key={val} onClick={() => update({ lunch: val })}
                className={`p-3 rounded-xl flex flex-col items-start gap-1 transition-all ${profile.lunch === val ? "bg-[#e2dfff] text-[#0f0069] font-bold shadow-sm" : "bg-[#e2e7ff] text-[#131b2e]"}`}>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  <span className="text-[12px] font-semibold">{title}</span>
                </div>
                <span className="text-[10px] opacity-70">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Test Prep */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-bold text-[#464555] uppercase tracking-wide">Test Preparation</label>
            <span className="text-[10px] bg-[#6ffbbe] text-[#002113] px-2 py-0.5 rounded-full font-bold">High Impact</span>
          </div>
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#e2e7ff] gap-1">
            {([["completed", "Completed ✨"], ["none", "None"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => update({ test_prep: val })}
                className={`py-2 rounded-lg text-[12px] font-semibold transition-all ${profile.test_prep === val ? "bg-white text-[#3525cd] font-bold shadow-sm" : "text-[#464555]"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Race/Ethnicity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#464555] uppercase tracking-wide" htmlFor="race">Demographic Group</label>
          <div className="relative">
            <select id="race" value={profile.race_ethnicity} onChange={(e) => update({ race_ethnicity: e.target.value as StudentProfile["race_ethnicity"] })}
              className="w-full h-12 px-3 rounded-xl bg-[#e2e7ff] text-[#131b2e] text-[12px] font-semibold appearance-none focus:outline-none focus:bg-[#dae2fd] transition-colors">
              {(["group A", "group B", "group C", "group D", "group E"] as const).map((g) => (
                <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-[#464555] text-[20px]">expand_more</span>
          </div>
        </div>
      </div>

      {/* ── Feature Attribution ── */}
      <div className="rounded-2xl bg-white p-5 shadow-md flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#3525cd] text-[20px]">analytics</span>
          <h3 className="text-[18px] font-bold text-[#131b2e]">Feature Attribution</h3>
        </div>
        {[
          { label: "Test Prep Completion", pts: prepPts, max: 25, color: "bg-[#006c49]", id: "prep" },
          { label: "Lunch Program",        pts: lunchPts, max: 25, color: "bg-[#3525cd]", id: "lunch" },
          { label: "Parental Education",   pts: parentPts, max: 15, color: "bg-[#5551c2]", id: "parent" },
        ].map(({ label, pts, max, color }) => (
          <div key={label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[12px] text-[#131b2e]">{label}</span>
              <span className="text-[12px] text-[#006c49] font-bold">{pts > 0 ? `+${pts.toFixed(1)} pts` : "0 pts"}</span>
            </div>
            <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
              <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, (pts / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col gap-2 pb-4">
        <button onClick={predict} disabled={loading}
          className="w-full h-12 rounded-xl bg-[#3525cd] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60">
          <span className="material-symbols-outlined text-[20px]">{loading ? "refresh" : "auto_fix_high"}</span>
          {loading ? "Running..." : "Run Prediction"}
        </button>
        <button onClick={save} disabled={saveStatus === "saving"}
          className="w-full h-12 rounded-xl bg-[#dae2fd] text-[#131b2e] text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#e2e7ff] active:scale-[0.99] transition-all disabled:opacity-60">
          <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
          Save to Supabase
        </button>
        {saveStatus !== "idle" && (
          <p className={`text-center text-[10px] font-semibold ${saveStatus === "saved" ? "text-[#006c49]" : saveStatus === "error" ? "text-[#ba1a1a]" : "text-[#464555]"}`}>
            {saveMessage}
          </p>
        )}
      </div>
    </div>
  );
}
