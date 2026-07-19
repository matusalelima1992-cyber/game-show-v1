import { useState } from "react";
import OfficialLogo from "../components/OfficialLogo";
import useGameState from "../hooks/useGameState";
import { QRCodeSVG } from "qrcode.react";

const QR_MODE_STORAGE_KEY = "gameShowMe.qrMode";
const TEST_WEB_PLAYER_URL = "https://game-show-v1.vercel.app";

function getJoinUrl(roomCode, network) {
  if (!roomCode) return "";
  return `${TEST_WEB_PLAYER_URL}/player?room=${encodeURIComponent(roomCode)}`;
}

function getAppJoinUrl(roomCode, network) {
  if (!roomCode) return "";
  const fallbackHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "localhost"
    : window.location.hostname;
  const host = network?.host || fallbackHost;
  const port = network?.serverPort || 3001;
  return `gameshowme://join?host=${encodeURIComponent(host)}&port=${encodeURIComponent(port)}&room=${encodeURIComponent(roomCode)}`;
}

function NeonIcon({ type, color = "pink" }) {
  const stroke = color === "pink" ? "#ff4fb8" : "#38a8ff";
  const glow = color === "pink" ? "drop-shadow(0 0 10px rgba(236,72,153,0.95))" : "drop-shadow(0 0 10px rgba(56,189,248,0.95))";

  if (type === "phone") {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" style={{ filter: glow }} aria-hidden="true">
        <rect x="18" y="6" width="28" height="52" rx="5" fill="none" stroke={stroke} strokeWidth="4" />
        <path d="M27 12h10M29 51h6" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="32" r="7" fill="none" stroke={stroke} strokeWidth="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 74 54" className="h-12 w-16" style={{ filter: glow }} aria-hidden="true">
      <rect x="4" y="8" width="66" height="38" rx="5" fill="none" stroke={stroke} strokeWidth="4" />
      {[14, 24, 34, 44, 54].map((x) => (
        <path key={x} d={`M${x} 18h4M${x} 28h4M${x} 38h4`} stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function NeonChevrons({ direction = "right", color = "pink" }) {
  const stroke = color === "pink" ? "#ff4fb8" : "#38a8ff";
  const transform = direction === "left" ? "scaleX(-1)" : undefined;
  return (
    <svg viewBox="0 0 78 84" className="h-16 w-14" style={{ filter: "drop-shadow(0 0 12px rgba(236,72,153,0.92))", transform }} aria-hidden="true">
      <path d="M12 16 C24 28 31 36 39 42 C31 48 24 56 12 68" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 16 C50 28 57 36 65 42 C57 48 50 56 38 68" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function QRCodeScreen({ gameState: providedGameState }) {
  const [qrMode, setQrMode] = useState(() => window.localStorage.getItem(QR_MODE_STORAGE_KEY) || "app");
  const liveGameState = useGameState();
  const gameState = providedGameState || liveGameState;
  const event = gameState.activeEvent;
  const roomCode = event?.roomCode || "------";
  const connectedCount = gameState.participants?.total || 0;
  const participantStatus = connectedCount > 0 ? "Participantes conectados" : "Aguardando participantes";
  const joinUrl = getJoinUrl(event?.roomCode, gameState.network);
  const appJoinUrl = getAppJoinUrl(event?.roomCode, gameState.network);
  const qrValue = qrMode === "web" ? joinUrl : appJoinUrl;
  const qrModeLabel = qrMode === "web" ? "Navegador" : "Aplicativo";

  function changeQrMode(nextMode) {
    setQrMode(nextMode);
    window.localStorage.setItem(QR_MODE_STORAGE_KEY, nextMode);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02050f] p-3 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_50%,rgba(37,99,235,0.28),transparent_34%),radial-gradient(circle_at_78%_50%,rgba(236,72,153,0.24),transparent_34%),linear-gradient(180deg,#050816_0%,#02040b_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.42)_62%,rgba(0,0,0,0.88)_100%)]" />

      <main className="relative z-10 grid h-[calc(100vh-24px)] grid-rows-[64px_minmax(0,1fr)] overflow-hidden rounded-xl border border-white/18 bg-black/38 p-6 shadow-[0_0_70px_rgba(0,0,0,0.82),inset_0_0_80px_rgba(255,255,255,0.025)]">
        <header className="flex min-h-0 items-start justify-between">
          <OfficialLogo />
          <div className="flex items-center gap-4 rounded-xl border border-blue-400/25 bg-blue-950/28 px-5 py-3 text-right shadow-[0_0_24px_rgba(59,130,246,0.14)]">
            <div className="text-base font-black uppercase text-white">
              {event?.active ? participantStatus : "Nenhum evento ativo"}
            </div>
            {connectedCount > 0 && (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cyan-300/50 bg-black/48 text-2xl font-black text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.22),inset_0_0_16px_rgba(34,211,238,0.10)]">
                {connectedCount}
              </div>
            )}
          </div>
        </header>

        <section className="grid min-h-0 grid-cols-[0.82fr_minmax(360px,58vh)_0.82fr] items-start gap-6 pt-4">
          <div className="grid h-[min(52vh,430px)] min-h-[330px] grid-cols-[1fr_58px] items-center gap-2 pt-[112px] text-right">
            <div className="flex flex-col items-center">
              <NeonIcon type="phone" color="pink" />
              <div className="mt-4 text-center text-xl font-black uppercase leading-snug text-white">
                Aponte a camera<br />do seu celular
              </div>
              <div className="mt-2 text-center text-lg font-black uppercase text-pink-300">para o QR Code</div>
            </div>
            <div className="translate-y-6">
              <NeonChevrons direction="right" color="pink" />
            </div>
          </div>

          <div className="flex min-w-0 flex-col items-center">
            <h1 className="mb-2 text-center text-[34px] font-black uppercase leading-none tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              Entre no evento
            </h1>
            <div className="mb-3 max-w-full rounded-full border border-white/12 bg-black/35 px-6 py-2 text-center text-lg font-black uppercase tracking-wide text-white/86">
              {event?.name || "Aguardando evento"}
            </div>
            <div className="mb-3 flex items-center overflow-hidden rounded-full border border-white/12 bg-black/38 p-1 text-[11px] font-black uppercase tracking-wide">
              {[
                ["app", "Aplicativo"],
                ["web", "Navegador"]
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => changeQrMode(mode)}
                  className={`rounded-full px-4 py-2 transition ${
                    qrMode === mode
                      ? "bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.35)]"
                      : "text-white/52"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex aspect-square h-[min(52vh,430px)] min-h-[330px] items-center justify-center rounded-2xl border border-blue-300/80 bg-white p-4 shadow-[0_0_36px_rgba(59,130,246,0.55),0_0_42px_rgba(236,72,153,0.28)]">
              {event?.roomCode ? (
                <QRCodeSVG
                  value={qrValue}
                  size={1000}
                  marginSize={2}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  className="h-full w-full"
                  title={`QR Code da sala ${roomCode}`}
                />
              ) : (
                <div className="text-center text-3xl font-black uppercase text-black/50">Crie um evento</div>
              )}
            </div>

            <div className="mt-3 text-center">
              <div className="text-sm font-black uppercase tracking-wide text-white/78">Modo do QR: {qrModeLabel}</div>
              <div className="mt-1 rounded-xl border border-blue-400/40 bg-blue-950/44 px-10 py-2 text-[38px] font-black uppercase tracking-[0.22em] text-blue-300 shadow-[0_0_28px_rgba(59,130,246,0.25)]">
                {roomCode}
              </div>
              <div className="mt-2 max-w-[52vh] break-all text-base font-bold text-white/75">
                {qrMode === "web" ? joinUrl : "Fallback navegador: " + joinUrl}
              </div>
            </div>
          </div>

          <div className="grid h-[min(52vh,430px)] min-h-[330px] grid-cols-[58px_1fr] items-center gap-2 pt-[112px] text-left">
            <div className="translate-y-6">
              <NeonChevrons direction="left" color="pink" />
            </div>
            <div className="flex flex-col items-center">
              <NeonIcon type="keyboard" color="blue" />
              <div className="mt-4 text-center text-xl font-black uppercase leading-snug text-white">
                Ou digite o<br />codigo da sala
              </div>
              <div className="mt-2 break-all text-center text-base font-bold text-blue-300">
                {event?.roomCode ? joinUrl : "Aguardando sala"}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
