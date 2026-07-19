import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import PlayerPage from "./pages/PlayerPage";
import TVDisplay from "./screens/TVDisplay";
import ResultScreen from "./screens/ResultScreen";
import GrandFinalScreen from "./screens/GrandFinalScreen";
import OperatorPanel from "./screens/OperatorPanel";
import QRCodeScreen from "./screens/QRCodeScreen";
import Top3CeremonyScreen from "./screens/Top3CeremonyScreen";
import { ScreenStateProvider } from "./state/ScreenState";

export default function App() {

  return (

    <ScreenStateProvider>

      <BrowserRouter>

        <Routes>

        <Route
          path="/"
          element={<Navigate to="/tv" replace />}
        />

        <Route
          path="/operator"
          element={<OperatorPanel />}
        />

        <Route
          path="/tv"
          element={<TVDisplay />}
        />

        <Route
          path="/player"
          element={<PlayerPage />}
        />

        <Route
          path="/result"
          element={<ResultScreen />}
        />

        <Route
          path="/grand-final"
          element={<GrandFinalScreen />}
        />

        <Route
          path="/qrcode"
          element={<QRCodeScreen />}
        />

        <Route
          path="/top3-ceremony"
          element={<Top3CeremonyScreen />}
        />

        </Routes>

      </BrowserRouter>

    </ScreenStateProvider>

  );

}
