import type { LucideIcon } from "lucide-react";

import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Calculator,
  Code2,
  Headphones,
  Landmark,
  ListTodo,
  Megaphone,
  Package,
  PenTool,
  Server,
  AtSign,
  UserSearch,
  Workflow,
} from "lucide-react";
import { CEOAgent } from "@/components/agents-ia/ceo-agent";
import { CommercialAgent } from "@/components/agents-ia/commercial-agent";
import { LinkedInAgent } from "@/components/agents-ia/linkedin-agent";
import { MarketingAgent } from "@/components/agents-ia/marketing-agent";
import { ContentCreatorAgent } from "@/components/agents-ia/content-creator-agent";
import { ProjectsManagerAgent } from "@/components/agents-ia/projects-manager-agent";
import { ProductsManagerAgent } from "@/components/agents-ia/products-manager-agent";
import { SupportClientAgent } from "@/components/agents-ia/support-client-agent";
import { FinanceAgent } from "@/components/agents-ia/finance-agent";
import { ComptableAgent } from "@/components/agents-ia/comptable-agent";
import { BusinessIntelligenceAgent } from "@/components/agents-ia/busines-intelligence-agent";
import { AutomationAgent } from "@/components/agents-ia/automation-agent";

export type AiAgent = {
  slug: string;
  name: string;
  category: string;
  role: string;
  description: string;
  capabilities: string[];
  example?: string;
  icon: LucideIcon;
  children: React.ReactNode;
};

export const aiAgents: AiAgent[] = [
  {
    slug: "ceo-assistant",
    name: "Agent CEO Assistant",
    category: "Direction",
    role: "Ton assistant personnel pour piloter l’entreprise.",
    description:
      "Centralise les informations importantes et aide le dirigeant à identifier rapidement les priorités.",
    capabilities: [
      "Résumer les activités de la journée",
      "Prioriser les tâches",
      "Identifier les projets en retard",
      "Générer les rapports hebdomadaires",
      "Proposer les prochaines actions",
    ],
    example:
      "Tu as 5 leads chauds à contacter aujourd’hui et 2 projets dont les échéances approchent.",
    icon: Bot,
    children: (<CEOAgent/>)
  },
  {
    slug: "commercial",
    name: "Agent Commercial",
    category: "Ventes",
    role: "Transformer les prospects en clients.",
    description:
      "Assiste l’équipe commerciale pendant la qualification, la prospection, les relances et la préparation des offres.",
    capabilities: [
      "Qualification automatique des leads",
      "Scoring des prospects",
      "Rédaction des emails de prospection",
      "Relances automatiques",
      "Préparation des propositions commerciales",
    ],
    example: "Cette entreprise a 85 % de chance de devenir cliente.",
    icon: BriefcaseBusiness,
    children: (<CommercialAgent />),
  },
  {
    slug: "linkedin-outreach",
    name: "Agent LinkedIn Outreach",
    category: "Prospection",
    role: "Trouver des clients sur LinkedIn.",
    description:
      "Analyse les profils LinkedIn et prépare des approches personnalisées pour les prospects pertinents.",
    capabilities: [
      "Analyse des profils",
      "Détection des prospects",
      "Génération de messages personnalisés",
      "Suivi des conversations",
      "Suggestions de relance",
    ],
    example:
      "Voici 20 CTO susceptibles d’être intéressés par l’automatisation IA.",
    icon: AtSign,
    children: (<LinkedInAgent />),
  },
  {
    slug: "marketing",
    name: "Agent Marketing",
    category: "Marketing",
    role: "Gérer et développer la présence en ligne.",
    description:
      "Aide l’entreprise à créer, planifier et analyser ses campagnes et contenus marketing.",
    capabilities: [
      "Génération de posts LinkedIn",
      "Génération de publications pour X",
      "Génération de scripts vidéo",
      "Planification du contenu",
      "Analyse des performances",
    ],
    example: "Ce post a le potentiel d’obtenir plus d’engagement.",
    icon: Megaphone,
    children: (<MarketingAgent />),
  },
  {
    slug: "creation-contenu",
    name: "Agent Création de Contenu",
    category: "Contenu",
    role: "Produire du contenu professionnel.",
    description:
      "Transforme les idées, données et informations de l’entreprise en contenus adaptés à plusieurs canaux.",
    capabilities: [
      "Création d’articles de blog",
      "Création de newsletters",
      "Création de scripts YouTube",
      "Création de carrousels LinkedIn",
      "Création d’études de cas clients",
    ],
    icon: PenTool,
    children: (<ContentCreatorAgent />),
  },
  {
    slug: "gestionnaire-projets",
    name: "Agent Gestionnaire de Projets",
    category: "Projets",
    role: "Suivre tous les projets de l’entreprise.",
    description:
      "Surveille l’avancement, les échéances, les blocages et la charge de travail des équipes.",
    capabilities: [
      "Création automatique des tâches",
      "Détection des blocages",
      "Suivi des échéances",
      "Génération de roadmaps",
      "Analyse de la charge de travail",
    ],
    example: "Le projet Ajira risque un retard de 7 jours.",
    icon: ListTodo,
    children: (<ProjectsManagerAgent />),
  },
  {
    slug: "product-manager",
    name: "Agent Product Manager",
    category: "Produit",
    role: "Aider à construire et améliorer les produits.",
    description:
      "Transforme les besoins métiers et les retours utilisateurs en décisions produit structurées.",
    capabilities: [
      "Génération des spécifications",
      "Création des user stories",
      "Priorisation du backlog",
      "Analyse des retours utilisateurs",
      "Suggestions de fonctionnalités",
    ],
    icon: Package,
    children: (<ProductsManagerAgent />),
  },
  {
    slug: "support-client",
    name: "Agent Support Client",
    category: "Support",
    role: "Répondre rapidement aux demandes des clients.",
    description:
      "Classe, résume et traite les demandes avant de les transférer à un humain lorsque cela est nécessaire.",
    capabilities: [
      "Réponse automatique",
      "Classification des tickets",
      "Consultation de la base de connaissances",
      "Résumé des conversations",
      "Escalade vers un humain",
    ],
    icon: Headphones,
    children: (<SupportClientAgent />),
  },
  {
    slug: "finance",
    name: "Agent Finance",
    category: "Finance",
    role: "Suivre et analyser l’argent de l’entreprise.",
    description:
      "Fournit une vision claire des revenus, dépenses, factures, paiements et prévisions.",
    capabilities: [
      "Analyse des revenus",
      "Analyse des dépenses",
      "Prévisions financières",
      "Gestion de la facturation",
      "Rappels de paiement",
    ],
    example: "Votre marge ce mois-ci est de 37 %.",
    icon: Landmark,
    children: (<FinanceAgent />)
  },
  {
    slug: "comptable",
    name: "Agent Comptable",
    category: "Comptabilité",
    role: "Préparer et structurer les données comptables.",
    description:
      "Organise les opérations financières pour simplifier la production des rapports et documents comptables.",
    capabilities: [
      "Catégorisation des dépenses",
      "Génération de rapports financiers",
      "Préparation fiscale",
      "Gestion des reçus",
      "Contrôle des opérations comptables",
    ],
    icon: Calculator,
    children: (<ComptableAgent />)
  },
  {
    slug: "business-intelligence",
    name: "Agent Business Intelligence",
    category: "Décision",
    role: "Aider les dirigeants à prendre de meilleures décisions.",
    description:
      "Analyse les indicateurs de l’entreprise et transforme les données en recommandations exploitables.",
    capabilities: [
      "Analyse des KPIs",
      "Détection des tendances",
      "Prévisions de croissance",
      "Recommandations stratégiques",
      "Génération de rapports décisionnels",
    ],
    example:
      "Les services d’automatisation IA génèrent 60 % des revenus de l’entreprise.",
    icon: BarChart3,
    children: (<BusinessIntelligenceAgent />)
  },
  {
    slug: "automatisation-n8n",
    name: "Agent Automatisation n8n",
    category: "Automatisation",
    role: "Construire et maintenir les workflows n8n.",
    description:
      "Analyse les processus métier et propose des workflows pour automatiser les tâches répétitives.",
    capabilities: [
      "Génération de workflows n8n",
      "Détection des erreurs",
      "Suggestions d’automatisation",
      "Documentation des workflows",
      "Optimisation des automatisations",
    ],
    icon: Workflow,
    children: (<AutomationAgent />)
  },
];

export function getAiAgentBySlug(slug: string) {
  return aiAgents.find((agent) => agent.slug === slug);
}