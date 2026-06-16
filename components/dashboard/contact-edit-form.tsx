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

type ContactEditFormProps = {
  action: any;
  contact: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    fullName: string;
    companyId?: string | null;
    activityId?: string | null;
    jobTitle?: string | null;
    department?: string | null;
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    linkedinUrl?: string | null;
    status: string;
    source?: string | null;
    notes?: string | null;
  };
  companies: Array<{ id: string; label: string }>;
  activities: Array<{ id: string; label: string }>;
};

export default function ContactEditForm({
  action,
  contact,
  companies,
  activities,
}: ContactEditFormProps) {
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    companyId: "",
    activityId: "",
    jobTitle: "",
    department: "",
    email: "",
    phone: "",
    whatsapp: "",
    linkedinUrl: "",
    status: "prospect",
    source: "",
    notes: "",
  });

  useEffect(() => {
    setFormState({
      firstName: contact.firstName ?? "",
      lastName: contact.lastName ?? "",
      fullName: contact.fullName ?? "",
      companyId: contact.companyId ?? "",
      activityId: contact.activityId ?? "",
      jobTitle: contact.jobTitle ?? "",
      department: contact.department ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      whatsapp: contact.whatsapp ?? "",
      linkedinUrl: contact.linkedinUrl ?? "",
      status: contact.status ?? "prospect",
      source: contact.source ?? "",
      notes: contact.notes ?? "",
    });
  }, [contact]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="contactId" value={contact.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Prénom">
          <input
            name="firstName"
            value={formState.firstName}
            onChange={handleChange}
            placeholder="Prénom"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Nom">
          <input
            name="lastName"
            value={formState.lastName}
            onChange={handleChange}
            placeholder="Nom"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <FormField label="Nom complet">
        <input
          name="fullName"
          value={formState.fullName}
          onChange={handleChange}
          placeholder="Nom complet"
          className={formControlClassName}
          required
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Entreprise">
          <select
            name="companyId"
            value={formState.companyId}
            onChange={handleChange}
            className={formSelectClassName}
          >
            <option value="">Aucune</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.label}
              </option>
            ))}
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
        <FormField label="Titre">
          <input
            name="jobTitle"
            value={formState.jobTitle}
            onChange={handleChange}
            placeholder="Titre du poste"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Département">
          <input
            name="department"
            value={formState.department}
            onChange={handleChange}
            placeholder="Département"
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
        <FormField label="WhatsApp">
          <input
            name="whatsapp"
            value={formState.whatsapp}
            onChange={handleChange}
            placeholder="WhatsApp"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="LinkedIn">
          <input
            name="linkedinUrl"
            value={formState.linkedinUrl}
            onChange={handleChange}
            placeholder="URL LinkedIn"
            className={formControlClassName}
          />
        </FormField>
      </div>

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
