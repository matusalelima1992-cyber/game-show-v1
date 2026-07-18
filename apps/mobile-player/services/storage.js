import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "@gameshow_player_session";

export async function savePlayerSession(session) {
  const payload = {
    ...session,
    updatedAt: Date.now()
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

export async function loadPlayerSession() {
  const rawSession = await AsyncStorage.getItem(SESSION_KEY);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession);
  } catch {
    await clearPlayerSession();
    return null;
  }
}

export async function clearPlayerSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export function createPlayerKey() {
  return `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
