import React from "react";

export default function OfficialLogo({ subtitle, compact = false, mini = false, className = "" }) {
  const titleSize = mini ? "text-[13px]" : compact ? "text-[18px]" : "text-[24px]";
  const iconSize = mini ? "h-7 w-8" : compact ? "h-8 w-10" : "h-9 w-11";
  const svgSize = mini ? "h-5 w-6" : compact ? "h-6 w-8" : "h-7 w-9";
  const dotSize = mini ? "text-[7px]" : "text-[9px]";
  const meSize = mini ? "text-[9px]" : "text-[12px]";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex ${iconSize} items-center justify-center rounded-xl border border-blue-500/45 bg-blue-950/45 text-blue-300 shadow-[0_0_18px_rgba(59,130,246,0.3)]`}>
        <svg className={svgSize} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="7" width="18" height="11" rx="4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M8 12h3M9.5 10.5v3M8 7l1-2h6l1 2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <circle cx="16.5" cy="11.5" r=".8" fill="currentColor" />
          <circle cx="18.5" cy="14" r=".8" fill="currentColor" />
        </svg>
      </div>
      <div>
        <div className={`${titleSize} font-black uppercase leading-none`}>
          <span className="text-blue-400">GAME</span>{" "}
          <span className="text-pink-400">SHOW</span>
          <span className="-ml-0.5 inline-flex items-baseline text-white/60">
            <span className={dotSize}>.</span>
            <span className={`inline-block -translate-y-[1px] skew-x-[-7deg] ${meSize} font-black lowercase italic`}>
              me
            </span>
          </span>
        </div>
        {subtitle && (
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/66">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
