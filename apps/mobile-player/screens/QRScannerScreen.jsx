import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { parseGameShowQRCode } from "../services/qrParser";
import { usePlayerStore } from "../state/playerStore";

export default function QRScannerScreen({ navigation }) {
  const { dispatch } = usePlayerStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState("");

  const handleScan = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed = parseGameShowQRCode(data);
      dispatch({ type: "setConnection", payload: parsed });
      navigation.replace("JoinRoom");
    } catch (err) {
      setError(err.message);
      setScanned(false);
    }
  };

  if (!permission) {
    return <View style={styles.center}><Text style={styles.text}>Preparando camera...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.title}>Permitir camera</Text>
        <Text style={styles.text}>A camera e necessaria para ler o QR Code da sala.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir acesso</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Aponte para o QR Code</Text>
      <View style={styles.cameraWrap}>
        <CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={handleScan} />
        <View style={styles.frame} />
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.text}>Centralize o codigo exibido na TV.</Text>
      )}
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    backgroundColor: "#050914"
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050914"
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  text: {
    marginTop: 14,
    color: "#cbd5e1",
    textAlign: "center"
  },
  cameraWrap: {
    marginTop: 24,
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#f472b6"
  },
  camera: {
    flex: 1
  },
  frame: {
    position: "absolute",
    left: "12%",
    top: "12%",
    width: "76%",
    height: "76%",
    borderWidth: 3,
    borderColor: "#fde047",
    borderRadius: 14
  },
  error: {
    marginTop: 14,
    color: "#fb7185",
    textAlign: "center",
    fontWeight: "800"
  },
  button: {
    marginTop: 24,
    height: 52,
    paddingHorizontal: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#16a34a"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "900",
    textTransform: "uppercase"
  },
  secondaryButton: {
    marginTop: 18,
    height: 48,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)"
  },
  secondaryText: {
    color: "#e5e7eb",
    fontWeight: "900",
    textTransform: "uppercase"
  }
});
