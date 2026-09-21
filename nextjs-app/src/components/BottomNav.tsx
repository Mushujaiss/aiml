"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Predict", icon: "tune" },
  { href: "/insights", label: "Insights", icon: "bar_chart" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 w-full z-50 bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(19,27,46,0.05)]">
      <div className="h-16 px-2 grid grid-cols-2 items-center">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active
                  ? "text-[#3525cd] font-bold"
                  : "text-[#464555] hover:text-[#131b2e]"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {item.icon}
              </span>
              <span className="text-[10px] font-bold tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
