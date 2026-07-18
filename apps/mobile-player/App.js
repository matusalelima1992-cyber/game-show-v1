import React, { useEffect, useRef } from "react";
import { Linking } from "react-native";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { PlayerProvider } from "./state/playerStore";
import { parseGameShowQRCode } from "./services/qrParser";
import { usePlayerStore } from "./state/playerStore";
import HomeScreen from "./screens/HomeScreen";
import QRScannerScreen from "./screens/QRScannerScreen";
import JoinRoomScreen from "./screens/JoinRoomScreen";
import WaitingScreen from "./screens/WaitingScreen";
import QuestionScreen from "./screens/QuestionScreen";
import ResultScreen from "./screens/ResultScreen";

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

export default function App() {
  return (
    <PlayerProvider>
      <PlayerNavigation />
    </PlayerProvider>
  );
}

function PlayerNavigation() {
  const { dispatch } = usePlayerStore();
  const pendingUrlRef = useRef("");

  const openJoinRoomFromUrl = (url) => {
    if (!url) return;

    try {
      const connection = parseGameShowQRCode(url);
      dispatch({ type: "setConnection", payload: connection });

      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: "JoinRoom" }]
        });
      } else {
        pendingUrlRef.current = url;
      }
    } catch (err) {
      dispatch({ type: "setError", payload: err.message });
    }
  };

  useEffect(() => {
    let mounted = true;

    Linking.getInitialURL().then((url) => {
      if (mounted) openJoinRoomFromUrl(url);
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      openJoinRoomFromUrl(url);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const handleReady = () => {
    if (!pendingUrlRef.current) return;
    const pendingUrl = pendingUrlRef.current;
    pendingUrlRef.current = "";
    openJoinRoomFromUrl(pendingUrl);
  };

  return (
    <NavigationContainer ref={navigationRef} onReady={handleReady}>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
          contentStyle: { backgroundColor: "#050914" }
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        <Stack.Screen name="JoinRoom" component={JoinRoomScreen} />
        <Stack.Screen name="Waiting" component={WaitingScreen} />
        <Stack.Screen name="Question" component={QuestionScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
