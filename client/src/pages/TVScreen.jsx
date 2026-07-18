import React, { useEffect, useState } from "react";
import OfficialLogo from "../components/OfficialLogo";
import useGameState from "../hooks/useGameState";


const answers = [
  ["A", "TERRA", "blue", false],
  ["B", "MARTE", "purple", false],
  ["C", "JUPITER", "green", true],
  ["D", "SATURNO", "orange", false]
];

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

function Avatar({ tone = "blue", size = "large" }) {
  const dimension = size === "small" ? "h-9 w-9" : size === "card" ? "h-14 w-14" : "h-16 w-16";
  const color =
    tone === "pink"
      ? "border-pink-400/75 from-pink-100/40 via-pink-500/30 to-black shadow-[0_0_16px_rgba(236,72,153,0.35)]"
      : "border-blue-400/75 from-blue-100/40 via-blue-500/30 to-black shadow-[0_0_16px_rgba(59,130,246,0.35)]";

  return (
    <div
      className={`${dimension} shrink-0 rounded-full border-2 bg-gradient-to-br ${color}`}
    />
  );
}

function ChoiceBadge({ children, color = "blue", compact = false }) {
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
      className={`${compact ? "h-6 w-6 text-xs" : "h-10 w-10 text-2xl"} flex shrink-0 items-center justify-center rounded-full border bg-gradient-to-b ${optionStyles[color]} ${glow} font-black text-white`}
    >
      {children}
    </span>
  );
}

function GroupPanel({ side, title, leader, speed, leaderOption, votes }) {
  const hasLeaderVote = Boolean(leaderOption);
  const hasVotes = votes.length > 0;
  const isWomen = side === "women";
  const accent = isWomen ? "pink" : "blue";
  const panel =
    accent === "pink"
      ? "justify-self-end border-pink-500/80 bg-[#08030a]/94 shadow-[0_0_32px_rgba(236,72,153,0.20),inset_0_0_38px_rgba(236,72,153,0.04)] backdrop-blur-sm"
      : "justify-self-start border-blue-500/80 bg-[#030814]/94 shadow-[0_0_32px_rgba(37,99,235,0.20),inset_0_0_38px_rgba(59,130,246,0.04)] backdrop-blur-sm";
  const titleColor = accent === "pink" ? "text-pink-400" : "text-blue-400";
  const cardBorder = accent === "pink" ? "border-pink-500/65" : "border-blue-500/65";
  const rankBg = accent === "pink" ? "bg-pink-600" : "bg-blue-600";
  const timeColor = accent === "pink" ? "text-pink-300" : "text-blue-300";
  const icon = isWomen ? "\u2640" : "\u2642";

  return (
    <aside className={`tv-vote-panel flex max-h-[520px] w-[315px] flex-col rounded-[16px] border p-4 transition-all duration-700 ease-out ${hasVotes ? "translate-y-0 opacity-100 blur-0" : "pointer-events-none translate-y-4 opacity-0 blur-sm"} ${panel}`}>
      <div className={`mb-3 flex items-center gap-3 text-[30px] font-black leading-none ${titleColor}`}>
        <span className="text-[36px]">{icon}</span>
        <span>{title}</span>
      </div>

      <div className={`mb-4 rounded-lg border ${cardBorder} bg-black/62 p-3 shadow-[inset_0_0_20px_rgba(0,0,0,0.55)]`}>
        <div className="grid grid-cols-[56px_minmax(0,1fr)_34px_44px] items-center gap-3">
          <Avatar tone={accent} size="card" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center whitespace-nowrap text-[11px] font-semibold uppercase leading-none tracking-[0.02em] text-white/90">
              <span className="mr-1 text-[18px] leading-none text-[#ffe600] drop-shadow-[0_0_6px_rgba(255,230,0,0.9)]">
                {"\u26A1"}
              </span>
              Mais {isWomen ? "rapida" : "rapido"}
            </div>
            <div className="mt-1 whitespace-nowrap text-[24px] font-black leading-none">
              {leader}
            </div>
          </div>
          <span className="flex justify-center">
            {hasLeaderVote && <ChoiceBadge compact color={optionColorByLetter[leaderOption] || accent}>{leaderOption}</ChoiceBadge>}
          </span>
          <div className={`w-[44px] shrink-0 text-right text-[20px] font-black leading-none ${timeColor}`}>
            {speed}
          </div>
        </div>
      </div>

      <div className="mb-2 text-sm uppercase tracking-wide text-white/65">
        Ordem de votacao
      </div>

      <div className="tv-vote-scroll min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {votes.map(([place, name, option, time]) => (
          <div
            key={`${title}-${place}`}
            className="tv-vote-row grid grid-cols-[24px_1fr_26px_44px] items-center gap-2 border-b border-white/5 bg-black/12 py-[3px] text-[14px] font-medium"
          >
            <span className={`rounded ${rankBg} py-0.5 text-center text-xs font-black text-white`}>
              {place}
            </span>
            <span className="truncate">{name}</span>
            <span className="flex justify-center">
              {option && <ChoiceBadge compact color={optionColorByLetter[option] || accent}>{option}</ChoiceBadge>}
            </span>
            <span className={`text-right text-xs font-bold ${timeColor}`}>{time}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function AnswerButton({ letter, text, color, correct, textStyle }) {
  return (
    <button
      className={`relative flex h-[48px] w-full items-center overflow-hidden rounded-full border px-4 text-left text-[20px] font-black tracking-wide ${
        correct
          ? "border-green-400 bg-gradient-to-r from-green-500/16 via-[#030812]/98 to-green-500/14 shadow-[0_0_18px_rgba(34,197,94,0.44),inset_0_0_18px_rgba(0,0,0,0.55)]"
          : "border-white/25 bg-gradient-to-r from-black/72 via-[#070b12]/96 to-black/72 shadow-[inset_0_0_16px_rgba(0,0,0,0.55)]"
      }`}
    >
      <span
        className={`mr-4 flex h-9 w-9 items-center justify-center rounded-full border bg-gradient-to-b ${optionStyles[color]} text-lg font-black text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.35)]`}
      >
        {letter}
      </span>
      <span
        className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        style={{
          color: textStyle?.color,
          fontSize: textStyle?.fontSize ? `${textStyle.fontSize}px` : undefined,
          fontWeight: textStyle?.fontWeight
        }}
      >
        {text}
      </span>
      {correct && (
        <span className="ml-auto -mr-4 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-green-500 text-[32px] font-black text-white shadow-[0_0_18px_rgba(34,197,94,0.58)]">
          {"\u2713"}
        </span>
      )}
    </button>
  );
}

export default function TVScreen({ gameState: providedGameState }) {
  const liveGameState = useGameState();
  const gameState = providedGameState || liveGameState;
  const currentQuestion = gameState.currentQuestion;
  const questionIsLive = Boolean(gameState.questionVisible);
  const displayAnswers = (currentQuestion.options || answers).map((option, index) => {
    const [letterPart, ...textParts] = String(option).split("-");
    const letter = letterPart.trim().charAt(0).toUpperCase();
    const text = (textParts.join("-").trim() || option).toUpperCase();
    return [letter, text, optionColorByLetter[letter] || "blue", gameState.answerRevealed && letter === currentQuestion.correct, currentQuestion.style?.options?.[index]];
  });
  const rowsFor = (group) => {
    return (gameState.votes.list || [])
      .filter((vote) => vote.group === group)
      .sort((a, b) => a.elapsed - b.elapsed)
      .map((vote, index) => [String(index + 1), vote.name, vote.option, `${Number(vote.elapsed || 0).toFixed(1)}s`]);
  };
  const menRows = rowsFor("HOMENS");
  const womenRows = rowsFor("MULHERES");
  const menLeader = menRows[0] || ["", "Aguardando", "", "--"];
  const womenLeader = womenRows[0] || ["", "Aguardando", "", "--"];
  const voteTotal = gameState.votes.total || gameState.participants.total || 0;
  const voteProgress = voteTotal > 0 ? Math.min(1, Math.max(0, gameState.votes.count / voteTotal)) : 0;
  const voteCircleLength = 258;
  const voteCircleOffset = voteCircleLength * (1 - voteProgress);
  const currentRoundQuestionNumber = gameState.currentRoundQuestionNumber || gameState.currentQuestionIndex + 1;
  const currentPhaseNumber = (gameState.currentRoundIndex || 0) + 1;
  const hasAnyVote = gameState.votes.count > 0;
  const [waitingSeconds, setWaitingSeconds] = useState(60);
  const waitingTime = `${String(Math.floor(waitingSeconds / 60)).padStart(2, "0")}:${String(waitingSeconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (questionIsLive) {
      setWaitingSeconds(60);
      return undefined;
    }

    const waitingTimer = window.setInterval(() => {
      setWaitingSeconds((current) => (current <= 1 ? 60 : current - 1));
    }, 1000);

    return () => window.clearInterval(waitingTimer);
  }, [questionIsLive]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02050f] p-2 text-white">
      <style>
        {`
          @keyframes tvVoteRowIn {
            from {
              opacity: 0;
              transform: translate3d(0, 10px, 0) scale(0.98);
              filter: blur(5px);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
              filter: blur(0);
            }
          }

          .tv-vote-row {
            animation: tvVoteRowIn 620ms ease both;
          }

          .tv-vote-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(96, 165, 250, 0.58) rgba(2, 6, 23, 0.35);
          }

          .tv-vote-scroll::-webkit-scrollbar {
            width: 6px;
          }

          .tv-vote-scroll::-webkit-scrollbar-track {
            background: rgba(2, 6, 23, 0.35);
            border-radius: 999px;
          }

          .tv-vote-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(96, 165, 250, 0.8), rgba(236, 72, 153, 0.72));
            border-radius: 999px;
          }
        `}
      </style>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 16% 48%, rgba(14,165,233,0.18), transparent 34%),
            radial-gradient(ellipse at 84% 48%, rgba(236,72,153,0.16), transparent 34%),
            linear-gradient(180deg, #050816 0%, #02040b 100%)
          `
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.50)_54%,rgba(0,0,0,0.90)_100%)]" />

      <main className="relative z-10 h-[calc(100vh-16px)] min-h-[610px] overflow-hidden rounded-lg border border-white/20 bg-black/35 shadow-[0_0_70px_rgba(0,0,0,0.82),inset_0_0_80px_rgba(255,255,255,0.025)]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src="/assets/game-show-stage-bg.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-74 [filter:contrast(1.18)_saturate(1.08)_brightness(0.78)]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.10)_38%,rgba(0,0,0,0.78)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.28)_42%,rgba(0,0,0,0.34)_68%,rgba(0,0,0,0.66)_100%)]" />
        </div>
        <header className="relative z-20 flex h-[86px] items-start justify-between px-6 pt-4">
          <div>
            <OfficialLogo compact />
            <div className="mt-1 flex items-center gap-2 pl-[52px] text-[10px] font-black uppercase tracking-[0.28em] text-red-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
              AO VIVO
            </div>
          </div>

          <div className="absolute left-1/2 top-0 w-[214px] -translate-x-1/2 rounded-b-[18px] border border-t-0 border-yellow-400/25 bg-[#070c14]/95 px-6 pb-2 pt-3 text-center shadow-[0_0_28px_rgba(250,204,21,0.08)]">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{"\u23F1"}</span>
              <span className="text-[34px] font-black leading-none text-yellow-300">00:{String(gameState.timer).padStart(2, "0")}</span>
            </div>
            <div className="mt-1 text-[11px] font-black uppercase text-white/80">Tempo restante</div>
          </div>

          <div className="flex items-center gap-3 pr-4">
            <div className="relative h-[82px] w-[82px] rounded-full">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="41" stroke="rgba(255,255,255,0.09)" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="41"
                  stroke="#22c55e"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={voteCircleLength}
                  strokeDashoffset={voteCircleOffset}
                  style={{ filter: "drop-shadow(0 0 8px rgba(34,197,94,0.55))" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[17px] font-black">{gameState.votes.count}/{voteTotal}</div>
            </div>
            <div className="text-sm font-black uppercase leading-tight tracking-wide">
              Votos<br />recebidos
            </div>
          </div>
        </header>

        <div className="absolute left-1/2 top-[92px] z-20 -translate-x-1/2 rounded-md border border-white/15 bg-[#080d16]/90 px-4 py-1 text-sm font-black uppercase tracking-wide text-white/90">
          Pergunta {String(currentRoundQuestionNumber).padStart(2, "0")}/{gameState.totalQuestions}
        </div>

        <section className="relative z-10 grid grid-cols-[340px_1fr_340px] px-3 pt-7">
          <GroupPanel
            side="men"
            title="HOMENS"
            leader={menLeader[1]}
            speed={menLeader[3]}
            leaderOption={menLeader[2]}
            votes={menRows}
          />

          <div className="flex min-w-0 flex-col items-center pt-14">
            {questionIsLive ? (
              <>
                <h1
                  className="mb-5 text-center font-black uppercase leading-[1.08] tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                  style={{
                    color: currentQuestion.style?.question?.color,
                    fontSize: currentQuestion.style?.question?.fontSize ? `${currentQuestion.style.question.fontSize}px` : "36px",
                    fontWeight: currentQuestion.style?.question?.fontWeight,
                    fontFamily: currentQuestion.style?.question?.fontFamily
                  }}
                >
                  {currentQuestion.title}
                </h1>

                <div className="w-full max-w-[530px] space-y-2.5">
                  {displayAnswers.map(([letter, text, color, correct, textStyle]) => (
                    <AnswerButton
                      key={letter}
                      letter={letter}
                      text={text}
                      color={color}
                      correct={correct}
                      textStyle={textStyle}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-16 flex h-[260px] w-full max-w-[560px] flex-col items-center justify-center rounded-2xl border border-white/12 bg-black/42 text-center shadow-[inset_0_0_50px_rgba(0,0,0,0.55),0_0_40px_rgba(0,0,0,0.35)]">
                <div className="text-[15px] font-black uppercase tracking-[0.24em] text-blue-200/70">
                  Aguardando pergunta da fase {currentPhaseNumber}
                </div>
                <div className="mt-5 text-[56px] font-black uppercase leading-none text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,0.35)]">
                  {waitingTime}
                </div>
                <div className="mt-3 max-w-[420px] text-sm font-semibold uppercase tracking-wide text-white/48">
                  {"A pergunta aparecer\u00e1 no tel\u00e3o quando o admin autorizar"}
                </div>
              </div>
            )}
          </div>

          <GroupPanel
            side="women"
            title="MULHERES"
            leader={womenLeader[1]}
            speed={womenLeader[3]}
            leaderOption={womenLeader[2]}
            votes={womenRows}
          />
        </section>

        <footer className={`absolute bottom-2 left-1/2 z-20 grid h-[74px] w-[74%] -translate-x-1/2 grid-cols-3 overflow-hidden rounded-lg border border-white/20 bg-[#07101a]/78 shadow-[0_0_30px_rgba(0,0,0,0.62),inset_0_0_22px_rgba(255,255,255,0.035)] backdrop-blur-sm transition-all duration-700 ${questionIsLive ? "opacity-100" : "opacity-70"}`}>
          <div className="flex items-center justify-center gap-3 border-r border-white/15 text-center">
            {menRows.length > 0 && <Avatar tone="blue" size="small" />}
            <div>
              <div className="text-xs font-black uppercase text-yellow-300">Primeiro a votar</div>
              <div className="mt-1 text-[15px] font-bold">
                {menRows.length > 0 ? (
                  <>
                    {menLeader[1]} <span className="text-blue-300">(Homens)</span>
                    <span className="ml-8 text-blue-200">{menLeader[3]}</span>
                  </>
                ) : (
                  <span className="text-white/54">Aguardando votos</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 border-r border-white/15 text-center">
            {womenRows.length > 0 && <Avatar tone="pink" size="small" />}
            <div>
              <div className="text-xs font-black uppercase text-yellow-300">Primeiro a acertar</div>
              <div className="mt-1 text-[15px] font-bold">
                {womenRows.length > 0 ? (
                  <>
                    {womenLeader[1]} <span className="text-pink-300">(Mulheres)</span>
                    <span className="ml-8 text-pink-300">{womenLeader[3]}</span>
                  </>
                ) : (
                  <span className="text-white/54">Aguardando votos</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-center">
            {questionIsLive && hasAnyVote ? (
              <>
                <ChoiceBadge color={optionColorByLetter[gameState.votes.top.option] || "green"}>{gameState.votes.top.option}</ChoiceBadge>
                <div>
                  <div className="text-xs font-black uppercase text-yellow-300">Alternativa mais votada</div>
                  <div className="mt-1 text-[15px] font-black text-green-300">{String(gameState.votes.top.text || "").toUpperCase()} ({gameState.votes.top.percent || 0}%)</div>
                </div>
              </>
            ) : (
              <div>
                <div className="text-xs font-black uppercase text-yellow-300">Alternativa mais votada</div>
                <div className="mt-1 text-[15px] font-black text-white/54">Aguardando votos</div>
              </div>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}





