export function getRequiredString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

export function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim() ?? "";
  return value || null;
}

export function getNumber(formData: FormData, key: string, fallback = 0) {
  const rawValue = formData.get(key)?.toString().trim() ?? "";
  const value = Number(rawValue);

  return Number.isFinite(value) ? value : fallback;
}

export function getOptionalNumber(formData: FormData, key: string) {
  const rawValue = formData.get(key)?.toString().trim() ?? "";

  if (!rawValue) {
    return null;
  }

  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
}

export function getOptionalDate(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim() ?? "";
  return value || null;
}

export function getBoolean(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim().toLowerCase() ?? "";
  return value === "true" || value === "1" || value === "on" || value === "yes";
}

export function getStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => value.toString().trim())
    .filter(Boolean);
}

export function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function calculateProgress(currentValue: number, targetValue: number) {
  if (targetValue <= 0) {
    return 0;
  }

  return clampPercentage((currentValue / targetValue) * 100);
}
