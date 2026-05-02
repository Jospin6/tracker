import type { SocialPost } from "@/db/types";

export const socialPostService = {
  list: async (): Promise<SocialPost[]> => {
    const response = await fetch("/api/social-posts");
    return response.json();
  },
  schedule: async (payload: Partial<SocialPost>) => {
    return fetch("/api/social-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: Partial<SocialPost>) => {
    return fetch(`/api/social-posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
};
