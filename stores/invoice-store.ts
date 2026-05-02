import { create } from "zustand";
import type { Invoice } from "@/db/types";

interface InvoiceState {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  setInvoices: (invoices: Invoice[]) => void;
  setSelectedInvoice: (invoice: Invoice | null) => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  selectedInvoice: null,
  setInvoices: (invoices) => set({ invoices }),
  setSelectedInvoice: (selectedInvoice) => set({ selectedInvoice }),
}));
