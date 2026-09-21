"use client";

import { useEffect, useState } from "react";
import { createClient, type Prediction } from "@/lib/supabase";

export default function InsightsPage() {
  const [history, setHistory] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (err) throw err;
      setHistory(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  return (
    <div className="flex flex-col gap-4 px-5 py-4 max-w-lg mx-auto w-full">

      {/* ── Benchmark Card ── */}
      <div className="rounded-2xl bg-white p-5 shadow-md flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#e2dfff] text-[#3525cd] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-[#131b2e]">Benchmark Evaluation</h2>
            <p className="text-[10px] text-[#464555]">5-fold CV · 1,000 Cohorts · Synthetic Dataset</p>
          </div>
          <span className="ml-auto bg-[#6cf8bb] text-[#00714d] px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]" /> Active Champion
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Linear Regression — Champion */}
          <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#3525cd]">Linear Reg.</span>
              <span className="bg-[#3525cd] text-white rounded px-1 text-[9px] font-bold uppercase">Top</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-bold text-[#131b2e]">0.863</span>
              <span className="text-[10px] text-[#464555]">R²</span>
            </div>
            <div className="flex flex-col gap-0.5 pt-1 text-[10px] text-[#464555]">
              <div className="flex justify-between"><span>MAE</span><span className="font-bold text-[#131b2e]">4.05 pts</span></div>
              <div className="flex justify-between"><span>RMSE</span><span className="font-bold text-[#131b2e]">5.01 pts</span></div>
            </div>
          </div>
          {/* Random Forest */}
          <div className="bg-white rounded-xl p-3 flex flex-col gap-1.5 border border-[#e2e7ff] opacity-80">
            <span className="text-[12px] font-bold text-[#464555]">Random Forest</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-bold text-[#131b2e]">0.838</span>
              <span className="text-[10px] text-[#464555]">R²</span>
            </div>
            <div className="flex flex-col gap-0.5 pt-1 text-[10px] text-[#464555]">
              <div className="flex justify-between"><span>MAE</span><span className="font-bold text-[#131b2e]">4.49 pts</span></div>
              <div className="flex justify-between"><span>RMSE</span><span className="font-bold text-[#131b2e]">5.45 pts</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SHAP Waterfall ── */}
      <div className="rounded-2xl bg-white p-5 shadow-md flex flex-col gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-[#131b2e]">SHAP Value Attribution</h2>
          <p className="text-[10px] text-[#464555]">Local contributions to avg score (M+R+W)/3</p>
        </div>
        <div className="bg-[#f2f3ff] rounded-xl p-3">
          <p className="text-[10px] text-[#464555] mb-2">Base Value E[f(x)] = <span className="font-bold text-[#131b2e]">67.7 pts</span></p>
          <svg className="w-full h-36 text-[#131b2e]" fill="none" viewBox="0 0 320 130" xmlns="http://www.w3.org/2000/svg">
            <line stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.2" x1="70" x2="70" y1="5" y2="125" />
            <text fill="currentColor" fontSize="9" x="73" y="14">Base: 67.7</text>
            <g><text fill="currentColor" fontSize="10" x="5" y="34">Prep: Done</text><rect fill="#006c49" height="14" rx="3" width="65" x="70" y="22" /><text fill="#006c49" fontSize="10" fontWeight="bold" x="140" y="33">+8.4</text></g>
            <g><text fill="currentColor" fontSize="10" x="5" y="58">Lunch: Std</text><rect fill="#006c49" height="14" rx="3" width="46" x="135" y="46" /><text fill="#006c49" fontSize="10" fontWeight="bold" x="186" y="57">+5.8</text></g>
            <g><text fill="currentColor" fontSize="10" x="5" y="82">Parent: BSc</text><rect fill="#006c49" height="14" rx="3" width="32" x="181" y="70" /><text fill="#006c49" fontSize="10" fontWeight="bold" x="218" y="81">+4.1</text></g>
            <g><text fill="currentColor" fontSize="10" x="5" y="106">Gender: F</text><rect fill="#006c49" height="14" rx="3" width="18" x="213" y="94" /><text fill="#006c49" fontSize="10" fontWeight="bold" x="236" y="105">+2.3</text></g>
            <line stroke="#3525cd" strokeDasharray="4 2" strokeWidth="1.5" x1="232" x2="232" y1="5" y2="125" />
            <text fill="#3525cd" fontSize="9" x="234" y="14">Pred: 88.3</text>
          </svg>
        </div>
      </div>

      {/* ── Prediction History ── */}
      <div className="rounded-2xl bg-white p-5 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3525cd] text-[20px]">history</span>
            <h2 className="text-[18px] font-bold text-[#131b2e]">Recent Predictions</h2>
          </div>
          <button onClick={loadHistory} className="text-[#3525cd] text-[12px] font-bold flex items-center gap-1 hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined text-[16px]">refresh</span> Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-[12px] text-[#464555] text-center py-6">Loading...</p>
        ) : error ? (
          <p className="text-[12px] text-[#ba1a1a] text-center py-4">{error}</p>
        ) : history.length === 0 ? (
          <p className="text-[12px] text-[#464555] text-center py-6">No predictions saved yet. Run one and save it!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((row) => (
              <div key={row.id} className="flex items-center justify-between p-3 bg-[#f2f3ff] rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-bold text-[#131b2e]">
                    {row.gender} · {row.lunch} · {row.test_prep}
                  </span>
                  <span className="text-[10px] text-[#464555]">
                    {row.parental_education} · {new Date(row.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[22px] font-black text-[#131b2e]">
                    {parseFloat(String(row.predicted_score)).toFixed(1)}
                  </span>
                  <span className="text-[10px] bg-[#e2dfff] text-[#3525cd] px-1.5 py-0.5 rounded-full font-bold">
                    {row.grade ?? "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
