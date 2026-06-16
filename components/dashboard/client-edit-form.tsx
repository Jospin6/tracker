"use client";

import React, { useEffect, useState } from "react";
import {
  FormField,
  formControlClassName,
  formSelectClassName,
  formTextareaClassName,
  primaryButtonClassName,
} from "@/components/dashboard/ui";
import { SubmitButton } from "@/components/shared/submit-button";

type ClientEditFormProps = {
  action: any;
  client: {
    id: string;
    name: string;
    company?: string | null;
    status: string;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    source?: string | null;
    notes?: string | null;
    address?: string | null;
  };
};

export default function ClientEditForm({ action, client }: ClientEditFormProps) {
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

  useEffect(() => {
    setFormState({
      name: client.name ?? "",
      company: client.company ?? "",
      status: client.status ?? "prospect",
      email: client.email ?? "",
      phone: client.phone ?? "",
      website: client.website ?? "",
      source: client.source ?? "",
      notes: client.notes ?? "",
      address: client.address ?? "",
    });
  }, [client]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="clientId" value={client.id} />

      <FormField label="Nom">
        <input
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Nom du client"
          className={formControlClassName}
          required
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Société">
          <input
            name="company"
            value={formState.company}
            onChange={handleChange}
            placeholder="Société"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Statut">
          <select
            name="status"
            value={formState.status}
            onChange={handleChange}
            className={formSelectClassName}
          >
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
          <input
            name="email"
            type="email"
            value={formState.email}
            onChange={handleChange}
            placeholder="contact@client.com"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Téléphone">
          <input
            name="phone"
            value={formState.phone}
            onChange={handleChange}
            placeholder="+33..."
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Site web">
          <input
            name="website"
            value={formState.website}
            onChange={handleChange}
            placeholder="https://..."
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Source">
          <input
            name="source"
            value={formState.source}
            onChange={handleChange}
            placeholder="Inbound, referral..."
            className={formControlClassName}
          />
        </FormField>
      </div>

      <FormField label="Notes">
        <textarea
          name="notes"
          rows={4}
          value={formState.notes}
          onChange={handleChange}
          placeholder="Notes"
          className={formTextareaClassName}
        />
      </FormField>

      <FormField label="Adresse">
        <input
          name="address"
          value={formState.address}
          onChange={handleChange}
          placeholder="Adresse"
          className={formControlClassName}
        />
      </FormField>

      <SubmitButton idleLabel="Mettre à jour" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}
