import { cookies } from "next/headers";

const secure = process.env.NODE_ENV === "production";

export const AUTH_COOKIE_NAMES = {
  accessToken: "nurutrack-access-token",
  expiresAt: "nurutrack-expires-at",
  refreshToken: "nurutrack-refresh-token",
} as const;

export const WORKSPACE_COOKIE_NAME = "nurutrack-workspace-id";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CookieOptions = Parameters<CookieStore["set"]>[2];
type WritableCookies = Pick<CookieStore, "delete" | "get" | "set">;

function getCookieOptions(expiresAt?: number | null): CookieOptions {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
    ...(typeof expiresAt === "number"
      ? { expires: new Date(expiresAt * 1000) }
      : {}),
  };
}

export function readAuthCookies(cookieStore: Pick<CookieStore, "get">) {
  return {
    accessToken: cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value ?? null,
    expiresAt: Number(
      cookieStore.get(AUTH_COOKIE_NAMES.expiresAt)?.value ?? "0"
    ),
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
    getCookieOptions(session.expires_at)
  );

  cookieStore.set(
    AUTH_COOKIE_NAMES.refreshToken,
    session.refresh_token,
    getCookieOptions()
  );

  cookieStore.set(
    AUTH_COOKIE_NAMES.expiresAt,
    String(session.expires_at ?? ""),
    getCookieOptions(session.expires_at)
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
    path: "/",
    sameSite: "lax",
    secure,
  });
}

export function clearWorkspaceCookie(cookieStore: WritableCookies) {
  cookieStore.delete(WORKSPACE_COOKIE_NAME);
}
