import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getGameSocket } from "../services/socket";
import { usePlayerStore } from "../state/playerStore";

export default function QuestionScreen({ navigation }) {
  const { state, dispatch } = usePlayerStore();
  const gameState = state.gameState || {};
  const question = gameState.currentQuestion || {};
  const alternatives = Array.isArray(question.alternatives) ? question.alternatives : [];

  useEffect(() => {
    const socket = getGameSocket();
    if (!socket) return undefined;

    const handleGameState = (nextGameState) => {
      dispatch({ type: "setGameState", payload: nextGameState });

      if (!nextGameState?.questionVisible) {
        navigation.replace("Waiting");
      }

      if (nextGameState?.answerRevealed) {
        navigation.replace("Result");
      }
    };

    socket.on("gameStateUpdate", handleGameState);

    return () => {
      socket.off("gameStateUpdate", handleGameState);
    };
  }, [dispatch, navigation]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeGroup}>{state.player.group === "mulheres" ? "Mulheres" : "Homens"}</Text>
          <Text style={styles.badgeName}>{state.player.name}</Text>
        </View>
        <View style={styles.timer}>
          <Text style={styles.timerValue}>{Number(gameState.timer || 0)}s</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.kicker}>Pergunta {Number(gameState.currentQuestionIndex || 0) + 1}</Text>
        <Text style={styles.title}>{question.text || "Aguardando pergunta"}</Text>

        <View style={styles.options}>
          {alternatives.map((alternative, index) => (
            <TouchableOpacity key={`${alternative.letter || index}`} style={styles.option}>
              <Text style={styles.optionBadge}>{alternative.letter || String.fromCharCode(65 + index)}</Text>
              <Text style={styles.optionText}>{alternative.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.note}>Votacao completa sera implementada na proxima fase.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 18,
    backgroundColor: "#050914"
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  badge: {
    minWidth: 132,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.5)",
    backgroundColor: "rgba(37,99,235,0.22)"
  },
  badgeGroup: {
    color: "#ffffff",
    fontWeight: "900",
    textTransform: "uppercase"
  },
  badgeName: {
    color: "#cbd5e1",
    fontWeight: "700"
  },
  timer: {
    width: 74,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.5)",
    backgroundColor: "rgba(20,184,166,0.12)"
  },
  timerValue: {
    color: "#67e8f9",
    fontSize: 24,
    fontWeight: "900"
  },
  card: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 24
  },
  kicker: {
    color: "#93c5fd",
    textAlign: "center",
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    marginTop: 12,
    color: "#ffffff",
    textAlign: "center",
    fontSize: 25,
    fontWeight: "900",
    textTransform: "uppercase",
    lineHeight: 34
  },
  options: {
    marginTop: 26,
    gap: 12
  },
  option: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(15,23,42,0.92)"
  },
  optionBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    textAlign: "center",
    lineHeight: 34,
    overflow: "hidden",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    fontWeight: "900"
  },
  optionText: {
    marginLeft: 12,
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  note: {
    marginTop: 18,
    color: "#94a3b8",
    textAlign: "center",
    fontSize: 12
  }
});
