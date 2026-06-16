"use client";

import React, { useEffect, useState } from "react";
import { FormField, formControlClassName, formSelectClassName, formTextareaClassName, primaryButtonClassName } from "@/components/dashboard/ui";
import { SubmitButton } from "@/components/shared/submit-button";

type Contact = Record<string, any>;

export default function ClientForm({
  contacts,
  contactsList,
  action,
}: {
  contacts: Array<{ id: string; label: string }>;
  contactsList: Contact[];
  action: any;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [formState, setFormState] = useState({
    name: "",
    company: "",
    status: "prospect",
    email: "",
    phone: "",
    website: "",
    source: "",
    notes: "",
    address: "",
  });
  const [promoteDirect, setPromoteDirect] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setFormState((s) => ({ ...s, name: "", company: "", email: "", phone: "", website: "", source: "", notes: "", address: "" }));
      return;
    }

    const contact = contactsList.find((c) => c.id === selectedId);
    if (!contact) return;

    setFormState({
      name: contact.fullName ?? contact.name ?? "",
      company: contact.companyName ?? contact.company ?? "",
      status: contact.status ?? "prospect",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      website: contact.website ?? "",
      source: contact.source ?? "",
      notes: contact.notes ?? "",
      address: contact.address ?? "",
    });
  }, [selectedId, contactsList]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormState((s) => ({ ...s, [name]: value }));
  }

  return (
    <form action={action} className="space-y-4">
      <FormField label="Contact existant (optionnel)">
        <select name="contactSelect" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className={formSelectClassName}>
          <option value="">Choisir un contact</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="flex items-center gap-3">
        <input id="promoteDirect" name="promoteDirect" type="checkbox" checked={promoteDirect} onChange={(e) => setPromoteDirect(e.target.checked)} />
        <label htmlFor="promoteDirect" className="text-sm text-zinc-400">Promouvoir directement (utiliser l'enregistrement du contact)</label>
      </div>

      {selectedId && promoteDirect && <input type="hidden" name="contactId" value={selectedId} />}

      <FormField label="Nom">
        <input name="name" value={formState.name} onChange={handleChange} placeholder="Nom du client" className={formControlClassName} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Societe">
          <input name="company" value={formState.company} onChange={handleChange} placeholder="Societe" className={formControlClassName} />
        </FormField>

        <FormField label="Statut">
          <select name="status" value={formState.status} onChange={handleChange} className={formSelectClassName}>
            <option value="prospect">Prospect</option>
            <option value="contacted">Contacted</option>
            <option value="negotiating">Negotiating</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lost">Lost</option>
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email">
          <input name="email" type="email" value={formState.email} onChange={handleChange} placeholder="contact@client.com" className={formControlClassName} />
        </FormField>

        <FormField label="Telephone">
          <input name="phone" value={formState.phone} onChange={handleChange} placeholder="+33..." className={formControlClassName} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Site web">
          <input name="website" value={formState.website} onChange={handleChange} placeholder="https://..." className={formControlClassName} />
        </FormField>

        <FormField label="Source">
          <input name="source" value={formState.source} onChange={handleChange} placeholder="Inbound, referral..." className={formControlClassName} />
        </FormField>
      </div>

      <FormField label="Notes">
        <textarea name="notes" rows={4} value={formState.notes} onChange={handleChange} placeholder="Notes" className={formTextareaClassName} />
      </FormField>

      <input type="hidden" name="address" value={formState.address} />

      <SubmitButton idleLabel="Creer le client" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}
