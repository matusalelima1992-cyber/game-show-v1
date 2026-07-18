import React from "react";
import OfficialLogo from "../components/OfficialLogo";
import useGameState from "../hooks/useGameState";

const optionStyles = {
  blue: "from-blue-300/80 via-blue-600/80 to-blue-950 border-blue-200/30",
  purple: "from-purple-300/80 via-purple-600/80 to-purple-950 border-purple-200/30",
  green: "from-green-300/80 via-green-600/80 to-green-950 border-green-200/30",
  orange: "from-orange-300/80 via-orange-600/80 to-orange-950 border-orange-200/30"
};

const optionColorByLetter = {
  A: "blue",
  B: "purple",
  C: "green",
  D: "orange"
};

const victoryConfetti = [
  ["6%", "#38bdf8", "0s", 10, 4, 18],
  ["10%", "#f97316", "0.45s", 12, 4, -36],
  ["15%", "#22c55e", "0.15s", 9, 5, 42],
  ["21%", "#eab308", "0.72s", 13, 4, -18],
  ["27%", "#0ea5e9", "0.3s", 10, 4, 28],
  ["34%", "#f43f5e", "0.9s", 8, 5, -42],
  ["40%", "#22c55e", "0.55s", 11, 4, 16],
  ["47%", "#f97316", "0.2s", 9, 4, -24],
  ["53%", "#38bdf8", "0.8s", 12, 4, 32],
  ["60%", "#eab308", "0.38s", 8, 5, -12],
  ["66%", "#22c55e", "0.12s", 10, 4, 44],
  ["73%", "#f97316", "0.66s", 13, 4, -30],
  ["79%", "#ec4899", "0.26s", 9, 5, 22],
  ["85%", "#22c55e", "0.84s", 11, 4, -40],
  ["90%", "#38bdf8", "0.5s", 8, 5, 36],
  ["95%", "#ec4899", "0.05s", 12, 4, -16]
];

function OptionBadge({ letter, size = "small" }) {
  const color = optionColorByLetter[letter] || "blue";
  const dimension = size === "large" ? "h-12 w-12 text-[32px]" : "h-7 w-7 text-xs";
  const glow =
    color === "green"
      ? "shadow-[0_0_12px_rgba(34,197,94,0.48),inset_0_2px_4px_rgba(255,255,255,0.35)]"
      : color === "purple"
      ? "shadow-[0_0_12px_rgba(147,51,234,0.48),inset_0_2px_4px_rgba(255,255,255,0.35)]"
      : color === "orange"
      ? "shadow-[0_0_12px_rgba(249,115,22,0.48),inset_0_2px_4px_rgba(255,255,255,0.35)]"
      : "shadow-[0_0_12px_rgba(37,99,235,0.48),inset_0_2px_4px_rgba(255,255,255,0.35)]";

  return (
    <span
      className={`flex ${dimension} shrink-0 items-center justify-center rounded-full border bg-gradient-to-b ${optionStyles[color]} ${glow} font-black text-white`}
    >
      {letter}
    </span>
  );
}

function ResultIcon({ correct }) {
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center text-[25px] font-black leading-none ${
        correct
          ? "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.75)]"
          : "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]"
      }`}
    >
      {correct ? "\u2713" : "\u2715"}
    </span>
  );
}

function FastestCorrectCard({ side, player }) {
  if (!player) {
    return null;
  }

  const isWomen = side === "women";
  const card = isWomen
    ? "right-8 border-pink-500/55 bg-[#120512]/82 shadow-[0_0_22px_rgba(236,72,153,0.22),inset_0_0_18px_rgba(236,72,153,0.045)]"
    : "left-8 border-blue-500/55 bg-[#041023]/82 shadow-[0_0_22px_rgba(37,99,235,0.22),inset_0_0_18px_rgba(59,130,246,0.045)]";
  const text = isWomen ? "text-pink-300" : "text-blue-300";
  const avatar = isWomen
    ? "border-pink-400/80 shadow-[0_0_16px_rgba(236,72,153,0.45)]"
    : "border-blue-400/80 shadow-[0_0_16px_rgba(59,130,246,0.45)]";
  const label = isWomen ? "MAIS R\u00c1PIDA A ACERTAR" : "MAIS R\u00c1PIDO A ACERTAR";
  const initial = String(player.name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className={`absolute top-1/2 hidden h-[62px] w-[285px] -translate-y-1/2 items-center gap-3 rounded-lg border px-4 backdrop-blur-sm xl:flex ${card}`}>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-black/55 text-xl font-black text-white ${avatar}`}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-black uppercase tracking-wide text-yellow-300">
          {label}
        </div>
        <div className="mt-1 truncate text-[20px] font-black leading-none text-white">
          {player.name}
        </div>
      </div>
      <div className={`text-[21px] font-black leading-none ${text}`}>
        {player.time}
      </div>
    </div>
  );
}

function RankingPanel({ side, title, rows }) {
  const isWomen = side === "women";
  const panel =
    isWomen
      ? "border-pink-500/80 bg-[#08030a]/94 shadow-[0_0_34px_rgba(236,72,153,0.22),inset_0_0_40px_rgba(236,72,153,0.045)]"
      : "border-blue-500/80 bg-[#030814]/94 shadow-[0_0_34px_rgba(37,99,235,0.22),inset_0_0_40px_rgba(59,130,246,0.045)]";
  const header =
    isWomen
      ? "border-pink-500/55 bg-gradient-to-r from-pink-950/80 via-pink-900/45 to-pink-950/55 text-pink-300"
      : "border-blue-500/55 bg-gradient-to-r from-blue-950/80 via-blue-900/45 to-blue-950/55 text-blue-300";
  const rank = isWomen ? "bg-pink-600" : "bg-blue-600";
  const timeColor = isWomen ? "text-pink-200" : "text-blue-200";
  const icon = isWomen ? "\u2640" : "\u2642";

  return (
    <aside className={`overflow-hidden rounded-lg border ${panel} backdrop-blur-sm`}>
      <div className={`flex h-[52px] items-center justify-center gap-3 border-b px-5 ${header}`}>
        <span className="text-[25px] font-black leading-none">{icon}</span>
        <span className="text-[27px] font-black uppercase leading-none tracking-wide">{title}</span>
      </div>

      <div className="px-4 py-2.5">
        <div className="space-y-1.5">
          {rows.length ? (
            rows.map(([place, name, option, correct, time]) => (
              <div
                key={`${title}-${place}-${name}`}
                className="grid h-[38px] grid-cols-[38px_1fr_40px_58px_34px] items-center gap-2 rounded-md border border-white/5 bg-black/38 px-3 text-[17px] font-semibold shadow-[inset_0_0_18px_rgba(0,0,0,0.42)]"
              >
                <span className={`rounded ${rank} py-1 text-center text-sm font-black text-white`}>
                  {place}
                </span>
                <span className="truncate">{name}</span>
                <span className="flex justify-center">
                  <OptionBadge letter={option} />
                </span>
                <span className={`text-right text-[15px] font-black leading-none ${correct ? timeColor : "text-white/18"}`}>
                  {correct ? time : "--"}
                </span>
                <ResultIcon correct={correct} />
              </div>
            ))
          ) : (
            <div className="flex h-[84px] items-center justify-center rounded-lg border border-white/6 bg-black/28 text-sm font-black uppercase tracking-wide text-white/38">
              Nenhum participante
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function ScoreCard({ side, label, value }) {
  const isWomen = side === "women";
  const card = isWomen
    ? "border-pink-400/45 bg-gradient-to-r from-pink-950/90 via-pink-700/85 to-pink-950/88 shadow-[0_0_24px_rgba(236,72,153,0.28),inset_0_0_20px_rgba(255,255,255,0.05)]"
    : "border-blue-400/45 bg-gradient-to-r from-blue-950/90 via-blue-700/85 to-blue-950/88 shadow-[0_0_24px_rgba(37,99,235,0.28),inset_0_0_20px_rgba(255,255,255,0.05)]";

  return (
    <div className={`flex h-[62px] min-w-[335px] items-center justify-center gap-5 rounded-lg border px-8 ${card}`}>
      <span className="text-[24px] font-medium uppercase text-white/80">{label}:</span>
      <span className="text-[27px] font-black uppercase tracking-wide text-white">{value} ACERTOS</span>
    </div>
  );
}

function VictoryConfetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
      {victoryConfetti.map(([left, color, delay, height, width, rotate], index) => (
        <span
          key={index}
          className="absolute top-[-18px] rounded-full opacity-0 shadow-[0_0_10px_currentColor]"
          style={{
            left,
            width: `${width}px`,
            height: `${height}px`,
            color,
            backgroundColor: color,
            transform: `rotate(${rotate}deg)`,
            animation: `resultConfettiFall 4.6s ease-in-out ${delay} infinite`
          }}
        />
      ))}
      <div className="absolute left-[8%] top-10 h-12 w-[28%] bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.18)_0%,transparent_68%)] blur-xl" />
      <div className="absolute right-[8%] top-10 h-12 w-[28%] bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.16)_0%,transparent_68%)] blur-xl" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent via-black/58 to-black" />
    </div>
  );
}

export default function ResultScreen({ gameState: providedGameState }) {
  const liveGameState = useGameState();
  const gameState = providedGameState || liveGameState;
  const round = gameState.roundResult;
  const resultMenRows = (round?.menRows || []).map((row) => [String(row.place), row.name, row.option, row.correct, row.time]);
  const resultWomenRows = (round?.womenRows || []).map((row) => [String(row.place), row.name, row.option, row.correct, row.time]);
  const resultFastest = {
    men: round?.fastestCorrect?.men || null,
    women: round?.fastestCorrect?.women || null
  };
  const correctLetter = round?.correct || gameState.currentQuestion?.correct || "C";
  const correctText = round?.correctText || (gameState.currentQuestion?.options || [])
    .find((option) => String(option).startsWith(`${correctLetter} `) || String(option).startsWith(`${correctLetter} -`))
    ?.replace(/^[A-Z]\s*-\s*/i, "") || "";
  const menScore = round?.menCorrect ?? 0;
  const womenScore = round?.womenCorrect ?? 0;

  return (
    <div className="relative h-screen overflow-hidden bg-[#02050f] p-2 text-white">
      <style>
        {`
          @keyframes resultConfettiFall {
            0% {
              opacity: 0;
              transform: translate3d(0, -18px, 0) rotate(0deg);
            }
            12% {
              opacity: 1;
            }
            72% {
              opacity: 0.95;
            }
            100% {
              opacity: 0;
              transform: translate3d(18px, 158px, 0) rotate(210deg);
            }
          }
        `}
      </style>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 18% 44%, rgba(14,165,233,0.18), transparent 34%),
            radial-gradient(ellipse at 82% 44%, rgba(236,72,153,0.16), transparent 34%),
            linear-gradient(180deg, #050816 0%, #02040b 100%)
          `
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.50)_58%,rgba(0,0,0,0.92)_100%)]" />

      <main className="relative z-10 mx-auto flex h-[calc(100vh-16px)] max-w-[1540px] flex-col overflow-hidden rounded-xl border border-white/20 bg-[#050911]/92 shadow-[0_0_80px_rgba(0,0,0,0.86),inset_0_0_90px_rgba(255,255,255,0.025)]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_38%,rgba(37,99,235,0.16),transparent_32%),radial-gradient(ellipse_at_80%_38%,rgba(236,72,153,0.15),transparent_32%),linear-gradient(180deg,rgba(8,13,24,0.95)_0%,rgba(2,5,12,0.98)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.62)_100%)]" />
        </div>

        <section className="relative z-10 flex min-h-0 flex-1 flex-col px-10 py-5">
          <div className="relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/48 px-8 pb-5 pt-4 shadow-[inset_0_0_38px_rgba(255,255,255,0.025)]">
            <VictoryConfetti />
            <OfficialLogo mini className="absolute left-8 top-1.5 opacity-86" />
            <FastestCorrectCard side="men" player={resultFastest.men} />
            <FastestCorrectCard side="women" player={resultFastest.women} />

            <div className="relative mx-auto w-fit text-center">
              <div className="mb-2 text-[18px] font-black uppercase tracking-wide text-white/90">
                RESPOSTA CORRETA
              </div>
              <div className="flex h-[62px] min-w-[390px] items-center justify-center gap-6 rounded-lg border border-green-300/55 bg-gradient-to-r from-green-950/95 via-green-600/95 to-green-950/95 px-10 text-[36px] font-black uppercase tracking-wide text-white shadow-[0_0_32px_rgba(34,197,94,0.42),inset_0_0_24px_rgba(255,255,255,0.08)]">
                <OptionBadge letter={correctLetter} size="large" />
                <span>&mdash;</span>
                <span>{correctText}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid min-h-0 flex-1 grid-cols-2 gap-8">
            <RankingPanel side="men" title="HOMENS" rows={resultMenRows} />
            <RankingPanel side="women" title="MULHERES" rows={resultWomenRows} />
          </div>

          <footer className="relative mt-5 shrink-0 rounded-2xl border border-white/18 bg-[#050b12]/88 px-8 py-4 shadow-[0_0_36px_rgba(0,0,0,0.68),inset_0_0_28px_rgba(255,255,255,0.035)] backdrop-blur-sm">
            <div className="mb-3 text-center text-[20px] font-black uppercase tracking-wide text-white/86">
              DESEMPENHO DA RODADA
            </div>
            <div className="flex items-center justify-center gap-10">
              <ScoreCard side="men" label="HOMENS" value={menScore} />
              <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full border border-yellow-300/35 bg-yellow-400/10 text-[46px] shadow-[0_0_24px_rgba(250,204,21,0.42),inset_0_0_18px_rgba(250,204,21,0.08)]">
                &#127942;
              </div>
              <ScoreCard side="women" label="MULHERES" value={womenScore} />
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
