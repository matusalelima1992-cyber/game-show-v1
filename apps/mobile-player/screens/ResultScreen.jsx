import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getGameSocket } from "../services/socket";
import { usePlayerStore } from "../state/playerStore";

export default function ResultScreen({ navigation }) {
  const { state, dispatch } = usePlayerStore();
  const gameState = state.gameState || {};
  const question = gameState.currentQuestion || {};
  const correctAlternative = getCorrectAlternative(question);

  useEffect(() => {
    const socket = getGameSocket();
    if (!socket) return undefined;

    const handleGameState = (nextGameState) => {
      dispatch({ type: "setGameState", payload: nextGameState });
      if (!nextGameState?.answerRevealed && !nextGameState?.questionVisible) {
        navigation.replace("Waiting");
      }
    };

    socket.on("gameStateUpdate", handleGameState);

    return () => {
      socket.off("gameStateUpdate", handleGameState);
    };
  }, [dispatch, navigation]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.icon}>RESULTADO</Text>
        <Text style={styles.kicker}>Resposta revelada</Text>
        <Text style={styles.title}>{correctAlternative ? `${correctAlternative.letter} - ${correctAlternative.text}` : "Aguardando resultado"}</Text>
        <Text style={styles.text}>Resultado completo sera conectado nas proximas fases do app mobile.</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Waiting")}>
          <Text style={styles.buttonText}>Aguardar proxima rodada</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getCorrectAlternative(question) {
  if (!question) return null;
  const alternatives = Array.isArray(question.alternatives) ? question.alternatives : [];
  const correctLetter = String(question.correctAnswer || question.correct || "").toUpperCase();
  return alternatives.find((alternative) => String(alternative.letter || "").toUpperCase() === correctLetter) || null;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: "#050914"
  },
  card: {
    alignItems: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.5)",
    borderRadius: 22,
    backgroundColor: "rgba(24,18,5,0.84)"
  },
  icon: {
    color: "#fde047",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2
  },
  kicker: {
    marginTop: 16,
    color: "#fde047",
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    marginTop: 12,
    color: "#ffffff",
    textAlign: "center",
    fontSize: 26,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  text: {
    marginTop: 12,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 20
  },
  button: {
    marginTop: 22,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#2563eb"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "900",
    textTransform: "uppercase"
  }
});
