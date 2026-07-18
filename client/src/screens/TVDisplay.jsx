import TVScreen from "./TVScreen";
import ResultScreen from "./ResultScreen";
import GrandFinalScreen from "./GrandFinalScreen";
import QRCodeScreen from "./QRCodeScreen";
import { useScreenState } from "../state/ScreenState";
import useGameState from "../hooks/useGameState";

export default function TVDisplay() {
  const { currentScreen } = useScreenState();
  const gameState = useGameState();
  const screen = gameState.currentScreen || currentScreen;
  const shouldSoftenEntry = screen === "result" || screen === "grandFinal";

  const renderScreen = () => {
    if (screen === "result") {
      return <ResultScreen gameState={gameState} />;
    }

    if (screen === "grandFinal") {
      return <GrandFinalScreen gameState={gameState} />;
    }

    if (screen === "qrcode") {
      return <QRCodeScreen gameState={gameState} />;
    }

    return <TVScreen gameState={gameState} />;
  };

  return (
    <div key={screen} className={shouldSoftenEntry ? "tv-soft-screen-entry" : undefined}>
      {renderScreen()}
    </div>
  );
}
