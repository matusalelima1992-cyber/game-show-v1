import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "gameShow.currentScreen";
const CHANNEL_KEY = "gameShow.screenChannel";
const allowedScreens = ["tv", "result", "grandFinal", "qrcode"];

const ScreenStateContext = createContext(null);

function normalizeScreen(screen) {
  return allowedScreens.includes(screen) ? screen : "tv";
}

export function ScreenStateProvider({ children }) {
  const [currentScreen, setCurrentScreenState] = useState(() => {
    try {
      return normalizeScreen(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      return "tv";
    }
  });

  const setCurrentScreen = (screen) => {
    const nextScreen = normalizeScreen(screen);
    setCurrentScreenState(nextScreen);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextScreen);
      window.dispatchEvent(new CustomEvent("game-show-screen-change", { detail: nextScreen }));
    } catch {
      // The UI still works in-memory if storage is unavailable.
    }

    try {
      const channel = new BroadcastChannel(CHANNEL_KEY);
      channel.postMessage(nextScreen);
      channel.close();
    } catch {
      // Older browsers can still sync through storage/polling.
    }
  };

  useEffect(() => {
    let lastKnownScreen = currentScreen;
    let channel;

    const syncScreen = (screen) => {
      const nextScreen = normalizeScreen(screen);
      lastKnownScreen = nextScreen;
      setCurrentScreenState(nextScreen);
    };

    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        syncScreen(event.newValue);
      }
    };

    const handleLocalChange = (event) => {
      syncScreen(event.detail);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("game-show-screen-change", handleLocalChange);

    try {
      channel = new BroadcastChannel(CHANNEL_KEY);
      channel.onmessage = (event) => {
        syncScreen(event.data);
      };
    } catch {
      channel = null;
    }

    const pollStorage = window.setInterval(() => {
      try {
        const storedScreen = normalizeScreen(window.localStorage.getItem(STORAGE_KEY));
        if (storedScreen !== lastKnownScreen) {
          syncScreen(storedScreen);
        }
      } catch {
        // Ignore storage read errors; direct in-memory updates still work.
      }
    }, 300);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("game-show-screen-change", handleLocalChange);
      window.clearInterval(pollStorage);
      if (channel) {
        channel.close();
      }
    };
  }, [currentScreen]);

  const value = useMemo(
    () => ({
      currentScreen,
      setCurrentScreen
    }),
    [currentScreen]
  );

  return (
    <ScreenStateContext.Provider value={value}>
      {children}
    </ScreenStateContext.Provider>
  );
}

export function useScreenState() {
  const context = useContext(ScreenStateContext);

  if (!context) {
    throw new Error("useScreenState must be used inside ScreenStateProvider");
  }

  return context;
}
