import React, { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { connectToGameServer } from "../services/socket";
import { createPlayerKey, savePlayerSession } from "../services/storage";
import { usePlayerStore } from "../state/playerStore";

export default function JoinRoomScreen({ navigation }) {
  const { state, dispatch } = usePlayerStore();
  const nameInputRef = useRef(null);
  const [name, setName] = useState(state.player.name);
  const [group, setGroup] = useState(state.player.group || "homens");
  const [roomCode, setRoomCode] = useState(state.connection.roomCode);
  const [host, setHost] = useState(state.connection.host);
  const [port, setPort] = useState(state.connection.port || "3001");
  const [advancedOpen, setAdvancedOpen] = useState(!state.connection.host);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");

  const canJoin = useMemo(() => {
    return Boolean(name.trim() && group && roomCode.trim() && host.trim() && port.trim());
  }, [name, group, roomCode, host, port]);

  useEffect(() => {
    setName(state.player.name);
    setGroup(state.player.group || "homens");
    setRoomCode(state.connection.roomCode);
    setHost(state.connection.host);
    setPort(state.connection.port || "3001");
  }, [state.connection, state.player]);

  useEffect(() => {
    if (!state.connection.roomCode) return undefined;
    const focusTimer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 450);
    return () => clearTimeout(focusTimer);
  }, [state.connection.roomCode]);

  useEffect(() => {
    const connection = {
      host: host.trim(),
      port: port.trim(),
      roomCode: roomCode.trim().toUpperCase()
    };

    if (!connection.host || !connection.port || !connection.roomCode) return undefined;

    let mounted = true;

    try {
      const socket = connectToGameServer(connection);

      const handleConnect = async () => {
        if (!mounted) return;
        dispatch({ type: "setConnected", payload: true });
        dispatch({ type: "setConnection", payload: connection });
        await savePlayerSession({
          connection,
          player: state.player,
          joined: false
        });
        setMessage("Sala pronta. Informe seu apelido.");
      };

      const handleConnectError = () => {
        if (!mounted) return;
        dispatch({ type: "setConnected", payload: false });
        setMessage("Nao foi possivel conectar ao servidor local.");
      };

      socket.on("connect", handleConnect);
      socket.on("connect_error", handleConnectError);

      if (socket.connected) {
        handleConnect();
      }

      return () => {
        mounted = false;
        socket.off("connect", handleConnect);
        socket.off("connect_error", handleConnectError);
      };
    } catch (err) {
      setMessage(err.message);
      return undefined;
    }
  }, [host, port, roomCode, dispatch, state.player]);

  const joinRoom = async () => {
    if (!canJoin || joining) return;

    const connection = {
      host: host.trim(),
      port: port.trim(),
      roomCode: roomCode.trim().toUpperCase()
    };
    const player = {
      name: name.trim(),
      group,
      playerKey: state.player.playerKey || createPlayerKey()
    };

    try {
      setJoining(true);
      setMessage("Conectando ao servidor...");
      const socket = connectToGameServer(connection);

      socket.off("connect");
      socket.off("playerJoinError");
      socket.off("gameStateUpdate");

      socket.on("connect", () => {
        dispatch({ type: "setConnected", payload: true });
        socket.emit("joinPlayer", {
          ...player,
          roomCode: connection.roomCode
        });
      });

      socket.on("playerJoinError", (payload) => {
        setJoining(false);
        setMessage(payload?.reason || "Nao foi possivel entrar na sala.");
      });

      socket.on("gameStateUpdate", async (gameState) => {
        const participantList = Array.isArray(gameState?.participants?.list) ? gameState.participants.list : [];
        const joinedParticipant = participantList.some((participant) => {
          return participant.playerKey === player.playerKey || (participant.name === player.name && String(participant.group || "").toLowerCase() === player.group);
        });

        if (!joinedParticipant) return;

        dispatch({ type: "setGameState", payload: gameState });
        dispatch({ type: "setConnection", payload: connection });
        dispatch({ type: "setPlayer", payload: player });
        dispatch({ type: "setJoined", payload: true });
        await savePlayerSession({ connection, player, joined: true });
        navigation.replace("Waiting");
      });

      if (socket.connected) {
        dispatch({ type: "setConnected", payload: true });
        socket.emit("joinPlayer", {
          ...player,
          roomCode: connection.roomCode
        });
      }
    } catch (err) {
      setJoining(false);
      setMessage(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Sala encontrada</Text>
        <Text style={styles.title}>{roomCode || "Codigo da sala"}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Apelido</Text>
          <TextInput ref={nameInputRef} style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Joao" placeholderTextColor="#64748b" returnKeyType="done" />

          <Text style={styles.label}>Escolha seu grupo</Text>
          <View style={styles.groupRow}>
            <TouchableOpacity style={[styles.groupButton, group === "homens" && styles.groupMenSelected]} onPress={() => setGroup("homens")}>
              <Text style={styles.groupIcon}>H</Text>
              <Text style={styles.groupText}>Homens</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.groupButton, group === "mulheres" && styles.groupWomenSelected]} onPress={() => setGroup("mulheres")}>
              <Text style={styles.groupIcon}>M</Text>
              <Text style={styles.groupText}>Mulheres</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Codigo da sala</Text>
          <TextInput style={styles.input} value={roomCode} onChangeText={(value) => setRoomCode(value.toUpperCase())} autoCapitalize="characters" placeholder="A7K9M2" placeholderTextColor="#64748b" />

          <TouchableOpacity style={styles.advancedToggle} onPress={() => setAdvancedOpen((current) => !current)}>
            <Text style={styles.advancedText}>{advancedOpen ? "Ocultar configuracoes avancadas" : "Configuracoes avancadas"}</Text>
          </TouchableOpacity>

          {advancedOpen && (
            <View style={styles.advancedBox}>
              <Text style={styles.label}>IP do servidor</Text>
              <TextInput style={styles.input} value={host} onChangeText={setHost} placeholder="192.168.1.149" placeholderTextColor="#64748b" autoCapitalize="none" />

              <Text style={styles.label}>Porta</Text>
              <TextInput style={styles.input} value={port} onChangeText={setPort} keyboardType="number-pad" placeholder="3001" placeholderTextColor="#64748b" />
            </View>
          )}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <TouchableOpacity style={[styles.joinButton, !canJoin && styles.disabled]} onPress={joinRoom} disabled={!canJoin || joining}>
            <Text style={styles.joinText}>{joining ? "Entrando..." : "Entrar no game"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#050914"
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22
  },
  kicker: {
    color: "#93c5fd",
    textAlign: "center",
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    marginTop: 8,
    color: "#ffffff",
    textAlign: "center",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 4
  },
  card: {
    marginTop: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.35)",
    borderRadius: 18,
    backgroundColor: "rgba(8,15,28,0.94)"
  },
  label: {
    marginTop: 14,
    marginBottom: 6,
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  input: {
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 10,
    color: "#ffffff",
    backgroundColor: "rgba(0,0,0,0.28)"
  },
  groupRow: {
    flexDirection: "row",
    gap: 10
  },
  groupButton: {
    flex: 1,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)"
  },
  groupMenSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(37,99,235,0.28)"
  },
  groupWomenSelected: {
    borderColor: "#ec4899",
    backgroundColor: "rgba(219,39,119,0.28)"
  },
  groupIcon: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900"
  },
  groupText: {
    marginTop: 4,
    color: "#ffffff",
    fontWeight: "900",
    textTransform: "uppercase"
  },
  advancedToggle: {
    marginTop: 14,
    alignItems: "center"
  },
  advancedText: {
    color: "#67e8f9",
    fontWeight: "900"
  },
  advancedBox: {
    marginTop: 8
  },
  message: {
    marginTop: 14,
    color: "#fbbf24",
    textAlign: "center",
    fontWeight: "800"
  },
  joinButton: {
    marginTop: 20,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#16a34a"
  },
  disabled: {
    opacity: 0.45
  },
  joinText: {
    color: "#ffffff",
    fontWeight: "900",
    textTransform: "uppercase"
  }
});
