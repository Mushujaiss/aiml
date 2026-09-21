import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduPredict AI — Student Score Predictor",
  description:
    "ML-powered student exam score predictor. Explore how test prep, lunch program, parental education, and demographic factors influence academic performance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${manrope.variable} font-sans bg-[#faf8ff] text-[#131b2e] antialiased min-h-full flex flex-col`}
      >
        <header className="fixed top-0 w-full z-50 bg-[#faf8ff]/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3525cd] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">insights</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[18px] font-bold text-[#131b2e] leading-none">
                    EduPredict AI
                  </span>
                  <span className="bg-[#e2e7ff] text-[#3525cd] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    v1.4 · R² 0.86
                  </span>
                </div>
                <span className="text-[10px] text-[#464555] leading-tight">
                  Student Score Predictor
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006c49] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006c49]" />
              </span>
              <span className="text-[10px] text-[#464555]">Live</span>
            </div>
          </div>
        </header>
        <main className="flex-1 w-full pt-16 pb-20 flex flex-col">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
