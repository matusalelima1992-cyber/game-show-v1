import { useEffect, useState } from "react";
import socket from "../socket";

const initialState = {
  currentScreen: "tv",
  currentQuestion: {
    title: "QUAL E O MAIOR PLANETA DO SISTEMA SOLAR?",
    options: ["A - Terra", "B - Marte", "C - Jupiter", "D - Saturno"],
    correct: "C"
  },
  currentQuestionIndex: 0,
  currentRoundQuestionNumber: 1,
  totalQuestions: 10,
  currentRoundIndex: 0,
  totalRounds: 1,
  roundLocked: false,
  roundStartIndex: 0,
  roundEndIndex: 10,
  rounds: [],
  currentRound: null,
  pendingQuestionIndexes: [],
  selectedQuestionIndexes: [],
  questions: [],
  settings: {
    defaultTimer: 15,
    maxParticipants: 20,
    roundQuestionLimit: 10
  },
  questionVisible: false,
  answerRevealed: false,
  timer: 15,
  timerRunning: false,
  participants: {
    men: 0,
    women: 0,
    total: 0,
    list: []
  },
  votes: {
    count: 0,
    total: 0,
    percent: 0,
    top: {
      option: "C",
      text: "Jupiter",
      votes: 0,
      percent: 0
    },
    list: []
  },
  roundResult: null,
  grandFinal: null,
  activeEvent: null,
  network: null,
  history: []
};

export default function useGameState() {
  const [gameState, setGameState] = useState(initialState);

  useEffect(() => {
    const handleGameState = (nextState) => {
      console.log("gameStateUpdate", nextState);
      setGameState((current) => ({
        ...current,
        ...nextState,
        participants: {
          ...current.participants,
          ...(nextState?.participants || {})
        },
        votes: {
          ...current.votes,
          ...(nextState?.votes || {}),
          top: {
            ...current.votes.top,
            ...(nextState?.votes?.top || {})
          }
        }
      }));
    };

    const handleTimer = (timer) => {
      setGameState((current) => ({ ...current, timer }));
    };

    const handleQuestion = (currentQuestion) => {
      setGameState((current) => ({ ...current, currentQuestion }));
    };

    const handleVisibility = (questionVisible) => {
      setGameState((current) => ({ ...current, questionVisible }));
    };

    const handleResults = (roundResult) => {
      setGameState((current) => ({ ...current, roundResult }));
    };

    socket.on("gameState", handleGameState);
    socket.on("gameStateUpdate", handleGameState);
    socket.on("timerUpdate", handleTimer);
    socket.on("questionUpdate", handleQuestion);
    socket.on("questionVisibility", handleVisibility);
    socket.on("resultsUpdate", handleResults);

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("gameStateUpdate", handleGameState);
      socket.off("timerUpdate", handleTimer);
      socket.off("questionUpdate", handleQuestion);
      socket.off("questionVisibility", handleVisibility);
      socket.off("resultsUpdate", handleResults);
    };
  }, []);

  return gameState;
}
