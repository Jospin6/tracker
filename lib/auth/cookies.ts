import { cookies } from "next/headers";

const secure = process.env.NODE_ENV === "production";
const oneYearInSeconds = 60 * 60 * 24 * 365;

export const AUTH_COOKIE_NAMES = {
  accessToken: "nurutrack-access-token",
  expiresAt: "nurutrack-expires-at",
  refreshToken: "nurutrack-refresh-token",
} as const;

export const WORKSPACE_COOKIE_NAME = "nurutrack-workspace-id";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CookieOptions = Parameters<CookieStore["set"]>[2];
type CookieValue = ReturnType<CookieStore["get"]>;

export type ReadableCookies = {
  get(name: string): CookieValue;
};

export type WritableCookies = ReadableCookies & {
  delete(name: string): unknown;
  set(name: string, value: string, options?: CookieOptions): unknown;
};

function getCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    maxAge: oneYearInSeconds,
    path: "/",
    sameSite: "lax",
    secure,
  };
}

export function readAuthCookies(cookieStore: ReadableCookies) {
  const rawExpiresAt = cookieStore.get(AUTH_COOKIE_NAMES.expiresAt)?.value ?? "";
  const expiresAt = Number(rawExpiresAt);

  return {
    accessToken: cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value ?? null,
    expiresAt: Number.isFinite(expiresAt) && expiresAt > 0 ? expiresAt : null,
    refreshToken: cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value ?? null,
  };
}

export function setAuthCookies(
  cookieStore: WritableCookies,
  session: {
    access_token: string;
    expires_at?: number | null;
    refresh_token: string;
  }
) {
  cookieStore.set(
    AUTH_COOKIE_NAMES.accessToken,
    session.access_token,
    getCookieOptions()
  );

  cookieStore.set(
    AUTH_COOKIE_NAMES.refreshToken,
    session.refresh_token,
    getCookieOptions()
  );

  cookieStore.set(
    AUTH_COOKIE_NAMES.expiresAt,
    String(session.expires_at ?? ""),
    getCookieOptions()
  );
}

export function clearAuthCookies(cookieStore: WritableCookies) {
  cookieStore.delete(AUTH_COOKIE_NAMES.accessToken);
  cookieStore.delete(AUTH_COOKIE_NAMES.refreshToken);
  cookieStore.delete(AUTH_COOKIE_NAMES.expiresAt);
}

export function setWorkspaceCookie(
  cookieStore: WritableCookies,
  workspaceId: string
) {
  cookieStore.set(WORKSPACE_COOKIE_NAME, workspaceId, {
    httpOnly: true,
    maxAge: oneYearInSeconds,
    path: "/",
    sameSite: "lax",
    secure,
  });
}

export function clearWorkspaceCookie(cookieStore: WritableCookies) {
  cookieStore.delete(WORKSPACE_COOKIE_NAME);
}
