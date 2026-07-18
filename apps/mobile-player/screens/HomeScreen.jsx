import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { loadPlayerSession } from "../services/storage";
import { usePlayerStore } from "../state/playerStore";

export default function HomeScreen({ navigation }) {
  const { dispatch } = usePlayerStore();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadPlayerSession().then((session) => {
      if (!mounted || !session) return;
      dispatch({ type: "hydrate", payload: session });
      setHasSession(true);
    });
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.glowBlue} />
      <View style={styles.glowPink} />

      <View style={styles.logoWrap}>
        <Text style={styles.logoBlue}>GAME</Text>
        <Text style={styles.logoPink}> SHOW</Text>
        <Text style={styles.logoMe}>.me</Text>
      </View>
      <Text style={styles.subtitle}>Player oficial dos participantes</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Entrar no evento</Text>
        <Text style={styles.text}>Leia o QR Code exibido na TV ou entre manualmente com o codigo da sala.</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("QRScanner")}>
          <Text style={styles.primaryText}>Ler QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("JoinRoom")}>
          <Text style={styles.secondaryText}>Entrar manualmente</Text>
        </TouchableOpacity>

        {hasSession && (
          <TouchableOpacity style={styles.ghostButton} onPress={() => navigation.navigate("JoinRoom")}>
            <Text style={styles.ghostText}>Continuar ultima sala</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#050914"
  },
  glowBlue: {
    position: "absolute",
    left: -120,
    top: 80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(37,99,235,0.22)"
  },
  glowPink: {
    position: "absolute",
    right: -130,
    bottom: 80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(236,72,153,0.18)"
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  logoBlue: {
    color: "#60a5fa",
    fontSize: 34,
    fontWeight: "900"
  },
  logoPink: {
    color: "#ff5fb3",
    fontSize: 34,
    fontWeight: "900"
  },
  logoMe: {
    marginBottom: 4,
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 4,
    textAlign: "center",
    color: "#b6c2d8",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4
  },
  card: {
    marginTop: 34,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.35)",
    borderRadius: 18,
    backgroundColor: "rgba(8,15,28,0.92)"
  },
  title: {
    textAlign: "center",
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  text: {
    marginTop: 10,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 20
  },
  primaryButton: {
    marginTop: 22,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#16a34a"
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "900",
    textTransform: "uppercase"
  },
  secondaryButton: {
    marginTop: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.55)",
    borderRadius: 12,
    backgroundColor: "rgba(37,99,235,0.18)"
  },
  secondaryText: {
    color: "#93c5fd",
    fontWeight: "900",
    textTransform: "uppercase"
  },
  ghostButton: {
    marginTop: 12,
    alignItems: "center"
  },
  ghostText: {
    color: "#f9a8d4",
    fontWeight: "800"
  }
});
