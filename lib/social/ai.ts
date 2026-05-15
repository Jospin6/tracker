import "server-only";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import type { BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
  normalizeHashtags,
  scoreSocialContent,
  socialAiProviderLabels,
  socialAiProviderOptions,
  socialPlatformLabels,
  socialPlatformOptions,
} from "@/lib/social/shared";

type SocialPlatform = (typeof socialPlatformOptions)[number];
type SocialAiProvider = (typeof socialAiProviderOptions)[number];
type HuggingFaceMessageRole = "assistant" | "system" | "user";

export type GenerateSocialDraftInput = {
  audience?: string | null;
  brief: string;
  model?: string | null;
  objective?: string | null;
  platform: SocialPlatform;
  projectName?: string | null;
  provider?: SocialAiProvider | null;
  tone?: string | null;
  workspaceName?: string | null;
};

export type GeneratedSocialDraft = {
  callToAction: string;
  content: string;
  hashtags: string | null;
  model: string;
  prompt: string;
  provider: SocialAiProvider | "fallback";
  reasoning: string;
  score: number;
  source: "fallback" | "langchain";
  title: string;
};

const baseSystemPrompt = [
  "Tu es un strategist social media senior specialise en SaaS et automation.",
  "Tu rediges uniquement en francais, avec un ton credible, concret et publiable.",
  "Tu adaptes l'angle, le rythme et la densite a la plateforme cible.",
  "Tu n'inventes ni preuve, ni chiffre, ni testimonial non present dans le brief.",
  "Le texte doit etre actionnable, sans remplissage marketing ni emojis inutiles.",
].join("\n");

const socialDraftPrompt = ChatPromptTemplate.fromMessages([
  ["system", baseSystemPrompt],
  ["human", "{context}"],
]);

const socialDraftSchema = z.object({
  callToAction: z.string().min(8).max(220),
  content: z.string().min(80).max(1800),
  hashtags: z.array(z.string().min(2).max(40)).min(3).max(6),
  reasoning: z.string().min(20).max(500),
  title: z.string().min(8).max(80),
});

type StructuredSocialDraft = z.infer<typeof socialDraftSchema>;

const socialDraftJsonSchema = JSON.stringify(
  zodToJsonSchema(socialDraftSchema, "social_post_draft"),
  null,
  2
);

const providerSettings: Record<
  SocialAiProvider,
  {
    defaultModel: string;
    envKeys: string[];
    modelEnvKeys: string[];
  }
> = {
  gemini: {
    defaultModel: "gemini-2.5-flash",
    envKeys: [
      "GOOGLE_API_KEY",
      "GEMINI_API_KEY",
      "GOOGLE_GENERATIVE_AI_API_KEY",
      "GOOGLE_SOCIAL_API_KEY",
    ],
    modelEnvKeys: ["GEMINI_SOCIAL_MODEL", "GOOGLE_SOCIAL_MODEL"],
  },
  groq: {
    defaultModel: "llama-3.3-70b-versatile",
    envKeys: ["GROQ_API_KEY", "GROQ_SOCIAL_API_KEY"],
    modelEnvKeys: ["GROQ_SOCIAL_MODEL"],
  },
  huggingface: {
    defaultModel: "meta-llama/Llama-3.1-8B-Instruct",
    envKeys: ["HF_TOKEN", "HUGGINGFACE_API_KEY", "HUGGING_FACE_HUB_TOKEN"],
    modelEnvKeys: ["HUGGINGFACE_SOCIAL_MODEL", "HF_SOCIAL_MODEL"],
  },
  openai: {
    defaultModel: "gpt-5.2",
    envKeys: ["OPENAI_API_KEY", "OPENAI_SOCIAL_API_KEY"],
    modelEnvKeys: ["OPENAI_SOCIAL_MODEL", "OPENAI_MODEL"],
  },
};

const SocialDraftGraphState = Annotation.Root({
  apiKey: Annotation<string | null>,
  context: Annotation<string>,
  error: Annotation<string | null>,
  input: Annotation<GenerateSocialDraftInput>,
  model: Annotation<string>,
  prompt: Annotation<string>,
  provider: Annotation<SocialAiProvider>,
  result: Annotation<GeneratedSocialDraft | null>,
  structuredDraft: Annotation<StructuredSocialDraft | null>,
});

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function flattenMessageContent(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (part && typeof part === "object" && "text" in part) {
        return String((part as { text?: unknown }).text ?? "");
      }

      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function truncateSentence(value: string, limit = 72) {
  const normalized = collapseWhitespace(value);

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit - 3).trim()}...`;
}

function normalizeProvider(rawValue: SocialAiProvider | null | undefined) {
  return socialAiProviderOptions.includes((rawValue ?? "") as SocialAiProvider)
    ? ((rawValue ?? "") as SocialAiProvider)
    : "openai";
}

function getProviderApiKey(provider: SocialAiProvider) {
  for (const envKey of providerSettings[provider].envKeys) {
    const candidate = process.env[envKey]?.trim();

    if (candidate) {
      return candidate;
    }
  }

  return "";
}

function getProviderModel(
  provider: SocialAiProvider,
  requestedModel?: string | null
) {
  if (requestedModel?.trim()) {
    return requestedModel.trim();
  }

  for (const envKey of providerSettings[provider].modelEnvKeys) {
    const candidate = process.env[envKey]?.trim();

    if (candidate) {
      return candidate;
    }
  }

  return providerSettings[provider].defaultModel;
}

function buildPromptContext(input: GenerateSocialDraftInput) {
  return [
    `Plateforme cible: ${socialPlatformLabels[input.platform]}.`,
    `Brief: ${collapseWhitespace(input.brief)}.`,
    `Objectif: ${collapseWhitespace(
      input.objective ?? "Creer un engagement qualifie et utile"
    )}.`,
    `Audience: ${collapseWhitespace(
      input.audience ?? "Audience professionnelle large"
    )}.`,
    `Ton: ${collapseWhitespace(input.tone ?? "Clair, credible, direct")}.`,
    `Contexte: ${collapseWhitespace(
      input.workspaceName ?? "Workspace"
    )} / ${collapseWhitespace(input.projectName ?? "Sans projet")}.`,
    "Contraintes:",
    "- Titre court et memorisable",
    "- Copie principale orientee valeur",
    "- Call-to-action distinct et explicite",
    "- 3 a 6 hashtags utiles, sans spam",
    "- Pas d'affirmation non prouvee, pas de jargon vide",
  ].join("\n");
}

async function buildPromptMessages(context: string): Promise<BaseMessage[]> {
  return socialDraftPrompt.formatMessages({ context });
}

async function buildSerializedPrompt(context: string) {
  const messages = await buildPromptMessages(context);

  return messages
    .map((message: BaseMessage) => {
      const role = "type" in message ? String(message.type) : "message";
      const content = flattenMessageContent(message.content);

      return `${role.toUpperCase()}\n${content}`;
    })
    .join("\n\n");
}

function createFallbackDraft(
  input: GenerateSocialDraftInput,
  reason?: string | null
): GeneratedSocialDraft {
  const normalizedBrief = collapseWhitespace(input.brief);

  const title = truncateSentence(
    normalizedBrief
      .replace(/[.!?].*$/, "")
      .replace(/^./, (value) => value.toUpperCase())
  );

  const callToAction =
    collapseWhitespace(input.objective ?? "") ||
    "Dis-moi si tu veux que je transforme cette idee en plan d'action concret.";

  const content = [
    `${title}.`,
    "",
    `Sur ${socialPlatformLabels[input.platform]}, le bon angle n'est pas d'en dire plus, mais de rendre le message immediatement utile.`,
    normalizedBrief,
    "",
    `Angle retenu: ${collapseWhitespace(
      input.tone ?? "credible et oriente resultat"
    )}.`,
    `Public vise: ${collapseWhitespace(
      input.audience ?? "des decideurs et executants qui veulent du concret"
    )}.`,
    "",
    callToAction,
  ].join("\n");

  const hashtags = normalizeHashtags(
    ["socialmedia", input.platform, "marketing", "automation", "content"]
      .map((value) => value.replace(/[^a-z0-9]/gi, ""))
      .filter(Boolean)
      .join(" ")
  );

  return {
    callToAction,
    content,
    hashtags,
    model: "fallback-local",
    prompt: buildPromptContext(input),
    provider: "fallback",
    reasoning:
      reason?.trim() ||
      "Fallback local utilise faute de configuration provider ou de reponse exploitable.",
    score: scoreSocialContent({ callToAction, content, hashtags, title }),
    source: "fallback",
    title,
  };
}

function maybeAppendCallToAction(content: string, callToAction: string) {
  const normalizedContent = content.trim();
  const normalizedCallToAction = callToAction.trim();

  if (!normalizedCallToAction) {
    return normalizedContent;
  }

  if (
    normalizedContent
      .toLowerCase()
      .includes(normalizedCallToAction.toLowerCase())
  ) {
    return normalizedContent;
  }

  return `${normalizedContent}\n\n${normalizedCallToAction}`;
}

function extractJsonText(value: string) {
  const fencedMatch = value.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = value.indexOf("{");
  const lastBrace = value.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return value.slice(firstBrace, lastBrace + 1).trim();
  }

  return value.trim();
}

function mapMessageRoleToHuggingFace(type: string): HuggingFaceMessageRole {
  if (type === "system") {
    return "system";
  }

  if (type === "ai" || type === "assistant") {
    return "assistant";
  }

  return "user";
}

function parseStructuredDraftFromText(rawText: string) {
  const jsonText = extractJsonText(rawText);

  try {
    return socialDraftSchema.parse(JSON.parse(jsonText));
  } catch (error) {
    throw new Error(
      `Reponse IA invalide. JSON attendu conforme au schema socialDraftSchema. ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

async function requestOpenAiDraft(
  messages: Awaited<ReturnType<typeof buildPromptMessages>>,
  apiKey: string,
  model: string
) {
  const llm = new ChatOpenAI({
    apiKey,
    model,
    temperature: 0.45,
    useResponsesApi: true,
  });

  const structuredLlm = llm.withStructuredOutput(socialDraftSchema, {
    name: "social_post_draft",
  });

  return socialDraftSchema.parse(await structuredLlm.invoke(messages));
}

async function requestGroqDraft(
  messages: Awaited<ReturnType<typeof buildPromptMessages>>,
  apiKey: string,
  model: string
) {
  const llm = new ChatGroq({
    apiKey,
    maxTokens: 1200,
    model,
    temperature: 0.45,
  });

  const structuredLlm = llm.withStructuredOutput(socialDraftSchema, {
    name: "social_post_draft",
  });

  return socialDraftSchema.parse(await structuredLlm.invoke(messages));
}

async function requestGeminiDraft(
  messages: Awaited<ReturnType<typeof buildPromptMessages>>,
  apiKey: string,
  model: string
) {
  const llm = new ChatGoogleGenerativeAI({
    apiKey,
    model,
    temperature: 0.4,
  });

  const structuredLlm = llm.withStructuredOutput(socialDraftSchema, {
    method: "jsonSchema",
    name: "social_post_draft",
  });

  return socialDraftSchema.parse(await structuredLlm.invoke(messages));
}

async function requestHuggingFaceDraft(
  messages: Awaited<ReturnType<typeof buildPromptMessages>>,
  apiKey: string,
  model: string
) {
  const { HfInference } = await import("@huggingface/inference");

  const client = new HfInference(apiKey) as {
    chatCompletion?: (input: {
      max_tokens?: number;
      messages: Array<{
        content: string;
        role: HuggingFaceMessageRole;
      }>;
      model: string;
      provider?: string;
      temperature?: number;
    }) => Promise<{
      choices?: Array<{
        message?: {
          content?: string | Array<{ text?: string; type?: string }>;
        };
      }>;
    }>;
  };

  if (typeof client.chatCompletion !== "function") {
    throw new Error(
      "La methode chatCompletion est indisponible dans cette version de @huggingface/inference."
    );
  }

  const response = await client.chatCompletion({
    max_tokens: 1200,
    messages: [
      {
        content: [
          baseSystemPrompt,
          "Reponds uniquement avec un JSON valide conforme a ce schema:",
          socialDraftJsonSchema,
        ].join("\n\n"),
        role: "system",
      },
      ...messages.map((message: BaseMessage) => ({
        content: flattenMessageContent(message.content),
        role: mapMessageRoleToHuggingFace(
          "type" in message ? String(message.type) : "human"
        ),
      })),
    ],
    model,
    provider: "auto",
    temperature: 0.35,
  });

  const rawContent = response.choices?.[0]?.message?.content;
  const rawText = flattenMessageContent(rawContent);

  if (!rawText) {
    throw new Error("Hugging Face a retourne une reponse vide.");
  }

  return parseStructuredDraftFromText(rawText);
}

async function requestStructuredDraft(
  state: typeof SocialDraftGraphState.State
) {
  const messages = await buildPromptMessages(state.context);

  switch (state.provider) {
    case "gemini":
      return requestGeminiDraft(messages, state.apiKey ?? "", state.model);

    case "groq":
      return requestGroqDraft(messages, state.apiKey ?? "", state.model);

    case "huggingface":
      return requestHuggingFaceDraft(messages, state.apiKey ?? "", state.model);

    case "openai":
    default:
      return requestOpenAiDraft(messages, state.apiKey ?? "", state.model);
  }
}

async function prepareDraftState(state: typeof SocialDraftGraphState.State) {
  const provider = normalizeProvider(state.input.provider);
  const model = getProviderModel(provider, state.input.model);
  const apiKey = getProviderApiKey(provider);
  const context = buildPromptContext(state.input);

  return {
    apiKey: apiKey || null,
    context,
    error: apiKey
      ? null
      : `Cle API absente pour ${socialAiProviderLabels[provider]}.`,
    model,
    prompt: await buildSerializedPrompt(context),
    provider,
  };
}

async function generateDraftState(state: typeof SocialDraftGraphState.State) {
  if (!state.apiKey) {
    return { structuredDraft: null };
  }

  try {
    return {
      error: null,
      structuredDraft: await requestStructuredDraft(state),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      structuredDraft: null,
    };
  }
}

function finalizeDraftState(state: typeof SocialDraftGraphState.State) {
  if (!state.structuredDraft) {
    return {
      result: createFallbackDraft(state.input, state.error),
    };
  }

  const title = truncateSentence(state.structuredDraft.title, 80);
  const callToAction = collapseWhitespace(state.structuredDraft.callToAction);

  const content = maybeAppendCallToAction(
    collapseWhitespace(state.structuredDraft.content),
    callToAction
  );

  const hashtags = normalizeHashtags(state.structuredDraft.hashtags.join(" "));

  const result: GeneratedSocialDraft = {
    callToAction,
    content,
    hashtags,
    model: state.model,
    prompt: state.prompt,
    provider: state.provider,
    reasoning: collapseWhitespace(state.structuredDraft.reasoning),
    score: scoreSocialContent({
      callToAction,
      content,
      hashtags,
      title,
    }),
    source: "langchain",
    title,
  };

  return {
    result,
  };
}

const socialDraftGraph = new StateGraph(SocialDraftGraphState)
  .addNode("prepare", prepareDraftState)
  .addNode("generate", generateDraftState)
  .addNode("finalize", finalizeDraftState)
  .addEdge(START, "prepare")
  .addEdge("prepare", "generate")
  .addEdge("generate", "finalize")
  .addEdge("finalize", END)
  .compile();

export async function generateSocialDraft(input: GenerateSocialDraftInput) {
  try {
    const state = await socialDraftGraph.invoke({ input });

    if (state.result) {
      return state.result;
    }
  } catch {
    // Fallback volontaire pour ne pas casser l'UX si LangGraph ou le provider IA echoue.
  }

  return createFallbackDraft(input);
}