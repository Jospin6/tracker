import { create } from "zustand";
import type { SocialPost } from "@/db/types";

interface SocialPostState {
  posts: SocialPost[];
  selectedPost: SocialPost | null;
  setPosts: (posts: SocialPost[]) => void;
  setSelectedPost: (post: SocialPost | null) => void;
}

export const useSocialPostStore = create<SocialPostState>((set) => ({
  posts: [],
  selectedPost: null,
  setPosts: (posts) => set({ posts }),
  setSelectedPost: (selectedPost) => set({ selectedPost }),
}));
