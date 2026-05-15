export const socialPlatformOptions = [
  "facebook",
  "instagram",
  "linkedin",
  "tiktok",
  "youtube",
  "x",
  "other",
] as const;

export const socialStatusOptions = [
  "idea",
  "drafted",
  "approved",
  "scheduled",
  "published",
  "cancelled",
] as const;

export const socialChannelProviderOptions = ["manual", "webhook"] as const;

export const socialAiProviderOptions = [
  "openai",
  "groq",
  "huggingface",
  "gemini",
] as const;

export const socialChannelStatusOptions = [
  "draft",
  "connected",
  "attention",
  "disabled",
] as const;

export const socialDeliveryStatusOptions = [
  "draft",
  "scheduled",
  "processing",
  "published",
  "failed",
  "cancelled",
] as const;

export const socialPlatformLabels: Record<(typeof socialPlatformOptions)[number], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  other: "Other",
  tiktok: "TikTok",
  x: "X",
  youtube: "YouTube",
};

export const socialProviderLabels: Record<
  (typeof socialChannelProviderOptions)[number],
  string
> = {
  manual: "Manuel",
  webhook: "Webhook",
};

export const socialAiProviderLabels: Record<
  (typeof socialAiProviderOptions)[number],
  string
> = {
  gemini: "Google Gemini",
  groq: "Groq",
  huggingface: "Hugging Face",
  openai: "OpenAI",
};

export function pickEnumValue<T extends readonly string[]>(
  values: T,
  rawValue: string | null | undefined,
  fallback: T[number]
) {
  return values.includes((rawValue ?? "") as T[number])
    ? ((rawValue ?? "") as T[number])
    : fallback;
}

export function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export function normalizeHashtags(rawValue: string | null | undefined) {
  if (!rawValue) {
    return null;
  }

  const tokens = rawValue
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => (value.startsWith("#") ? value : `#${value}`));

  if (!tokens.length) {
    return null;
  }

  return uniqueValues(tokens).join(" ");
}

export function scoreSocialContent(input: {
  callToAction?: string | null;
  content?: string | null;
  hashtags?: string | null;
  title?: string | null;
}) {
  let score = 40;
  const titleLength = input.title?.trim().length ?? 0;
  const contentLength = input.content?.trim().length ?? 0;
  const hashtagCount = input.hashtags
    ? input.hashtags
        .split(/\s+/)
        .map((value) => value.trim())
        .filter((value) => value.startsWith("#")).length
    : 0;

  if (titleLength >= 12 && titleLength <= 80) {
    score += 15;
  }

  if (contentLength >= 90 && contentLength <= 900) {
    score += 25;
  } else if (contentLength >= 40) {
    score += 10;
  }

  if (hashtagCount >= 2 && hashtagCount <= 8) {
    score += 10;
  }

  if (input.callToAction?.trim()) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

export function statusFromDeliveryState(input: {
  deliveryStatuses: string[];
  fallback: (typeof socialStatusOptions)[number];
  hasScheduledDate: boolean;
}) {
  const deliveryStatuses = new Set(input.deliveryStatuses);

  if (deliveryStatuses.has("published")) {
    return "published" as const;
  }

  if (deliveryStatuses.has("processing") || deliveryStatuses.has("scheduled")) {
    return "scheduled" as const;
  }

  if (deliveryStatuses.has("failed") && input.hasScheduledDate) {
    return "scheduled" as const;
  }

  return input.fallback;
}
