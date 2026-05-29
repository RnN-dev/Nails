const TOKEN_KEY = "studio_luminail_token";

type JwtPayload = {
  exp?: number;
  sub?: string;
  role?: string;
};

function decodePayload(token: string): JwtPayload | null {
  const payload = token.split(".")[1];

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  const token = window.localStorage.getItem(TOKEN_KEY);

  if (!token || isTokenExpired(token)) {
    clearToken();
    return null;
  }

  return token;
}

export function isTokenExpired(token: string): boolean {
  const payload = decodePayload(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now() + 30_000;
}
