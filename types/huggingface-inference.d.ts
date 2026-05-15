declare module "@huggingface/inference/dist/esm/tasks/nlp/chatCompletion.js" {
  export type HuggingFaceChatMessage = {
    content: string;
    role: "assistant" | "system" | "user";
  };

  export type HuggingFaceChatCompletionResponse = {
    choices?: Array<{
      message?: {
        content?: string | Array<{ text?: string; type?: string }>;
      };
    }>;
  };

  export function chatCompletion(args: {
    accessToken?: string;
    max_tokens?: number;
    messages: HuggingFaceChatMessage[];
    model: string;
    provider?: string;
    temperature?: number;
  }): Promise<HuggingFaceChatCompletionResponse>;
}
