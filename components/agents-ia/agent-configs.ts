import type { LucideIcon } from "lucide-react";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    BookOpen,
    Boxes,
    Calculator,
    Calendar,
    ChartLine,
    CircleDollarSign,
    ClipboardList,
    Clock3,
    DollarSign,
    FileText,
    FlaskConical,
    FolderKanban,
    Handshake,
    Headphones,
    Image,
    AtSign,
    Landmark,
    Library,
    Lightbulb,
    ListChecks,
    Mail,
    Megaphone,
    MessageSquare,
    Package,
    PenTool,
    PiggyBank,
    ReceiptText,
    Repeat2,
    Rocket,
    Route,
    Search,
    Share2,
    Smile,
    Tags,
    Target,
    TrendingUp,
    UserSearch,
    Users,
    Wallet,
    WandSparkles,
    Workflow,
    Sparkles,
    BriefcaseBusiness,
    Goal,
    Bot,
} from "lucide-react";
import { QuickAction } from "./chat-types";


export type AgentConfig = {
    agentId: string;
    endpoint: string;
    title: string;
    description: string;
    placeholder: string;
    initialMessage: string;
    icon: LucideIcon;
    quickActions: QuickAction[];
};

/* -------------------------------------------------------------------------- */
/*                            CEO AGENT                                */
/* -------------------------------------------------------------------------- */

const ceoQuickActions: QuickAction[] = [
    {
        label: "Briefing exécutif",
        icon: Sparkles,
        prompt:
            "Donne-moi le briefing exécutif actuel de l’entreprise avec les priorités, alertes et décisions à prendre.",
    },
    {
        label: "Risques",
        icon: AlertTriangle,
        prompt:
            "Analyse les risques actuels de l’entreprise : projets, clients, factures, budgets, objectifs et tâches.",
    },
    {
        label: "Pipeline commercial",
        icon: TrendingUp,
        prompt:
            "Analyse le pipeline commercial et indique les opportunités prioritaires, les relances à effectuer et les contrats à risque.",
    },
    {
        label: "Situation financière",
        icon: CircleDollarSign,
        prompt:
            "Donne-moi la situation financière actuelle avec les revenus, dépenses, trésorerie, budgets et prévisions.",
    },
    {
        label: "Projets",
        icon: BriefcaseBusiness,
        prompt:
            "Analyse tous les projets actifs et indique les retards, blocages, dépassements de budget et prochaines actions.",
    },
    {
        label: "Factures",
        icon: ReceiptText,
        prompt:
            "Analyse les factures et indique celles qui sont en attente, en retard ou nécessitent une relance.",
    },
    {
        label: "Objectifs",
        icon: Goal,
        prompt:
            "Analyse les objectifs de l’entreprise et indique ceux qui sont atteints, en retard ou à risque.",
    },
];

/* -------------------------------------------------------------------------- */
/*                            AUTOMATION AGENT                                */
/* -------------------------------------------------------------------------- */

const automationQuickActions: QuickAction[] = [
    {
        label: "Auditer les processus",
        icon: Search,
        prompt:
            "Analyse les processus actuels de l’entreprise et identifie les tâches manuelles, répétitives ou sujettes aux erreurs qui pourraient être automatisées.",
    },
    {
        label: "Automatisations prioritaires",
        icon: WandSparkles,
        prompt:
            "Classe les automatisations possibles par priorité selon leur impact, leur coût, leur complexité et le temps économisé.",
    },
    {
        label: "Créer un workflow",
        icon: Workflow,
        prompt:
            "Aide-moi à concevoir un workflow d’automatisation complet. Commence par identifier le déclencheur, les étapes, les conditions, les données utilisées et le résultat attendu.",
    },
    {
        label: "Erreurs d’automatisation",
        icon: AlertTriangle,
        prompt:
            "Analyse les automatisations en erreur ou interrompues, identifie les causes probables et propose les actions correctives.",
    },
    {
        label: "Performance des workflows",
        icon: Activity,
        prompt:
            "Présente les performances des automatisations actives : exécutions, réussites, erreurs, temps économisé et optimisations recommandées.",
    },
];

/* -------------------------------------------------------------------------- */
/*                     BUSINESS INTELLIGENCE AGENT                            */
/* -------------------------------------------------------------------------- */

const businessIntelligenceQuickActions: QuickAction[] = [
    {
        label: "Tableau de bord",
        icon: BarChart3,
        prompt:
            "Génère un tableau de bord exécutif avec les principaux indicateurs commerciaux, financiers, opérationnels et projets.",
    },
    {
        label: "KPI critiques",
        icon: Target,
        prompt:
            "Identifie les KPI les plus importants à surveiller actuellement et explique leur évolution, leur impact et les actions recommandées.",
    },
    {
        label: "Détecter les anomalies",
        icon: AlertTriangle,
        prompt:
            "Analyse les données de l’entreprise et détecte les anomalies, variations inhabituelles, baisses de performance ou risques émergents.",
    },
    {
        label: "Comparer les périodes",
        icon: Calendar,
        prompt:
            "Compare les performances de la période actuelle avec la période précédente pour les ventes, revenus, dépenses, projets et clients.",
    },
    {
        label: "Prévisions",
        icon: ChartLine,
        prompt:
            "Produis des prévisions basées sur les données disponibles et présente un scénario prudent, réaliste et optimiste.",
    },
];

/* -------------------------------------------------------------------------- */
/*                            COMMERCIAL AGENT                                */
/* -------------------------------------------------------------------------- */

const commercialQuickActions: QuickAction[] = [
    {
        label: "Analyser le pipeline",
        icon: TrendingUp,
        prompt:
            "Analyse le pipeline commercial actuel, les montants par étape, les opportunités bloquées et les contrats ayant le plus de chances d’être signés.",
    },
    {
        label: "Prospects prioritaires",
        icon: UserSearch,
        prompt:
            "Identifie les prospects les plus prioritaires à contacter selon leur potentiel, leur niveau d’engagement et leur probabilité de conversion.",
    },
    {
        label: "Relances à effectuer",
        icon: Mail,
        prompt:
            "Liste les prospects, contacts et clients qui doivent être relancés, puis prépare pour chacun un message de relance adapté.",
    },
    {
        label: "Préparer une proposition",
        icon: FileText,
        prompt:
            "Aide-moi à préparer une proposition commerciale adaptée au besoin du client, avec la solution, les bénéfices, le prix et les prochaines étapes.",
    },
    {
        label: "Prévision des ventes",
        icon: CircleDollarSign,
        prompt:
            "Estime les ventes probables pour les prochaines semaines en tenant compte du pipeline, des probabilités de conversion et des dates de clôture.",
    },
];

/* -------------------------------------------------------------------------- */
/*                             COMPTABLE AGENT                                */
/* -------------------------------------------------------------------------- */

const comptableQuickActions: QuickAction[] = [
    {
        label: "Factures impayées",
        icon: ReceiptText,
        prompt:
            "Liste les factures impayées, partiellement payées ou en retard, classées par montant, ancienneté et priorité de recouvrement.",
    },
    {
        label: "Rapprochement",
        icon: Calculator,
        prompt:
            "Analyse les paiements et transactions disponibles afin d’identifier les opérations non rapprochées, les différences et les doublons.",
    },
    {
        label: "Dépenses à classer",
        icon: Tags,
        prompt:
            "Identifie les dépenses non catégorisées ou mal catégorisées et propose une classification comptable adaptée.",
    },
    {
        label: "Clôture mensuelle",
        icon: ClipboardList,
        prompt:
            "Prépare la clôture comptable du mois avec les écritures manquantes, les factures non enregistrées, les paiements non rapprochés et les contrôles à effectuer.",
    },
    {
        label: "Rapport comptable",
        icon: BookOpen,
        prompt:
            "Prépare un rapport comptable synthétique avec les revenus, charges, créances, dettes, factures et opérations nécessitant une vérification.",
    },
];

/* -------------------------------------------------------------------------- */
/*                        CONTENT CREATOR AGENT                               */
/* -------------------------------------------------------------------------- */

const contentCreatorQuickActions: QuickAction[] = [
    {
        label: "Calendrier éditorial",
        icon: Calendar,
        prompt:
            "Crée un calendrier éditorial adapté aux objectifs actuels de l’entreprise, aux audiences ciblées et aux plateformes utilisées.",
    },
    {
        label: "Créer un contenu",
        icon: PenTool,
        prompt:
            "Aide-moi à créer un contenu professionnel. Demande ou utilise le sujet, la plateforme, l’audience, le ton et l’objectif disponibles.",
    },
    {
        label: "Idées de contenu",
        icon: Lightbulb,
        prompt:
            "Propose des idées de contenu pertinentes basées sur les services, produits, projets, audiences et objectifs marketing de l’entreprise.",
    },
    {
        label: "Réutiliser un contenu",
        icon: Repeat2,
        prompt:
            "Transforme un contenu existant en plusieurs formats adaptés aux réseaux sociaux, blog, newsletter, vidéo et présentation.",
    },
    {
        label: "Analyser les contenus",
        icon: BarChart3,
        prompt:
            "Analyse les performances des contenus publiés et identifie les sujets, formats et canaux qui génèrent le plus d’engagement.",
    },
];

/* -------------------------------------------------------------------------- */
/*                              FINANCE AGENT                                 */
/* -------------------------------------------------------------------------- */

const financeQuickActions: QuickAction[] = [
    {
        label: "Situation de trésorerie",
        icon: Wallet,
        prompt:
            "Présente la situation actuelle de la trésorerie avec les fonds disponibles, encaissements attendus, dépenses prévues et risques de liquidité.",
    },
    {
        label: "Prévisions financières",
        icon: ChartLine,
        prompt:
            "Prépare des prévisions financières pour les prochains mois avec les revenus, dépenses, trésorerie et hypothèses utilisées.",
    },
    {
        label: "Analyser les budgets",
        icon: PiggyBank,
        prompt:
            "Analyse les budgets de l’entreprise, les montants consommés, les écarts, les dépassements probables et les réallocations possibles.",
    },
    {
        label: "Analyser la rentabilité",
        icon: DollarSign,
        prompt:
            "Analyse la rentabilité par activité, projet, client et service, puis identifie les principales sources de profit ou de perte.",
    },
    {
        label: "Simuler des scénarios",
        icon: FlaskConical,
        prompt:
            "Prépare plusieurs scénarios financiers en fonction des revenus, dépenses, investissements et hypothèses disponibles.",
    },
];

/* -------------------------------------------------------------------------- */
/*                             LINKEDIN AGENT                                 */
/* -------------------------------------------------------------------------- */

const linkedinQuickActions: QuickAction[] = [
    {
        label: "Créer un post",
        icon: PenTool,
        prompt:
            "Crée un post LinkedIn professionnel, humain et engageant en fonction du sujet, de l’audience et de l’objectif disponibles.",
    },
    {
        label: "Calendrier LinkedIn",
        icon: Calendar,
        prompt:
            "Crée un calendrier de publications LinkedIn adapté au positionnement, aux services et aux objectifs de l’entreprise.",
    },
    {
        label: "Auditer le profil",
        icon: Search,
        prompt:
            "Analyse le profil ou la page LinkedIn disponible et propose des améliorations pour le titre, le résumé, le positionnement et la crédibilité.",
    },
    {
        label: "Trouver des prospects",
        icon: UserSearch,
        prompt:
            "Définis les profils de prospects à rechercher sur LinkedIn et prépare une stratégie de prise de contact personnalisée.",
    },
    {
        label: "Analyser les performances",
        icon: BarChart3,
        prompt:
            "Analyse les performances LinkedIn disponibles et identifie les publications, sujets et formats les plus efficaces.",
    },
];

/* -------------------------------------------------------------------------- */
/*                            MARKETING AGENT                                 */
/* -------------------------------------------------------------------------- */

const marketingQuickActions: QuickAction[] = [
    {
        label: "Créer une campagne",
        icon: Megaphone,
        prompt:
            "Conçois une campagne marketing complète avec l’objectif, l’audience, le message, les canaux, le budget, le calendrier et les KPI.",
    },
    {
        label: "Segmenter l’audience",
        icon: Users,
        prompt:
            "Analyse les clients et prospects afin de créer des segments marketing exploitables avec leurs besoins, comportements et messages adaptés.",
    },
    {
        label: "Analyser le tunnel",
        icon: Route,
        prompt:
            "Analyse le tunnel marketing et commercial, identifie les points de friction et propose des améliorations pour augmenter les conversions.",
    },
    {
        label: "Performance des canaux",
        icon: Share2,
        prompt:
            "Compare les performances des différents canaux marketing selon leur coût, leur portée, leurs conversions et leur rentabilité.",
    },
    {
        label: "Positionner une offre",
        icon: Target,
        prompt:
            "Aide-moi à définir le positionnement d’une offre avec sa cible, son problème, sa proposition de valeur, ses bénéfices et son message principal.",
    },
];

/* -------------------------------------------------------------------------- */
/*                         PRODUCT MANAGER AGENT                              */
/* -------------------------------------------------------------------------- */

const productsManagerQuickActions: QuickAction[] = [
    {
        label: "Créer la roadmap",
        icon: Route,
        prompt:
            "Crée ou améliore la roadmap produit selon les objectifs stratégiques, les besoins utilisateurs, les ressources et les échéances.",
    },
    {
        label: "Prioriser les fonctionnalités",
        icon: ListChecks,
        prompt:
            "Classe les fonctionnalités selon leur valeur utilisateur, leur impact business, leur urgence, leur coût et leur complexité.",
    },
    {
        label: "Rédiger les user stories",
        icon: FileText,
        prompt:
            "Transforme le besoin produit en user stories claires avec les critères d’acceptation, les règles métier et les cas limites.",
    },
    {
        label: "Analyser les retours",
        icon: MessageSquare,
        prompt:
            "Analyse les retours des utilisateurs et identifie les problèmes récurrents, les demandes prioritaires et les opportunités produit.",
    },
    {
        label: "Préparer une release",
        icon: Rocket,
        prompt:
            "Prépare un plan de release avec les fonctionnalités, dépendances, tests, risques, communication et critères de validation.",
    },
];

/* -------------------------------------------------------------------------- */
/*                         PROJECT MANAGER AGENT                              */
/* -------------------------------------------------------------------------- */

const projectsManagerQuickActions: QuickAction[] = [
    {
        label: "État des projets",
        icon: FolderKanban,
        prompt:
            "Présente l’état de tous les projets actifs avec leur progression, leurs échéances, leurs budgets et leurs prochains jalons.",
    },
    {
        label: "Projets à risque",
        icon: AlertTriangle,
        prompt:
            "Identifie les projets à risque, en retard, bloqués ou susceptibles de dépasser leur budget, puis propose des actions correctives.",
    },
    {
        label: "Tâches prioritaires",
        icon: ListChecks,
        prompt:
            "Identifie les tâches les plus prioritaires selon leur urgence, leur impact, leurs dépendances et les échéances des projets.",
    },
    {
        label: "Charge de l’équipe",
        icon: Users,
        prompt:
            "Analyse la charge de travail des membres de l’équipe et identifie les surcharges, sous-charges et réaffectations possibles.",
    },
    {
        label: "Rapport de projet",
        icon: FileText,
        prompt:
            "Prépare un rapport de projet avec l’avancement, les tâches terminées, les tâches en retard, les risques, le budget et les prochaines étapes.",
    },
];

/* -------------------------------------------------------------------------- */
/*                          SUPPORT CLIENT AGENT                              */
/* -------------------------------------------------------------------------- */

const supportClientQuickActions: QuickAction[] = [
    {
        label: "Tickets urgents",
        icon: AlertTriangle,
        prompt:
            "Identifie les demandes et tickets clients les plus urgents selon leur gravité, leur ancienneté, le client concerné et leur impact.",
    },
    {
        label: "Préparer une réponse",
        icon: Mail,
        prompt:
            "Prépare une réponse claire, professionnelle et empathique à la demande du client en utilisant le contexte disponible.",
    },
    {
        label: "Problèmes récurrents",
        icon: Repeat2,
        prompt:
            "Analyse les demandes du support et identifie les problèmes récurrents, leurs causes probables et les solutions permanentes possibles.",
    },
    {
        label: "Analyser les délais",
        icon: Clock3,
        prompt:
            "Analyse les délais de première réponse et de résolution, puis identifie les tickets qui risquent de dépasser les engagements de service.",
    },
    {
        label: "Base de connaissances",
        icon: Library,
        prompt:
            "Identifie les demandes qui devraient être transformées en articles de base de connaissances et propose leur structure.",
    },
];

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATIONS                                */
/* -------------------------------------------------------------------------- */

export const agentConfigs = {
    ceo: {
        agentId: "ceo-agent",
        endpoint: "/api/agents/ceo",
        icon: Bot,
        title: "Assistant exécutif",
        description: "Posez une question ou demandez une action.",
        placeholder: "Demandez quelque chose à votre agent CEO...",
        initialMessage: "Bonjour. Je suis votre agent CEO. Je peux analyser l’entreprise, détecter les risques, recommander des décisions et piloter vos opérations.",
        quickActions: ceoQuickActions
    },
    automation: {
        agentId: "automation-agent",
        endpoint: "/api/agents/automation",
        title: "Agent d’automatisation",
        description:
            "Identifiez, créez et optimisez les automatisations de l’entreprise.",
        placeholder:
            "Décrivez le processus que vous souhaitez automatiser...",
        initialMessage:
            "Bonjour. Je peux analyser vos processus, concevoir des workflows et améliorer vos automatisations.",
        icon: Workflow,
        quickActions: automationQuickActions,
    },

    businessIntelligence: {
        agentId: "business-intelligence-agent",
        endpoint: "/api/agents/business-intelligence",
        title: "Agent Business Intelligence",
        description:
            "Analysez les performances, les KPI, les tendances et les anomalies.",
        placeholder:
            "Demandez une analyse de vos données et performances...",
        initialMessage:
            "Bonjour. Je peux transformer les données de votre entreprise en analyses, indicateurs et recommandations.",
        icon: BarChart3,
        quickActions: businessIntelligenceQuickActions,
    },

    commercial: {
        agentId: "commercial-agent",
        endpoint: "/api/agents/commercial",
        title: "Agent commercial",
        description:
            "Pilotez vos prospects, opportunités, relances et ventes.",
        placeholder:
            "Demandez une analyse commerciale ou préparez une action...",
        initialMessage:
            "Bonjour. Je peux analyser votre pipeline, prioriser les prospects et vous aider à convertir davantage d’opportunités.",
        icon: Handshake,
        quickActions: commercialQuickActions,
    },

    comptable: {
        agentId: "comptable-agent",
        endpoint: "/api/agents/comptable",
        title: "Agent comptable",
        description:
            "Suivez les factures, transactions, dépenses et rapprochements.",
        placeholder:
            "Demandez une analyse comptable...",
        initialMessage:
            "Bonjour. Je peux vous aider à contrôler les factures, transactions, dépenses et opérations comptables.",
        icon: Calculator,
        quickActions: comptableQuickActions,
    },

    contentCreator: {
        agentId: "content-creator-agent",
        endpoint: "/api/agents/content-creator",
        title: "Agent créateur de contenu",
        description:
            "Créez, planifiez et améliorez les contenus de votre entreprise.",
        placeholder:
            "Décrivez le contenu que vous souhaitez créer...",
        initialMessage:
            "Bonjour. Je peux créer vos contenus, préparer votre calendrier éditorial et adapter vos publications à chaque plateforme.",
        icon: PenTool,
        quickActions: contentCreatorQuickActions,
    },

    finance: {
        agentId: "finance-agent",
        endpoint: "/api/agents/finance",
        title: "Agent financier",
        description:
            "Analysez la trésorerie, les budgets, la rentabilité et les prévisions.",
        placeholder:
            "Demandez une analyse ou une simulation financière...",
        initialMessage:
            "Bonjour. Je peux analyser votre situation financière, vos budgets, votre rentabilité et vos besoins futurs.",
        icon: Landmark,
        quickActions: financeQuickActions,
    },

    linkedin: {
        agentId: "linkedin-agent",
        endpoint: "/api/agents/linkedin",
        title: "Agent LinkedIn",
        description:
            "Gérez votre présence, vos contenus et votre prospection LinkedIn.",
        placeholder:
            "Demandez un post, une analyse ou une stratégie LinkedIn...",
        initialMessage:
            "Bonjour. Je peux vous aider à publier, prospecter et améliorer votre présence professionnelle sur LinkedIn.",
        icon: AtSign,
        quickActions: linkedinQuickActions,
    },

    marketing: {
        agentId: "marketing-agent",
        endpoint: "/api/agents/marketing",
        title: "Agent marketing",
        description:
            "Créez des campagnes, analysez les canaux et améliorez les conversions.",
        placeholder:
            "Décrivez votre objectif marketing...",
        initialMessage:
            "Bonjour. Je peux créer vos campagnes, analyser votre audience et améliorer votre stratégie marketing.",
        icon: Megaphone,
        quickActions: marketingQuickActions,
    },

    productsManager: {
        agentId: "products-manager-agent",
        endpoint: "/api/agents/product-manager",
        title: "Agent Product Manager",
        description:
            "Pilotez la roadmap, les fonctionnalités et les besoins utilisateurs.",
        placeholder:
            "Décrivez votre besoin produit...",
        initialMessage:
            "Bonjour. Je peux organiser votre roadmap, prioriser les fonctionnalités et transformer les besoins en spécifications produit.",
        icon: Package,
        quickActions: productsManagerQuickActions,
    },

    projectsManager: {
        agentId: "projects-manager-agent",
        endpoint: "/api/agents/project-manager",
        title: "Agent Project Manager",
        description:
            "Supervisez les projets, les tâches, les équipes et les échéances.",
        placeholder:
            "Demandez une analyse ou une action sur vos projets...",
        initialMessage:
            "Bonjour. Je peux suivre vos projets, détecter les risques et organiser les tâches et les priorités.",
        icon: FolderKanban,
        quickActions: projectsManagerQuickActions,
    },

    supportClient: {
        agentId: "support-client-agent",
        endpoint: "/api/agents/support-client",
        title: "Agent support client",
        description:
            "Traitez les demandes, priorisez les tickets et améliorez le service.",
        placeholder:
            "Décrivez une demande client ou demandez une analyse du support...",
        initialMessage:
            "Bonjour. Je peux analyser les demandes clients, préparer des réponses et identifier les problèmes récurrents.",
        icon: Headphones,
        quickActions: supportClientQuickActions,
    },
} satisfies Record<string, AgentConfig>;