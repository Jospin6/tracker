import { create } from "zustand";
import type { Contact } from "@/db/types";

interface ContactState {
  contacts: Contact[];
  selectedContact: Contact | null;
  setContacts: (contacts: Contact[]) => void;
  setSelectedContact: (contact: Contact | null) => void;
}

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  selectedContact: null,
  setContacts: (contacts) => set({ contacts }),
  setSelectedContact: (selectedContact) => set({ selectedContact }),
}));
