import React, { useMemo, useState } from "react";
import OfficialLogo from "../components/OfficialLogo";
import useGameState from "../hooks/useGameState";

function Avatar({ name, tone = "blue" }) {
  const ring =
    tone === "pink"
      ? "border-pink-400/80 shadow-[0_0_14px_rgba(236,72,153,0.42)]"
      : tone === "gold"
      ? "border-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.48)]"
      : "border-blue-400/80 shadow-[0_0_14px_rgba(59,130,246,0.42)]";
  const initial = String(name || "?").trim().charAt(0).toUpperCase();

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-black/55 text-xl font-black text-white ${ring} 2xl:h-12 2xl:w-12 2xl:text-2xl`}
    >
      {initial}
    </div>
  );
}

function Medal({ place, medal }) {
  const color =
    medal === "gold"
      ? "border-yellow-200 bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-800 text-black shadow-[0_0_16px_rgba(250,204,21,0.55)]"
      : medal === "silver"
      ? "border-white bg-gradient-to-b from-white via-slate-300 to-slate-700 text-black shadow-[0_0_14px_rgba(226,232,240,0.40)]"
      : "border-orange-200 bg-gradient-to-b from-orange-200 via-orange-500 to-orange-900 text-black shadow-[0_0_14px_rgba(249,115,22,0.45)]";

  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xl font-black 2xl:h-12 2xl:w-12 2xl:text-2xl ${color}`}>
      {place}
    </div>
  );
}

function ScoreHeaderCard({ side, score }) {
  const isWomen = side === "women";
  const card = isWomen
    ? "justify-self-end border-pink-500/75 bg-[#160617]/88 text-pink-300 shadow-[0_0_26px_rgba(236,72,153,0.26),inset_0_0_24px_rgba(236,72,153,0.055)]"
    : "justify-self-start border-blue-500/75 bg-[#06142a]/88 text-blue-300 shadow-[0_0_26px_rgba(37,99,235,0.26),inset_0_0_24px_rgba(59,130,246,0.055)]";
  const icon = isWomen ? "\u2640" : "\u2642";
  const label = isWomen ? "MULHERES" : "HOMENS";
  const groupColor = isWomen
    ? {
        head: "from-pink-200 via-pink-400 to-pink-700",
        body: "from-pink-300 via-pink-600 to-pink-950",
        glow: "drop-shadow-[0_0_10px_rgba(236,72,153,0.62)]"
      }
    : {
        head: "from-blue-200 via-blue-400 to-blue-700",
        body: "from-blue-300 via-blue-600 to-blue-950",
        glow: "drop-shadow-[0_0_10px_rgba(59,130,246,0.62)]"
      };

  return (
    <div className={`flex h-[68px] w-full max-w-[300px] items-center justify-between rounded-xl border px-5 ${card}`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-black leading-none">{icon}</span>
        <div className="min-w-[92px] text-center">
          <div className="text-xl font-black uppercase leading-none tracking-wide">{label}</div>
          <div className="mt-1 text-lg font-black uppercase text-white">{score}</div>
        </div>
      </div>
      <div className={`relative h-10 w-14 ${groupColor.glow}`}>
        <span className={`absolute left-0 top-2 h-4 w-4 rounded-full bg-gradient-to-b ${groupColor.head}`} />
        <span className={`absolute right-0 top-2 h-4 w-4 rounded-full bg-gradient-to-b ${groupColor.head}`} />
        <span className={`absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full bg-gradient-to-b ${groupColor.head}`} />
        <span className={`absolute bottom-1 left-[-2px] h-6 w-6 rounded-t-full bg-gradient-to-b ${groupColor.body}`} />
        <span className={`absolute bottom-1 right-[-2px] h-6 w-6 rounded-t-full bg-gradient-to-b ${groupColor.body}`} />
        <span className={`absolute bottom-0 left-1/2 h-7 w-7 -translate-x-1/2 rounded-t-full bg-gradient-to-b ${groupColor.body}`} />
      </div>
    </div>
  );
}

function RankingPanel({ type, title, rows, onRowClick }) {
  const isPink = type === "pink";
  const panel = isPink
    ? "border-pink-400/90 bg-[#190517]/95 shadow-[0_0_34px_rgba(236,72,153,0.34),inset_0_0_42px_rgba(236,72,153,0.09)]"
    : "border-blue-500/75 bg-[#031020]/90 shadow-[0_0_28px_rgba(37,99,235,0.22),inset_0_0_34px_rgba(59,130,246,0.045)]";
  const text = isPink ? "text-pink-300 drop-shadow-[0_0_8px_rgba(236,72,153,0.55)]" : "text-blue-300";
  const rowStyle = isPink
    ? "border-pink-500/34 bg-[#190514]/76 shadow-[inset_0_0_24px_rgba(236,72,153,0.08),0_0_14px_rgba(236,72,153,0.10)]"
    : "border-white/8 bg-black/48 shadow-[inset_0_0_22px_rgba(0,0,0,0.48)]";

  return (
    <section className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border p-4 ${panel}`}>
      <div className={`mb-3 flex shrink-0 items-center justify-center gap-2 text-[21px] font-black uppercase tracking-wide ${text}`}>
        {isPink ? (
          <svg className="h-7 w-7 drop-shadow-[0_0_8px_rgba(236,72,153,0.75)]" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="15" cy="17" r="9" stroke="currentColor" strokeWidth="3" />
            <circle cx="15" cy="17" r="4" stroke="currentColor" strokeWidth="3" />
            <path d="M19 13L27 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M23 5H27V9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="text-[22px]">&#9889;</span>
        )}
        <span>{title}</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-3 gap-3">
        {rows.length ? (
          rows.map((row) => (
            <div
              key={`${row.place}-${row.name}`}
              className={`grid min-h-0 grid-cols-[48px_54px_minmax(0,1fr)_62px] items-center gap-3 overflow-hidden rounded-xl border px-3 ${rowStyle}`}
            >
              <Medal place={row.place} medal={row.medal} />
              <Avatar name={row.name} tone={row.place === 1 ? "gold" : isPink ? "pink" : "blue"} />
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => row.audit && onRowClick?.(row.audit)}
                  className={`block max-w-full truncate text-left text-[20px] font-black leading-none text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)] ${row.audit ? "cursor-pointer hover:text-yellow-200" : ""}`}
                >
                  {row.name}
                  {row.fastestAward && <span className="ml-1 text-yellow-300">&#9889;</span>}
                  {row.streakAward && <span className="ml-1 text-orange-300">&#128293;</span>}
                </button>
                <div className={`mt-1 truncate text-[13px] font-black leading-none ${text}`}>
                  {isPink ? "Total de acertos" : "Melhor tempo"}
                </div>
              </div>
              <div className={`text-right text-[30px] font-black leading-none ${text}`}>
                {isPink ? row.score : row.time}
              </div>
            </div>
          ))
        ) : (
          <div className={`flex min-h-0 items-center justify-center rounded-xl border px-3 text-sm font-black uppercase tracking-wide text-white/38 ${rowStyle}`}>
            Nenhum participante
          </div>
        )}
      </div>
    </section>
  );
}

function formatAuditTime(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(2)}s` : "--";
}

function RankingAuditModal({ audit, onClose }) {
  if (!audit) return null;

  const comparison = audit.comparison;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/72 px-6">
      <div className="w-full max-w-[760px] rounded-2xl border border-cyan-300/40 bg-[#050913]/96 p-6 text-white shadow-[0_0_42px_rgba(34,211,238,0.22)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Auditoria de Ranking</div>
            <div className="mt-1 text-3xl font-black uppercase">
              {audit.name}
              {audit.fastestAward && <span className="ml-2 text-yellow-300">&#9889;</span>}
              {audit.streakAward && <span className="ml-2 text-orange-300">&#128293;</span>}
            </div>
            <div className="mt-1 text-sm font-bold uppercase text-white/55">{audit.group}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/25 px-4 py-2 text-sm font-black uppercase text-white hover:bg-white/10"
          >
            Fechar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm font-bold">
          <AuditItem label="Acertos" value={audit.correct} />
          <AuditItem label="Erros" value={audit.errors} />
          <AuditItem label="Tempo medio" value={formatAuditTime(audit.averageTime)} />
          <AuditItem label="Melhor tempo" value={formatAuditTime(audit.bestTime)} />
          <AuditItem label="Respostas rapidas corretas" value={audit.fastCorrectCount} />
          <AuditItem label="Maior sequencia" value={audit.bestStreak} />
          <AuditItem label="Primeiro acerto registrado" value={formatAuditTime(audit.firstCorrectElapsed)} />
          <AuditItem label="Posicao atual" value={`${audit.position}º`} />
        </div>

        <div className="mt-4 rounded-xl border border-yellow-300/30 bg-yellow-950/18 p-4">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-yellow-200">Criterio decisivo</div>
          <div className="mt-1 text-xl font-black uppercase text-white">{audit.decisiveCriterion}</div>
        </div>

        {comparison && (
          <div className="mt-4 rounded-xl border border-pink-300/28 bg-pink-950/16 p-4">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-pink-200">Comparacao direta</div>
            <div className="mt-2 text-lg font-black uppercase text-white">
              {audit.name} x {comparison.name}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm font-bold">
              <AuditItem label="Acertos" value={`${audit.correct} x ${comparison.correct}`} />
              <AuditItem label="Velocidade" value={`${formatAuditTime(audit.averageTime)} x ${formatAuditTime(comparison.averageTime)}`} />
            </div>
            <div className="mt-3 text-sm font-black uppercase text-yellow-200">Empate detectado.</div>
            <div className="mt-1 text-base font-bold text-white/82">{comparison.result}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function AuditItem({ label, value }) {
  return (
    <div className="px-1 py-2">
      <div className="text-[11px] font-black uppercase tracking-wide text-white/45">{label}</div>
      <div className="mt-1 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function RunnerUpCard({ runnerUp }) {
  const isWaiting = !runnerUp?.group;
  const label = isWaiting ? "" : runnerUp.group;
  const score = runnerUp?.score ?? 0;

  return (
    <section className="relative flex min-h-0 flex-col items-stretch overflow-hidden rounded-2xl border border-slate-300/65 bg-[#070910] text-center shadow-[0_0_24px_rgba(226,232,240,0.16),inset_0_0_34px_rgba(148,163,184,0.055)]">
      <RunnerUpPodium score={score} label={label} />
    </section>
  );
}

function RunnerUpPodium({ score, label }) {
  return (
    <div className="relative h-full min-h-0 w-full flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,rgba(226,232,240,0.12),transparent_46%),linear-gradient(180deg,#111827_0%,#060813_58%,#03040a_100%)]">
      <svg className="absolute inset-x-0 bottom-0 h-[82%] w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="runnerUpPodiumSilver" x1="50" y1="8" x2="50" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f8fafc" />
            <stop offset="0.34" stopColor="#cbd5e1" />
            <stop offset="0.72" stopColor="#64748b" />
            <stop offset="1" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="runnerUpPodiumLight" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(255,255,255,0.18)" />
            <stop offset="0.36" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="0.74" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="1" stopColor="rgba(15,23,42,0.26)" />
          </linearGradient>
        </defs>
        <path
          d="M0 100V58C0 53 4 50 10 50H22L24 43V29C24 24 30 21 38 21H62C70 21 76 24 76 29V43L78 50H90C96 50 100 53 100 58V100Z"
          fill="url(#runnerUpPodiumSilver)"
          stroke="rgba(248,250,252,0.70)"
          strokeWidth="0.8"
        />
        <path
          d="M2 100V59C2 55 6 52 11 52H23L28 45V32C28 28 33 25 40 25H60C67 25 72 28 72 32V45L77 52H89C94 52 98 55 98 59V100Z"
          fill="url(#runnerUpPodiumLight)"
        />
      </svg>
      <div className="absolute left-1/2 top-[152px] z-20 h-11 w-[154px] -translate-x-1/2 rounded-b-full border-x border-b border-white/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(100,116,139,0.28)_44%,rgba(15,23,42,0.58)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]" />
      <div className="absolute left-1/2 top-[102px] z-30 flex h-[78px] w-[78px] -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(145deg,#ffffff_0%,#e2e8f0_42%,#94a3b8_72%,#475569_100%)] text-[42px] font-black text-[#0f172a] shadow-[0_0_28px_rgba(226,232,240,0.36),inset_0_2px_0_rgba(255,255,255,0.58),inset_0_-11px_18px_rgba(15,23,42,0.32)]">
        2
      </div>
      <div className="absolute left-1/2 top-[258px] z-30 -translate-x-1/2 text-[64px] font-black leading-none text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.28)]">
        {score}
      </div>
      <div className="absolute left-1/2 top-[318px] z-30 flex w-[150px] -translate-x-1/2 items-center justify-center gap-2 text-pink-300/92">
        <span className="h-px flex-1 bg-pink-400/70" />
        <span className="text-[15px] leading-none">&#9733;</span>
        <span className="h-px flex-1 bg-pink-400/70" />
      </div>
      {label && (
        <div className="absolute inset-x-5 bottom-10 z-30 truncate text-center text-[38px] font-black uppercase leading-none tracking-wide text-pink-200 drop-shadow-[0_0_16px_rgba(244,114,182,0.48)]">
          {label}
        </div>
      )}
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg
      className="h-[106px] w-[210px] drop-shadow-[0_0_24px_rgba(250,204,21,0.78)]"
      viewBox="0 0 220 150"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="grandFinalTrophyCup" x1="70" y1="22" x2="147" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7ad" />
          <stop offset="0.24" stopColor="#facc15" />
          <stop offset="0.55" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="grandFinalTrophyBase" x1="70" y1="112" x2="150" y2="146" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" />
          <stop offset="0.45" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#78350f" />
        </linearGradient>
      </defs>

      <path d="M72 35H46C45 58 56 74 79 78" stroke="url(#grandFinalTrophyCup)" strokeWidth="10" strokeLinecap="round" />
      <path d="M148 35H174C175 58 164 74 141 78" stroke="url(#grandFinalTrophyCup)" strokeWidth="10" strokeLinecap="round" />
      <path
        d="M70 24H150C149 74 135 97 110 97C85 97 71 74 70 24Z"
        fill="url(#grandFinalTrophyCup)"
        stroke="#fde68a"
        strokeWidth="3"
      />
      <path d="M86 31H137C135 70 126 88 110 88C94 88 88 70 86 31Z" fill="rgba(255,255,255,0.18)" />
      <path d="M109 55C114 60 117 64 117 70C117 76 113 80 110 80C107 80 103 76 103 70C103 64 106 60 109 55Z" stroke="#92400e" strokeWidth="2" opacity="0.55" />
      <path d="M101 96H119V119H101V96Z" fill="url(#grandFinalTrophyCup)" />
      <path d="M82 119H138L146 140H74L82 119Z" fill="url(#grandFinalTrophyBase)" stroke="#fde68a" strokeWidth="2" />
      <path d="M91 128H129" stroke="#fff7ad" strokeWidth="5" strokeLinecap="round" opacity="0.75" />

      <path d="M49 130C31 111 29 87 41 67" stroke="#d97706" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
      <path d="M171 130C189 111 191 87 179 67" stroke="#d97706" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
      {[0, 1, 2, 3, 4].map((leaf) => (
        <g key={`left-${leaf}`} transform={`translate(${42 - leaf * 3} ${119 - leaf * 11}) rotate(${-38 - leaf * 8})`}>
          <ellipse cx="0" cy="0" rx="4" ry="10" fill="#facc15" opacity="0.86" />
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((leaf) => (
        <g key={`right-${leaf}`} transform={`translate(${178 + leaf * 3} ${119 - leaf * 11}) rotate(${38 + leaf * 8})`}>
          <ellipse cx="0" cy="0" rx="4" ry="10" fill="#facc15" opacity="0.86" />
        </g>
      ))}
    </svg>
  );
}

function ChampionCard({ champion = "MULHERES", score = 52 }) {
  const isWaiting = champion === "AGUARDANDO";
  const championLabel = isWaiting ? "" : champion;

  return (
    <section className="relative flex min-h-0 flex-col items-stretch overflow-hidden rounded-2xl border-2 border-yellow-400 bg-[#E6B800] text-center shadow-[0_0_18px_rgba(230,184,0,0.24)]">
      <ChampionPodium score={score} label={championLabel} />
    </section>
  );
}

function ChampionPodium({ score, label }) {
  const MEDAL_SIZE = 88;
  const MEDAL_TOP = 26;
  const HEAD_WIDTH = 120;
  const HEAD_HEIGHT = 45;
  const HEAD_RADIUS = 999;
  const BODY_RADIUS = 4;
  const OUTER_SHOULDER_LEFT = 18;
  const OUTER_SHOULDER_RIGHT = 82;
  const OUTER_HEAD_LEFT = 32;
  const OUTER_HEAD_RIGHT = 68;
  const INNER_SHOULDER_LEFT = 30;
  const INNER_SHOULDER_RIGHT = 82;
  const INNER_HEAD_LEFT = 49;
  const INNER_HEAD_RIGHT = 69;

  const HEAD_TOP = MEDAL_TOP + 50;
  const medalFontSize = 46;
  const outerBodyPath = `M0 100V52C0 47 ${BODY_RADIUS} 44 10 44H${OUTER_SHOULDER_LEFT}L28 38V25C28 21 32 18 ${OUTER_HEAD_LEFT} 18H${OUTER_HEAD_RIGHT}C68 18 72 21 72 25V38L${OUTER_SHOULDER_RIGHT} 44H90C${100 - BODY_RADIUS} 44 100 47 100 52V100Z`;
  const innerBodyPath = `M2 100V53C2 49 ${BODY_RADIUS + 2} 46 11 46H${INNER_SHOULDER_LEFT}L31 39V28C31 24 34 21 ${INNER_HEAD_LEFT} 21H${INNER_HEAD_RIGHT}C66 21 69 24 69 28V39L${INNER_SHOULDER_RIGHT} 46H89C${100 - BODY_RADIUS - 2} 46 98 49 98 53V100Z`;

  return (
    <div className="relative h-full min-h-0 w-full flex-1 overflow-hidden bg-[linear-gradient(180deg,#8c5608_0%,#c28416_42%,#d8a11b_68%,#9b620e_100%)]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="championPodiumGold" x1="50" y1="8" x2="50" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f3c447" />
            <stop offset="0.45" stopColor="#dda11d" />
            <stop offset="1" stopColor="#bc760e" />
          </linearGradient>
          <linearGradient id="championPodiumLight" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(255,255,255,0.16)" />
            <stop offset="0.28" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="0.72" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="1" stopColor="rgba(70,34,4,0.18)" />
          </linearGradient>
        </defs>
        <path
          d={outerBodyPath}
          fill="url(#championPodiumGold)"
          stroke="rgba(254,243,199,0.72)"
          strokeWidth="0.9"
        />
        <path
          d={innerBodyPath}
          fill="url(#championPodiumLight)"
        />
      </svg>
      <div
        className="absolute left-1/2 z-20 -translate-x-1/2 border-x border-b border-yellow-50/28 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(112,62,8,0.32)_42%,rgba(44,25,5,0.66)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.20)]"
        style={{
          top: HEAD_TOP,
          width: HEAD_WIDTH,
          height: HEAD_HEIGHT,
          borderBottomLeftRadius: HEAD_RADIUS,
          borderBottomRightRadius: HEAD_RADIUS
        }}
      />
      <div
        className="absolute left-1/2 z-30 flex -translate-x-1/2 items-center justify-center rounded-full border-2 border-yellow-100 bg-[#E6B800] font-black text-[#1c1606]"
        style={{
          top: MEDAL_TOP,
          width: MEDAL_SIZE,
          height: MEDAL_SIZE,
          fontSize: medalFontSize
        }}
      >
        1
      </div>
      <div className="absolute left-1/2 top-[184px] z-30 -translate-x-1/2 text-[72px] font-black leading-none text-white">
        {score}
      </div>
      <div className="absolute left-1/2 top-[246px] z-30 flex w-[150px] -translate-x-1/2 items-center justify-center gap-2 text-yellow-100/92">
        <span className="h-px flex-1 bg-yellow-100/65" />
        <span className="text-[14px] leading-none">&#9733;</span>
        <span className="h-px flex-1 bg-yellow-100/65" />
      </div>
      {label && (
        <div className="absolute inset-x-5 bottom-10 z-30 truncate text-center text-[39px] font-black uppercase leading-none tracking-wide text-white">
          {label}
        </div>
      )}
    </div>
  );
}

function StatCard({ stat }) {
  const tone =
    stat.color === "purple"
      ? "border-purple-400/55 text-purple-300 shadow-[0_0_22px_rgba(168,85,247,0.24)]"
      : stat.color === "cyan"
      ? "border-cyan-400/55 text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.24)]"
      : stat.color === "gold"
      ? "border-yellow-500/80 text-yellow-300 shadow-[0_0_26px_rgba(245,158,11,0.34),inset_0_0_24px_rgba(245,158,11,0.06)]"
      : "border-blue-400/55 text-blue-300 shadow-[0_0_22px_rgba(59,130,246,0.24)]";

  return (
    <div className={`grid h-[64px] grid-cols-[56px_1fr] items-center gap-2 rounded-xl border bg-black/52 px-4 ${tone}`}>
      {stat.group ? (
        <div className="relative h-10 w-14 drop-shadow-[0_0_10px_rgba(168,85,247,0.62)]">
          <span className="absolute left-0 top-2 h-4 w-4 rounded-full bg-gradient-to-b from-purple-200 via-purple-400 to-purple-700" />
          <span className="absolute right-0 top-2 h-4 w-4 rounded-full bg-gradient-to-b from-purple-200 via-purple-400 to-purple-700" />
          <span className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full bg-gradient-to-b from-fuchsia-100 via-purple-400 to-purple-800" />
          <span className="absolute bottom-1 left-[-2px] h-6 w-6 rounded-t-full bg-gradient-to-b from-purple-300 via-purple-600 to-purple-900" />
          <span className="absolute bottom-1 right-[-2px] h-6 w-6 rounded-t-full bg-gradient-to-b from-purple-300 via-purple-600 to-purple-900" />
          <span className="absolute bottom-0 left-1/2 h-7 w-7 -translate-x-1/2 rounded-t-full bg-gradient-to-b from-fuchsia-200 via-purple-500 to-purple-950" />
        </div>
      ) : stat.fire ? (
        <FlameIcon idSuffix="stat" className="h-10 w-10 drop-shadow-[0_0_14px_rgba(245,158,11,0.72)]" />
      ) : (
        <div className="text-3xl leading-none">{stat.icon}</div>
      )}
      <div className="text-center">
        <div className={`text-[12px] font-black uppercase tracking-wide ${stat.group ? "text-purple-100" : stat.fire ? "text-yellow-200" : "text-white/88"}`}>
          {stat.label}
        </div>
        <div className={`mt-1 font-black leading-none ${
          stat.group
            ? "text-[28px] text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.55)]"
            : stat.fire
            ? "whitespace-nowrap text-[21px] text-yellow-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.72)]"
            : "text-[25px]"
        }`}>
          {stat.value}
        </div>
      </div>
    </div>
  );
}

function FlameIcon({ idSuffix = "main", className = "h-12 w-12" }) {
  const outerId = `grandFinalFireOuter-${idSuffix}`;
  const innerId = `grandFinalFireInner-${idSuffix}`;

  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M31 58C20.5 58 12 50.2 12 39.8c0-7.1 3.8-12.4 8.7-18.1 1.9 5.7 5.2 8.4 8.1 9.8-1.2-10.4 4.5-18.5 12.4-25.5.3 9.5 4.2 14.3 7.5 18.4C51.7 28 54 32.1 54 39.5 54 50.1 45.1 58 31 58Z"
        fill={`url(#${outerId})`}
      />
      <path
        d="M32 56c-6.4 0-11.3-4.8-11.3-11.1 0-4.3 2.4-7.6 5.2-11.1 1.2 3.6 3.3 5.3 5.3 6.2-.8-6.6 2.6-11.8 7.6-16.5.2 6 2.6 9.1 4.6 11.8 1.7 2.2 3.1 4.8 3.1 9.4C46.5 51.2 40.8 56 32 56Z"
        fill={`url(#${innerId})`}
      />
      <defs>
        <linearGradient id={outerId} x1="18" y1="8" x2="45" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde047" />
          <stop offset="0.48" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={innerId} x1="26" y1="26" x2="39" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7ad" />
          <stop offset="0.55" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StreakFlameBadge({ side, active }) {
  if (!active) return null;

  const positionClass = side === "men" ? "-right-3 top-1/2 -translate-y-1/2" : "-left-3 top-1/2 -translate-y-1/2";

  return (
    <div className={`absolute ${positionClass} z-20 flex h-11 w-11 items-center justify-center rounded-full border border-yellow-300/50 bg-black/68 shadow-[0_0_20px_rgba(245,158,11,0.42),inset_0_0_14px_rgba(245,158,11,0.10)]`}>
      <FlameIcon idSuffix={`streak-${side}`} className="h-8 w-8 drop-shadow-[0_0_10px_rgba(245,158,11,0.85)]" />
    </div>
  );
}

function DurationIcon() {
  return (
    <svg className="h-10 w-10 drop-shadow-[0_0_12px_rgba(34,211,238,0.55)]" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="25" r="16" fill="rgba(8,47,73,0.62)" stroke="#67e8f9" strokeWidth="3" />
      <path d="M18 5h12" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 9V5" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 16v10l7 4" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 12l-4 4M37 12l4 4" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="25" r="3" fill="#67e8f9" />
    </svg>
  );
}

function ComparisonBar({ menScore = 48, womenScore = 52, eventDuration = "00:00:00" }) {
  const totalScore = menScore + womenScore;
  const menPercent = totalScore ? Math.round((menScore / totalScore) * 100) : 0;
  const womenPercent = totalScore ? 100 - menPercent : 0;
  const menBarWidth = totalScore ? Math.max(menPercent, 8) : 50;
  const womenBarWidth = totalScore ? Math.max(womenPercent, 8) : 50;

  return (
    <section className="self-end rounded-2xl border border-pink-500/55 bg-black/62 px-5 py-1 shadow-[0_0_28px_rgba(236,72,153,0.14),inset_0_0_28px_rgba(59,130,246,0.03)]">
      <div className="grid grid-cols-[160px_1fr_54px_1fr_160px] items-center gap-3">
        <div className="flex items-center gap-3 text-cyan-300">
          <DurationIcon />
          <div>
            <div className="text-[15px] font-black uppercase leading-none text-white/70">DURACAO</div>
            <div className="mt-1 text-[22px] font-black uppercase leading-none text-cyan-200">{eventDuration}</div>
          </div>
        </div>
        <div className="relative flex h-[38px] items-center justify-end overflow-hidden rounded-l-2xl rounded-r-sm bg-white/5">
          <div
            className="relative flex h-full items-center justify-end overflow-hidden rounded-l-2xl rounded-r-sm border border-blue-200/35 bg-[linear-gradient(135deg,#0b5ee8_0%,#1684ff_46%,#2f6dff_100%)] px-5 text-2xl font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.26),0_0_24px_rgba(37,99,235,0.42),inset_0_2px_0_rgba(255,255,255,0.28),inset_0_-8px_16px_rgba(3,7,18,0.24)] transition-all duration-700"
            style={{ width: `${menBarWidth}%` }}
          >
            <span className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_9px,transparent_9px,transparent_22px)] opacity-45" />
            <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/18 to-transparent" />
            <span className="relative whitespace-nowrap drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]">{menPercent}%</span>
          </div>
        </div>
        <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-pink-400/55 bg-black text-base font-black text-white shadow-[0_0_18px_rgba(236,72,153,0.24)]">
          VS
        </div>
        <div className="relative flex h-[38px] items-center overflow-hidden rounded-l-sm rounded-r-2xl bg-white/5">
          <div
            className="relative flex h-full items-center overflow-hidden rounded-l-sm rounded-r-2xl border border-pink-200/35 bg-[linear-gradient(135deg,#e31978_0%,#f23a98_48%,#c41467_100%)] px-5 text-2xl font-black text-white shadow-[0_10px_24px_rgba(236,72,153,0.25),0_0_24px_rgba(236,72,153,0.42),inset_0_2px_0_rgba(255,255,255,0.28),inset_0_-8px_16px_rgba(3,7,18,0.24)] transition-all duration-700"
            style={{ width: `${womenBarWidth}%` }}
          >
            <span className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_9px,transparent_9px,transparent_22px)] opacity-45" />
            <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/18 to-transparent" />
            <span className="relative whitespace-nowrap drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]">{womenPercent}%</span>
          </div>
        </div>
        <div className="min-h-[38px] rounded-xl border border-white/8 bg-white/[0.025]" />
      </div>
    </section>
  );
}

function formatEventDuration(startedAt) {
  const start = Number(startedAt || 0);
  if (!start) return "00:00:00";

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
  const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getBestStreakSides(final = {}) {
  const bestStreak = Number(final.bestStreak || 0);
  const rows = Array.isArray(final.topCorrect) ? final.topCorrect : [];
  const bestRows = rows.filter((row) => Number(row.correct || 0) === bestStreak && bestStreak > 0);
  const groups = new Set(bestRows.map((row) => row.group));

  return {
    men: groups.has("HOMENS"),
    women: groups.has("MULHERES")
  };
}

function getRunnerUpGroup(menScore = 0, womenScore = 0) {
  const hasScores = menScore > 0 || womenScore > 0;
  if (!hasScores) return { group: "", score: 0 };

  if (menScore === womenScore) {
    return { group: "EMPATE", score: menScore };
  }

  return womenScore < menScore
    ? { group: "MULHERES", score: womenScore }
    : { group: "HOMENS", score: menScore };
}

function CrownIcon({ className = "mr-4 h-12 w-12 shrink-0 drop-shadow-[0_0_10px_rgba(250,204,21,0.65)]" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="grandFinalCrownGold" x1="10" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7ad" />
          <stop offset="0.38" stopColor="#facc15" />
          <stop offset="0.72" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <path
        d="M12 51h40l3-28-13 11-10-20-10 20L9 23l3 28Z"
        fill="url(#grandFinalCrownGold)"
        stroke="#fde68a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M16 55h32" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
      <circle cx="9" cy="21" r="4" fill="#fde047" />
      <circle cx="32" cy="12" r="4" fill="#fde047" />
      <circle cx="55" cy="21" r="4" fill="#fde047" />
      <path d="M18 45h28" stroke="#fff7ad" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

export default function GrandFinalScreen({ gameState: providedGameState }) {
  const [selectedAudit, setSelectedAudit] = useState(null);
  const liveGameState = useGameState();
  const gameState = providedGameState || liveGameState;
  const final = gameState.grandFinal || {};
  const auditByParticipant = useMemo(() => {
    const entries = Array.isArray(final.rankingAudit) ? final.rankingAudit : [];
    return new Map(entries.map((audit) => [`${audit.name}-${audit.group}`, audit]));
  }, [final.rankingAudit]);
  const menScore = final.menCorrect ?? 0;
  const womenScore = final.womenCorrect ?? 0;
  const hasScores = menScore > 0 || womenScore > 0;
  const champion = hasScores ? final.champion || (womenScore >= menScore ? "MULHERES" : "HOMENS") : "AGUARDANDO";
  const championScore = hasScores ? final.championScore ?? Math.max(menScore, womenScore) : 0;
  const bestStreakSides = getBestStreakSides(final);
  const eventDuration = formatEventDuration(gameState.activeEvent?.createdAt);
  const eventTitle =
    gameState.activeEvent?.name ||
    gameState.activeEvent?.eventName ||
    gameState.eventName ||
    "RESULTADO FINAL DO QUIZ";
  const runnerUpGroup = getRunnerUpGroup(menScore, womenScore);
  const finalFastest = (final.fastest || []).map((row, index) => ({
        place: row.place,
        name: row.name,
        time: row.time,
        audit: auditByParticipant.get(`${row.name}-${row.group}`),
        fastestAward: auditByParticipant.get(`${row.name}-${row.group}`)?.fastestAward,
        streakAward: auditByParticipant.get(`${row.name}-${row.group}`)?.streakAward,
        medal: index === 0 ? "gold" : index === 1 ? "silver" : "bronze"
      }));
  const finalAccuracy = (final.topCorrect || []).map((row, index) => ({
        place: row.place,
        name: row.name,
        score: row.correct,
        audit: auditByParticipant.get(`${row.name}-${row.group}`),
        fastestAward: row.fastestAward,
        streakAward: row.streakAward,
        medal: index === 0 ? "gold" : index === 1 ? "silver" : "bronze"
      }));
  const finalStats = [
    { label: "TOTAL DE PERGUNTAS", value: String(final.totalQuestions ?? gameState.totalQuestions ?? 0), icon: "\u25a4", color: "blue" },
    { label: "TOTAL DE VOTOS", value: String(final.totalVotes ?? 0), icon: "\u25cf\u25cf", color: "purple", group: true },
    { label: "M\u00c9DIA DE RESPOSTA", value: `${Number(final.averageTime ?? 0).toFixed(1)}s`, icon: "\u23f1", color: "cyan" },
    { label: "MAIOR SEQU\u00caNCIA", value: String(final.bestStreak ?? 0), color: "gold", fire: true }
  ];

  return (
    <div className="relative h-screen overflow-hidden bg-[#02050f] p-3 text-white">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 18% 32%, rgba(37,99,235,0.18), transparent 32%),
            radial-gradient(ellipse at 82% 32%, rgba(236,72,153,0.17), transparent 32%),
            radial-gradient(ellipse at 50% 58%, rgba(245,158,11,0.08), transparent 38%),
            linear-gradient(180deg, #050816 0%, #02040b 100%)
          `
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.50)_62%,rgba(0,0,0,0.94)_100%)]" />

      <main className="relative z-10 mx-auto grid h-[calc(100vh-24px)] max-w-[1880px] grid-rows-[78px_minmax(250px,1fr)_64px_58px_34px] gap-3 overflow-hidden rounded-2xl border border-white/20 bg-black/52 px-10 py-5 shadow-[0_0_90px_rgba(0,0,0,0.86),inset_0_0_90px_rgba(255,255,255,0.025)]">
        <header className="grid grid-cols-[0.82fr_1.14fr_1fr] items-center gap-4">
          <div className="relative">
            <ScoreHeaderCard side="men" score={menScore} />
            <StreakFlameBadge side="men" active={bestStreakSides.men} />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-[42px] font-black uppercase leading-none tracking-[0.04em] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              <CrownIcon />
              <span>PLACAR GERAL</span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-3 whitespace-nowrap text-[18px] font-black uppercase tracking-[0.10em] text-white/76">
              <span className="h-px w-20 bg-gradient-to-r from-transparent via-blue-400 to-yellow-300" />
              <span className="max-w-[560px] truncate">{eventTitle}</span>
              <span className="h-px w-20 bg-gradient-to-r from-yellow-300 via-pink-400 to-transparent" />
            </div>
          </div>
          <div className="relative">
            <ScoreHeaderCard side="women" score={womenScore} />
            <StreakFlameBadge side="women" active={bestStreakSides.women} />
          </div>
        </header>

        <section className="grid min-h-0 grid-cols-[0.82fr_1.14fr_1fr] gap-4">
          <RankingPanel type="blue" title="TOP3 DO PLACAR" rows={finalFastest} onRowClick={setSelectedAudit} />
          <ChampionCard champion={champion} score={championScore} />
          <RunnerUpCard runnerUp={runnerUpGroup} />
        </section>

        <section className="grid grid-cols-4 gap-5">
          {finalStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </section>

        <ComparisonBar menScore={menScore} womenScore={womenScore} eventDuration={eventDuration} />

        <footer className="relative mx-auto flex h-9 min-w-[560px] items-center justify-center gap-6 rounded-full border border-white/18 bg-[#06090f]/95 px-10 text-lg font-black uppercase tracking-wide text-white/72 shadow-[0_0_24px_rgba(0,0,0,0.8)]">
          <OfficialLogo mini className="absolute -left-[300px] top-1/2 -translate-y-1/2 opacity-88" />
          <span>&#9733;</span>
          <span>PARAB&Eacute;NS A TODOS OS PARTICIPANTES!</span>
          <span>&#9733;</span>
        </footer>
      </main>
      <RankingAuditModal audit={selectedAudit} onClose={() => setSelectedAudit(null)} />
    </div>
  );
}
