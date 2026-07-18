import { useEffect, useMemo, useState } from "react";
import OfficialLogo from "../components/OfficialLogo";
import useGameState from "../hooks/useGameState";
import socket from "../socket";

const fallbackQuestion = {
  title: "QUAL E O MAIOR PLANETA DO SISTEMA SOLAR?",
  options: ["A - Terra", "B - Marte", "C - Jupiter", "D - Saturno"],
  correct: "C"
};

const PLAYER_STORAGE_KEY = "gameShowV1.player";
const PLAYER_HEARTBEAT_MS = 60 * 1000;
const PLAYER_SESSION_TIMEOUT_MS = 10 * 60 * 1000;

const optionTone = {
  A: "from-blue-600/78 to-blue-950/80 border-blue-400/40 text-blue-100",
  B: "from-purple-600/78 to-purple-950/80 border-purple-400/40 text-purple-100",
  C: "from-green-600/78 to-green-950/80 border-green-400/40 text-green-100",
  D: "from-orange-500/78 to-orange-950/80 border-orange-400/40 text-orange-100"
};

function parseOption(option) {
  const [letterPart, ...textParts] = String(option).split("-");
  const letter = letterPart.trim().charAt(0).toUpperCase();
  const text = textParts.join("-").trim() || String(option).replace(/^[A-Z]\s*/i, "").trim();

  return {
    letter,
    text
  };
}

function GroupBadge({ group, name }) {
  const isWomen = group === "MULHERES";
  const tone = isWomen
    ? "border-purple-400/45 bg-purple-950/72 text-purple-100 shadow-[0_0_18px_rgba(168,85,247,0.24)]"
    : "border-blue-400/45 bg-blue-950/72 text-blue-100 shadow-[0_0_18px_rgba(59,130,246,0.24)]";

  return (
    <div className={`flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2 ${tone}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isWomen ? "bg-purple-500" : "bg-blue-500"}`}>
        {isWomen ? "♀" : "♂"}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-black uppercase leading-none">{group}</div>
        <div className="mt-1 truncate text-xs text-white/78">{name}</div>
      </div>
    </div>
  );
}

function OptionBadge({ letter }) {
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b ${optionTone[letter] || optionTone.A} border font-black text-white shadow-[0_0_12px_rgba(255,255,255,0.12)]`}>
      {letter}
    </span>
  );
}

function ConnectionStatus() {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-white/72">
      <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
      Conectado
    </div>
  );
}

function createPlayerKey() {
  return `player-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadSavedPlayer() {
  try {
    const saved = window.localStorage.getItem(PLAYER_STORAGE_KEY);
    const playerData = saved ? JSON.parse(saved) : null;
    if (!playerData) return null;

    const expiresAt = Number(playerData.expiresAt || 0);
    const lastActiveAt = Number(playerData.lastActiveAt || 0);
    const expiredByExpiresAt = expiresAt && Date.now() > expiresAt;
    const expiredByLastActive = lastActiveAt && Date.now() - lastActiveAt > PLAYER_SESSION_TIMEOUT_MS;

    if (expiredByExpiresAt || expiredByLastActive || (!expiresAt && !lastActiveAt)) {
      clearSavedPlayer();
      return null;
    }

    return playerData;
  } catch {
    clearSavedPlayer();
    return null;
  }
}

function savePlayer(playerData) {
  const now = Date.now();
  window.localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify({
    ...playerData,
    lastActiveAt: now,
    expiresAt: now + PLAYER_SESSION_TIMEOUT_MS
  }));
}

function clearSavedPlayer() {
  window.localStorage.removeItem(PLAYER_STORAGE_KEY);
}

export default function PlayerScreen() {
  const gameState = useGameState();
  const activeEvent = gameState.activeEvent;
  const eventIsActive = Boolean(activeEvent?.active);
  const urlRoomCode = new URLSearchParams(window.location.search).get("room") || "";
  const [roomCode, setRoomCode] = useState(urlRoomCode.toUpperCase());
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [playerKey, setPlayerKey] = useState("");
  const [restoredSession, setRestoredSession] = useState(false);
  const [joined, setJoined] = useState(false);
  const [question, setQuestion] = useState(fallbackQuestion);
  const [timer, setTimer] = useState(20);
  const [questionVisible, setQuestionVisible] = useState(false);
  const [currentRoundQuestionNumber, setCurrentRoundQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [selectedVote, setSelectedVote] = useState("");
  const [voteSent, setVoteSent] = useState(false);
  const [timeEnded, setTimeEnded] = useState(false);
  const [result, setResult] = useState(null);
  const [entryReady, setEntryReady] = useState(false);

  const options = useMemo(
    () => (question.options || fallbackQuestion.options).map((option, index) => ({
      ...parseOption(option),
      style: question.style?.options?.[index]
    })),
    [question.options, question.style]
  );

  const selectedOption = options.find((option) => option.letter === selectedVote);
  const correctLetter = result?.correct || question.correct;
  const correctOption = options.find((option) => option.letter === correctLetter);
  const hasResult = Boolean(result?.correct);
  const isCorrect = hasResult && selectedVote === correctLetter;

  function restoreVoteFromState(state) {
    const vote = state.votes?.list?.find((item) => (
      (playerKey && item.playerKey === playerKey) ||
      (item.name === name && item.group === group)
    ));

    if (vote) {
      setSelectedVote(vote.option);
      setVoteSent(true);
    } else if (!state.answerRevealed) {
      setSelectedVote("");
      setVoteSent(false);
    }
  }

  useEffect(() => {
    const savedPlayer = loadSavedPlayer();

    if (savedPlayer?.name && savedPlayer?.group && savedPlayer?.roomCode) {
      setRoomCode(savedPlayer.roomCode);
      setName(savedPlayer.name);
      setGroup(savedPlayer.group);
      setPlayerKey(savedPlayer.playerKey || createPlayerKey());
      setRestoredSession(true);
      setJoined(true);
    }
  }, []);

  useEffect(() => {
    if (!joined && urlRoomCode) {
      setRoomCode(urlRoomCode.toUpperCase());
    }
  }, [joined, urlRoomCode]);

  useEffect(() => {
    const entryTimer = window.setTimeout(() => setEntryReady(true), 120);
    return () => window.clearTimeout(entryTimer);
  }, []);

  useEffect(() => {
    if (!joined || !name || !group || !roomCode) return;

    const storedKey = playerKey || createPlayerKey();
    if (!playerKey) {
      setPlayerKey(storedKey);
    }

    const playerData = {
      playerKey: storedKey,
      name,
      group,
      roomCode,
      restore: restoredSession
    };

    savePlayer(playerData);

    if (socket.connected) {
      console.log("reconectando participante", playerData);
      socket.emit("joinPlayer", playerData);
    }
  }, [joined, name, group, roomCode, playerKey, restoredSession]);

  useEffect(() => {
    if (!joined || !playerKey) return undefined;

    const emitHeartbeat = () => {
      savePlayer({
        playerKey,
        name,
        group,
        roomCode,
        restore: true
      });

      socket.emit("playerHeartbeat", {
        playerKey,
        name,
        group,
        roomCode
      });
    };

    emitHeartbeat();
    const heartbeatTimer = window.setInterval(emitHeartbeat, PLAYER_HEARTBEAT_MS);

    return () => {
      window.clearInterval(heartbeatTimer);
    };
  }, [joined, playerKey, name, group, roomCode]);

  useEffect(() => {
    const resetPlayerSession = () => {
      clearSavedPlayer();
      setJoined(false);
      setName("");
      setGroup("");
      setPlayerKey("");
      setRestoredSession(false);
      setSelectedVote("");
      setVoteSent(false);
      setTimeEnded(false);
      setResult(null);
      setQuestionVisible(false);
    };

    const handleConnect = () => {
      console.log("socket connected", socket.id);
      const savedPlayer = loadSavedPlayer();
      if (savedPlayer?.name && savedPlayer?.group && savedPlayer?.roomCode) {
        socket.emit("joinPlayer", {
          ...savedPlayer,
          restore: true
        });
      }
    };

    const handleQuestionUpdate = (data) => {
      setQuestion(data || fallbackQuestion);
      setSelectedVote("");
      setVoteSent(false);
      setTimeEnded(false);
      setResult(null);
    };

    const handleQuestionVisibility = (visible) => {
      setQuestionVisible(Boolean(visible));
      if (visible) {
        setSelectedVote("");
        setVoteSent(false);
        setTimeEnded(false);
        setResult(null);
      }
    };

    const handleTimerUpdate = (time) => {
      setTimer(time);
      if (time <= 0) {
        setTimeEnded(true);
      }
    };

    const handleTimeEnded = () => {
      setTimeEnded(true);
    };

    const handleResultsUpdate = (data) => {
      setResult(data);
    };

    const handlePlayerExpired = () => {
      resetPlayerSession();
    };

    const handleSystemEnded = () => {
      resetPlayerSession();
    };

    const handlePlayerJoinError = () => {
      resetPlayerSession();
    };

    const handleGameStateUpdate = (state) => {
      if (!state) return;

      if (state.currentQuestion) {
        setQuestion(state.currentQuestion);
      }

      if (typeof state.currentRoundQuestionNumber === "number") {
        setCurrentRoundQuestionNumber(state.currentRoundQuestionNumber);
      }

      if (typeof state.totalQuestions === "number") {
        setTotalQuestions(state.totalQuestions);
      }

      if (typeof state.questionVisible === "boolean") {
        setQuestionVisible(state.questionVisible);
      }

      if (typeof state.timer === "number") {
        setTimer(state.timer);
        if (state.timer <= 0 && state.questionVisible && !state.answerRevealed) {
          setTimeEnded(true);
        } else {
          setTimeEnded(false);
        }
      }

      setResult(state.roundResult || null);

      if (joined && (!state.activeEvent?.active || state.activeEvent?.roomCode !== roomCode)) {
        resetPlayerSession();
        return;
      }

      if (joined) {
        restoreVoteFromState(state);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("questionUpdate", handleQuestionUpdate);
    socket.on("questionVisibility", handleQuestionVisibility);
    socket.on("timerUpdate", handleTimerUpdate);
    socket.on("timeEnded", handleTimeEnded);
    socket.on("resultsUpdate", handleResultsUpdate);
    socket.on("gameStateUpdate", handleGameStateUpdate);
    socket.on("playerExpired", handlePlayerExpired);
    socket.on("systemEnded", handleSystemEnded);
    socket.on("playerJoinError", handlePlayerJoinError);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("questionUpdate", handleQuestionUpdate);
      socket.off("questionVisibility", handleQuestionVisibility);
      socket.off("timerUpdate", handleTimerUpdate);
      socket.off("timeEnded", handleTimeEnded);
      socket.off("resultsUpdate", handleResultsUpdate);
      socket.off("gameStateUpdate", handleGameStateUpdate);
      socket.off("playerExpired", handlePlayerExpired);
      socket.off("systemEnded", handleSystemEnded);
      socket.off("playerJoinError", handlePlayerJoinError);
    };
  }, [joined, playerKey, name, group, roomCode]);

  function enterGame() {
    const normalizedRoomCode = roomCode.trim().toUpperCase();
    if (!eventIsActive || normalizedRoomCode !== activeEvent?.roomCode || !normalizedRoomCode || !name.trim() || !group) return;
    const nextPlayerKey = playerKey || createPlayerKey();
    const playerData = {
      playerKey: nextPlayerKey,
      name,
      group,
      roomCode: normalizedRoomCode,
      restore: false
    };

    setRoomCode(normalizedRoomCode);
    setPlayerKey(nextPlayerKey);
    setRestoredSession(false);
    savePlayer(playerData);
    console.log("emitindo joinPlayer", playerData);
    socket.emit("joinPlayer", playerData);
    setJoined(true);
  }

  function leaveGame() {
    const confirmed = window.confirm("Deseja sair do jogo?");
    if (!confirmed) return;

    socket.emit("leavePlayer", {
      playerKey,
      name,
      group,
      roomCode
    });

    clearSavedPlayer();
    setJoined(false);
    setName("");
    setGroup("");
    setPlayerKey("");
    setRestoredSession(false);
    setSelectedVote("");
    setVoteSent(false);
    setTimeEnded(false);
    setResult(null);
    setQuestionVisible(false);
  }

  function closePlayerScreen() {
    if (joined) {
      leaveGame();
      return;
    }

    clearSavedPlayer();
    setName("");
    setGroup("");
    setPlayerKey("");
    setRestoredSession(false);

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "about:blank";
  }

  function vote(letter) {
    if (!joined || voteSent || timeEnded || hasResult) return;

    setSelectedVote(letter);
    setVoteSent(true);
    savePlayer({
      playerKey,
      name,
      group,
      roomCode,
      restore: true
    });

    socket.emit("vote", {
      id: socket.id,
      playerKey,
      name,
      group,
      option: letter,
      time: Date.now()
    });
  }

  const showQuestion = joined && questionVisible && !voteSent && !timeEnded && !hasResult;
  const showVoteSent = joined && voteSent && !timeEnded && !hasResult;
  const showTimeEnded = joined && timeEnded && !hasResult;
  const showResult = joined && hasResult;

  return (
    <div className="min-h-screen bg-[#020611] px-4 py-5 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.2),transparent_34%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.18),transparent_34%),linear-gradient(180deg,#06101d_0%,#020611_100%)]" />

      <main className={`relative mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[430px] flex-col overflow-hidden rounded-[28px] border border-white/14 bg-black/72 shadow-[0_0_42px_rgba(0,0,0,0.72),inset_0_0_42px_rgba(255,255,255,0.035)] transition duration-500 ${entryReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <header className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <OfficialLogo compact />
            <div className="flex items-center gap-2">
              {joined && (
                <ConnectionStatus />
              )}
              <button
                type="button"
                onClick={closePlayerScreen}
                aria-label="Fechar tela do participante"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/14 bg-white/7 text-lg font-black leading-none text-white/80 shadow-[0_0_14px_rgba(255,255,255,0.08)] active:scale-95"
              >
                x
              </button>
            </div>
          </div>

          {joined && (
            <div className="mt-4">
              <GroupBadge group={group} name={name} />
            </div>
          )}
        </header>

        <section className="flex flex-1 flex-col px-5 py-5">
          {!joined && (
            <div className="flex flex-1 flex-col justify-center">
              <div className="mb-7 text-center">
                <div className="text-[13px] font-black uppercase tracking-[0.24em] text-blue-300">
                  {urlRoomCode ? "Sala encontrada" : "Participe do game"}
                </div>
                <h1 className="mt-3 text-3xl font-black uppercase leading-none">
                  {urlRoomCode ? "Entre no game" : "Entrar na sala"}
                </h1>
                {activeEvent?.name && (
                  <div className="mt-3 text-xs font-black uppercase tracking-wide text-white/55">
                    {activeEvent.name}
                  </div>
                )}
              </div>

              {urlRoomCode ? (
                <div className="mb-4 rounded-2xl border border-blue-400/35 bg-blue-950/30 px-4 py-4 text-center shadow-[0_0_24px_rgba(59,130,246,0.16),inset_0_0_24px_rgba(59,130,246,0.08)]">
                  <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-blue-200/75">Codigo da sala</span>
                  <div className="mt-1 text-3xl font-black uppercase tracking-[0.22em] text-blue-300">
                    {roomCode || "------"}
                  </div>
                </div>
              ) : (
                <label className="mb-4 block">
                  <span className="mb-2 block text-center text-xs font-black uppercase text-white/72">Codigo da sala</span>
                  <input
                    value={roomCode}
                    onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                    inputMode="text"
                    className="h-12 w-full rounded-xl border border-blue-400/35 bg-white/5 px-4 text-center text-2xl font-black tracking-[0.18em] text-blue-300 outline-none focus:border-blue-300"
                  />
                </label>
              )}

              {!eventIsActive && (
                <div className="mb-4 rounded-xl border border-yellow-400/25 bg-yellow-950/24 px-4 py-3 text-center">
                  <div className="text-sm font-black uppercase text-yellow-200">Nenhum evento ativo.</div>
                  <div className="mt-1 text-xs font-semibold text-white/68">Aguarde o operador criar uma sala.</div>
                </div>
              )}

              {eventIsActive && roomCode.trim().toUpperCase() !== activeEvent.roomCode && (
                <div className="mb-4 rounded-xl border border-red-400/25 bg-red-950/24 px-4 py-3 text-center">
                  <div className="text-sm font-black uppercase text-red-200">Codigo de sala invalido.</div>
                  <div className="mt-1 text-xs font-semibold text-white/68">Confira o codigo exibido no QR Code.</div>
                </div>
              )}

              <label className="mb-5 block">
                <span className="mb-2 block text-center text-xs font-black uppercase text-white/72">Seu nome</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  className="h-12 w-full rounded-xl border border-white/14 bg-white/5 px-4 text-base font-semibold outline-none focus:border-blue-300"
                />
              </label>

              <div className="mb-6">
                <div className="mb-3 text-center text-xs font-black uppercase text-white/72">Escolha seu grupo</div>
                <div className="grid grid-cols-2 gap-3">
                  {["HOMENS", "MULHERES"].map((team) => {
                    const active = group === team;
                    const isWomen = team === "MULHERES";
                    return (
                      <button
                        key={team}
                        type="button"
                        onClick={() => setGroup(team)}
                        className={`h-20 rounded-xl border text-sm font-black uppercase transition active:scale-[0.98] ${
                          isWomen
                            ? "border-purple-400/42 bg-purple-950/50 text-purple-100"
                            : "border-blue-400/42 bg-blue-950/50 text-blue-100"
                        } ${active ? "ring-2 ring-white/45 brightness-125" : ""}`}
                      >
                        <div className="text-2xl">{isWomen ? "♀" : "♂"}</div>
                        {team}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={enterGame}
                disabled={!eventIsActive || roomCode.trim().toUpperCase() !== activeEvent?.roomCode || !roomCode.trim() || !name.trim() || !group}
                className="h-14 rounded-xl border border-green-300/35 bg-gradient-to-r from-green-700 to-green-500 text-base font-black uppercase tracking-wide text-white shadow-[0_0_24px_rgba(34,197,94,0.32)] transition enabled:active:scale-[0.98] disabled:opacity-35"
              >
                Entrar no game
              </button>
            </div>
          )}

          {joined && !questionVisible && !hasResult && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-blue-400/25 bg-blue-950/35 text-5xl text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.22)]">
                ⏳
              </div>
              <h2 className="text-2xl font-black uppercase text-blue-300">Aguardando pergunta</h2>
              <p className="mt-3 max-w-[280px] text-sm text-white/70">
                Aguarde o operador liberar a proxima rodada.
              </p>
            </div>
          )}

          {showQuestion && (
            <div>
              <div className="mb-5 text-center">
                <div className="text-xs font-black uppercase tracking-wide text-white/64">
                  Pergunta {String(currentRoundQuestionNumber).padStart(2, "0")}/{totalQuestions}
                </div>
                <h2
                  className="mt-3 font-black uppercase leading-tight"
                  style={{
                    color: question.style?.question?.color,
                    fontSize: question.style?.question?.fontSize ? `${Math.max(22, Math.min(32, question.style.question.fontSize - 12))}px` : "24px",
                    fontWeight: question.style?.question?.fontWeight
                  }}
                >
                  {question.title}
                </h2>
              </div>

              <div className="space-y-3">
                {options.map(({ letter, text, style }) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => vote(letter)}
                    className="flex min-h-[58px] w-full items-center gap-3 rounded-xl border border-white/10 bg-white/7 px-4 text-left text-base font-black uppercase shadow-[inset_0_0_20px_rgba(255,255,255,0.025)] transition active:scale-[0.985]"
                  >
                    <OptionBadge letter={letter} />
                    <span
                      style={{
                        color: style?.color,
                        fontSize: style?.fontSize ? `${Math.max(15, Math.min(22, style.fontSize - 2))}px` : undefined,
                        fontWeight: style?.fontWeight
                      }}
                    >
                      {text}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-3 text-sm text-white/76">
                <span className="text-xl text-blue-300">◷</span>
                Tempo restante:
                <span className="text-3xl font-black text-blue-300">{timer}s</span>
              </div>
            </div>
          )}

          {showVoteSent && (
            <StatusMessage
              tone="green"
              icon="✓"
              title="Voto enviado!"
              description="Aguardando os demais participantes."
              selected={selectedOption}
            />
          )}

          {showTimeEnded && (
            <StatusMessage
              tone="blue"
              icon="⌛"
              title="Tempo encerrado!"
              description="Aguardando o operador revelar a resposta."
            />
          )}

          {showResult && (
            <div className="flex flex-1 flex-col justify-center text-center">
              <div className="mb-4 text-xs font-black uppercase tracking-wide text-white/72">Resposta correta</div>
              <AnswerPill option={correctOption} />

              {selectedOption && (
                <>
                  <div className="mt-5 text-xs font-black uppercase tracking-wide text-white/62">Seu voto</div>
                  <AnswerPill option={selectedOption} muted={!isCorrect} />
                </>
              )}

              <div className={`mx-auto mt-7 flex h-20 w-20 items-center justify-center rounded-full text-5xl font-black shadow-[0_0_30px_currentColor] ${isCorrect ? "bg-green-500 text-green-100" : "bg-red-500 text-red-100"}`}>
                {isCorrect ? "✓" : "×"}
              </div>
              <h2 className={`mt-5 text-3xl font-black uppercase ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                {isCorrect ? "Voce acertou!" : "Voce errou!"}
              </h2>
              <p className="mt-3 text-sm text-white/70">
                {isCorrect ? "Parabens! Voce ganhou pontos para o seu grupo." : "Continue participando e ajudando seu grupo a vencer."}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function AnswerPill({ option, muted = false }) {
  if (!option) return null;

  return (
    <div className={`mx-auto flex h-12 w-full max-w-[260px] items-center justify-center gap-3 rounded-xl border px-4 font-black uppercase ${muted ? "border-blue-400/45 bg-blue-950/45 text-blue-100" : "border-green-400/45 bg-green-950/55 text-green-100"}`}>
      <OptionBadge letter={option.letter} />
      <span>{option.text}</span>
    </div>
  );
}

function StatusMessage({ tone, icon, title, description, selected }) {
  const isGreen = tone === "green";

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className={`mb-7 flex h-24 w-24 items-center justify-center rounded-full text-6xl font-black shadow-[0_0_32px_currentColor] ${isGreen ? "bg-green-500 text-green-100" : "bg-blue-500/20 text-blue-300"}`}>
        {icon}
      </div>
      <h2 className={`text-3xl font-black uppercase ${isGreen ? "text-green-400" : "text-blue-300"}`}>{title}</h2>
      {selected && (
        <div className="mt-6 w-full">
          <div className="mb-2 text-sm text-white/72">Voce escolheu:</div>
          <AnswerPill option={selected} />
        </div>
      )}
      <p className="mt-6 max-w-[280px] text-sm text-white/72">{description}</p>
      {isGreen && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/68">
          Seu voto foi registrado e nao pode ser alterado.
        </div>
      )}
    </div>
  );
}
