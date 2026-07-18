import React, { createContext, useContext, useMemo, useReducer } from "react";

const initialState = {
  connection: {
    host: "",
    port: "3001",
    roomCode: ""
  },
  player: {
    name: "",
    group: "",
    playerKey: ""
  },
  connected: false,
  joined: false,
  gameState: null,
  error: ""
};

const PlayerStoreContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "setConnection":
      return {
        ...state,
        connection: {
          ...state.connection,
          ...action.payload
        },
        error: ""
      };
    case "setPlayer":
      return {
        ...state,
        player: {
          ...state.player,
          ...action.payload
        },
        error: ""
      };
    case "setConnected":
      return {
        ...state,
        connected: Boolean(action.payload)
      };
    case "setJoined":
      return {
        ...state,
        joined: Boolean(action.payload)
      };
    case "setGameState":
      return {
        ...state,
        gameState: action.payload
      };
    case "setError":
      return {
        ...state,
        error: action.payload || ""
      };
    case "hydrate":
      return {
        ...state,
        connection: {
          ...state.connection,
          ...(action.payload?.connection || {})
        },
        player: {
          ...state.player,
          ...(action.payload?.player || {})
        },
        joined: Boolean(action.payload?.joined),
        error: ""
      };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <PlayerStoreContext.Provider value={value}>{children}</PlayerStoreContext.Provider>;
}

export function usePlayerStore() {
  const context = useContext(PlayerStoreContext);
  if (!context) {
    throw new Error("usePlayerStore deve ser usado dentro de PlayerProvider.");
  }
  return context;
}
