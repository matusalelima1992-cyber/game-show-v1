import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { disconnectGameSocket, getGameSocket } from "../services/socket";
import { clearPlayerSession } from "../services/storage";
import { usePlayerStore } from "../state/playerStore";

export default function WaitingScreen({ navigation }) {
  const { state, dispatch } = usePlayerStore();
  const groupLabel = state.player.group === "mulheres" ? "Mulheres" : "Homens";

  useEffect(() => {
    const socket = getGameSocket();
    if (!socket) return undefined;

    const handleGameState = (gameState) => {
      dispatch({ type: "setGameState", payload: gameState });
      if (gameState?.questionVisible && gameState?.currentQuestion) {
        navigation.replace("Question");
      }
    };

    const handleSystemEnded = () => {
      clearPlayerSession();
      dispatch({ type: "reset" });
      disconnectGameSocket();
      navigation.replace("Home");
    };

    socket.on("gameStateUpdate", handleGameState);
    socket.on("systemEnded", handleSystemEnded);

    return () => {
      socket.off("gameStateUpdate", handleGameState);
      socket.off("systemEnded", handleSystemEnded);
    };
  }, [dispatch, navigation]);

  const leave = async () => {
    const socket = getGameSocket();
    socket?.emit("leavePlayer", {
      ...state.player,
      roomCode: state.connection.roomCode
    });
    await clearPlayerSession();
    disconnectGameSocket();
    dispatch({ type: "reset" });
    navigation.replace("Home");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.badge}>
        <Text style={styles.badgeGroup}>{groupLabel}</Text>
        <Text style={styles.badgeName}>{state.player.name}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.icon}>...</Text>
        <Text style={styles.title}>Aguardando rodada</Text>
        <Text style={styles.text}>Voce esta na sala {state.connection.roomCode}.</Text>
        <Text style={styles.text}>Quando o operador liberar, a pergunta aparece aqui.</Text>
      </View>

      <TouchableOpacity style={styles.leaveButton} onPress={leave}>
        <Text style={styles.leaveText}>Sair do jogo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 22,
    backgroundColor: "#050914"
  },
  badge: {
    alignSelf: "flex-start",
    minWidth: 140,
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
    marginTop: 2,
    color: "#cbd5e1",
    fontWeight: "700"
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    fontSize: 70
  },
  title: {
    marginTop: 18,
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  text: {
    marginTop: 10,
    color: "#cbd5e1",
    textAlign: "center"
  },
  leaveButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.55)",
    borderRadius: 12,
    backgroundColor: "rgba(127,29,29,0.28)"
  },
  leaveText: {
    color: "#fca5a5",
    fontWeight: "900",
    textTransform: "uppercase"
  }
});
