import { useEffect, useMemo, useState } from "react";
import OfficialLogo from "../components/OfficialLogo";
import useGameState from "../hooks/useGameState";

const AUTO_STAGE_FLOW = [
  { stage: "waiting", duration: 3200 },
  { stage: "third", duration: 4300 },
  { stage: "second", duration: 4300 },
  { stage: "first", duration: 5200 },
  { stage: "podium", duration: 999999 }
];

const FALLBACK_TOP = [
  { place: 1, name: "Equipe Vermelha", score: 247 },
  { place: 2, name: "Equipe Azul", score: 214 },
  { place: 3, name: "Equipe Verde", score: 182 }
];

const MEDAL_STYLE = {
  first: {
    rank: "1",
    label: "CAMPEAO GERAL",
    place: "1o LUGAR",
    tone: "gold",
    gradient: "from-yellow-200 via-amber-400 to-yellow-700",
    glow: "rgba(250,204,21,0.68)",
    title: "text-amber-200"
  },
  second: {
    rank: "2",
    label: "2o LUGAR",
    place: "2o LUGAR",
    tone: "silver",
    gradient: "from-white via-slate-200 to-slate-500",
    glow: "rgba(226,232,240,0.52)",
    title: "text-slate-100"
  },
  third: {
    rank: "3",
    label: "3o LUGAR",
    place: "3o LUGAR",
    tone: "bronze",
    gradient: "from-orange-200 via-orange-500 to-amber-900",
    glow: "rgba(251,146,60,0.56)",
    title: "text-orange-200"
  }
};

export default function Top3CeremonyScreen({ gameState: providedGameState }) {
  const liveGameState = useGameState();
  const gameState = providedGameState || liveGameState;
  const [stage, setStage] = useState("waiting");

  const topThree = useMemo(() => buildTopThree(gameState), [gameState]);
  const currentParticipant = getStageParticipant(stage, topThree);
  const style = getStageStyle(stage);

  useEffect(() => {
    const timers = [];
    let elapsed = 0;

    AUTO_STAGE_FLOW.forEach((item) => {
      timers.push(setTimeout(() => setStage(item.stage), elapsed));
      elapsed += item.duration;
    });

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-[#02030a] text-white">
      <CeremonyBackground tone={style.tone} />

      <main className="relative z-10 mx-auto flex h-screen max-w-[1920px] flex-col px-12 py-8">
        <header className="pointer-events-none absolute left-10 top-8 z-20">
          <OfficialLogo compact subtitle="Cerimonia Top 3" />
        </header>

        <section className="relative flex min-h-0 flex-1 items-center justify-center">
          {stage === "podium" ? (
            <PodiumFinal topThree={topThree} />
          ) : (
            <RevealStage stage={stage} participant={currentParticipant} style={style} />
          )}
        </section>
      </main>
    </div>
  );
}

function buildTopThree(gameState) {
  const rows = Array.isArray(gameState?.grandFinal?.topCorrect) ? gameState.grandFinal.topCorrect : [];
  const normalizedRows = rows
    .filter((row) => row?.name)
    .map((row, index) => ({
      place: Number(row.place || index + 1),
      name: row.name,
      score: Number(row.correct ?? row.score ?? 0)
    }))
    .sort((a, b) => a.place - b.place)
    .slice(0, 3);

  return normalizedRows.length ? normalizedRows : FALLBACK_TOP;
}

function getStageParticipant(stage, topThree) {
  if (stage === "third") return topThree[2] || FALLBACK_TOP[2];
  if (stage === "second") return topThree[1] || FALLBACK_TOP[1];
  if (stage === "first") return topThree[0] || FALLBACK_TOP[0];
  return null;
}

function getStageStyle(stage) {
  if (stage === "third") return MEDAL_STYLE.third;
  if (stage === "second") return MEDAL_STYLE.second;
  if (stage === "first") return MEDAL_STYLE.first;
  return MEDAL_STYLE.first;
}

function CeremonyBackground({ tone }) {
  const particles = Array.from({ length: 56 }, (_, index) => index);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.14), transparent 18%),
            radial-gradient(ellipse at 50% 52%, rgba(250,204,21,0.24), transparent 30%),
            radial-gradient(ellipse at 22% 38%, rgba(37,99,235,0.24), transparent 30%),
            radial-gradient(ellipse at 78% 38%, rgba(168,85,247,0.18), transparent 28%),
            linear-gradient(180deg, #040814 0%, #05030a 50%, #000 100%)
          `
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.42)_64%,rgba(0,0,0,0.9)_100%)]" />
      <div className="absolute left-1/2 top-[6vh] h-[82vh] w-[48vw] -translate-x-1/2 rounded-full bg-amber-200/12 blur-[95px]" />
      <StageChevrons side="left" />
      <StageChevrons side="right" />
      <StageFloor />
      <div className={`ceremony-light-beam ceremony-light-left ceremony-${tone}`} />
      <div className={`ceremony-light-beam ceremony-light-right ceremony-${tone}`} />
      <div className={`ceremony-overhead-light ceremony-overhead-main ceremony-${tone}`} />
      <div className={`ceremony-overhead-light ceremony-overhead-left ceremony-${tone}`} />
      <div className={`ceremony-overhead-light ceremony-overhead-right ceremony-${tone}`} />
      <div className={`ceremony-spotlight ceremony-spotlight-left ceremony-${tone}`} />
      <div className={`ceremony-spotlight ceremony-spotlight-right ceremony-${tone}`} />
      <div className="absolute inset-x-0 bottom-0 h-[28vh] bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.26),transparent_56%)] blur-2xl" />
      {particles.map((particle) => (
        <span
          key={particle}
          className={`ceremony-particle ceremony-${tone}`}
          style={{
            left: `${(particle * 23) % 100}%`,
            top: `${10 + ((particle * 37) % 74)}%`,
            animationDelay: `${(particle % 9) * 0.42}s`,
            animationDuration: `${4.8 + (particle % 7) * 0.44}s`
          }}
        />
      ))}
    </div>
  );
}

function RevealStage({ stage, participant, style }) {
  if (stage === "waiting") {
    return (
      <div className="ceremony-stage-enter -mt-6 text-center">
        <div className="mb-5 flex items-center justify-center gap-5 text-[28px] font-black uppercase tracking-[0.28em] text-amber-200/90">
          <span className="h-px w-32 bg-gradient-to-r from-transparent via-amber-300 to-amber-100" />
          Cerimonia Top 3
          <span className="h-px w-32 bg-gradient-to-r from-amber-100 via-amber-300 to-transparent" />
        </div>
        <div className="relative mx-auto flex h-[370px] w-[520px] items-center justify-center">
          <div className="absolute inset-x-6 bottom-6 h-20 rounded-[100%] border border-amber-200/30 bg-black/58 shadow-[0_0_65px_rgba(250,204,21,0.38),inset_0_0_32px_rgba(250,204,21,0.16)]" />
          <TrophyMark className="relative z-10 h-[310px] w-[310px] text-amber-200 drop-shadow-[0_0_40px_rgba(250,204,21,0.88)]" />
        </div>
        <div className="mt-2 text-[92px] font-black uppercase leading-none tracking-[0.015em] text-amber-300 drop-shadow-[0_0_28px_rgba(250,204,21,0.48)]">
          Preparando
        </div>
        <div className="mt-3 text-[54px] font-black uppercase leading-none tracking-[0.035em] text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.24)]">
          Revelacao dos campeoes
        </div>
        <div className="mx-auto mt-8 h-px w-[620px] bg-gradient-to-r from-transparent via-amber-200/80 to-transparent" />
        <div className="mt-4 text-2xl font-black uppercase tracking-[0.2em]">
          <span className="text-blue-400">Game</span> <span className="text-pink-400">Show</span><span className="text-white/70">.me</span>
        </div>
      </div>
    );
  }

  const isChampion = stage === "first";

  return (
    <div className="ceremony-stage-enter -mt-3 w-full text-center">
      <div className="mb-4 flex items-center justify-center gap-5 text-[22px] font-black uppercase tracking-[0.26em] text-white/58">
        <span className="h-px w-28 bg-gradient-to-r from-transparent via-white/50 to-amber-200" />
        Cerimonia Top 3
        <span className="h-px w-28 bg-gradient-to-r from-amber-200 via-white/50 to-transparent" />
      </div>
      <Medal rank={style.rank} gradient={style.gradient} glow={style.glow} size={isChampion ? "hero" : "large"} />
      <div
        className={`${isChampion ? "mt-8 text-[84px]" : "mt-8 text-[68px]"} font-black uppercase leading-none tracking-[0.03em] ${style.title}`}
        style={{ textShadow: `0 0 28px ${style.glow}` }}
      >
        {style.label}
      </div>
      <div className={`${isChampion ? "mt-8 max-w-[1500px] px-16 py-7" : "mt-7 max-w-[1120px] px-12 py-5"} mx-auto rounded-3xl border border-white/16 bg-black/36 shadow-[inset_0_0_60px_rgba(255,255,255,0.035)]`}>
        <div className={`${isChampion ? "text-[106px]" : "text-[60px]"} font-black uppercase leading-tight text-white drop-shadow-[0_0_32px_rgba(255,255,255,0.26)]`}>
          {participant?.name || "Aguardando participante"}
        </div>
      </div>
      <div
        className={`${isChampion ? "mt-10 px-14 py-5 text-[42px]" : "mt-8 px-10 py-4 text-[34px]"} mx-auto w-fit rounded-xl border font-black uppercase tracking-[0.08em]`}
        style={{
          borderColor: style.glow,
          color: "#ffffff",
          background: "rgba(0,0,0,0.36)",
          boxShadow: `0 0 34px ${style.glow}`
        }}
      >
        {participant?.score ?? 0} pontos
      </div>
    </div>
  );
}

function PodiumFinal({ topThree }) {
  const first = topThree[0] || FALLBACK_TOP[0];
  const second = topThree[1] || FALLBACK_TOP[1];
  const third = topThree[2] || FALLBACK_TOP[2];

  return (
    <div className="ceremony-stage-enter w-full scale-[0.91]">
      <div className="mb-9 text-center text-[54px] font-black uppercase tracking-[0.035em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.24)]">
        Podio final dos campeoes
      </div>
      <div className="mx-auto grid max-w-[1380px] grid-cols-[1fr_1.18fr_1fr] items-end gap-8">
        <PodiumBlock participant={third} rank="3" height="h-[360px]" tone="bronze" />
        <PodiumBlock participant={first} rank="1" height="h-[480px]" tone="gold" champion />
        <PodiumBlock participant={second} rank="2" height="h-[390px]" tone="silver" />
      </div>
      <div className="mx-auto mt-8 flex h-20 max-w-[920px] items-center justify-center rounded-2xl border border-amber-200/30 bg-black/58 px-8 text-center shadow-[0_0_38px_rgba(250,204,21,0.18),inset_0_0_36px_rgba(255,255,255,0.04)]">
        <span className="text-3xl font-black uppercase tracking-[0.05em] text-amber-200">Parabens a todas as equipes</span>
      </div>
    </div>
  );
}

function StageChevrons({ side }) {
  const isLeft = side === "left";
  return (
    <div className={`absolute top-[18vh] h-[52vh] w-[16vw] ${isLeft ? "left-0" : "right-0 scale-x-[-1]"}`}>
      <div className="absolute left-0 top-0 h-full w-full border-y-[4px] border-r-[4px] border-blue-400/70 shadow-[0_0_24px_rgba(59,130,246,0.7)] [clip-path:polygon(0_0,58%_50%,0_100%,18%_100%,76%_50%,18%_0)]" />
      <div className="absolute left-12 top-[10%] h-[80%] w-[80%] border-y-[4px] border-r-[4px] border-amber-300/72 shadow-[0_0_24px_rgba(250,204,21,0.56)] [clip-path:polygon(0_0,58%_50%,0_100%,18%_100%,76%_50%,18%_0)]" />
    </div>
  );
}

function StageFloor() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[34vh] overflow-hidden">
      <div className="absolute inset-x-[-12vw] bottom-[-22vh] h-[42vh] rounded-[100%] border border-amber-200/32 bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.18),rgba(37,99,235,0.08)_32%,transparent_62%)] shadow-[0_0_60px_rgba(250,204,21,0.22)]" />
      <div className="absolute inset-x-[24vw] bottom-[8vh] h-px bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[16vh] bg-gradient-to-t from-black via-black/58 to-transparent" />
    </div>
  );
}

function PodiumBlock({ participant, rank, height, tone, champion = false }) {
  const style = tone === "gold" ? MEDAL_STYLE.first : tone === "silver" ? MEDAL_STYLE.second : MEDAL_STYLE.third;
  const teamColor = getTeamColor(participant.name, rank);
  const teamName = getDisplayTeamName(participant.name);
  const scoreSize = champion ? "text-[78px]" : "text-[58px]";
  const teamSize = champion ? "text-[58px]" : "text-[44px]";

  return (
    <div className="text-center">
      <Medal rank={rank} gradient={style.gradient} glow={style.glow} size={champion ? "podiumChampion" : "podium"} wreath />
      <div
        className={`${height} relative mt-5 flex flex-col items-center justify-center overflow-hidden rounded-t-[34px] border pt-10 shadow-[inset_0_0_80px_rgba(255,255,255,0.07)]`}
        style={{
          borderColor: teamColor.border,
          background: `linear-gradient(180deg, ${teamColor.panelTop}, ${teamColor.panelMid} 48%, rgba(0,0,0,0.82))`,
          boxShadow: `0 0 54px ${teamColor.glow}, inset 0 0 70px ${teamColor.inner}`
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
        <div className="absolute inset-x-8 bottom-10 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />
        <div className="text-4xl font-black text-white/92 drop-shadow-[0_0_14px_rgba(255,255,255,0.28)]">TROFEU</div>
        <div className="mt-4 text-[34px] font-black uppercase leading-none tracking-[0.06em] text-white/88">Equipe</div>
        <div className={`${teamSize} mt-2 font-black uppercase leading-none text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.26)]`}>
          {teamName}
        </div>
        <div className="mt-7 flex w-[78%] items-center justify-center gap-4">
          <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${teamColor.border})` }} />
          <span className="text-2xl font-black" style={{ color: teamColor.star }}>★</span>
          <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${teamColor.border}, transparent)` }} />
        </div>
        <div className={`${scoreSize} mt-5 font-black leading-none text-white drop-shadow-[0_0_22px_rgba(255,255,255,0.28)]`}>
          {participant.score}
        </div>
        <div className="mt-1 text-2xl font-black uppercase tracking-[0.06em] text-white/88">Pontos</div>
      </div>
      <div
        className="mx-auto h-[82px] w-[106%] -translate-y-2 rounded-[100%] border bg-black/80"
        style={{
          borderColor: teamColor.border,
          boxShadow: `0 0 38px ${teamColor.glow}, inset 0 0 42px ${teamColor.inner}`
        }}
      />
    </div>
  );
}

function Medal({ rank, gradient, glow, size, wreath = false }) {
  const sizeClass = size === "hero" ? "h-64 w-64 text-[134px]" : size === "large" ? "h-52 w-52 text-[104px]" : size === "medium" ? "h-32 w-32 text-[66px]" : size === "podiumChampion" ? "h-28 w-28 text-[58px]" : size === "podium" ? "h-20 w-20 text-[40px]" : "h-24 w-24 text-[48px]";
  return (
    <div className="relative mx-auto w-fit">
      {wreath && (
        <div className="absolute -inset-5 rounded-full border-x-4 border-amber-200/70 opacity-80" />
      )}
      <div
        className={`relative z-10 mx-auto flex ${sizeClass} items-center justify-center rounded-full border border-white/45 bg-gradient-to-br ${gradient} font-black text-black shadow-2xl`}
        style={{
          boxShadow: `0 0 70px ${glow}, inset 0 0 26px rgba(255,255,255,0.44)`
        }}
      >
        {rank}
      </div>
    </div>
  );
}

function getTeamColor(name = "", rank = "1") {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("azul")) {
    return {
      background: "linear-gradient(90deg, rgba(29,78,216,0.96), rgba(37,99,235,0.72))",
      podiumTop: "rgba(37,99,235,0.7)",
      panelTop: "rgba(29,78,216,0.72)",
      panelMid: "rgba(15,23,80,0.78)",
      border: "rgba(96,165,250,0.96)",
      star: "#38bdf8",
      inner: "rgba(37,99,235,0.25)",
      glow: "rgba(59,130,246,0.62)"
    };
  }

  if (normalizedName.includes("vermelh")) {
    return {
      background: "linear-gradient(90deg, rgba(185,28,28,0.96), rgba(239,68,68,0.72))",
      podiumTop: "rgba(220,38,38,0.68)",
      panelTop: "rgba(185,28,28,0.78)",
      panelMid: "rgba(69,10,10,0.82)",
      border: "rgba(248,113,113,0.98)",
      star: "#ef4444",
      inner: "rgba(239,68,68,0.26)",
      glow: "rgba(248,113,113,0.58)"
    };
  }

  if (normalizedName.includes("verde")) {
    return {
      background: "linear-gradient(90deg, rgba(21,128,61,0.96), rgba(34,197,94,0.70))",
      podiumTop: "rgba(22,163,74,0.62)",
      panelTop: "rgba(21,128,61,0.72)",
      panelMid: "rgba(5,46,22,0.84)",
      border: "rgba(74,222,128,0.96)",
      star: "#22c55e",
      inner: "rgba(34,197,94,0.22)",
      glow: "rgba(74,222,128,0.52)"
    };
  }

  if (rank === "1") {
    return {
      background: "linear-gradient(90deg, rgba(180,83,9,0.96), rgba(250,204,21,0.72))",
      podiumTop: "rgba(250,204,21,0.62)",
      panelTop: "rgba(180,83,9,0.72)",
      panelMid: "rgba(69,26,3,0.84)",
      border: "rgba(250,204,21,0.96)",
      star: "#facc15",
      inner: "rgba(250,204,21,0.24)",
      glow: "rgba(250,204,21,0.58)"
    };
  }

  if (rank === "2") {
    return {
      background: "linear-gradient(90deg, rgba(71,85,105,0.96), rgba(203,213,225,0.62))",
      podiumTop: "rgba(203,213,225,0.56)",
      panelTop: "rgba(71,85,105,0.72)",
      panelMid: "rgba(15,23,42,0.84)",
      border: "rgba(226,232,240,0.88)",
      star: "#e2e8f0",
      inner: "rgba(226,232,240,0.2)",
      glow: "rgba(226,232,240,0.52)"
    };
  }

  return {
    background: "linear-gradient(90deg, rgba(154,52,18,0.96), rgba(251,146,60,0.66))",
    podiumTop: "rgba(251,146,60,0.58)",
    panelTop: "rgba(154,52,18,0.72)",
    panelMid: "rgba(67,20,7,0.84)",
    border: "rgba(251,146,60,0.92)",
    star: "#fb923c",
    inner: "rgba(251,146,60,0.2)",
    glow: "rgba(251,146,60,0.52)"
  };
}

function getDisplayTeamName(name = "") {
  const normalizedName = String(name || "").trim();
  const lowerName = normalizedName.toLowerCase();

  if (lowerName.includes("vermelh")) return "Vermelha";
  if (lowerName.includes("azul")) return "Azul";
  if (lowerName.includes("verde")) return "Verde";

  return normalizedName.replace(/^equipe\s+/i, "") || "Equipe";
}

function TrophyMark({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="top3TrophyGold" x1="24" y1="18" x2="92" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7ad" />
          <stop offset="0.42" stopColor="#facc15" />
          <stop offset="0.78" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <path d="M37 24h46v20c0 22-10 37-23 37S37 66 37 44V24Z" fill="url(#top3TrophyGold)" stroke="#fde68a" strokeWidth="4" />
      <path d="M37 34H22c0 19 8 29 22 31M83 34h15c0 19-8 29-22 31" fill="none" stroke="#fbbf24" strokeWidth="7" strokeLinecap="round" />
      <path d="M60 81v18M43 103h34" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" />
      <path d="M48 111h24" stroke="#fde68a" strokeWidth="6" strokeLinecap="round" />
      <path d="M51 39h18M51 51h25" stroke="#fff7ad" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
