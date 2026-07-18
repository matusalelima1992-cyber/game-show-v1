const EXPECTED_SCHEME = "gameshowme://join";

export function parseGameShowQRCode(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    throw new Error("QR Code vazio.");
  }

  if (rawValue.startsWith(EXPECTED_SCHEME)) {
    const params = readQueryParams(rawValue);
    const host = params.host;
    const port = params.port || "3001";
    const room = params.room;

    if (!host || !room) {
      throw new Error("QR Code sem host ou sala.");
    }

    return normalizeConnectionData({ host, port, roomCode: room });
  }

  if (rawValue.startsWith("http://") || rawValue.startsWith("https://")) {
    const hostMatch = rawValue.match(/^https?:\/\/([^/:?#]+)(?::(\d+))?/i);
    const params = readQueryParams(rawValue);
    const pathParts = rawValue.split("?")[0].split("/").filter(Boolean);
    const room = params.room || pathParts[pathParts.length - 1];

    if (!hostMatch?.[1] || !room) {
      throw new Error("Link sem servidor ou sala.");
    }

    return normalizeConnectionData({
      host: hostMatch[1],
      port: hostMatch[2] || "3001",
      roomCode: room
    });
  }

  if (/^[a-z0-9]{4,10}$/i.test(rawValue)) {
    return normalizeConnectionData({ roomCode: rawValue });
  }

  throw new Error("QR Code invalido para o GameShow.me.");
}

function readQueryParams(value) {
  const query = String(value || "").split("?")[1] || "";
  return query.split("&").reduce((params, pair) => {
    const [rawKey, rawValue = ""] = pair.split("=");
    const key = decodeURIComponent(rawKey || "").trim();
    if (!key) return params;
    return {
      ...params,
      [key]: decodeURIComponent(rawValue).trim()
    };
  }, {});
}

export function normalizeConnectionData(data = {}) {
  return {
    host: String(data.host || "").trim(),
    port: String(data.port || "3001").trim(),
    roomCode: String(data.roomCode || data.room || "").trim().toUpperCase()
  };
}

export function buildSocketUrl({ host, port }) {
  const cleanHost = String(host || "").trim();
  const cleanPort = String(port || "3001").trim();

  if (!cleanHost) return "";
  return `http://${cleanHost}:${cleanPort}`;
}
