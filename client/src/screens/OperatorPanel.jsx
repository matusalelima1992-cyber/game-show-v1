import React, { useEffect, useState } from "react";
import { useScreenState } from "../state/ScreenState";
import OfficialLogo from "../components/OfficialLogo";
import useGameState from "../hooks/useGameState";
import socket from "../socket";

const fallbackQuestions = [
  "Qual e a capital do Brasil?",
  "Quem pintou a Mona Lisa?",
  "Qual e o maior planeta do sistema solar?",
  "Qual e o animal mais rapido do mundo?",
  "Quantos continentes existem?",
  "Qual e o elemento quimico do ouro?",
  "Em que ano o homem pisou na Lua?",
  "Qual e o maior oceano da Terra?",
  "Quem escreveu Dom Quixote?",
  "Qual e o idioma mais falado no mundo?"
];

const alternatives = [
  ["A", "Terra", false],
  ["B", "Marte", false],
  ["C", "Jupiter", true],
  ["D", "Saturno", false]
];

const defaultOptionStyle = {
  color: "#ffffff",
  fontSize: 20,
  fontWeight: "900"
};

const defaultQuestionStyle = {
  question: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "900",
    fontFamily: "inherit"
  },
  options: ["A", "B", "C", "D"].map(() => ({ ...defaultOptionStyle }))
};

const colorPresets = ["#ffffff", "#fde047", "#60a5fa", "#f472b6", "#4ade80", "#fb923c"];

const fontSizeOptions = [
  ["Pequena", 18],
  ["Padrao", 20],
  ["Grande", 24],
  ["Gigante", 28]
];

const questionFontSizeOptions = [
  ["Padrao", 36],
  ["Grande", 42],
  ["Gigante", 48],
  ["Maxima", 54]
];

const fontWeightOptions = [
  ["Normal", "700"],
  ["Forte", "800"],
  ["Black", "900"]
];

const fontFamilyOptions = [
  ["Padrao", "inherit"],
  ["Arial", "Arial, sans-serif"],
  ["Impact", "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"],
  ["Trebuchet", "'Trebuchet MS', Arial, sans-serif"],
  ["Georgia", "Georgia, serif"]
];

function optionLetter(index) {
  return String.fromCharCode(65 + index);
}

function parseQuestionOption(option, index) {
  const letter = optionLetter(index);
  return String(option || "").replace(/^[A-Z]\s*-\s*/i, "").trim() || `Alternativa ${letter}`;
}

function createDraftFromQuestion(question) {
  const style = question?.style || defaultQuestionStyle;
  const optionCount = Math.min(26, Math.max(4, question?.options?.length || 4));

  return {
    title: question?.title || "",
    options: Array.from({ length: optionCount }, (_, index) => parseQuestionOption(question?.options?.[index], index)),
    correct: question?.correct || "A",
    style: {
      question: {
        ...defaultQuestionStyle.question,
        ...(style.question || {})
      },
      options: Array.from({ length: optionCount }, (_, index) => ({
        ...defaultOptionStyle,
        ...(style.options?.[index] || {})
      }))
    }
  };
}

function StylePicker({ label, value, sizeOptions, onChange, onReset }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-white/58">{label}</span>
        <button type="button" onClick={onReset} className="text-[10px] font-black uppercase text-cyan-300">Resetar</button>
      </div>

      <div className="grid grid-cols-[1fr_92px_96px] gap-2">
        <div className="flex items-center gap-1">
          {colorPresets.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ ...value, color })}
              className={`h-6 w-6 rounded-full border ${value.color === color ? "border-white" : "border-white/20"}`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          <input
            type="color"
            value={value.color}
            onChange={(event) => onChange({ ...value, color: event.target.value })}
            className="h-6 w-7 rounded border border-white/20 bg-transparent"
          />
        </div>

        <select
          value={value.fontSize}
          onChange={(event) => onChange({ ...value, fontSize: Number(event.target.value) })}
          className="rounded-md border border-white/10 bg-black/45 px-2 text-[11px] font-bold text-white outline-none"
        >
          {sizeOptions.map(([labelOption, size]) => (
            <option key={size} value={size}>{labelOption}</option>
          ))}
        </select>

        <select
          value={value.fontWeight}
          onChange={(event) => onChange({ ...value, fontWeight: event.target.value })}
          className="rounded-md border border-white/10 bg-black/45 px-2 text-[11px] font-bold text-white outline-none"
        >
          {fontWeightOptions.map(([labelOption, weight]) => (
            <option key={weight} value={weight}>{labelOption}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Icon({ name, className = "" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2
  };

  const paths = {
    monitor: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" {...common} />
        <path d="M8 20h8M12 16v4" {...common} />
      </>
    ),
    play: <path d="M8 5v14l11-7z" fill="currentColor" />,
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" {...common} />
        <circle cx="12" cy="12" r="3" {...common} />
      </>
    ),
    bars: (
      <>
        <path d="M5 19V9M12 19V5M19 19v-7" {...common} />
        <path d="M4 19h16" {...common} />
      </>
    ),
    trophy: (
      <>
        <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z" {...common} />
        <path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" {...common} />
      </>
    ),
    back: <path d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-1" {...common} />,
    square: <rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" />,
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...common} />
        <circle cx="9" cy="7" r="4" {...common} />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...common} />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V9M10 19V5M16 19v-8M22 19H2" {...common} />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" {...common} />
        <path d="M12 7v5l3 2" {...common} />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...common} />
        <path d="M14 2v6h6M8 13h8M8 17h6" {...common} />
      </>
    ),
    list: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13" {...common} />
        <path d="M3 6h.01M3 12h.01M3 18h.01" {...common} />
      </>
    ),
    gear: (
      <>
        <circle cx="12" cy="12" r="3" {...common} />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 5 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 5a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.22.38.6.65 1 .72.18.03.36.04.6.04h.01a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z" {...common} />
      </>
    ),
    power: (
      <>
        <path d="M12 2v10" {...common} />
        <path d="M18.36 6.64a9 9 0 1 1-12.72 0" {...common} />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" {...common} />
    ,
    qr: (
      <>
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" {...common} />
        <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2" {...common} />
      </>
    ),
    gamepad: (
      <>
        <rect x="3" y="7" width="18" height="11" rx="4" {...common} />
        <path d="M8 12h3M9.5 10.5v3" {...common} />
        <circle cx="16.5" cy="11.5" r=".8" fill="currentColor" />
        <circle cx="18.5" cy="14" r=".8" fill="currentColor" />
        <path d="M8 7l1-2h6l1 2" {...common} />
      </>
    )
  };

  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Panel({ title, icon, children, className = "", titleClassName = "" }) {
  return (
    <section className={`min-h-0 rounded-lg border border-white/10 bg-[#080d13]/92 shadow-[0_0_28px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}>
      {title && (
        <div className={`mb-3 flex items-center gap-2 text-[13px] font-black uppercase tracking-wide text-white/82 ${titleClassName}`}>
          {typeof icon === "string" ? icon : icon}
          <span>{title}</span>
        </div>
      )}
      {children}
    </section>
  );
}

function CommandButton({ tone, icon, title, subtitle, onClick, disabled = false }) {
  const styles = {
    blue: "border-blue-500/70 bg-gradient-to-r from-blue-950/90 to-blue-900/44 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.16)]",
    green: "border-green-500/70 bg-gradient-to-r from-green-950/95 to-green-900/50 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.16)]",
    purple: "border-purple-500/70 bg-gradient-to-r from-purple-950/95 to-purple-900/46 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.16)]",
    amber: "border-amber-500/70 bg-gradient-to-r from-amber-950/95 to-amber-900/46 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.16)]",
    pink: "border-pink-500/70 bg-gradient-to-r from-pink-950/95 to-pink-900/46 text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.16)]",
    cyan: "border-cyan-500/70 bg-gradient-to-r from-cyan-950/95 to-cyan-900/46 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.16)]",
    red: "border-red-500/70 bg-gradient-to-r from-red-950/95 to-red-900/46 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.16)]"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-[34px] w-full items-center gap-3 rounded-lg border px-4 text-left transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:brightness-100 ${styles[tone]}`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/8">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-black uppercase leading-none">{title}</span>
        <span className="mt-0.5 block truncate text-[9px] font-medium text-white/66">{subtitle}</span>
      </span>
    </button>
  );
}

function MetricCard({ title, icon, children, tone = "blue", className = "" }) {
  const styles = {
    blue: "border-blue-500/26 bg-gradient-to-br from-blue-950/38 via-[#081019]/88 to-[#06090e] text-blue-300",
    purple: "border-purple-500/28 bg-gradient-to-br from-purple-950/44 via-[#120a18]/88 to-[#06090e] text-purple-300",
    cyan: "border-cyan-500/28 bg-gradient-to-br from-cyan-950/42 via-[#061719]/88 to-[#06090e] text-cyan-300",
    amber: "border-amber-500/30 bg-gradient-to-br from-amber-950/38 via-[#171107]/88 to-[#06090e] text-amber-300",
    green: "border-green-500/26 bg-gradient-to-br from-green-950/38 via-[#081408]/88 to-[#06090e] text-green-300"
  };

  return (
    <div className={`min-h-0 rounded-lg border p-3 ${styles[tone]} ${className}`}>
      <div className="mb-2 flex items-center gap-2 border-b border-white/8 pb-2 text-[11px] font-black uppercase">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function ScreenName({ value }) {
  if (value === "result") return "ResultScreen";
  if (value === "grandFinal") return "GrandFinalScreen";
  if (value === "qrcode") return "QRCodeScreen";
  return "TVScreen";
}

function QuestionStatus({ state }) {
  if (state === "done") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[11px] font-black text-black shadow-[0_0_10px_rgba(34,197,94,0.55)]">
        ✓
      </span>
    );
  }

  if (state === "active") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-300 bg-blue-500/26 text-[10px] text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.45)]">
        ▶
      </span>
    );
  }

  return (
    <span className="h-5 w-5 rounded-full border border-white/38 bg-black/35 shadow-[inset_0_0_8px_rgba(255,255,255,0.06)]" />
  );
}

function StepperControl({ value, min = 1, max = 999, suffix, onChange }) {
  const clamp = (nextValue) => Math.min(max, Math.max(min, Math.round(Number(nextValue) || min)));

  return (
    <div className="grid grid-cols-[30px_1fr_34px] overflow-hidden rounded-md border border-white/10 bg-black/28 text-center">
      <button type="button" onClick={() => onChange(clamp(value - 1))} className="py-1 text-white/64">-</button>
      <input
        value={value}
        onChange={(event) => onChange(clamp(event.target.value))}
        inputMode="numeric"
        className="min-w-0 border-x border-white/8 bg-transparent py-1 text-center font-bold text-white outline-none"
      />
      <button type="button" onClick={() => onChange(clamp(value + 1))} className="py-1 text-white/64">{suffix || "+"}</button>
    </div>
  );
}

export default function OperatorPanel() {
  const { currentScreen: localScreen, setCurrentScreen } = useScreenState();
  const gameState = useGameState();
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [editorMode, setEditorMode] = useState(null);
  const [draftQuestion, setDraftQuestion] = useState(createDraftFromQuestion());
  const [newRoundName, setNewRoundName] = useState("");
  const [systemNow, setSystemNow] = useState(new Date());
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [eventNameDraft, setEventNameDraft] = useState("");
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [quickSettingsDraft, setQuickSettingsDraft] = useState({
    defaultTimer: 15,
    roundQuestionLimit: 10,
    maxParticipants: 20
  });
  const currentQuestion = gameState.currentQuestion;
  const gameQuestions = gameState.questions?.length ? gameState.questions : fallbackQuestions.map((title) => ({ title, options: [], correct: "A" }));
  const parsedAlternatives = (currentQuestion.options || []).map((option) => {
    const [letterPart, ...textParts] = String(option).split("-");
    return [letterPart.trim().charAt(0), textParts.join("-").trim(), letterPart.trim().charAt(0) === currentQuestion.correct];
  });
  const displayedAlternatives = parsedAlternatives.length ? parsedAlternatives : alternatives;
  const votePercent = Math.min(100, gameState.votes.percent || 0);
  const defaultTimer = gameState.settings?.defaultTimer || 15;
  const maxParticipants = gameState.settings?.maxParticipants || gameState.participants.max || 20;
  const roundQuestionLimit = gameState.settings?.roundQuestionLimit || gameState.totalQuestions || 10;
  const currentScreen = gameState.currentScreen || localScreen;
  const roundLocked = Boolean(gameState.roundLocked);
  const currentRoundNumber = (gameState.currentRoundIndex || 0) + 1;
  const totalRounds = gameState.totalRounds || 1;
  const currentRoundQuestionNumber = gameState.currentRoundQuestionNumber || 1;
  const questionProgress = Math.round((currentRoundQuestionNumber / Math.max(gameState.totalQuestions, 1)) * 100);
  const gameRounds = gameState.rounds?.length ? gameState.rounds : [{ name: "Rodada 1", questionIndexes: gameQuestions.map((_, index) => index), playedQuestionIndexes: [] }];
  const currentQuestionIndex = gameState.currentQuestionIndex || 0;
  const systemTime = systemNow.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const systemDate = systemNow.toLocaleDateString("pt-BR");
  const tvQuestionStyle = {
    ...defaultQuestionStyle.question,
    ...(currentQuestion.style?.question || {})
  };

  useEffect(() => {
    const clockTimer = window.setInterval(() => setSystemNow(new Date()), 1000);
    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    console.log("gameStateUpdate", gameState);
  }, [gameState]);

  useEffect(() => {
    setSelectedQuestionIndex(gameState.currentQuestionIndex || 0);
  }, [gameState.currentQuestionIndex]);

  const selectedQuestion = gameQuestions[selectedQuestionIndex] || currentQuestion;

  const emitSettings = (settings) => {
    socket.emit("updateSettings", {
      defaultTimer,
      maxParticipants,
      roundQuestionLimit,
      ...settings
    });
  };

  const openQuickSettings = () => {
    setQuickSettingsDraft({
      defaultTimer,
      roundQuestionLimit,
      maxParticipants
    });
    setShowQuickSettings(true);
  };

  const applyQuickSettings = () => {
    emitSettings(quickSettingsDraft);
    setShowQuickSettings(false);
  };

  const updateTVQuestionStyle = (nextStyle) => {
    const optionStyles = currentQuestion.style?.options || (currentQuestion.options || []).map(() => ({ ...defaultOptionStyle }));

    socket.emit("updateQuestion", {
      index: currentQuestionIndex,
      question: {
        ...currentQuestion,
        style: {
          ...(currentQuestion.style || {}),
          question: {
            ...defaultQuestionStyle.question,
            ...nextStyle
          },
          options: optionStyles
        }
      }
    });
  };

  const resetTVQuestionStyle = () => {
    updateTVQuestionStyle(defaultQuestionStyle.question);
  };

  const openCreateQuestion = () => {
    setDraftQuestion(createDraftFromQuestion({
      title: "",
      options: ["A - ", "B - ", "C - ", "D - "],
      correct: "A"
    }));
    setEditorMode("create");
  };

  const openEditQuestion = () => {
    setDraftQuestion(createDraftFromQuestion(selectedQuestion));
    setEditorMode("edit");
  };

  const saveDraftQuestion = () => {
    const question = {
      title: draftQuestion.title,
      options: draftQuestion.options.map((option, index) => `${optionLetter(index)} - ${option}`),
      correct: draftQuestion.correct,
      style: draftQuestion.style
    };

    if (editorMode === "create") {
      socket.emit("createQuestion", question);
    } else if (editorMode === "edit") {
      socket.emit("updateQuestion", { index: selectedQuestionIndex, question });
    }

    setEditorMode(null);
  };

  const addAlternative = () => {
    setDraftQuestion((draft) => {
      if (draft.options.length >= 26) return draft;

      return {
        ...draft,
        options: [...draft.options, ""],
        style: {
          ...draft.style,
          options: [...draft.style.options, { ...defaultOptionStyle }]
        }
      };
    });
  };

  const selectQuestion = (index) => {
    setSelectedQuestionIndex(index);
    socket.emit("selectQuestion", index);
    setCurrentScreen("tv");
  };

  const createEvent = () => {
    const name = eventNameDraft.trim();
    if (!name) return;

    socket.emit("createEvent", { name });
    setEventNameDraft("");
    setShowCreateEventModal(false);
    setCurrentScreen("qrcode");
  };

  const openCreateEvent = () => {
    setEventNameDraft("");
    setShowCreateEventModal(true);
  };

  const duplicateQuestion = () => {
    socket.emit("duplicateQuestion", selectedQuestionIndex);
  };

  const deleteQuestion = () => {
    socket.emit("deleteQuestion", selectedQuestionIndex);
  };

  const showQuestion = () => {
    socket.emit("showQuestion");
    setCurrentScreen("tv");
  };

  const previousQuestion = () => {
    socket.emit("previousQuestion");
    setCurrentScreen("tv");
  };

  const revealAnswer = () => {
    socket.emit("setCorrectAnswer", currentQuestion.correct);
    socket.emit("revealAnswer");
  };

  const showResult = () => {
    socket.emit("showResult");
    setCurrentScreen("result");
  };

  const showGrandFinal = () => {
    socket.emit("showGrandFinal");
    setCurrentScreen("grandFinal");
  };

  const showQRCode = () => {
    socket.emit("showQRCode");
    setCurrentScreen("qrcode");
  };

  const nextQuestion = () => {
    socket.emit("nextQuestion");
    setCurrentScreen("tv");
  };

  const clearRound = () => {
    socket.emit("clearRound");
    setCurrentScreen("tv");
  };

  const endSystem = () => {
    const confirmed = window.confirm("Encerrar o evento atual? Participantes serao desconectados e a sala sera invalidada.");
    if (!confirmed) return;

    socket.emit("endSystem");
    setShowSystemMenu(false);
    setCurrentScreen("tv");
  };

  const restartSystem = () => {
    const confirmed = window.confirm("Deseja reiniciar o sistema?");
    if (!confirmed) return;

    socket.emit("restartSystem");
    setShowSystemMenu(false);
    setCurrentScreen("tv");
  };

  const closeProgram = () => {
    const confirmed = window.confirm("Deseja fechar o programa?");
    if (!confirmed) return;

    socket.emit("endSystem");
    setShowSystemMenu(false);
    window.alert("Fechar programa disponivel apenas na versao Desktop.");
  };

  const returnToQuestion = () => {
    socket.emit("setScreen", "tv");
    setCurrentScreen("tv");
  };

  const unlockNextRound = () => {
    socket.emit("unlockNextRound");
    setCurrentScreen("tv");
  };

  const createRound = () => {
    socket.emit("createRound", { name: newRoundName || `Rodada ${gameRounds.length + 1}` });
    setNewRoundName("");
  };

  const deleteRound = (roundIndex) => {
    const round = gameRounds[roundIndex];
    const name = round?.name || `Rodada ${roundIndex + 1}`;

    if (gameRounds.length <= 1) {
      window.alert("O jogo precisa manter pelo menos uma rodada.");
      return;
    }

    const confirmed = window.confirm(`Eliminar ${name}? As perguntas nao serao excluidas, apenas removidas desta rodada.`);
    if (!confirmed) return;

    socket.emit("deleteRound", roundIndex);
  };

  const toggleRoundQuestion = (roundIndex, questionIndex) => {
    const round = gameRounds[roundIndex];
    const currentIndexes = round?.questionIndexes || [];
    const alreadySelected = currentIndexes.includes(questionIndex);

    if (!alreadySelected) {
      const existingRoundIndex = gameRounds.findIndex((candidateRound, candidateIndex) => (
        candidateIndex !== roundIndex && (candidateRound.questionIndexes || []).includes(questionIndex)
      ));

      if (existingRoundIndex >= 0) {
        const currentRoundName = round?.name || `Rodada ${roundIndex + 1}`;
        const existingRoundName = gameRounds[existingRoundIndex]?.name || `Rodada ${existingRoundIndex + 1}`;
        const confirmed = window.confirm(`Essa pergunta ja foi selecionada na ${existingRoundName}. Quer marcar novamente na ${currentRoundName}?`);
        if (!confirmed) return;
      }
    }

    const questionIndexes = currentIndexes.includes(questionIndex)
      ? currentIndexes.filter((index) => index !== questionIndex)
      : [...currentIndexes, questionIndex];

    socket.emit("updateRoundQuestions", { roundIndex, questionIndexes });
  };

  return (
    <div className="h-screen overflow-hidden bg-[#03070d] p-2 text-white">
      <div className="mx-auto grid h-[calc(100vh-16px)] grid-rows-[60px_minmax(0,1fr)_38px] rounded-xl border border-white/16 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.12),transparent_30%),linear-gradient(180deg,rgba(8,13,20,0.96),rgba(0,0,0,0.96))] p-4 shadow-[0_0_70px_rgba(0,0,0,0.85),inset_0_0_80px_rgba(255,255,255,0.02)]">
        <header className="grid min-h-0 grid-cols-[360px_minmax(0,1fr)_142px_274px] items-center gap-4">
          <OfficialLogo subtitle="Painel do operador" />

          <div className="grid h-[60px] grid-cols-2 rounded-lg border border-white/14 bg-[#080c12]/88">
            <div className="border-r border-white/10 px-5 py-2">
              <div className="text-[12px] uppercase text-white/78">Status do sistema</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-black uppercase text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
                Conectado
              </div>
            </div>
            <div className="flex items-center gap-4 px-5 py-2">
              <Icon name="monitor" className="h-10 w-10 text-blue-400" />
              <div>
                <div className="text-[12px] uppercase text-white/78">Status da TV</div>
                <div className="mt-1 flex items-center gap-2 text-sm font-black uppercase text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
                  Conectada
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/14 bg-[#080c12]/88 py-3 text-center">
            <div className="text-lg font-black leading-none">{systemTime}</div>
            <div className="mt-1 text-[11px] text-white/58">{systemDate}</div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSystemMenu((current) => !current)}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-lg border border-cyan-500/45 bg-cyan-950/38 text-sm font-black uppercase text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.14)] transition hover:brightness-125"
            >
              <Icon name="gear" className="h-5 w-5" />
              Sistema
            </button>

            {showSystemMenu && (
              <div className="absolute right-0 top-[58px] z-40 w-[230px] overflow-hidden rounded-xl border border-white/14 bg-[#060b12] py-2 text-sm shadow-[0_18px_44px_rgba(0,0,0,0.78),0_0_30px_rgba(34,211,238,0.12)]">
                <button type="button" onClick={endSystem} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-black uppercase text-red-300 hover:bg-red-950/35">
                  <Icon name="power" className="h-4 w-4" />
                  Encerrar Evento
                </button>
                <button type="button" onClick={restartSystem} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-black uppercase text-amber-300 hover:bg-amber-950/35">
                  <Icon name="back" className="h-4 w-4" />
                  Reiniciar Sistema
                </button>
                <button type="button" onClick={() => { setShowSystemSettings(true); setShowSystemMenu(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-black uppercase text-cyan-200 hover:bg-cyan-950/35">
                  <Icon name="gear" className="h-4 w-4" />
                  Configuracoes
                </button>
                <button type="button" onClick={() => { setShowAbout(true); setShowSystemMenu(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-black uppercase text-blue-200 hover:bg-blue-950/35">
                  <Icon name="file" className="h-4 w-4" />
                  Sobre
                </button>
                <button type="button" onClick={closeProgram} className="flex w-full items-center gap-3 border-t border-white/10 px-4 py-2.5 text-left font-black uppercase text-white/72 hover:bg-white/8">
                  <Icon name="square" className="h-4 w-4" />
                  Fechar Programa
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="grid min-h-0 grid-cols-[366px_minmax(0,1fr)] gap-4 py-3">
          <aside className="flex min-h-0 flex-col gap-3 overflow-hidden">
            <Panel title="Controles principais" icon={<Icon name="gear" className="h-4 w-4 text-white/70" />} className="shrink-0 p-3">
              <div className="space-y-1">
                <CommandButton tone="cyan" icon={<Icon name="plus" className="h-5 w-5" />} title="Criar evento" subtitle="Gerar sala e QR Code" onClick={openCreateEvent} />
                <CommandButton tone="blue" icon={<Icon name="qr" className="h-5 w-5" />} title="Mostrar QR Code" subtitle="Exibir entrada da sala na TV" onClick={showQRCode} disabled={!gameState.activeEvent?.active} />
                <CommandButton tone="blue" icon={<Icon name="monitor" className="h-5 w-5" />} title="Mostrar pergunta" subtitle="Exibir pergunta na tela da TV" onClick={showQuestion} disabled={roundLocked} />
                <CommandButton tone="red" icon={<Icon name="square" className="h-5 w-5" />} title="Proxima pergunta" subtitle="Avancar dentro da rodada" onClick={nextQuestion} disabled={roundLocked} />
                <CommandButton tone="purple" icon={<Icon name="eye" className="h-5 w-5" />} title="Revelar resposta" subtitle="Revelar resposta correta" onClick={revealAnswer} disabled={roundLocked} />
                <CommandButton tone="amber" icon={<Icon name="bars" className="h-5 w-5" />} title="Mostrar resultado" subtitle="Exibir resultado da rodada" onClick={showResult} disabled={roundLocked} />
                <CommandButton tone="pink" icon={<Icon name="trophy" className="h-5 w-5" />} title="Mostrar placar geral" subtitle="Exibir placar geral do game" onClick={showGrandFinal} />
                <CommandButton tone="cyan" icon={<Icon name="back" className="h-5 w-5" />} title="Voltar para pergunta" subtitle="Voltar para tela de pergunta" onClick={returnToQuestion} />
                <CommandButton tone="green" icon={<Icon name="back" className="h-5 w-5" />} title="Voltar pergunta" subtitle="Retornar pergunta anterior" onClick={previousQuestion} />
              </div>
            </Panel>

            <Panel className="relative h-[210px] shrink-0 overflow-visible p-3">
              <div className="space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={openQuickSettings}
                  className="mb-2 flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:border-cyan-400/35 hover:bg-cyan-950/18"
                >
                  <span className="flex items-center gap-2">
                    <Icon name="gear" className="h-5 w-5 text-white/70" />
                    <span className="font-black uppercase tracking-wide text-white">Configuracoes rapidas</span>
                  </span>
                  <span className="text-[10px] font-black uppercase text-cyan-300">Abrir</span>
                </button>

                {showQuickSettings && (
                  <div className="absolute inset-x-3 bottom-3 z-30 h-[248px] rounded-xl border border-cyan-400/36 bg-[#020811] p-3 shadow-[0_0_45px_rgba(34,211,238,0.24),0_18px_44px_rgba(0,0,0,0.86)]">
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(180deg,#06121c_0%,#020811_58%,#010409_100%)]" />
                    <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2 text-sm font-black uppercase text-white">
                        <Icon name="gear" className="h-5 w-5 text-cyan-300" />
                        Ajustes rapidos
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQuickSettings(false)}
                        className="rounded border border-white/12 px-2 py-1 text-[10px] font-black uppercase text-white/62 hover:bg-white/8"
                      >
                        Fechar
                      </button>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="grid grid-cols-[1fr_116px] items-center gap-3">
                        <span className="text-white/74">Tempo padrao da rodada</span>
                        <StepperControl value={quickSettingsDraft.defaultTimer} min={5} max={300} suffix="seg" onChange={(value) => setQuickSettingsDraft((draft) => ({ ...draft, defaultTimer: value }))} />
                      </div>
                      <div className="grid grid-cols-[1fr_116px] items-center gap-3">
                        <span className="text-white/74">Perguntas por rodada</span>
                        <StepperControl value={quickSettingsDraft.roundQuestionLimit} min={1} max={Math.max(gameQuestions.length, 1)} onChange={(value) => setQuickSettingsDraft((draft) => ({ ...draft, roundQuestionLimit: value }))} />
                      </div>
                      <div className="grid grid-cols-[1fr_116px] items-center gap-3">
                        <span className="text-white/74">Participantes</span>
                        <StepperControl value={quickSettingsDraft.maxParticipants} min={1} max={999} onChange={(value) => setQuickSettingsDraft((draft) => ({ ...draft, maxParticipants: value }))} />
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setShowQuickSettings(false)}
                        className="h-8 rounded-lg border border-white/14 bg-white/6 text-xs font-black uppercase text-white/72"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={applyQuickSettings}
                        className="h-8 rounded-lg border border-green-400/38 bg-green-950/50 text-xs font-black uppercase text-green-200"
                      >
                        Aplicar
                      </button>
                    </div>
                    </div>
                  </div>
                )}

                <div className={`rounded-lg border px-3 py-1.5 ${roundLocked ? "border-amber-400/45 bg-amber-950/30" : "border-green-400/25 bg-green-950/18"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-black uppercase text-white/58">Bloco de rodadas</div>
                      <div className="mt-0.5 text-xs font-black uppercase text-white">
                        Rodada {currentRoundNumber}/{totalRounds}
                        <span className="ml-2 text-white/52">
                          Pergunta {currentRoundQuestionNumber}/{gameState.totalQuestions}
                        </span>
                      </div>
                    </div>
                    <span className={`rounded px-2 py-1 text-[10px] font-black uppercase ${roundLocked ? "bg-amber-400/20 text-amber-200" : "bg-green-400/16 text-green-300"}`}>
                      {roundLocked ? "Travada" : "Liberada"}
                    </span>
                  </div>
                  {roundLocked && (
                    <button
                      type="button"
                      onClick={unlockNextRound}
                      disabled={currentRoundNumber >= totalRounds}
                      className="mt-2 h-8 w-full rounded-md border border-cyan-400/35 bg-cyan-950/36 text-[10px] font-black uppercase text-cyan-200 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      {currentRoundNumber >= totalRounds ? "Todas as rodadas concluidas" : "Destravar proxima rodada"}
                    </button>
                  )}
                </div>
                <button onClick={clearRound} className="h-8 w-full rounded-lg border border-white/12 bg-white/5 font-black uppercase text-white/78">Limpar rodada</button>
              </div>
            </Panel>
          </aside>

          <section className="grid min-h-0 grid-rows-[178px_minmax(0,1fr)] gap-4 overflow-hidden">
            <div className="grid min-h-0 grid-cols-[1fr_1fr_1fr_1fr_1.08fr] gap-3">
              <MetricCard title="Participantes" icon={<Icon name="users" className="h-5 w-5" />} tone="blue">
                <div className="grid grid-cols-2 border-b border-white/8 pb-3 text-center">
                  <div>
                    <div className="text-xs uppercase text-blue-300">Homens</div>
                    <div className="mt-1 text-2xl font-black text-blue-300">{gameState.participants.men}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-pink-300">Mulheres</div>
                    <div className="mt-1 text-2xl font-black text-pink-300">{gameState.participants.women}</div>
                  </div>
                </div>
                <div className="pt-3 text-center">
                  <div className="text-xs uppercase text-white/62">Total</div>
                  <div className="text-2xl font-black text-white">{gameState.participants.total}</div>
                </div>
              </MetricCard>

              <MetricCard title="Votos recebidos" icon={<Icon name="chart" className="h-5 w-5" />} tone="purple">
                <div className="text-3xl font-black">{gameState.votes.count} <span className="text-xl text-white/86">/ {gameState.votes.total || 0}</span></div>
                <div className="mt-2 text-lg font-black text-purple-300">{votePercent}%</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full border border-white/20 bg-black/40">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400" style={{ width: `${votePercent}%` }} />
                </div>
              </MetricCard>

              <MetricCard title="Tempo da rodada" icon={<Icon name="clock" className="h-5 w-5" />} tone="cyan">
                <div className="text-center text-4xl font-black text-cyan-300">{gameState.timer}<span className="text-xl">s</span></div>
                <div className="mt-1 text-center text-[10px] uppercase text-white/62">Tempo padrao</div>
                <button onClick={() => emitSettings({ defaultTimer: defaultTimer + 5 })} className="mt-2 h-7 w-full rounded-md border border-cyan-500/45 bg-cyan-950/42 text-[10px] font-black uppercase text-cyan-300">Alterar tempo</button>
              </MetricCard>

              <MetricCard title="Pergunta atual" icon={<Icon name="file" className="h-5 w-5" />} tone="amber">
                <div className="text-center text-4xl font-black text-amber-300">{String(currentRoundQuestionNumber).padStart(2, "0")} <span className="text-xl text-white">/ {gameState.totalQuestions}</span></div>
                <div className="mt-1 text-center text-[10px] uppercase text-white/62">Pergunta da rodada</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/50">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300" style={{ width: `${questionProgress}%` }} />
                </div>
              </MetricCard>

              <MetricCard title="Status da TV" icon={<Icon name="monitor" className="h-4 w-4" />} tone="green">
                <div className="mt-1 flex items-center gap-2 text-lg font-black uppercase text-green-400">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
                  Conectada
                </div>
                <div className="mt-3 space-y-1 border-b border-white/8 pb-2 text-[11px] text-white/72">
                  <div>IP: <span className="text-white">192.168.1.10</span></div>
                  <div>Porta: <span className="text-white">3001</span></div>
                </div>
                <div className="mt-2 text-[9px] font-bold uppercase text-white/58">Tela atual:</div>
                <div className="truncate text-sm font-black text-green-400"><ScreenName value={currentScreen} /></div>
              </MetricCard>
            </div>

            <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_580px] gap-4">
              <Panel title="Pre-visualizacao da pergunta" icon={<Icon name="eye" className="h-4 w-4 text-white/72" />} className="overflow-hidden p-3">
                <div className="rounded-lg border border-white/10 bg-black/24 p-2.5">
                  <div className="mb-1.5 text-[12px] text-white/88">{String(gameState.currentQuestionIndex + 1).padStart(2, "0")}. {currentQuestion.title}</div>
                  {displayedAlternatives.map(([letter, text, correct]) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => socket.emit("setCorrectAnswer", letter)}
                      className={`mb-1 flex w-full items-center justify-between rounded-md px-2.5 py-1 text-left text-[11px] transition hover:brightness-125 ${correct ? "bg-green-700/45 text-green-100" : "bg-white/4"}`}
                    >
                      <span><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black">{letter}</span>{text}</span>
                      {correct && <span className="rounded bg-green-500/30 px-2 py-1 text-[10px] font-black uppercase">Correta</span>}
                    </button>
                  ))}
                </div>

                <div className="mt-2 border-t border-white/10 pt-2">
                  <div className="mb-1 text-[10px] font-bold uppercase text-white/62">Alternativa mais votada (atual)</div>
                  <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-950/44 px-3 py-1.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-base font-black">{gameState.votes.top.option}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px]"><span>{gameState.votes.top.text}</span><span>{gameState.votes.top.votes} votos</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-black/45"><div className="h-full rounded-full bg-green-400" style={{ width: `${gameState.votes.top.percent || 0}%` }} /></div>
                    </div>
                    <span className="text-base font-black">{gameState.votes.top.percent || 0}%</span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="mb-1 text-[10px] font-bold uppercase text-white/72">Historico da rodada</div>
                  <div className="rounded-lg border border-white/10 bg-black/22">
                    {gameState.history.length ? (
                      gameState.history.map(([time, text]) => (
                        <div key={`${time}-${text}`} className="grid grid-cols-[60px_1fr] border-b border-white/6 px-3 py-0.5 font-mono text-[9px] text-white/70 last:border-b-0">
                          <span>{time}</span>
                          <span>{text}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-white/36">
                        Sem eventos na rodada
                      </div>
                    )}
                  </div>
                </div>
              </Panel>

              <Panel title="Gerenciar perguntas" icon={<Icon name="list" className="h-5 w-5 text-white/72" />} className="flex min-h-0 flex-col overflow-hidden p-4">
                <div className="-mt-9 mb-3 flex justify-end">
                  <button onClick={openCreateQuestion} className="flex items-center gap-2 rounded-md border border-blue-500/55 bg-blue-950/55 px-4 py-2 text-sm font-black uppercase text-blue-300">
                    <Icon name="plus" className="h-4 w-4" />
                    Nova pergunta
                  </button>
                </div>
                <div className="operator-question-scroll min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10 bg-black/16">
                  {gameRounds.map((round, roundIndex) => {
                    const pendingIndexes = (round.questionIndexes || []).filter((index) => !(round.playedQuestionIndexes || []).includes(index));

                    return (
                      <div key={round.id || round.name || roundIndex} className="border-b border-white/10 last:border-b-0">
                        <div className="flex items-center justify-between bg-white/5 px-3 py-2 text-[11px] font-black uppercase text-cyan-200">
                          <span>{round.name || `Rodada ${roundIndex + 1}`}</span>
                          <span className="text-white/50">{pendingIndexes.length} pendentes</span>
                        </div>
                        {pendingIndexes.length ? pendingIndexes.map((index) => {
                          const question = gameQuestions[index];
                          const active = index === gameState.currentQuestionIndex;
                          const status = active ? "active" : "pending";

                          return (
                            <button
                              key={`${roundIndex}-${question?.title || index}`}
                              type="button"
                              onClick={() => selectQuestion(index)}
                              className={`grid grid-cols-[42px_1fr_32px] items-center border-b border-white/7 px-3 py-2.5 text-left text-sm transition last:border-b-0 hover:bg-blue-900/28 ${active ? "bg-blue-700/46 text-white" : selectedQuestionIndex === index ? "bg-white/8 text-white" : "text-white/78"}`}
                            >
                              <span>{String(index + 1).padStart(2, "0")}.</span>
                              <span className="truncate">{question?.title || question}</span>
                              <span className="flex justify-end"><QuestionStatus state={status} /></span>
                            </button>
                          );
                        }) : (
                          <div className="px-3 py-3 text-xs font-bold uppercase text-white/36">Rodada sem perguntas pendentes</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <button onClick={openEditQuestion} className="h-11 rounded-md border border-blue-500/50 bg-blue-950/45 font-black uppercase text-blue-300">Editar</button>
                  <button onClick={duplicateQuestion} className="h-11 rounded-md border border-white/14 bg-white/6 font-black uppercase text-white/78">Duplicar</button>
                  <button onClick={deleteQuestion} className="h-11 rounded-md border border-red-500/50 bg-red-950/45 font-black uppercase text-red-300">Excluir</button>
                </div>
              </Panel>
            </div>
          </section>
        </main>

        <footer className="grid h-[38px] grid-cols-[1fr_1fr_1fr_1fr_42px] items-center rounded-lg border border-white/12 bg-[#080c12]/74 px-5 text-xs text-white/70">
          <span>Usuario: <b>Operador</b></span>
          <span>Evento: <b>Game Show V1</b></span>
          <span>Duracao da rodada: <b>15s</b></span>
          <span>Versao: <b>1.0.0</b></span>
          <button
            type="button"
            onClick={() => setShowGeneralSettings(true)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md border border-cyan-400/35 bg-cyan-950/35 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.18)] transition hover:brightness-125"
            title="Configuracao geral"
          >
            <Icon name="gear" className="h-4 w-4" />
          </button>
        </footer>

        {showCreateEventModal && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/72 p-6">
            <div className="w-[560px] rounded-xl border border-cyan-400/28 bg-[#071018] p-5 shadow-[0_0_55px_rgba(34,211,238,0.16),inset_0_0_45px_rgba(255,255,255,0.03)]">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-xl font-black uppercase text-white">Criar evento</div>
                  <div className="text-xs font-bold uppercase tracking-wide text-white/50">Nome do evento exibido na tela do QR Code</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateEventModal(false)}
                  className="h-9 rounded-md border border-white/14 px-4 text-xs font-black uppercase text-white/72 hover:bg-white/8"
                >
                  Fechar
                </button>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-cyan-200">Nome do evento</span>
                <input
                  value={eventNameDraft}
                  onChange={(event) => setEventNameDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      createEvent();
                    }
                  }}
                  placeholder="Ex: Culto Jovens 2026"
                  className="h-12 w-full rounded-lg border border-white/12 bg-[#050910] px-4 text-base font-black text-white outline-none focus:border-cyan-300"
                  autoFocus
                />
              </label>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateEventModal(false)}
                  className="h-11 rounded-md border border-white/14 bg-white/6 font-black uppercase text-white/72"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={createEvent}
                  disabled={!eventNameDraft.trim()}
                  className="h-11 rounded-md border border-cyan-400/45 bg-cyan-950/55 font-black uppercase text-cyan-200 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Gerar sala
                </button>
              </div>
            </div>
          </div>
        )}

        {showSystemSettings && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/72 p-6">
            <div className="w-[760px] rounded-xl border border-cyan-400/25 bg-[#071018] p-5 shadow-[0_0_55px_rgba(34,211,238,0.16),inset_0_0_45px_rgba(255,255,255,0.03)]">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-xl font-black uppercase text-white">Configuracoes do sistema</div>
                  <div className="text-xs font-bold uppercase tracking-wide text-white/50">Estrutura preparada para futuras versoes</div>
                </div>
                <button type="button" onClick={() => setShowSystemSettings(false)} className="h-9 rounded-md border border-white/14 px-4 text-xs font-black uppercase text-white/72 hover:bg-white/8">
                  Fechar
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="rounded-lg border border-white/10 bg-black/24 p-4">
                  <div className="mb-3 font-black uppercase text-cyan-200">Geral</div>
                  <label className="mb-3 block">
                    <span className="mb-1 block text-xs font-bold uppercase text-white/52">Nome padrao do evento</span>
                    <input value="Game Show" readOnly className="h-9 w-full rounded border border-white/10 bg-black/35 px-3 text-white/70" />
                  </label>
                  <label className="mb-3 block">
                    <span className="mb-1 block text-xs font-bold uppercase text-white/52">Tempo padrao da rodada</span>
                    <input value={`${defaultTimer}s`} readOnly className="h-9 w-full rounded border border-white/10 bg-black/35 px-3 text-white/70" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-white/52">Quantidade padrao de perguntas</span>
                    <input value={roundQuestionLimit} readOnly className="h-9 w-full rounded border border-white/10 bg-black/35 px-3 text-white/70" />
                  </label>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/24 p-4">
                  <div className="mb-3 font-black uppercase text-pink-200">Visual</div>
                  <div className="space-y-3 text-xs font-bold uppercase text-white/58">
                    <div className="rounded border border-white/10 bg-black/28 p-3">Logo: Game Show.me</div>
                    <div className="rounded border border-white/10 bg-black/28 p-3">Tema futuro: Premium neon</div>
                    <div className="rounded border border-white/10 bg-black/28 p-3">Cor principal futura</div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/24 p-4">
                  <div className="mb-3 font-black uppercase text-amber-200">Dados</div>
                  <div className="space-y-3 text-xs font-bold uppercase text-white/58">
                    <div className="rounded border border-white/10 bg-black/28 p-3">Pasta de dados: futuro</div>
                    <div className="rounded border border-white/10 bg-black/28 p-3">Backups: futuro</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAbout && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/72 p-6">
            <div className="w-[560px] rounded-xl border border-blue-400/25 bg-[#071018] p-6 text-center shadow-[0_0_55px_rgba(59,130,246,0.16),inset_0_0_45px_rgba(255,255,255,0.03)]">
              <OfficialLogo subtitle="Sistema de Quiz Interativo" />
              <div className="mt-5 text-xl font-black uppercase text-white">Game Show.me</div>
              <div className="mt-1 text-sm font-bold uppercase text-blue-200">Versao: 1.0.0</div>
              <div className="mx-auto mt-5 max-w-[440px] rounded-lg border border-white/10 bg-black/28 p-5 text-center shadow-[inset_0_0_28px_rgba(59,130,246,0.08)]">
                <div className="text-lg font-black uppercase leading-snug tracking-wide text-white">
                  Interatividades, criatividades,
                  <br />
                  em um so lugar
                </div>
                <div className="mx-auto mt-4 h-px w-44 bg-gradient-to-r from-transparent via-pink-400/70 to-transparent" />
                <div className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-blue-200/75">
                  Game Show.me
                </div>
              </div>
              <button type="button" onClick={() => setShowAbout(false)} className="mt-5 h-10 rounded-md border border-white/14 px-6 text-xs font-black uppercase text-white/72 hover:bg-white/8">
                Fechar
              </button>
            </div>
          </div>
        )}

        {editorMode && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/68 p-6">
            <div className="max-h-[calc(100vh-48px)] w-[720px] overflow-y-auto rounded-xl border border-blue-400/25 bg-[#071018] p-5 shadow-[0_0_55px_rgba(59,130,246,0.16),inset_0_0_45px_rgba(255,255,255,0.03)]">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-lg font-black uppercase text-white">
                    {editorMode === "create" ? "Nova pergunta" : "Editar pergunta"}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-white/48">
                    A resposta correta escolhida aqui passa a comandar a rodada
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditorMode(null)}
                  className="h-9 rounded-md border border-white/14 px-4 text-xs font-black uppercase text-white/72 hover:bg-white/8"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="block text-xs font-black uppercase text-white/58">Pergunta</span>
                    <button
                      type="button"
                      onClick={() => setDraftQuestion((draft) => ({ ...draft, style: defaultQuestionStyle }))}
                      className="rounded border border-cyan-400/28 px-3 py-1 text-[10px] font-black uppercase text-cyan-300"
                    >
                      Resetar estilos
                    </button>
                  </div>
                  <input
                    value={draftQuestion.title}
                    onChange={(event) => setDraftQuestion((draft) => ({ ...draft, title: event.target.value }))}
                    className="h-11 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm font-semibold text-white outline-none focus:border-blue-400"
                  />
                </label>

                <StylePicker
                  label="Estilo do texto da pergunta"
                  value={draftQuestion.style.question}
                  sizeOptions={questionFontSizeOptions}
                  onChange={(questionStyle) => setDraftQuestion((draft) => ({
                    ...draft,
                    style: {
                      ...draft.style,
                      question: questionStyle
                    }
                  }))}
                  onReset={() => setDraftQuestion((draft) => ({
                    ...draft,
                    style: {
                      ...draft.style,
                      question: defaultQuestionStyle.question
                    }
                  }))}
                />

                <div className="grid grid-cols-2 gap-3">
                  {draftQuestion.options.map((_, index) => {
                    const letter = optionLetter(index);

                    return (
                    <div key={letter} className={`rounded-lg border p-3 ${draftQuestion.correct === letter ? "border-green-400/70 bg-green-950/30" : "border-white/10 bg-black/24"}`}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-white/62">Alternativa {letter}</span>
                        <button
                          type="button"
                          onClick={() => setDraftQuestion((draft) => ({ ...draft, correct: letter }))}
                          className={`rounded px-2 py-1 text-[10px] font-black uppercase ${draftQuestion.correct === letter ? "bg-green-500/30 text-green-200" : "bg-white/8 text-white/58"}`}
                        >
                          Correta
                        </button>
                      </div>
                      <input
                        value={draftQuestion.options[index]}
                        onChange={(event) => {
                          const options = [...draftQuestion.options];
                          options[index] = event.target.value;
                          setDraftQuestion((draft) => ({ ...draft, options }));
                        }}
                        className="h-10 w-full rounded-md border border-white/10 bg-[#050910] px-3 text-sm text-white caret-white outline-none placeholder:text-white/35 focus:border-blue-400"
                      />
                      <div className="mt-3">
                        <StylePicker
                          label={`Estilo alternativa ${letter}`}
                          value={draftQuestion.style.options[index] || defaultOptionStyle}
                          sizeOptions={fontSizeOptions}
                          onChange={(optionStyle) => {
                            const optionStyles = [...draftQuestion.style.options];
                            optionStyles[index] = optionStyle;
                            setDraftQuestion((draft) => ({
                              ...draft,
                              style: {
                                ...draft.style,
                                options: optionStyles
                              }
                            }));
                          }}
                          onReset={() => {
                            const optionStyles = [...draftQuestion.style.options];
                            optionStyles[index] = { ...defaultOptionStyle };
                            setDraftQuestion((draft) => ({
                              ...draft,
                              style: {
                                ...draft.style,
                                options: optionStyles
                              }
                            }));
                          }}
                        />
                      </div>
                    </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={addAlternative}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-cyan-400/35 bg-cyan-950/30 text-xs font-black uppercase tracking-wide text-cyan-200 hover:bg-cyan-900/40 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={draftQuestion.options.length >= 26}
                >
                  <Icon name="plus" className="h-4 w-4" />
                  Adicionar alternativa
                </button>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditorMode(null)}
                    className="h-11 rounded-md border border-white/14 bg-white/6 font-black uppercase text-white/72"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={saveDraftQuestion}
                    className="h-11 rounded-md border border-green-400/45 bg-green-950/55 font-black uppercase text-green-200"
                  >
                    Salvar pergunta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showGeneralSettings && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/68 p-6">
            <div className="w-[720px] rounded-xl border border-cyan-400/25 bg-[#071018] p-5 shadow-[0_0_55px_rgba(34,211,238,0.16),inset_0_0_45px_rgba(255,255,255,0.03)]">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-950/45 text-cyan-300">
                    <Icon name="gear" className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="text-lg font-black uppercase text-white">Configuracao geral</div>
                    <div className="text-xs uppercase tracking-wide text-white/48">Parametros visuais do Game Show</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGeneralSettings(false)}
                  className="h-9 rounded-md border border-white/14 px-4 text-xs font-black uppercase text-white/72 hover:bg-white/8"
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="rounded-lg border border-white/10 bg-black/24 p-4">
                  <div className="mb-3 font-black uppercase text-cyan-200">Adicionar rodadas</div>
                  <div className="grid grid-cols-[1fr_150px] gap-3">
                    <input
                      value={newRoundName}
                      onChange={(event) => setNewRoundName(event.target.value)}
                      placeholder={`Rodada ${gameRounds.length + 1}`}
                      className="h-10 rounded-md border border-white/10 bg-[#050910] px-3 text-sm font-bold text-white outline-none focus:border-cyan-300"
                    />
                    <button
                      type="button"
                      onClick={createRound}
                      className="rounded-md border border-cyan-400/35 bg-cyan-950/45 text-xs font-black uppercase text-cyan-200"
                    >
                      Adicionar rodada
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/24 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="font-black uppercase text-cyan-200">Estilo da pergunta no telao</div>
                      <div className="text-xs font-bold uppercase text-white/42">Cor, tamanho e fonte da pergunta central</div>
                    </div>
                    <button
                      type="button"
                      onClick={resetTVQuestionStyle}
                      className="rounded-md border border-cyan-400/35 bg-cyan-950/35 px-3 py-1.5 text-[10px] font-black uppercase text-cyan-200"
                    >
                      Resetar
                    </button>
                  </div>

                  <div className="grid grid-cols-[1fr_112px_112px_138px] gap-2">
                    <div className="flex items-center gap-1 rounded-md border border-white/10 bg-black/24 px-2">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateTVQuestionStyle({ ...tvQuestionStyle, color })}
                          className={`h-6 w-6 rounded-full border ${tvQuestionStyle.color === color ? "border-white" : "border-white/20"}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      <input
                        type="color"
                        value={tvQuestionStyle.color}
                        onChange={(event) => updateTVQuestionStyle({ ...tvQuestionStyle, color: event.target.value })}
                        className="h-6 w-7 rounded border border-white/20 bg-transparent"
                      />
                    </div>

                    <select
                      value={tvQuestionStyle.fontSize}
                      onChange={(event) => updateTVQuestionStyle({ ...tvQuestionStyle, fontSize: Number(event.target.value) })}
                      className="h-10 rounded-md border border-white/10 bg-[#050910] px-2 text-xs font-bold text-white outline-none"
                    >
                      {questionFontSizeOptions.map(([labelOption, size]) => (
                        <option key={size} value={size}>{labelOption}</option>
                      ))}
                    </select>

                    <select
                      value={tvQuestionStyle.fontWeight}
                      onChange={(event) => updateTVQuestionStyle({ ...tvQuestionStyle, fontWeight: event.target.value })}
                      className="h-10 rounded-md border border-white/10 bg-[#050910] px-2 text-xs font-bold text-white outline-none"
                    >
                      {fontWeightOptions.map(([labelOption, weight]) => (
                        <option key={weight} value={weight}>{labelOption}</option>
                      ))}
                    </select>

                    <select
                      value={tvQuestionStyle.fontFamily}
                      onChange={(event) => updateTVQuestionStyle({ ...tvQuestionStyle, fontFamily: event.target.value })}
                      className="h-10 rounded-md border border-white/10 bg-[#050910] px-2 text-xs font-bold text-white outline-none"
                    >
                      {fontFamilyOptions.map(([labelOption, family]) => (
                        <option key={family} value={family}>{labelOption}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {gameRounds.map((round, roundIndex) => {
                    const played = round.playedQuestionIndexes || [];
                    return (
                      <div key={round.id || round.name || roundIndex} className="rounded-lg border border-white/10 bg-black/24 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <div className="font-black uppercase text-white">{round.name || `Rodada ${roundIndex + 1}`}</div>
                            <div className="text-xs font-bold uppercase text-white/45">
                              {(round.questionIndexes || []).length} selecionadas | {played.length} reproduzidas
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded px-2 py-1 text-[10px] font-black uppercase ${roundIndex === gameState.currentRoundIndex ? "bg-green-400/16 text-green-300" : "bg-white/8 text-white/50"}`}>
                              {roundIndex === gameState.currentRoundIndex ? "Atual" : "Fila"}
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteRound(roundIndex)}
                              disabled={gameRounds.length <= 1}
                              className="rounded border border-red-500/40 bg-red-950/35 px-2 py-1 text-[10px] font-black uppercase text-red-300 transition hover:bg-red-900/45 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {gameQuestions.map((question, questionIndex) => {
                            const checked = (round.questionIndexes || []).includes(questionIndex);
                            const wasPlayed = played.includes(questionIndex);
                            return (
                              <label
                                key={`${roundIndex}-${questionIndex}`}
                                className={`flex min-h-[42px] cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold transition ${checked ? "border-cyan-400/35 bg-cyan-950/25 text-white" : "border-white/10 bg-white/4 text-white/58"} ${wasPlayed ? "opacity-40" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={wasPlayed}
                                  onChange={() => toggleRoundQuestion(roundIndex, questionIndex)}
                                  className="h-4 w-4 accent-cyan-400"
                                />
                                <span className="truncate">{String(questionIndex + 1).padStart(2, "0")}. {question.title || question}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
