import { create } from "zustand";
import type { Client } from "@/db/types";

interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  setClients: (clients: Client[]) => void;
  setSelectedClient: (client: Client | null) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  selectedClient: null,
  setClients: (clients) => set({ clients }),
  setSelectedClient: (selectedClient) => set({ selectedClient }),
}));
