const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const os = require("os");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

let questions = [
  {
    title: "QUAL E O MAIOR PLANETA DO SISTEMA SOLAR?",
    options: ["A - Terra", "B - Marte", "C - Jupiter", "D - Saturno"],
    correct: "C"
  },
  {
    title: "QUAL E O MAIOR OCEANO DO MUNDO?",
    options: ["A - Atlantico", "B - Pacifico", "C - Indico", "D - Artico"],
    correct: "B"
  },
  {
    title: "QUAL E A CAPITAL DO BRASIL?",
    options: ["A - Rio de Janeiro", "B - Brasilia", "C - Sao Paulo", "D - Salvador"],
    correct: "B"
  }
];

let defaultTimer = 15;
let maxParticipants = 20;
let roundQuestionLimit = 10;
let selectedQuestionIndexes = questions.map((_, index) => index);
let rounds = [
  {
    id: "round-1",
    name: "Rodada 1",
    questionIndexes: questions.map((_, index) => index),
    playedQuestionIndexes: []
  }
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

let currentQuestionIndex = 0;
let currentQuestion = questions[currentQuestionIndex];
let questionVisible = false;
let answerRevealed = false;
let timer = defaultTimer;
let timerRunning = false;
let timerInterval = null;
let votes = [];
let participants = [];
let roundResult = null;
let roundScored = false;
let history = [];
let currentScreen = "tv";
let currentRoundIndex = 0;
let roundLocked = false;
let activeEvent = null;
const PLAYER_INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
const PLAYER_EXPIRATION_CHECK_MS = 30 * 1000;
const CLIENT_PORT = process.env.CLIENT_PORT || 3000;

function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }

  return "localhost";
}

function buildNetworkInfo() {
  const host = getLocalNetworkIp();
  return {
    host,
    clientPort: Number(CLIENT_PORT),
    serverPort: 3001,
    clientUrl: `http://${host}:${CLIENT_PORT}`
  };
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function createEventName() {
  return `Game Show ${new Date().toLocaleDateString("pt-BR")}`;
}

function nowTime() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function addHistory(text) {
  history = [[nowTime(), text], ...history].slice(0, 6);
}

function optionLetter(index) {
  return String.fromCharCode(65 + index);
}

function optionText(letter) {
  const option = currentQuestion.options.find((item) => item.startsWith(`${letter} `) || item.startsWith(`${letter} -`));
  return option ? option.replace(/^[A-Z]\s*-\s*/i, "") : letter;
}

function getParticipant(id) {
  return participants.find((participant) => participant.id === id);
}

function getParticipantByVote(vote) {
  return (
    (vote.playerKey && getParticipantByKey(vote.playerKey)) ||
    getParticipant(vote.id) ||
    participants.find((participant) => participant.name === vote.name && participant.group === vote.group)
  );
}

function getParticipantByKey(playerKey) {
  return participants.find((participant) => participant.playerKey && participant.playerKey === playerKey);
}

function touchParticipant(participant) {
  if (participant) {
    participant.lastActiveAt = Date.now();
  }
}

function touchParticipantByKey(playerKey) {
  const participant = getParticipantByKey(playerKey);
  touchParticipant(participant);
  return participant;
}

function getElapsedTime() {
  return Math.max(0, defaultTimer - timer);
}

function normalizeGroup(group) {
  return group === "MULHERES" ? "MULHERES" : "HOMENS";
}

function normalizeRound(round, index) {
  const questionIndexes = Array.isArray(round.questionIndexes)
    ? round.questionIndexes.filter((questionIndex) => Number.isInteger(questionIndex) && questionIndex >= 0 && questionIndex < questions.length)
    : [];
  const uniqueQuestionIndexes = [...new Set(questionIndexes)];
  const playedQuestionIndexes = Array.isArray(round.playedQuestionIndexes)
    ? round.playedQuestionIndexes.filter((questionIndex) => uniqueQuestionIndexes.includes(questionIndex))
    : [];

  return {
    id: round.id || `round-${index + 1}`,
    name: round.name || `Rodada ${index + 1}`,
    questionIndexes: uniqueQuestionIndexes,
    playedQuestionIndexes: [...new Set(playedQuestionIndexes)]
  };
}

function syncRounds() {
  rounds = (rounds.length ? rounds : [{ id: "round-1", name: "Rodada 1", questionIndexes: questions.map((_, index) => index), playedQuestionIndexes: [] }])
    .map(normalizeRound);

  if (!rounds.some((round) => round.questionIndexes.length)) {
    rounds[0].questionIndexes = questions.map((_, index) => index);
  }

  currentRoundIndex = Math.min(Math.max(currentRoundIndex, 0), rounds.length - 1);
}

function getCurrentRound() {
  syncRounds();
  return rounds[currentRoundIndex];
}

function getCurrentRoundPendingIndexes() {
  const round = getCurrentRound();
  return round.questionIndexes.filter((questionIndex) => !round.playedQuestionIndexes.includes(questionIndex));
}

function markCurrentQuestionPlayed() {
  const round = getCurrentRound();
  if (!round.questionIndexes.includes(currentQuestionIndex)) return;
  if (!round.playedQuestionIndexes.includes(currentQuestionIndex)) {
    round.playedQuestionIndexes.push(currentQuestionIndex);
  }
}

function getCurrentSequenceIndex() {
  const round = getCurrentRound();
  const position = round.questionIndexes.indexOf(currentQuestionIndex);
  return position >= 0 ? position : 0;
}

function getTotalRounds() {
  syncRounds();
  return Math.max(1, rounds.length);
}

function getRoundStart() {
  return 0;
}

function getRoundEnd() {
  return getCurrentRound().questionIndexes.length;
}

function getRoundQuestionCount() {
  return Math.max(1, getCurrentRound().questionIndexes.length);
}

function getRoundQuestionNumber() {
  const round = getCurrentRound();
  return Math.max(1, round.playedQuestionIndexes.length + (round.playedQuestionIndexes.includes(currentQuestionIndex) ? 0 : 1));
}

function syncRoundToQuestion() {
  syncRounds();
  const currentRound = rounds[currentRoundIndex];
  if (currentRound?.questionIndexes.includes(currentQuestionIndex)) {
    return;
  }

  const roundIndex = rounds.findIndex((round) => round.questionIndexes.includes(currentQuestionIndex));
  if (roundIndex >= 0) {
    currentRoundIndex = roundIndex;
  }
}

function buildParticipantsSummary() {
  const connectedParticipants = participants.filter((participant) => participant.connected);
  const men = connectedParticipants.filter((participant) => participant.group === "HOMENS").length;
  const women = connectedParticipants.filter((participant) => participant.group === "MULHERES").length;

  return {
    men,
    women,
    total: connectedParticipants.length,
    max: maxParticipants,
    list: connectedParticipants
  };
}

function buildVotesSummary() {
  const counts = votes.reduce((acc, vote) => {
    acc[vote.option] = (acc[vote.option] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = sorted[0] || ["", 0];
  const participantsTotal = Math.max(buildParticipantsSummary().total, votes.length);

  return {
    count: votes.length,
    total: participantsTotal,
    percent: participantsTotal ? Math.round((votes.length / participantsTotal) * 100) : 0,
    top: {
      option: top[0],
      text: top[0] ? optionText(top[0]) : "",
      votes: top[1],
      percent: votes.length ? Math.round((top[1] / votes.length) * 100) : 0
    },
    list: votes
  };
}

function rankedVotes(group) {
  return votes
    .filter((vote) => vote.group === group)
    .sort((a, b) => a.elapsed - b.elapsed)
    .map((vote, index) => ({
      place: index + 1,
      name: vote.name,
      option: vote.option,
      time: `${vote.elapsed.toFixed(1)}s`,
      correct: vote.option === currentQuestion.correct
    }));
}

function fastestCorrect(group) {
  return votes
    .filter((vote) => vote.group === group && vote.option === currentQuestion.correct)
    .sort((a, b) => a.elapsed - b.elapsed)[0] || null;
}

function scoreRoundIfNeeded() {
  if (roundScored) return;

  const fastestCorrectVote = votes
    .filter((vote) => vote.option === currentQuestion.correct)
    .sort((a, b) => a.elapsed - b.elapsed)[0] || null;
  const votesByParticipant = new Map();
  votes.forEach((vote) => {
    const participant = getParticipantByVote(vote);
    if (participant) {
      votesByParticipant.set(participant.playerKey || participant.id, { vote, participant });
    }
  });

  participants.forEach((participant) => {
    const voteEntry = votesByParticipant.get(participant.playerKey || participant.id);
    if (!voteEntry) {
      participant.stats.currentStreak = 0;
      return;
    }

    const { vote } = voteEntry;
    const correct = vote.option === currentQuestion.correct;
    participant.stats.votes += 1;
    participant.stats.totalTime += vote.elapsed;

    if (correct) {
      participant.stats.correct += 1;
      participant.stats.currentStreak = (participant.stats.currentStreak || 0) + 1;
      participant.stats.bestStreak = Math.max(participant.stats.bestStreak || 0, participant.stats.currentStreak);
      participant.stats.firstCorrectAt = participant.stats.firstCorrectAt || vote.receivedAt;
      participant.stats.firstCorrectElapsed = participant.stats.firstCorrectElapsed ?? vote.elapsed;
      if (fastestCorrectVote && fastestCorrectVote.receivedAt === vote.receivedAt) {
        participant.stats.fastCorrectCount = (participant.stats.fastCorrectCount || 0) + 1;
      }
      if (!participant.stats.bestTime || vote.elapsed < participant.stats.bestTime) {
        participant.stats.bestTime = vote.elapsed;
      }
    } else {
      participant.stats.errors += 1;
      participant.stats.currentStreak = 0;
    }
  });

  roundScored = true;
}

function buildRoundResult() {
  const menRows = rankedVotes("HOMENS");
  const womenRows = rankedVotes("MULHERES");
  const menCorrect = menRows.filter((row) => row.correct).length;
  const womenCorrect = womenRows.filter((row) => row.correct).length;
  const menFastest = fastestCorrect("HOMENS");
  const womenFastest = fastestCorrect("MULHERES");

  return {
    correct: currentQuestion.correct,
    correctText: optionText(currentQuestion.correct),
    question: currentQuestion,
    questionIndex: currentQuestionIndex,
    totalQuestions: getRoundQuestionCount(),
    currentRoundIndex,
    currentRoundQuestionNumber: getRoundQuestionNumber(),
    menCorrect,
    womenCorrect,
    menRows,
    womenRows,
    fastestCorrect: {
      men: menFastest
        ? { name: menFastest.name, time: `${menFastest.elapsed.toFixed(1)}s` }
        : null,
      women: womenFastest
        ? { name: womenFastest.name, time: `${womenFastest.elapsed.toFixed(1)}s` }
        : null
    }
  };
}

function buildGrandFinal() {
  const scoringParticipants = participants.filter((participant) => participant.stats.votes > 0 || participant.stats.correct > 0 || participant.stats.errors > 0);
  const menCorrect = scoringParticipants
    .filter((participant) => participant.group === "HOMENS")
    .reduce((sum, participant) => sum + participant.stats.correct, 0);
  const womenCorrect = scoringParticipants
    .filter((participant) => participant.group === "MULHERES")
    .reduce((sum, participant) => sum + participant.stats.correct, 0);
  const totalVotes = scoringParticipants.reduce((sum, participant) => sum + participant.stats.votes, 0);
  const totalTime = scoringParticipants.reduce((sum, participant) => sum + participant.stats.totalTime, 0);

  const fastest = scoringParticipants
    .filter((participant) => participant.stats.bestTime)
    .sort((a, b) => a.stats.bestTime - b.stats.bestTime)
    .slice(0, 3)
    .map((participant, index) => ({
      place: index + 1,
      name: participant.name,
      group: participant.group,
      time: `${participant.stats.bestTime.toFixed(1)}s`
    }));

  const fastestParticipantKey = fastest[0] ? `${fastest[0].name}-${fastest[0].group}` : "";
  const bestStreakValue = scoringParticipants.length ? Math.max(...scoringParticipants.map((participant) => participant.stats.bestStreak || 0), 0) : 0;
  const averageTime = (participant) => participant.stats.votes ? participant.stats.totalTime / participant.stats.votes : Number.POSITIVE_INFINITY;

  const rankedByCorrect = scoringParticipants
    .filter((participant) => participant.stats.correct > 0)
    .sort((a, b) => {
      const correctDiff = b.stats.correct - a.stats.correct;
      if (correctDiff !== 0) return correctDiff;

      const timeDiff = averageTime(a) - averageTime(b);
      if (timeDiff !== 0) return timeDiff;

      return (a.stats.firstCorrectAt || Number.POSITIVE_INFINITY) - (b.stats.firstCorrectAt || Number.POSITIVE_INFINITY);
    });

  const rankingAudit = rankedByCorrect.map((participant, index, rows) => {
    const previous = rows[index - 1] || null;
    const next = rows[index + 1] || null;
    const comparisonTarget = [previous, next].find((row) => row && row.stats.correct === participant.stats.correct) || null;
    const comparisonTargetIndex = comparisonTarget ? rows.indexOf(comparisonTarget) : -1;
    const participantIsAboveComparison = comparisonTargetIndex > index;
    const participantAverage = averageTime(participant);
    const targetAverage = comparisonTarget ? averageTime(comparisonTarget) : null;
    const decisiveCriterion =
      comparisonTarget && participant.stats.correct === comparisonTarget.stats.correct
        ? participantAverage !== targetAverage
          ? "Velocidade"
          : "Primeiro acerto registrado"
        : "Acertos";

    return {
      id: participant.playerKey || participant.id || `${participant.name}-${participant.group}`,
      name: participant.name,
      group: participant.group,
      position: index + 1,
      correct: participant.stats.correct,
      errors: participant.stats.errors,
      votes: participant.stats.votes,
      fastCorrectCount: participant.stats.fastCorrectCount || 0,
      bestStreak: participant.stats.bestStreak || 0,
      averageTime: Number.isFinite(participantAverage) ? participantAverage : null,
      bestTime: participant.stats.bestTime,
      firstCorrectAt: participant.stats.firstCorrectAt || null,
      firstCorrectElapsed: participant.stats.firstCorrectElapsed ?? null,
      decisiveCriterion,
      fastestAward: Boolean(participant.stats.bestTime && fastestParticipantKey === `${participant.name}-${participant.group}`),
      streakAward: Boolean((participant.stats.bestStreak || 0) > 0 && participant.stats.bestStreak === bestStreakValue),
      comparison: comparisonTarget
        ? {
            name: comparisonTarget.name,
            group: comparisonTarget.group,
            correct: comparisonTarget.stats.correct,
            averageTime: Number.isFinite(targetAverage) ? targetAverage : null,
            firstCorrectAt: comparisonTarget.stats.firstCorrectAt || null,
            firstCorrectElapsed: comparisonTarget.stats.firstCorrectElapsed ?? null,
            result:
              participantAverage !== targetAverage
                ? participantIsAboveComparison
                  ? `${participant.name} ficou acima por ter sido mais rapido.`
                  : `${comparisonTarget.name} ficou acima por ter sido mais rapido.`
                : participantIsAboveComparison
                  ? `${participant.name} ficou acima pelo primeiro acerto registrado.`
                  : `${comparisonTarget.name} ficou acima pelo primeiro acerto registrado.`
          }
        : null
    };
  });

  const topCorrect = rankedByCorrect
    .slice(0, 3)
    .map((participant, index) => ({
      id: participant.playerKey || participant.id || `${participant.name}-${participant.group}`,
      place: index + 1,
      name: participant.name,
      group: participant.group,
      correct: participant.stats.correct,
      bestTime: participant.stats.bestTime,
      fastestAward: Boolean(participant.stats.bestTime && fastestParticipantKey === `${participant.name}-${participant.group}`),
      streakAward: Boolean((participant.stats.bestStreak || 0) > 0 && participant.stats.bestStreak === bestStreakValue)
    }));

  return {
    menCorrect,
    womenCorrect,
    champion: womenCorrect >= menCorrect ? "MULHERES" : "HOMENS",
    championScore: Math.max(menCorrect, womenCorrect),
    totalQuestions: questions.length,
    totalVotes,
    averageTime: totalVotes ? totalTime / totalVotes : 0,
    bestStreak: bestStreakValue,
    fastest,
    topCorrect,
    rankingAudit
  };
}

function buildGameState() {
  return {
    currentScreen,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions: getRoundQuestionCount(),
    currentRoundQuestionNumber: getRoundQuestionNumber(),
    currentRoundIndex,
    totalRounds: getTotalRounds(),
    roundLocked,
    roundStartIndex: getRoundStart(),
    roundEndIndex: getRoundEnd(),
    rounds,
    currentRound: getCurrentRound(),
    pendingQuestionIndexes: getCurrentRoundPendingIndexes(),
    selectedQuestionIndexes,
    questions,
    settings: {
      defaultTimer,
      maxParticipants,
      roundQuestionLimit
    },
    questionVisible,
    answerRevealed,
    timer,
    timerRunning,
    participants: buildParticipantsSummary(),
    votes: buildVotesSummary(),
    roundResult,
    grandFinal: buildGrandFinal(),
    activeEvent,
    network: buildNetworkInfo(),
    history
  };
}

function setCurrentScreen(screen) {
  currentScreen = ["tv", "result", "grandFinal", "qrcode"].includes(screen) ? screen : "tv";
}

function emitGameState() {
  const state = buildGameState();
  io.emit("gameState", state);
  io.emit("gameStateUpdate", state);
  io.emit("participantsUpdate", buildParticipantsSummary());
  io.emit("votesUpdate", buildVotesSummary());
}

function resetTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = null;
  timerRunning = false;
}

function startTimer() {
  if (roundLocked || !questionVisible) return;

  resetTimer();
  timerRunning = true;
  timer = defaultTimer;
  addHistory(`Tempo iniciado (${defaultTimer}s)`);
  io.emit("timerUpdate", timer);
  emitGameState();

  timerInterval = setInterval(() => {
    timer -= 1;
    io.emit("timerUpdate", timer);
    emitGameState();

    if (timer <= 0) {
      resetTimer();
      addHistory("Tempo encerrado");
      io.emit("timeEnded");
      emitGameState();
    }
  }, 1000);
}

function revealAnswer() {
  if (roundLocked || answerRevealed) return;

  resetTimer();
  answerRevealed = true;
  roundResult = buildRoundResult();
  scoreRoundIfNeeded();
  addHistory("Resposta revelada");
  io.emit("resultsUpdate", roundResult);
  io.emit("answerRevealed", roundResult);
  emitGameState();
}

function prepareCurrentQuestion() {
  currentQuestion = questions[currentQuestionIndex];
  syncRoundToQuestion();
  votes = [];
  roundResult = null;
  roundScored = false;
  answerRevealed = false;
  questionVisible = false;
  currentScreen = "tv";
  timer = defaultTimer;
  resetTimer();
}

function normalizeOption(option, index) {
  const letter = optionLetter(index);
  const text = String(option || "").replace(/^[A-Z]\s*-\s*/i, "").trim() || `Alternativa ${letter}`;
  return `${letter} - ${text}`;
}

function normalizeQuestion(data = {}) {
  const title = String(data.title || "").trim() || "NOVA PERGUNTA";
  const options = Array.isArray(data.options) ? data.options : [];
  const optionCount = Math.min(26, Math.max(4, options.length || 4));
  const normalizedOptions = Array.from({ length: optionCount }, (_, index) => normalizeOption(options[index], index));
  const validLetters = normalizedOptions.map((_, index) => optionLetter(index));
  const correct = String(data.correct || "A").charAt(0).toUpperCase();
  const questionStyle = data.style?.question || {};
  const optionStyles = Array.isArray(data.style?.options) ? data.style.options : [];

  return {
    title,
    options: normalizedOptions,
    correct: validLetters.includes(correct) ? correct : "A",
    style: {
      question: {
        ...defaultQuestionStyle.question,
        ...questionStyle
      },
      options: Array.from({ length: optionCount }, (_, index) => ({
        ...defaultOptionStyle,
        ...(optionStyles[index] || {})
      }))
    }
  };
}

function syncCurrentQuestion() {
  if (!questions.length) {
    questions.push(normalizeQuestion());
  }

  currentQuestionIndex = Math.min(Math.max(currentQuestionIndex, 0), questions.length - 1);
  const currentRound = getCurrentRound();
  if (!currentRound.questionIndexes.includes(currentQuestionIndex)) {
    currentQuestionIndex = getCurrentRoundPendingIndexes()[0] || currentRound.questionIndexes[0] || 0;
  }
  syncRoundToQuestion();
  currentQuestion = questions[currentQuestionIndex];
}

function resetRoundState() {
  votes = [];
  roundResult = null;
  roundScored = false;
  answerRevealed = false;
  questionVisible = false;
  currentScreen = "tv";
  roundLocked = false;
  timer = defaultTimer;
  resetTimer();
}

function resetEventState() {
  resetTimer();
  votes = [];
  participants = [];
  roundResult = null;
  roundScored = false;
  answerRevealed = false;
  questionVisible = false;
  currentScreen = "tv";
  currentRoundIndex = 0;
  roundLocked = false;
  activeEvent = null;
  timer = defaultTimer;
  rounds = rounds.map((round) => ({
    ...round,
    playedQuestionIndexes: []
  }));
  currentQuestionIndex = getCurrentRoundPendingIndexes()[0] || getCurrentRound().questionIndexes[0] || 0;
  currentQuestion = questions[currentQuestionIndex];
}

function emitQuestionState() {
  io.emit("questionUpdate", currentQuestion);
  io.emit("questionVisibility", questionVisible);
  io.emit("resultsUpdate", roundResult);
  io.emit("timerUpdate", timer);
  emitGameState();
}

function expireInactiveParticipants() {
  const now = Date.now();
  const expired = participants.filter((participant) => (
    !participant.expired &&
    participant.lastActiveAt &&
    now - participant.lastActiveAt > PLAYER_INACTIVITY_LIMIT_MS
  ));

  if (!expired.length) return;

  const expiredKeys = new Set(expired.map((participant) => participant.playerKey).filter(Boolean));
  const expiredIds = new Set(expired.map((participant) => participant.id).filter(Boolean));

  expired.forEach((participant) => {
    if (participant.connected && participant.id) {
      io.to(participant.id).emit("playerExpired", {
        reason: "Sessao expirada por inatividade"
      });
    }
    addHistory(`${participant.name} saiu por inatividade`);
  });

  participants.forEach((participant) => {
    if (expiredIds.has(participant.id) || (participant.playerKey && expiredKeys.has(participant.playerKey))) {
      participant.connected = false;
      participant.expired = true;
    }
  });

  emitGameState();
}

setInterval(expireInactiveParticipants, PLAYER_EXPIRATION_CHECK_MS);

io.on("connection", (socket) => {
  console.log("Usuario conectado", socket.id);

  socket.emit("questionUpdate", currentQuestion);
  socket.emit("questionVisibility", questionVisible);
  socket.emit("timerUpdate", timer);
  socket.emit("resultsUpdate", roundResult);
  socket.emit("gameState", buildGameState());
  socket.emit("gameStateUpdate", buildGameState());

  const handlePlayerJoin = (data = {}) => {
    console.log("player joined", data);

    const name = String(data.name || "").trim();
    if (!name) return;

    const requestedRoomCode = String(data.roomCode || "").trim().toUpperCase();
    if (!activeEvent?.active || requestedRoomCode !== activeEvent.roomCode) {
      socket.emit("playerJoinError", {
        reason: "Nenhum evento ativo ou codigo de sala invalido"
      });
      return;
    }

    const restoreExpiresAt = Number(data.expiresAt || 0);
    if (data.restore && restoreExpiresAt && Date.now() > restoreExpiresAt) {
      socket.emit("playerExpired", {
        reason: "Sessao expirada por inatividade"
      });
      return;
    }

    const group = normalizeGroup(data.group);
    const playerKey = String(data.playerKey || "").trim();
    const existing =
      (playerKey && getParticipantByKey(playerKey)) ||
      getParticipant(socket.id) ||
      participants.find((participant) => participant.name === name && participant.group === group && participant.roomCode === requestedRoomCode);

    if (existing) {
      if (existing.expired && data.restore) {
        socket.emit("playerExpired", {
          reason: "Sessao expirada por inatividade"
        });
        return;
      }

      const previousId = existing.id;
      existing.name = name;
      existing.group = group;
      existing.roomCode = requestedRoomCode;
      existing.playerKey = playerKey || existing.playerKey;
      existing.id = socket.id;
      existing.connected = true;
      existing.expired = false;
      existing.stats.currentStreak = existing.stats.currentStreak || 0;
      existing.stats.bestStreak = existing.stats.bestStreak || 0;
      existing.stats.fastCorrectCount = existing.stats.fastCorrectCount || 0;
      existing.stats.firstCorrectAt = existing.stats.firstCorrectAt || null;
      existing.stats.firstCorrectElapsed = existing.stats.firstCorrectElapsed ?? null;
      touchParticipant(existing);

      votes = votes.map((vote) => {
        if (vote.id !== previousId && vote.playerKey !== existing.playerKey) return vote;
        return {
          ...vote,
          id: socket.id,
          playerKey: existing.playerKey,
          name,
          group
        };
      });
    } else {
      participants.push({
        id: socket.id,
        playerKey,
        name,
        group,
        roomCode: requestedRoomCode,
        connected: true,
        expired: false,
        lastActiveAt: Date.now(),
        stats: {
          correct: 0,
          errors: 0,
          votes: 0,
          totalTime: 0,
          bestTime: null,
          currentStreak: 0,
          bestStreak: 0,
          fastCorrectCount: 0,
          firstCorrectAt: null,
          firstCorrectElapsed: null
        }
      });
    }

    addHistory(`${name} entrou em ${group}`);
    console.log("participants", participants);
    emitGameState();
  };

  socket.on("joinParticipant", handlePlayerJoin);
  socket.on("joinPlayer", handlePlayerJoin);
  socket.on("playerJoin", handlePlayerJoin);
  socket.on("registerPlayer", handlePlayerJoin);

  socket.on("playerHeartbeat", (data = {}) => {
    const playerKey = String(data.playerKey || "").trim();
    const participant = playerKey ? getParticipantByKey(playerKey) : getParticipant(socket.id);

    if (participant && !participant.expired) {
      participant.id = socket.id;
      emitGameState();
    } else if (participant?.expired) {
      socket.emit("playerExpired", {
        reason: "Sessao expirada por inatividade"
      });
    }
  });

  socket.on("leavePlayer", (data = {}) => {
    const playerKey = String(data.playerKey || "").trim();
    const name = String(data.name || "").trim();
    const group = normalizeGroup(data.group);

    let removedFromConnected = false;
    participants.forEach((participant) => {
      const matches =
        (playerKey && participant.playerKey === playerKey) ||
        participant.id === socket.id ||
        (name && participant.name === name && participant.group === group);

      if (matches && participant.connected) {
        participant.connected = false;
        removedFromConnected = true;
      }
    });

    if (removedFromConnected) {
      addHistory(`${name || "Participante"} saiu do jogo`);
    }

    emitGameState();
  });

  socket.on("vote", (data = {}) => {
    if (!questionVisible || answerRevealed || timer <= 0) return;
    const participant = getParticipant(socket.id);
    touchParticipant(participant);
    const name = participant?.name || data.name;
    const group = participant?.group || normalizeGroup(data.group);
    const option = String(data.option || "").charAt(0).toUpperCase();
    const playerKey = participant?.playerKey || String(data.playerKey || "").trim();

    if (!name || !option) return;
    if (votes.some((vote) => vote.id === socket.id || (playerKey && vote.playerKey === playerKey) || (vote.name === name && vote.group === group))) return;

    const vote = {
      id: socket.id,
      playerKey,
      name,
      group,
      option,
      elapsed: getElapsedTime(),
      receivedAt: Date.now()
    };

    votes.push(vote);
    addHistory(`${votes.length} votos recebidos`);
    io.emit("newVote", vote);
    emitGameState();
  });

  socket.on("showQuestion", () => {
    if (roundLocked) return;
    resetTimer();
    currentScreen = "tv";
    questionVisible = true;
    answerRevealed = false;
    roundResult = null;
    roundScored = false;
    timer = defaultTimer;
    addHistory("Pergunta mostrada na TV");
    io.emit("questionUpdate", currentQuestion);
    io.emit("questionVisibility", true);
    io.emit("resultsUpdate", null);
    emitGameState();
    startTimer();
  });

  socket.on("startTimer", startTimer);
  socket.on("revealAnswer", revealAnswer);

  socket.on("showResult", () => {
    if (roundLocked) return;
    if (!roundResult) {
      roundResult = buildRoundResult();
    }
    scoreRoundIfNeeded();
    currentScreen = "result";
    markCurrentQuestionPlayed();
    if (!getCurrentRoundPendingIndexes().length) {
      roundLocked = true;
      questionVisible = false;
      answerRevealed = false;
      addHistory(`Rodada ${currentRoundIndex + 1} concluida`);
    }
    io.emit("resultsUpdate", roundResult);
    emitGameState();
  });

  socket.on("showGrandFinal", () => {
    currentScreen = "grandFinal";
    io.emit("grandFinalUpdate", buildGrandFinal());
    emitGameState();
  });

  socket.on("createEvent", (data = {}) => {
    if (activeEvent?.active || participants.length) {
      io.emit("systemEnded", {
        reason: "Novo evento criado pelo operador"
      });
      resetEventState();
    }

    const roomCode = generateRoomCode();
    activeEvent = {
      id: `event-${Date.now()}`,
      name: String(data.name || "").trim() || createEventName(),
      roomCode,
      active: true,
      createdAt: Date.now()
    };
    currentScreen = "qrcode";
    addHistory(`Evento criado: ${activeEvent.roomCode}`);
    emitGameState();
  });

  socket.on("showQRCode", () => {
    if (!activeEvent?.active) return;
    currentScreen = "qrcode";
    addHistory("QR Code exibido na TV");
    emitGameState();
  });

  socket.on("setScreen", (screen) => {
    setCurrentScreen(screen);
    emitGameState();
  });

  socket.on("selectQuestion", (index) => {
    const nextIndex = Number(index);
    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= questions.length) return;

    currentQuestionIndex = nextIndex;
    syncRoundToQuestion();
    syncCurrentQuestion();
    resetRoundState();
    addHistory(`Pergunta ${nextIndex + 1} selecionada`);
    emitQuestionState();
  });

  socket.on("createQuestion", (data = {}) => {
    questions.push(normalizeQuestion(data));
    currentQuestionIndex = questions.length - 1;
    syncCurrentQuestion();
    resetRoundState();
    addHistory("Nova pergunta criada");
    emitQuestionState();
  });

  socket.on("createRound", (data = {}) => {
    const name = String(data.name || "").trim() || `Rodada ${rounds.length + 1}`;
    rounds.push({
      id: `round-${Date.now()}`,
      name,
      questionIndexes: [],
      playedQuestionIndexes: []
    });
    currentRoundIndex = rounds.length - 1;
    roundLocked = false;
    addHistory(`${name} criada`);
    emitQuestionState();
  });

  socket.on("updateRoundQuestions", ({ roundIndex, questionIndexes } = {}) => {
    const nextRoundIndex = Number(roundIndex);
    if (!Number.isInteger(nextRoundIndex) || nextRoundIndex < 0 || nextRoundIndex >= rounds.length) return;

    const validIndexes = Array.isArray(questionIndexes)
      ? questionIndexes.filter((index) => Number.isInteger(index) && index >= 0 && index < questions.length)
      : [];

    rounds[nextRoundIndex].questionIndexes = [...new Set(validIndexes)];
    rounds[nextRoundIndex].playedQuestionIndexes = rounds[nextRoundIndex].playedQuestionIndexes.filter((index) => rounds[nextRoundIndex].questionIndexes.includes(index));

    if (nextRoundIndex === currentRoundIndex) {
      currentQuestionIndex = getCurrentRoundPendingIndexes()[0] || rounds[nextRoundIndex].questionIndexes[0] || 0;
      syncCurrentQuestion();
      resetRoundState();
    }

    addHistory(`${rounds[nextRoundIndex].name} atualizada`);
    emitQuestionState();
  });

  socket.on("deleteRound", (roundIndex) => {
    const nextRoundIndex = Number(roundIndex);
    syncRounds();
    if (!Number.isInteger(nextRoundIndex) || nextRoundIndex < 0 || nextRoundIndex >= rounds.length) return;
    if (rounds.length <= 1) return;

    const [removedRound] = rounds.splice(nextRoundIndex, 1);
    if (currentRoundIndex >= rounds.length) {
      currentRoundIndex = rounds.length - 1;
    } else if (nextRoundIndex < currentRoundIndex) {
      currentRoundIndex -= 1;
    }

    const pendingIndexes = getCurrentRoundPendingIndexes();
    currentQuestionIndex = pendingIndexes[0] || getCurrentRound().questionIndexes[0] || 0;
    syncCurrentQuestion();
    resetRoundState();
    addHistory(`${removedRound.name || `Rodada ${nextRoundIndex + 1}`} eliminada`);
    emitQuestionState();
  });

  socket.on("updateQuestion", ({ index, question } = {}) => {
    const questionIndex = Number(index);
    if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= questions.length) return;

    questions[questionIndex] = normalizeQuestion(question);
    currentQuestionIndex = questionIndex;
    syncCurrentQuestion();
    resetRoundState();
    addHistory(`Pergunta ${questionIndex + 1} editada`);
    emitQuestionState();
  });

  socket.on("duplicateQuestion", (index) => {
    const questionIndex = Number(index);
    if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= questions.length) return;

    const copy = normalizeQuestion({
      ...questions[questionIndex],
      title: `${questions[questionIndex].title} (COPIA)`
    });
    questions.splice(questionIndex + 1, 0, copy);
    currentQuestionIndex = questionIndex + 1;
    syncCurrentQuestion();
    resetRoundState();
    addHistory(`Pergunta ${questionIndex + 1} duplicada`);
    emitQuestionState();
  });

  socket.on("deleteQuestion", (index) => {
    const questionIndex = Number(index);
    if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= questions.length) return;

    questions.splice(questionIndex, 1);
    syncCurrentQuestion();
    resetRoundState();
    addHistory(`Pergunta ${questionIndex + 1} excluida`);
    emitQuestionState();
  });

  socket.on("setCorrectAnswer", (letter) => {
    const correct = String(letter || "").charAt(0).toUpperCase();
    const validLetters = currentQuestion.options.map((_, index) => optionLetter(index));
    if (!validLetters.includes(correct)) return;

    currentQuestion.correct = correct;
    questions[currentQuestionIndex] = currentQuestion;
    roundResult = null;
    roundScored = false;
    answerRevealed = false;
    addHistory(`Resposta correta definida: ${correct}`);
    emitQuestionState();
  });

  socket.on("updateSettings", (settings = {}) => {
    const nextTimer = Number(settings.defaultTimer);
    const nextMaxParticipants = Number(settings.maxParticipants);
    const nextRoundQuestionLimit = Number(settings.roundQuestionLimit);

    if (Number.isFinite(nextTimer)) {
      defaultTimer = Math.min(300, Math.max(5, Math.round(nextTimer)));
      if (!timerRunning) {
        timer = defaultTimer;
      }
    }

    if (Number.isFinite(nextMaxParticipants)) {
      maxParticipants = Math.min(999, Math.max(1, Math.round(nextMaxParticipants)));
    }

    if (Number.isFinite(nextRoundQuestionLimit)) {
      roundQuestionLimit = Math.min(questions.length || 1, Math.max(1, Math.round(nextRoundQuestionLimit)));
      currentRoundIndex = Math.min(currentRoundIndex, getTotalRounds() - 1);
      currentQuestionIndex = Math.min(currentQuestionIndex, questions.length - 1);
      syncCurrentQuestion();
    }

    addHistory("Configuracoes atualizadas");
    emitQuestionState();
  });

  socket.on("nextQuestion", () => {
    if (roundLocked) return;

    if (questionVisible || answerRevealed || roundResult || votes.length) {
      if (answerRevealed || roundResult) {
        if (!roundResult) {
          roundResult = buildRoundResult();
        }
        scoreRoundIfNeeded();
      }
      markCurrentQuestionPlayed();
    }

    const nextIndex = getCurrentRoundPendingIndexes()[0];
    if (!Number.isInteger(nextIndex)) {
      resetTimer();
      questionVisible = false;
      answerRevealed = false;
      roundLocked = true;
      currentScreen = "result";
      if (!roundResult) {
        roundResult = buildRoundResult();
      }
      scoreRoundIfNeeded();
      addHistory(`Rodada ${currentRoundIndex + 1} concluida`);
      io.emit("resultsUpdate", roundResult);
      emitGameState();
      return;
    }

    currentQuestionIndex = nextIndex;
    prepareCurrentQuestion();
    questionVisible = true;
    currentScreen = "tv";
    addHistory("Proxima pergunta mostrada na TV");
    emitQuestionState();
    startTimer();
  });

  socket.on("previousQuestion", () => {
    const round = getCurrentRound();
    const currentPosition = round.questionIndexes.indexOf(currentQuestionIndex);
    const lastPlayedIndex = round.playedQuestionIndexes[round.playedQuestionIndexes.length - 1];
    const previousIndex = Number.isInteger(lastPlayedIndex)
      ? lastPlayedIndex
      : round.questionIndexes[Math.max(0, currentPosition - 1)];

    if (!Number.isInteger(previousIndex)) return;

    round.playedQuestionIndexes = round.playedQuestionIndexes.filter((questionIndex) => questionIndex !== previousIndex);
    currentQuestionIndex = previousIndex;
    syncCurrentQuestion();
    resetRoundState();
    questionVisible = true;
    currentScreen = "tv";
    roundLocked = false;
    addHistory("Pergunta anterior restaurada");
    emitQuestionState();
    startTimer();
  });

  socket.on("unlockNextRound", () => {
    const totalRounds = getTotalRounds();
    if (currentRoundIndex + 1 >= totalRounds) return;

    currentRoundIndex += 1;
    currentQuestionIndex = getCurrentRoundPendingIndexes()[0] || getCurrentRound().questionIndexes[0] || 0;
    syncCurrentQuestion();
    resetRoundState();
    roundLocked = false;
    addHistory(`Rodada ${currentRoundIndex + 1} destravada`);
    emitQuestionState();
  });

  socket.on("clearRound", () => {
    resetRoundState();
    addHistory("Rodada limpa");
    emitQuestionState();
  });

  socket.on("endSystem", () => {
    io.emit("systemEnded", {
      reason: "Sistema encerrado pelo operador"
    });
    resetEventState();
    history = [];
    addHistory("Sistema encerrado pelo operador");
    emitQuestionState();
  });

  socket.on("restartSystem", () => {
    io.emit("systemEnded", {
      reason: "Sistema reiniciado pelo operador"
    });
    resetEventState();
    history = [];
    addHistory("Sistema reiniciado pelo operador");
    emitQuestionState();
  });

  socket.on("disconnect", () => {
    const participant = getParticipant(socket.id);
    if (participant) {
      participant.connected = false;
      emitGameState();
    }
    console.log("Usuario desconectado", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
