const SUPABASE_CONNECTION_ERROR_MESSAGE =
  "Connexion impossible a Supabase. Verifie SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL et que le projet Supabase est actif.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorCause(error: unknown) {
  if (error instanceof Error && "cause" in error) {
    return error.cause;
  }

  if (isRecord(error) && "cause" in error) {
    return error.cause;
  }

  return null;
}

function getStringProperty(error: unknown, key: string) {
  if (!isRecord(error)) {
    return null;
  }

  const value = error[key];
  return typeof value === "string" ? value : null;
}

function getNumberProperty(error: unknown, key: string) {
  if (!isRecord(error)) {
    return null;
  }

  const value = error[key];
  return typeof value === "number" ? value : null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return getStringProperty(error, "message") ?? "";
}

function getErrorName(error: unknown) {
  if (error instanceof Error) {
    return error.name;
  }

  return getStringProperty(error, "name") ?? "";
}

function getErrorCode(error: unknown) {
  return getStringProperty(error, "code")?.toUpperCase() ?? "";
}

function includesConnectionSignal(value: string) {
  return [
    "fetch failed",
    "getaddrinfo",
    "enotfound",
    "eai_again",
    "econnrefused",
  ].some((signal) => value.includes(signal));
}

export function isSupabaseConnectionError(error: unknown) {
  const cause = getErrorCause(error);
  const message = getErrorMessage(error).toLowerCase();
  const causeMessage = getErrorMessage(cause).toLowerCase();
  const code = getErrorCode(error);
  const causeCode = getErrorCode(cause);
  const name = getErrorName(error).toLowerCase();

  return (
    name === "authretryablefetcherror" ||
    includesConnectionSignal(message) ||
    includesConnectionSignal(causeMessage) ||
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    code === "ECONNREFUSED" ||
    causeCode === "ENOTFOUND" ||
    causeCode === "EAI_AGAIN" ||
    causeCode === "ECONNREFUSED"
  );
}

export function getSafeErrorStatus(error: unknown, fallback = 500) {
  const status = getNumberProperty(error, "status");

  if (status && status >= 200 && status <= 599) {
    return status;
  }

  return fallback;
}

export function getSupabaseConnectionErrorMessage() {
  return SUPABASE_CONNECTION_ERROR_MESSAGE;
}
