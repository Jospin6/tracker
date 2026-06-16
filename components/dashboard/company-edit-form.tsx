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

type CompanyEditFormProps = {
  action: any;
  company: {
    id: string;
    name: string;
    status: string;
    activityId?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    industry?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    source?: string | null;
    notes?: string | null;
  };
  activities: Array<{ id: string; label: string }>;
};

export default function CompanyEditForm({ action, company, activities }: CompanyEditFormProps) {
  const [formState, setFormState] = useState({
    name: "",
    status: "prospect",
    activityId: "",
    address: "",
    city: "",
    country: "",
    industry: "",
    email: "",
    phone: "",
    website: "",
    source: "",
    notes: "",
  });

  useEffect(() => {
    setFormState({
      name: company.name ?? "",
      status: company.status ?? "prospect",
      activityId: company.activityId ?? "",
      address: company.address ?? "",
      city: company.city ?? "",
      country: company.country ?? "",
      industry: company.industry ?? "",
      email: company.email ?? "",
      phone: company.phone ?? "",
      website: company.website ?? "",
      source: company.source ?? "",
      notes: company.notes ?? "",
    });
  }, [company]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="companyId" value={company.id} />

      <FormField label="Nom de l'entreprise">
        <input
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Nom"
          className={formControlClassName}
          required
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
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

        <FormField label="Activité">
          <select
            name="activityId"
            value={formState.activityId}
            onChange={handleChange}
            className={formSelectClassName}
          >
            <option value="">Aucune</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Adresse">
          <input
            name="address"
            value={formState.address}
            onChange={handleChange}
            placeholder="Adresse"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Ville">
          <input
            name="city"
            value={formState.city}
            onChange={handleChange}
            placeholder="Ville"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Pays">
          <input
            name="country"
            value={formState.country}
            onChange={handleChange}
            placeholder="Pays"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Industrie">
          <input
            name="industry"
            value={formState.industry}
            onChange={handleChange}
            placeholder="Secteur"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email">
          <input
            name="email"
            type="email"
            value={formState.email}
            onChange={handleChange}
            placeholder="contact@entreprise.com"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Téléphone">
          <input
            name="phone"
            value={formState.phone}
            onChange={handleChange}
            placeholder="Téléphone"
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
            placeholder="https://"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Source">
          <input
            name="source"
            value={formState.source}
            onChange={handleChange}
            placeholder="Source"
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

      <SubmitButton idleLabel="Mettre à jour" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}
