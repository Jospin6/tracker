import { createAgent } from "langchain";
import { tool } from "langchain";
import { z } from "zod";

import {
  createBudgetAction,
  createCompanyAction,
  createContactAction,
  createGoalAction,
  createInvoiceAction,
  createProjectAction,
  createTaskAction,
  createTransactionAction,
  deleteCompanyAction,
  deleteContactAction,
  updateCompanyAction,
  updateContactAction,
  updateInvoicePaymentAction,
  updateProjectProgressAction,
} from "@/app/actions";
import {
  getBudgetPageData,
  getDashboardData,
  getProjectDetailPageData,
} from "@/lib/data/dashboard";

import {
  AGENT_ORDER,
  AGENTS,
  DEFAULT_AGENT_ID,
  getAgentDefinition,
  type AgentId,
} from "./agents";

type ChatMessage = {
  content: string;
  role: "assistant" | "user";
};

type AgentChatInput = {
  agentId?: string;
  messages: ChatMessage[];
  depth?: number;
};

type AgentChatResult = {
  agentId: AgentId;
  answer: string;
  fallback: boolean;
  needsConfirmation?: boolean;
  confirmationPreview?: string;
};

function toFormData(values: Record<string, unknown>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    formData.set(key, String(value));
  }

  return formData;
}

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function lastUserMessage(messages: ChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "user") {
      return message.content.trim();
    }
  }

  return "";
}

function normalizeAiContent(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (part && typeof part === "object" && "text" in part) {
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }

        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  if (content && typeof content === "object") {
    const maybeText = (content as { text?: unknown }).text;

    if (typeof maybeText === "string") {
      return maybeText;
    }
  }

  return "";
}

async function buildSnapshotSummary() {
  const dashboard = await getDashboardData();
  const budget = await getBudgetPageData();
  const companyNames = new Map(
    dashboard.companies.map((company) => [company.id, company.name] as const)
  );

  return {
    attentionProjects: dashboard.attentionProjects.slice(0, 4),
    budgetSummary: budget.summary,
    companies: dashboard.companies.slice(0, 8),
    contacts: dashboard.contacts.slice(0, 8).map((contact) => ({
      ...contact,
      companyName: contact.companyId ? companyNames.get(contact.companyId) ?? null : null,
    })),
    metrics: dashboard.metrics,
    overdueTasks: dashboard.overdueTasks.slice(0, 5),
    projects: dashboard.projects.slice(0, 8),
    recentTransactions: dashboard.recentTransactions.slice(0, 8),
    upcomingInvoices: dashboard.upcomingInvoices.slice(0, 8),
  };
}

function buildPrompt(agentId: AgentId, snapshot: Awaited<ReturnType<typeof buildSnapshotSummary>>) {
  const definition = AGENTS[agentId];

  return [
    definition.systemPrompt,
    "Contexte de travail actuel (JSON synthétique):",
    stringify(snapshot),
    "Règles:",
    "- Réponds en français.",
    "- Sois concret, concis et actionnable.",
    "- Si des informations manquent, pose des questions courtes.",
    "- Si une écriture métier est proposée, demande confirmation avant toute action destructive ou financière.",
  ].join("\n");
}

function buildSearchResults(snapshot: Awaited<ReturnType<typeof buildSnapshotSummary>>, query: string) {
  const normalized = query.trim().toLowerCase();

  const projectMatches = snapshot.projects.filter((project) => {
    const haystack = [
      project.name,
      project.description,
      project.companyName,
      project.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  const companyMatches = snapshot.companies.filter((company) => {
    const haystack = [company.name, company.industry, company.email, company.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  const contactMatches = snapshot.contacts.filter((contact) => {
    const haystack = [
      contact.fullName,
      contact.email,
      contact.jobTitle,
      contact.companyName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  const taskMatches = snapshot.overdueTasks.filter((task) => {
    const haystack = [task.title, task.projectName, task.companyName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  return {
    companies: companyMatches.slice(0, 5),
    contacts: contactMatches.slice(0, 5),
    projects: projectMatches.slice(0, 5),
    tasks: taskMatches.slice(0, 5),
  };
}

function isConfirmationRequired(confirm: boolean | undefined) {
  return confirm !== true;
}

function buildReadTools() {
  return [
    tool(
      async () => stringify(await buildSnapshotSummary()),
      {
        description:
          "Retourne un aperçu synthétique de l'entreprise: métriques, projets, entreprises, contacts, tâches en retard et factures à suivre.",
        name: "workspace_snapshot",
        schema: z.object({}),
      }
    ),
    tool(
      async ({ query }: { query: string }) => {
        const snapshot = await buildSnapshotSummary();
        return stringify(buildSearchResults(snapshot, query));
      },
      {
        description:
          "Recherche dans les projets, entreprises, contacts et tâches de l'espace de travail.",
        name: "search_workspace",
        schema: z.object({
          query: z.string().min(1).describe("Terme à rechercher"),
        }),
      }
    ),
    tool(
      async ({ projectId }: { projectId: string }) => {
        const project = await getProjectDetailPageData(projectId);
        return stringify(project ?? { found: false });
      },
      {
        description:
          "Retourne le détail complet d'un projet, avec entreprise, objectifs, tâches, finances et factures.",
        name: "project_detail",
        schema: z.object({
          projectId: z.string().min(1).describe("Identifiant du projet"),
        }),
      }
    ),
    tool(
      async () => stringify(await getBudgetPageData()),
      {
        description:
          "Retourne la synthèse financière: budgets, transactions, encours et tendances.",
        name: "financial_summary",
        schema: z.object({}),
      }
    ),
  ];
}

function buildMutationTools() {
  return [
    tool(
      async (input: {
        budgetPlanned?: number;
        budgetUsed?: number;
        companyId?: string;
        confirm?: boolean;
        description?: string;
        dueDate?: string;
        name?: string;
        priority?: string;
        progress?: number;
        startDate?: string;
        status?: string;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "create_project",
              name: input.name,
              companyId: input.companyId,
            },
          });
        }

        if (!input.name || !input.companyId) {
          return stringify({
            ok: false,
            error: "Le nom du projet et l'entreprise sont obligatoires.",
          });
        }

        await createProjectAction(
          toFormData({
            budgetPlanned: input.budgetPlanned ?? 0,
            budgetUsed: input.budgetUsed ?? 0,
            companyId: input.companyId,
            description: input.description,
            dueDate: input.dueDate,
            name: input.name,
            priority: input.priority ?? "medium",
            progress: input.progress ?? 0,
            startDate: input.startDate,
            status: input.status ?? "planned",
          })
        );

        return stringify({ ok: true, message: "Projet créé." });
      },
      {
        description: "Crée un projet dans le workspace.",
        name: "create_project",
        schema: z.object({
          budgetPlanned: z.number().optional(),
          budgetUsed: z.number().optional(),
          companyId: z.string().optional(),
          confirm: z.boolean().optional(),
          description: z.string().optional(),
          dueDate: z.string().optional(),
          name: z.string().optional(),
          priority: z.string().optional(),
          progress: z.number().optional(),
          startDate: z.string().optional(),
          status: z.string().optional(),
        }),
      }
    ),
    tool(
      async (input: {
        confirm?: boolean;
        currentValue?: number;
        deadline?: string;
        description?: string;
        goalType?: string;
        projectId?: string;
        startDate?: string;
        targetValue?: number;
        title?: string;
        unit?: string;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "create_goal",
              projectId: input.projectId,
              title: input.title,
            },
          });
        }

        if (!input.title || !input.projectId) {
          return stringify({
            ok: false,
            error: "Le titre de l'objectif et le projet sont obligatoires.",
          });
        }

        await createGoalAction(
          toFormData({
            currentValue: input.currentValue ?? 0,
            deadline: input.deadline,
            description: input.description,
            goalType: input.goalType ?? "project",
            projectId: input.projectId,
            startDate: input.startDate,
            targetValue: input.targetValue ?? 100,
            title: input.title,
            unit: input.unit,
          })
        );

        return stringify({ ok: true, message: "Objectif créé." });
      },
      {
        description: "Crée un objectif rattaché à un projet.",
        name: "create_goal",
        schema: z.object({
          confirm: z.boolean().optional(),
          currentValue: z.number().optional(),
          deadline: z.string().optional(),
          description: z.string().optional(),
          goalType: z.string().optional(),
          projectId: z.string().optional(),
          startDate: z.string().optional(),
          targetValue: z.number().optional(),
          title: z.string().optional(),
          unit: z.string().optional(),
        }),
      }
    ),
    tool(
      async (input: {
        confirm?: boolean;
        description?: string;
        dueDate?: string;
        estimatedMinutes?: number;
        goalId?: string;
        plannedDate?: string;
        priority?: string;
        projectId?: string;
        status?: string;
        title?: string;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "create_task",
              projectId: input.projectId,
              title: input.title,
            },
          });
        }

        if (!input.title || !input.projectId) {
          return stringify({
            ok: false,
            error: "Le titre de la tâche et le projet sont obligatoires.",
          });
        }

        await createTaskAction(
          toFormData({
            description: input.description,
            dueDate: input.dueDate,
            estimatedMinutes: input.estimatedMinutes ?? 0,
            goalId: input.goalId,
            plannedDate: input.plannedDate,
            priority: input.priority ?? "medium",
            projectId: input.projectId,
            status: input.status ?? "todo",
            title: input.title,
          })
        );

        return stringify({ ok: true, message: "Tâche créée." });
      },
      {
        description: "Crée une tâche dans un projet.",
        name: "create_task",
        schema: z.object({
          confirm: z.boolean().optional(),
          description: z.string().optional(),
          dueDate: z.string().optional(),
          estimatedMinutes: z.number().optional(),
          goalId: z.string().optional(),
          plannedDate: z.string().optional(),
          priority: z.string().optional(),
          projectId: z.string().optional(),
          status: z.string().optional(),
          title: z.string().optional(),
        }),
      }
    ),
    tool(
      async (input: {
        confirm?: boolean;
        name?: string;
        periodEnd?: string;
        periodStart?: string;
        projectId?: string;
        totalAmount?: number;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "create_budget",
              name: input.name,
              projectId: input.projectId,
            },
          });
        }

        if (!input.name || !input.projectId) {
          return stringify({
            ok: false,
            error: "Le nom du budget et le projet sont obligatoires.",
          });
        }

        await createBudgetAction(
          toFormData({
            name: input.name,
            periodEnd: input.periodEnd,
            periodStart: input.periodStart,
            projectId: input.projectId,
            totalAmount: input.totalAmount ?? 0,
          })
        );

        return stringify({ ok: true, message: "Budget créé." });
      },
      {
        description: "Crée un budget pour un projet.",
        name: "create_budget",
        schema: z.object({
          confirm: z.boolean().optional(),
          name: z.string().optional(),
          periodEnd: z.string().optional(),
          periodStart: z.string().optional(),
          projectId: z.string().optional(),
          totalAmount: z.number().optional(),
        }),
      }
    ),
    tool(
      async (input: {
        address?: string;
        city?: string;
        confirm?: boolean;
        country?: string;
        email?: string;
        industry?: string;
        name?: string;
        notes?: string;
        phone?: string;
        source?: string;
        status?: string;
        website?: string;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "create_company",
              name: input.name,
            },
          });
        }

        if (!input.name) {
          return stringify({
            ok: false,
            error: "Le nom de l'entreprise est obligatoire.",
          });
        }

        await createCompanyAction(
          toFormData({
            address: input.address,
            city: input.city,
            country: input.country,
            email: input.email,
            industry: input.industry,
            name: input.name,
            notes: input.notes,
            phone: input.phone,
            source: input.source,
            status: input.status ?? "prospect",
            website: input.website,
          })
        );

        return stringify({ ok: true, message: "Entreprise créée." });
      },
      {
        description: "Crée une entreprise.",
        name: "create_company",
        schema: z.object({
          address: z.string().optional(),
          city: z.string().optional(),
          confirm: z.boolean().optional(),
          country: z.string().optional(),
          email: z.string().optional(),
          industry: z.string().optional(),
          name: z.string().optional(),
          notes: z.string().optional(),
          phone: z.string().optional(),
          source: z.string().optional(),
          status: z.string().optional(),
          website: z.string().optional(),
        }),
      }
    ),
    tool(
      async (input: {
        companyId?: string;
        confirm?: boolean;
        department?: string;
        email?: string;
        firstName?: string;
        fullName?: string;
        jobTitle?: string;
        lastName?: string;
        linkedinUrl?: string;
        notes?: string;
        phone?: string;
        source?: string;
        status?: string;
        whatsapp?: string;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "create_contact",
              companyId: input.companyId,
              fullName: input.fullName,
            },
          });
        }

        const fullName =
          input.fullName ||
          [input.firstName, input.lastName].filter(Boolean).join(" ").trim();

        if (!fullName) {
          return stringify({
            ok: false,
            error: "Le nom complet du contact est obligatoire.",
          });
        }

        await createContactAction(
          toFormData({
            companyId: input.companyId,
            department: input.department,
            email: input.email,
            firstName: input.firstName,
            fullName,
            jobTitle: input.jobTitle,
            lastName: input.lastName,
            linkedinUrl: input.linkedinUrl,
            notes: input.notes,
            phone: input.phone,
            source: input.source,
            status: input.status ?? "prospect",
            whatsapp: input.whatsapp,
          })
        );

        return stringify({ ok: true, message: "Contact créé." });
      },
      {
        description: "Crée un contact.",
        name: "create_contact",
        schema: z.object({
          companyId: z.string().optional(),
          confirm: z.boolean().optional(),
          department: z.string().optional(),
          email: z.string().optional(),
          firstName: z.string().optional(),
          fullName: z.string().optional(),
          jobTitle: z.string().optional(),
          lastName: z.string().optional(),
          linkedinUrl: z.string().optional(),
          notes: z.string().optional(),
          phone: z.string().optional(),
          source: z.string().optional(),
          status: z.string().optional(),
          whatsapp: z.string().optional(),
        }),
      }
    ),
    tool(
      async (input: {
        amount?: number;
        category?: string;
        confirm?: boolean;
        currency?: string;
        description?: string;
        notes?: string;
        paymentMethod?: string;
        projectId?: string;
        transactionDate?: string;
        type?: string;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "create_transaction",
              amount: input.amount,
              projectId: input.projectId,
            },
          });
        }

        if (typeof input.amount !== "number") {
          return stringify({
            ok: false,
            error: "Le montant est obligatoire.",
          });
        }

        await createTransactionAction(
          toFormData({
            amount: input.amount,
            category: input.category,
            currency: input.currency ?? "EUR",
            description: input.description,
            notes: input.notes,
            paymentMethod: input.paymentMethod,
            projectId: input.projectId,
            transactionDate: input.transactionDate,
            type: input.type ?? "income",
          })
        );

        return stringify({ ok: true, message: "Flux financier créé." });
      },
      {
        description: "Crée un revenu ou une dépense pour un projet.",
        name: "create_transaction",
        schema: z.object({
          amount: z.number().optional(),
          category: z.string().optional(),
          confirm: z.boolean().optional(),
          currency: z.string().optional(),
          description: z.string().optional(),
          notes: z.string().optional(),
          paymentMethod: z.string().optional(),
          projectId: z.string().optional(),
          transactionDate: z.string().optional(),
          type: z.string().optional(),
        }),
      }
    ),
    tool(
      async (input: {
        confirm?: boolean;
        dueAt?: string;
        invoiceNumber?: string;
        itemDescription?: string;
        paidAmount?: number;
        projectId?: string;
        quantity?: number;
        status?: string;
        subtotal?: number;
        taxAmount?: number;
        currency?: string;
        issuedAt?: string;
        notes?: string;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "create_invoice",
              invoiceNumber: input.invoiceNumber,
              projectId: input.projectId,
            },
          });
        }

        if (!input.invoiceNumber || !input.itemDescription || !input.projectId) {
          return stringify({
            ok: false,
            error: "Le numéro, la description et le projet de facture sont obligatoires.",
          });
        }

        if (typeof input.subtotal !== "number") {
          return stringify({
            ok: false,
            error: "Le sous-total est obligatoire.",
          });
        }

        await createInvoiceAction(
          toFormData({
            currency: input.currency ?? "EUR",
            dueAt: input.dueAt,
            invoiceNumber: input.invoiceNumber,
            itemDescription: input.itemDescription,
            issuedAt: input.issuedAt,
            notes: input.notes,
            paidAmount: input.paidAmount ?? 0,
            projectId: input.projectId,
            quantity: input.quantity ?? 1,
            status: input.status ?? "draft",
            subtotal: input.subtotal,
            taxAmount: input.taxAmount ?? 0,
          })
        );

        return stringify({ ok: true, message: "Facture créée." });
      },
      {
        description: "Crée une facture liée à un projet.",
        name: "create_invoice",
        schema: z.object({
          confirm: z.boolean().optional(),
          dueAt: z.string().optional(),
          invoiceNumber: z.string().optional(),
          itemDescription: z.string().optional(),
          paidAmount: z.number().optional(),
          projectId: z.string().optional(),
          quantity: z.number().optional(),
          status: z.string().optional(),
          subtotal: z.number().optional(),
          taxAmount: z.number().optional(),
          currency: z.string().optional(),
          issuedAt: z.string().optional(),
          notes: z.string().optional(),
        }),
      }
    ),
    tool(
      async (input: {
        confirm?: boolean;
        contactId?: string;
        company?: string;
        email?: string;
        name?: string;
        notes?: string;
        phone?: string;
        source?: string;
        status?: string;
        website?: string;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "update_company",
              companyId: input.contactId,
            },
          });
        }

        if (!input.contactId) {
          return stringify({ ok: false, error: "companyId est obligatoire." });
        }

        await updateCompanyAction(
          toFormData({
            companyId: input.contactId,
            company: input.company,
            email: input.email,
            name: input.name,
            notes: input.notes,
            phone: input.phone,
            source: input.source,
            status: input.status ?? "prospect",
            website: input.website,
          })
        );

        return stringify({ ok: true, message: "Entreprise mise à jour." });
      },
      {
        description: "Met à jour une entreprise existante.",
        name: "update_company",
        schema: z.object({
          company: z.string().optional(),
          confirm: z.boolean().optional(),
          contactId: z.string().optional(),
          email: z.string().optional(),
          name: z.string().optional(),
          notes: z.string().optional(),
          phone: z.string().optional(),
          source: z.string().optional(),
          status: z.string().optional(),
          website: z.string().optional(),
        }),
      }
    ),
    tool(
      async (input: {
        companyId?: string;
        confirm?: boolean;
        email?: string;
        fullName?: string;
        notes?: string;
        phone?: string;
        source?: string;
        status?: string;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "update_contact",
              contactId: input.companyId,
            },
          });
        }

        if (!input.companyId) {
          return stringify({ ok: false, error: "contactId est obligatoire." });
        }

        await updateContactAction(
          toFormData({
            contactId: input.companyId,
            email: input.email,
            fullName: input.fullName,
            notes: input.notes,
            phone: input.phone,
            source: input.source,
            status: input.status ?? "prospect",
          })
        );

        return stringify({ ok: true, message: "Contact mis à jour." });
      },
      {
        description: "Met à jour un contact existant.",
        name: "update_contact",
        schema: z.object({
          companyId: z.string().optional(),
          confirm: z.boolean().optional(),
          email: z.string().optional(),
          fullName: z.string().optional(),
          notes: z.string().optional(),
          phone: z.string().optional(),
          source: z.string().optional(),
          status: z.string().optional(),
        }),
      }
    ),
    tool(
      async (input: { confirm?: boolean; companyId?: string }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "delete_company",
              companyId: input.companyId,
            },
          });
        }

        if (!input.companyId) {
          return stringify({ ok: false, error: "companyId est obligatoire." });
        }

        await deleteCompanyAction(toFormData({ companyId: input.companyId }));

        return stringify({ ok: true, message: "Entreprise supprimée." });
      },
      {
        description: "Supprime une entreprise.",
        name: "delete_company",
        schema: z.object({
          companyId: z.string().optional(),
          confirm: z.boolean().optional(),
        }),
      }
    ),
    tool(
      async (input: { confirm?: boolean; contactId?: string }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "delete_contact",
              contactId: input.contactId,
            },
          });
        }

        if (!input.contactId) {
          return stringify({ ok: false, error: "contactId est obligatoire." });
        }

        await deleteContactAction(toFormData({ contactId: input.contactId }));

        return stringify({ ok: true, message: "Contact supprimé." });
      },
      {
        description: "Supprime un contact.",
        name: "delete_contact",
        schema: z.object({
          confirm: z.boolean().optional(),
          contactId: z.string().optional(),
        }),
      }
    ),
    tool(
      async (input: {
        confirm?: boolean;
        invoiceId?: string;
        paidAmount?: number;
        status?: string;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "update_invoice_payment",
              invoiceId: input.invoiceId,
            },
          });
        }

        if (!input.invoiceId) {
          return stringify({ ok: false, error: "invoiceId est obligatoire." });
        }

        await updateInvoicePaymentAction(
          toFormData({
            invoiceId: input.invoiceId,
            paidAmount: input.paidAmount ?? 0,
            status: input.status ?? "draft",
          })
        );

        return stringify({ ok: true, message: "Paiement facture mis à jour." });
      },
      {
        description: "Met à jour le paiement d'une facture.",
        name: "update_invoice_payment",
        schema: z.object({
          confirm: z.boolean().optional(),
          invoiceId: z.string().optional(),
          paidAmount: z.number().optional(),
          status: z.string().optional(),
        }),
      }
    ),
    tool(
      async (input: {
        confirm?: boolean;
        progress?: number;
        projectId?: string;
        status?: string;
      }) => {
        if (isConfirmationRequired(input.confirm)) {
          return stringify({
            confirmRequired: true,
            preview: {
              action: "update_project_progress",
              projectId: input.projectId,
            },
          });
        }

        if (!input.projectId) {
          return stringify({ ok: false, error: "projectId est obligatoire." });
        }

        await updateProjectProgressAction(
          toFormData({
            progress: input.progress ?? 0,
            projectId: input.projectId,
            status: input.status ?? "in_progress",
          })
        );

        return stringify({ ok: true, message: "Projet mis à jour." });
      },
      {
        description: "Met à jour l'avancement d'un projet.",
        name: "update_project_progress",
        schema: z.object({
          confirm: z.boolean().optional(),
          progress: z.number().optional(),
          projectId: z.string().optional(),
          status: z.string().optional(),
        }),
      }
    ),
  ];
}

function buildAutomationTool() {
  return tool(
    async ({ description }: { description: string }) => {
      const workflow = {
        name: "Workflow n8n généré par Nurutrack",
        nodes: [
          {
            id: "trigger",
            name: "Trigger",
            type: "n8n-nodes-base.manualTrigger",
            parameters: {},
          },
          {
            id: "ai",
            name: "Analyse IA",
            type: "n8n-nodes-base.set",
            parameters: {
              values: {
                string: [
                  {
                    name: "brief",
                    value: description,
                  },
                ],
              },
            },
          },
          {
            id: "output",
            name: "Output",
            type: "n8n-nodes-base.noOp",
            parameters: {},
          },
        ],
        connections: {
          trigger: {
            main: [
              [
                {
                  node: "ai",
                  type: "main",
                  index: 0,
                },
              ],
            ],
          },
          ai: {
            main: [
              [
                {
                  node: "output",
                  type: "main",
                  index: 0,
                },
              ],
            ],
          },
        },
      };

      return stringify(workflow);
    },
    {
      description: "Transforme une description métier en workflow n8n minimal prêt à adapter.",
      name: "generate_n8n_json",
      schema: z.object({
        description: z.string().min(1).describe("Description du workflow souhaité"),
      }),
    }
  );
}

function buildDelegationTool() {
  return tool(
    async ({ agentId, request }: { agentId: AgentId; request: string }) => {
      const targetAgent = getAgentDefinition(agentId);

      if (!targetAgent) {
        return stringify({ ok: false, error: "Agent inconnu." });
      }

      const delegated = await runAgentChatInternal({
        agentId,
        depth: 1,
        messages: [
          {
            role: "user",
            content: request,
          },
        ],
      });

      return stringify({
        agent: targetAgent.label,
        answer: delegated.answer,
        fallback: delegated.fallback,
      });
    },
    {
      description: "Délègue une tâche à un sous-agent spécialisé.",
      name: "delegate_to_agent",
      schema: z.object({
        agentId: z.enum(AGENT_ORDER.filter((id) => id !== "ceo") as [AgentId, ...AgentId[]]),
        request: z.string().min(1),
      }),
    }
  );
}

function buildAgentTools(agentId: AgentId) {
  const [
    workspaceSnapshotTool,
    searchWorkspaceTool,
    projectDetailTool,
    financialSummaryTool,
  ] = buildReadTools();
  const [
    createProjectTool,
    createGoalTool,
    createTaskTool,
    createBudgetTool,
    createCompanyTool,
    createContactTool,
    createTransactionTool,
    createInvoiceTool,
    updateCompanyTool,
    updateContactTool,
    deleteCompanyTool,
    deleteContactTool,
    updateInvoicePaymentTool,
    updateProjectProgressTool,
  ] = buildMutationTools();
  const readTools = [
    workspaceSnapshotTool,
    searchWorkspaceTool,
    projectDetailTool,
    financialSummaryTool,
  ];

  if (agentId === "automation") {
    return [...readTools, buildAutomationTool()];
  }

  if (agentId === "ceo") {
    return [
      ...readTools,
      createProjectTool,
      createGoalTool,
      createTaskTool,
      createBudgetTool,
      createCompanyTool,
      createContactTool,
      createTransactionTool,
      createInvoiceTool,
      updateCompanyTool,
      updateContactTool,
      deleteCompanyTool,
      deleteContactTool,
      updateInvoicePaymentTool,
      updateProjectProgressTool,
      buildDelegationTool(),
    ];
  }

  if (agentId === "finance" || agentId === "comptable" || agentId === "business-intelligence") {
    return [
      ...readTools,
      createBudgetTool,
      createTransactionTool,
      createInvoiceTool,
      updateInvoicePaymentTool,
    ];
  }

  if (agentId === "project-manager" || agentId === "product-manager") {
    return [
      ...readTools,
      createProjectTool,
      createGoalTool,
      createTaskTool,
      createBudgetTool,
      updateProjectProgressTool,
    ];
  }

  if (agentId === "commercial") {
    return [
      ...readTools,
      createProjectTool,
      createCompanyTool,
      createContactTool,
      updateCompanyTool,
      updateContactTool,
    ];
  }

  if (agentId === "support-client") {
    return [workspaceSnapshotTool, searchWorkspaceTool, projectDetailTool];
  }

  return readTools;
}

function resolveModelName() {
  if (process.env.NURUTRACK_AGENT_MODEL) {
    return process.env.NURUTRACK_AGENT_MODEL;
  }

  if (process.env.GROQ_API_KEY) {
    return "groq:llama-3.1-70b-versatile";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai:gpt-4o-mini";
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return "anthropic:claude-3-5-sonnet-latest";
  }

  if (process.env.GOOGLE_API_KEY) {
    return "google-genai:gemini-2.0-flash";
  }

  return null;
}

function buildFallbackAnswer(agentId: AgentId, messages: ChatMessage[], snapshot: Awaited<ReturnType<typeof buildSnapshotSummary>>) {
  const message = lastUserMessage(messages);

  if (!message) {
    return `Je suis ${AGENTS[agentId].label}. Pose-moi une demande précise et je m'en occupe.`;
  }

  if (agentId === "automation") {
    return stringify({
      workflowName: "Workflow n8n",
      brief: message,
      nodes: [
        { id: "trigger", type: "manual", label: "Déclencheur" },
        { id: "process", type: "set", label: "Traitement" },
        { id: "output", type: "noop", label: "Sortie" },
      ],
    });
  }

  if (agentId === "finance" || agentId === "comptable" || agentId === "business-intelligence") {
    return [
      `Résumé pour ${AGENTS[agentId].label}:`,
      `- Projets actifs: ${snapshot.metrics.activeProjects}`,
      `- Balance mensuelle: ${snapshot.metrics.monthlyBalance}`,
      `- Factures impayées: ${snapshot.metrics.unpaidInvoices}`,
      "",
      `Demande reçue: ${message}`,
      "Si tu veux, je peux détailler par projet, entreprise ou période.",
    ].join("\n");
  }

  if (agentId === "project-manager") {
    return [
      "Plan d'action projet:",
      `- Demande: ${message}`,
      `- Projets à surveiller: ${snapshot.attentionProjects.length}`,
      `- Tâches en retard: ${snapshot.overdueTasks.length}`,
      "Je peux aussi te proposer une découpe en tâches si tu me donnes l'objectif exact.",
    ].join("\n");
  }

  if (agentId === "commercial") {
    return [
      "Lecture commerciale:",
      `- Demande: ${message}`,
      `- Entreprises suivies: ${snapshot.companies.length}`,
      "Je peux t'aider à structurer l'offre, la proposition et la relance.",
    ].join("\n");
  }

  if (agentId === "marketing" || agentId === "content-creator" || agentId === "linkedin") {
    return [
      `Proposition pour ${AGENTS[agentId].label}:`,
      `- Sujet: ${message}`,
      "- Angle principal: bénéfice concret pour le lecteur.",
      "- Structure: accroche, contexte, preuve, CTA.",
    ].join("\n");
  }

  if (agentId === "support-client") {
    return [
      "Réponse support suggérée:",
      `Bonjour, merci pour votre message. Concernant: ${message}`,
      "Nous revenons vers vous avec une réponse claire et un prochain pas concret.",
    ].join("\n");
  }

  if (agentId === "product-manager") {
    return [
      "Cadrage produit:",
      `- Besoin: ${message}`,
      "- Étape 1: clarifier le problème.",
      "- Étape 2: lister les user stories prioritaires.",
      "- Étape 3: valider la faisabilité et la valeur.",
    ].join("\n");
  }

  return [
    `${AGENTS[agentId].label} - réponse de secours`,
    `Demande: ${message}`,
    `Métriques clés: ${snapshot.metrics.activeProjects} projets actifs, ${snapshot.metrics.openTasks} tâches ouvertes.`,
  ].join("\n");
}

async function runAgentChatInternal(input: AgentChatInput): Promise<AgentChatResult> {
  const agentId =
    getAgentDefinition(input.agentId ?? "")?.id ?? DEFAULT_AGENT_ID;
  const definition = AGENTS[agentId];
  const snapshot = await buildSnapshotSummary();

  const modelName = resolveModelName();
  const fallbackAnswer = buildFallbackAnswer(agentId, input.messages, snapshot);

  if (!modelName) {
    return {
      agentId,
      answer: fallbackAnswer,
      fallback: true,
    };
  }

  try {
    const agent = createAgent({
      model: modelName,
      systemPrompt: buildPrompt(agentId, snapshot),
      tools: buildAgentTools(agentId),
    });

    const result = await agent.invoke({
      messages: input.messages,
    });

    const interrupt = (result as { __interrupt__?: unknown }).__interrupt__;
    if (interrupt) {
      return {
        agentId,
        answer:
          "Une action demande une validation humaine. Réponds avec plus de détails ou confirme explicitement l'opération.",
        fallback: false,
        needsConfirmation: true,
        confirmationPreview: stringify(interrupt),
      };
    }

    const answer =
      normalizeAiContent((result as { messages?: Array<{ content?: unknown }> }).messages?.at(-1)?.content) ||
      fallbackAnswer;

    return {
      agentId,
      answer,
      fallback: false,
    };
  } catch {
    return {
      agentId,
      answer: fallbackAnswer,
      fallback: true,
    };
  }
}

export async function runAgentChat(input: AgentChatInput) {
  return runAgentChatInternal(input);
}
