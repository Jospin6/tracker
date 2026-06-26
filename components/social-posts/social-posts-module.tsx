import {
  Bot,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Link2,
  RefreshCcw,
  Send,
  Sparkles,
  TrendingUp,
  Webhook,
} from "lucide-react";

import {
  createSocialChannelAction,
  createSocialPostAction,
  generateSocialPostAction,
  runSocialPublishingWorkerAction,
  updateSocialDeliveryAction,
  updateSocialPostAutomationAction,
  updateSocialPostMetricsAction,
} from "@/app/actions";
import {
  EmptyState,
  FormField,
  InlineActions,
  MetricCard,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
  formControlClassName,
  formSelectClassName,
  formTextareaClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/dashboard/ui";
import { SubmitButton } from "@/components/shared/submit-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSocialPostsPageData } from "@/lib/data/dashboard";
import {
  socialAiProviderLabels,
  socialAiProviderOptions,
  socialPlatformLabels,
  socialPlatformOptions,
  socialProviderLabels,
} from "@/lib/social/shared";
import { formatDateTime } from "@/lib/utils/format";

type SocialPostsPageData = Awaited<ReturnType<typeof getSocialPostsPageData>>;

function SocialTargetsFieldset({
  channelOptions,
}: {
  channelOptions: SocialPostsPageData["channelOptions"];
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-3 text-sm font-medium text-zinc-100">Cibles plateforme</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {socialPlatformOptions.map((platform) => (
            <label
              key={platform}
              className="app-tile flex items-center gap-3 px-4 py-3 text-sm text-zinc-300"
            >
              <input
                type="checkbox"
                name="platformTargets"
                value={platform}
                className="h-4 w-4 accent-brand-500"
              />
              <span>{socialPlatformLabels[platform]}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-zinc-100">Canaux connectés</p>
        <div className="grid gap-2">
          {channelOptions.length ? (
            channelOptions.map((channel) => (
              <label
                key={channel.id}
                className="app-tile flex items-center gap-3 px-4 py-3 text-sm text-zinc-300"
              >
                <input
                  type="checkbox"
                  name="channelIds"
                  value={channel.id}
                  className="h-4 w-4 accent-brand-500"
                />
                <span>{channel.label}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-zinc-500">
              Aucun canal relié pour l’instant. Les cibles plateforme peuvent tout de même être
              préparées.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ManualPostForm({
  channelOptions,
  goals,
  projects,
}: Pick<SocialPostsPageData, "channelOptions" | "goals" | "projects">) {
  return (
    <form action={createSocialPostAction} className="space-y-4">
      <FormField label="Titre">
        <input
          name="title"
          required
          placeholder="Angle principal du post"
          className={formControlClassName}
        />
      </FormField>

      <FormField label="Contenu">
        <textarea
          name="content"
          rows={6}
          placeholder="Copie prête à publier"
          className={formTextareaClassName}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Plateforme primaire">
          <select name="platform" defaultValue="linkedin" className={formSelectClassName}>
            {socialPlatformOptions.map((platform) => (
              <option key={platform} value={platform}>
                {socialPlatformLabels[platform]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Statut">
          <select name="status" defaultValue="drafted" className={formSelectClassName}>
            <option value="idea">Idea</option>
            <option value="drafted">Drafted</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Planification">
          <input name="scheduledAt" type="datetime-local" className={formControlClassName} />
        </FormField>

        <FormField label="Hashtags">
          <input
            name="hashtags"
            placeholder="#acquisition #contentops"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Projet">
          <select name="projectId" defaultValue="" className={formSelectClassName}>
            <option value="">Sans projet</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Objectif lié">
          <select name="goalId" defaultValue="" className={formSelectClassName}>
            <option value="">Sans objectif</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Objectif marketing">
          <input
            name="objective"
            placeholder="Ex: capter des leads ou annoncer une release"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Audience">
          <input
            name="audience"
            placeholder="Ex: freelances, créateurs, équipes marketing"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Ton">
          <input
            name="tone"
            placeholder="Ex: direct, premium, pédagogique"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Call-to-action">
          <input
            name="callToAction"
            placeholder="Ex: Réponds pour recevoir le template"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <FormField label="Notes d’approbation">
        <textarea
          name="approvalNotes"
          rows={3}
          placeholder="Points de validation interne ou notes éditoriales"
          className={formTextareaClassName}
        />
      </FormField>

      <SocialTargetsFieldset channelOptions={channelOptions} />

      <label className="app-tile flex items-center gap-3 px-4 py-3 text-sm text-zinc-300">
        <input type="checkbox" name="autoPublish" className="h-4 w-4 accent-brand-500" />
        <span>Auto-publier dès qu’une livraison planifiée devient due</span>
      </label>

      <SubmitButton
        idleLabel="Créer le post"
        className={`w-full ${primaryButtonClassName}`}
      />
    </form>
  );
}

function AiPostForm({
  channelOptions,
  goals,
  projects,
}: Pick<SocialPostsPageData, "channelOptions" | "goals" | "projects">) {
  return (
    <form action={generateSocialPostAction} className="space-y-4">
      <FormField label="Brief">
        <textarea
          name="brief"
          rows={7}
          required
          placeholder="Explique le sujet, le point de vue, la preuve à mettre en avant et ce que le lecteur doit retenir."
          className={formTextareaClassName}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Plateforme primaire">
          <select name="platform" defaultValue="linkedin" className={formSelectClassName}>
            {socialPlatformOptions.map((platform) => (
              <option key={platform} value={platform}>
                {socialPlatformLabels[platform]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Statut">
          <select name="status" defaultValue="drafted" className={formSelectClassName}>
            <option value="drafted">Drafted</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </FormField>

        <FormField label="Provider IA">
          <select name="provider" defaultValue="openai" className={formSelectClassName}>
            {socialAiProviderOptions.map((provider) => (
              <option key={provider} value={provider}>
                {socialAiProviderLabels[provider]}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Planification">
          <input name="scheduledAt" type="datetime-local" className={formControlClassName} />
        </FormField>

        <FormField label="Modele">
          <input
            name="model"
            placeholder="Optionnel, sinon modele par defaut du provider"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Ton">
          <input
            name="tone"
            placeholder="Ex: crédible, énergique, expert"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Objectif">
          <input
            name="objective"
            placeholder="Ex: déclencher des démos"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Audience">
          <input
            name="audience"
            placeholder="Ex: CMOs, fondateurs, commerciaux"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Projet">
          <select name="projectId" defaultValue="" className={formSelectClassName}>
            <option value="">Sans projet</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Objectif lié">
          <select name="goalId" defaultValue="" className={formSelectClassName}>
            <option value="">Sans objectif</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <SocialTargetsFieldset channelOptions={channelOptions} />

      <label className="app-tile flex items-center gap-3 px-4 py-3 text-sm text-zinc-300">
        <input type="checkbox" name="autoPublish" className="h-4 w-4 accent-brand-500" />
        <span>Préparer une auto-publication si un canal webhook est disponible</span>
      </label>

      <SubmitButton
        idleLabel="Générer avec l’IA"
        className={`w-full ${primaryButtonClassName}`}
      />
    </form>
  );
}

function ChannelForm() {
  return (
    <form action={createSocialChannelAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nom du canal">
          <input
            name="name"
            required
            placeholder="Ex: LinkedIn CEO"
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Handle">
          <input
            name="handle"
            placeholder="@nurutrack"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Plateforme">
          <select name="platform" defaultValue="linkedin" className={formSelectClassName}>
            {socialPlatformOptions.map((platform) => (
              <option key={platform} value={platform}>
                {socialPlatformLabels[platform]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Provider">
          <select name="provider" defaultValue="webhook" className={formSelectClassName}>
            <option value="webhook">Webhook</option>
            <option value="manual">Manual</option>
          </select>
        </FormField>

        <FormField label="Statut">
          <select name="status" defaultValue="connected" className={formSelectClassName}>
            <option value="draft">Draft</option>
            <option value="connected">Connected</option>
            <option value="attention">Attention</option>
            <option value="disabled">Disabled</option>
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Webhook URL">
          <input
            name="webhookUrl"
            placeholder="https://..."
            className={formControlClassName}
          />
        </FormField>

        <FormField label="Bearer token">
          <input
            name="bearerToken"
            placeholder="Optionnel"
            className={formControlClassName}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="External account ID">
          <input
            name="externalAccountId"
            placeholder="Compte ou page distante"
            className={formControlClassName}
          />
        </FormField>

        <label className="app-tile flex items-center gap-3 px-4 py-3 text-sm text-zinc-300">
          <input type="checkbox" name="autoPublish" className="h-4 w-4 accent-brand-500" />
          <span>Auto-publier sur ce canal</span>
        </label>
      </div>

      <SubmitButton
        idleLabel="Ajouter le canal"
        className={`w-full ${primaryButtonClassName}`}
      />
    </form>
  );
}

function AutomationQueue({
  deliveryQueue,
}: Pick<SocialPostsPageData, "deliveryQueue">) {
  return (
    <div className="space-y-4">
      {deliveryQueue.length ? (
        deliveryQueue.map((delivery) => (
          <article key={delivery.id} className="app-card p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-semibold text-white">{delivery.postTitle}</h3>
                  <StatusBadge value={delivery.status} />
                </div>
                <p className="text-sm text-zinc-500">
                  {socialPlatformLabels[delivery.platform]} • {delivery.channelName || "Sans canal"} •{" "}
                  {formatDateTime(delivery.scheduledAt)}
                </p>
                {delivery.lastError ? (
                  <p className="text-sm text-rose-200">{delivery.lastError}</p>
                ) : null}
              </div>

              <form action={updateSocialDeliveryAction} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="deliveryId" value={delivery.id} />
                <input
                  name="scheduledAt"
                  type="datetime-local"
                  defaultValue={
                    delivery.scheduledAt
                      ? new Date(delivery.scheduledAt).toISOString().slice(0, 16)
                      : ""
                  }
                  className={`${formControlClassName} w-52`}
                />
                <select
                  name="status"
                  defaultValue={delivery.status}
                  className={`${formSelectClassName} w-40`}
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="processing">Processing</option>
                  <option value="published">Published</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <SubmitButton
                  idleLabel="Mettre à jour"
                  pendingLabel="Maj..."
                  className={secondaryButtonClassName}
                />
              </form>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          title="Aucune livraison en file"
          description="Les posts planifiés ou en échec apparaîtront ici."
        />
      )}
    </div>
  );
}

function PostsPipeline({
  posts,
}: Pick<SocialPostsPageData, "posts">) {
  return (
    <div className="space-y-4">
      {posts.length ? (
        posts.map((post) => (
          <article key={post.id} className="app-card p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                  <StatusBadge value={post.status} />
                  {post.autoPublish ? (
                    <span className="rounded-full bg-brand-500/12 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-brand-200">
                      auto
                    </span>
                  ) : null}
                </div>

                <p className="text-sm text-zinc-500">
                  {socialPlatformLabels[post.platform]} • {post.projectName || "Sans projet"} •{" "}
                  {post.goalName || "Sans objectif"} • {post.companyName || "Sans entreprise"}
                </p>

                <p className="text-sm leading-6 text-zinc-300">{post.content || "Aucun contenu."}</p>

                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <span>Diffusions: {post.deliveryCount}</span>
                  <span>Programmées: {post.scheduledDeliveryCount}</span>
                  <span>Publiées: {post.publishedDeliveryCount}</span>
                  <span>Échecs: {post.failedDeliveryCount}</span>
                  <span>Score: {post.contentScore}/100</span>
                </div>

                {post.publishedUrls.length ? (
                  <div className="flex flex-wrap gap-2">
                    {post.publishedUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
                      >
                        Ouvrir le post
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>

              <form action={updateSocialPostAutomationAction} className="grid gap-3 xl:w-[27rem]">
                <input type="hidden" name="postId" value={post.id} />
                <input
                  name="scheduledAt"
                  type="datetime-local"
                  defaultValue={
                    post.nextPublicationAt
                      ? new Date(post.nextPublicationAt).toISOString().slice(0, 16)
                      : ""
                  }
                  className={formControlClassName}
                />
                <select
                  name="status"
                  defaultValue={post.status}
                  className={formSelectClassName}
                >
                  <option value="idea">Idea</option>
                  <option value="drafted">Drafted</option>
                  <option value="approved">Approved</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  name="callToAction"
                  defaultValue={post.callToAction || ""}
                  placeholder="Call-to-action"
                  className={formControlClassName}
                />
                <textarea
                  name="approvalNotes"
                  rows={3}
                  defaultValue={post.approvalNotes || ""}
                  placeholder="Notes ou retour d'exploitation"
                  className={formTextareaClassName}
                />
                <label className="app-tile flex items-center gap-3 px-4 py-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    name="autoPublish"
                    defaultChecked={post.autoPublish}
                    className="h-4 w-4 accent-brand-500"
                  />
                  <span>Auto-publication active</span>
                </label>
                <SubmitButton
                  idleLabel="Mettre à jour"
                  pendingLabel="Maj..."
                  className={secondaryButtonClassName}
                />
              </form>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          title="Aucun post"
          description="Crée un premier contenu ou génère-le avec l’IA depuis l’onglet Pipeline."
        />
      )}
    </div>
  );
}

function ChannelsPanel({
  channels,
}: Pick<SocialPostsPageData, "channels">) {
  return (
    <div className="space-y-4">
      {channels.length ? (
        channels.map((channel) => (
          <article key={channel.id} className="app-card p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{channel.name}</h3>
                  <StatusBadge value={channel.status} />
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  {socialPlatformLabels[channel.platform]} •{" "}
                  {socialProviderLabels[channel.provider]} • {channel.handle || "Sans handle"}
                </p>
                {channel.webhookUrl ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Webhook configuré
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2 text-sm text-zinc-300">
                <span>Planifiées: {channel.scheduledCount}</span>
                <span>Publiées: {channel.publishedCount}</span>
                <span>Échecs: {channel.failedCount}</span>
                <span>Dernière activité: {formatDateTime(channel.lastDeliveryAt)}</span>
              </div>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          title="Aucun canal connecté"
          description="Ajoute au moins un canal webhook ou manuel pour préparer la diffusion multi-réseaux."
        />
      )}
    </div>
  );
}

function PerformancePanel({
  topPerformers,
}: Pick<SocialPostsPageData, "topPerformers">) {
  return (
    <div className="space-y-4">
      {topPerformers.length ? (
        topPerformers.map((post) => (
          <article key={post.id} className="app-card p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                  <StatusBadge value={post.status} />
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  Engagement cumulé: {post.likes + post.comments + post.shares} • Leads:{" "}
                  {post.leadsGenerated}
                </p>
              </div>

              <form action={updateSocialPostMetricsAction} className="grid gap-3 xl:w-[27rem]">
                <input type="hidden" name="postId" value={post.id} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    name="views"
                    type="number"
                    min={0}
                    defaultValue={post.views}
                    placeholder="Views"
                    className={formControlClassName}
                  />
                  <input
                    name="likes"
                    type="number"
                    min={0}
                    defaultValue={post.likes}
                    placeholder="Likes"
                    className={formControlClassName}
                  />
                  <input
                    name="comments"
                    type="number"
                    min={0}
                    defaultValue={post.comments}
                    placeholder="Comments"
                    className={formControlClassName}
                  />
                  <input
                    name="shares"
                    type="number"
                    min={0}
                    defaultValue={post.shares}
                    placeholder="Shares"
                    className={formControlClassName}
                  />
                  <input
                    name="leadsGenerated"
                    type="number"
                    min={0}
                    defaultValue={post.leadsGenerated}
                    placeholder="Leads"
                    className={formControlClassName}
                  />
                </div>
                <SubmitButton
                  idleLabel="Mettre à jour les métriques"
                  pendingLabel="Maj..."
                  className={secondaryButtonClassName}
                />
              </form>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          title="Pas encore de performance exploitable"
          description="Les posts publiés avec métriques remontées apparaîtront ici."
        />
      )}
    </div>
  );
}

function CalendarPanel({
  calendar,
}: Pick<SocialPostsPageData, "calendar">) {
  return (
    <div className="space-y-4">
      {calendar.length ? (
        calendar.map((delivery) => (
          <article key={delivery.id} className="app-card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-semibold text-white">{delivery.postTitle}</h3>
                  <StatusBadge value={delivery.status} />
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  {socialPlatformLabels[delivery.platform]} • {delivery.channelName || "Sans canal"}
                </p>
              </div>
              <div className="text-sm text-zinc-500">
                <p>Prévu: {formatDateTime(delivery.scheduledAt)}</p>
                <p>Publié: {formatDateTime(delivery.publishedAt)}</p>
              </div>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          title="Calendrier vide"
          description="Dès qu’un post dispose d’une livraison ou d’une planification, il remonte ici."
        />
      )}
    </div>
  );
}

export function SocialPostsModule({
  data,
}: {
  data: SocialPostsPageData;
}) {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Posts"
        title="Orchestration social media"
        description="Planifie, génère, publie et pilote les posts multi-réseaux depuis un seul module."
        actions={
          <InlineActions>
            <form action={runSocialPublishingWorkerAction}>
              <input type="hidden" name="limit" value="20" />
              <SubmitButton
                idleLabel={
                  <span className="inline-flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Lancer le worker
                  </span>
                }
                pendingLabel="Publication..."
                className={secondaryButtonClassName}
              />
            </form>
          </InlineActions>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Send className="h-5 w-5" />}
          label="Posts"
          value={String(data.summary.totalPosts)}
          hint={`${data.summary.draftPosts} encore en préparation`}
        />
        <MetricCard
          icon={<CalendarClock className="h-5 w-5" />}
          label="Livraisons"
          value={String(data.summary.scheduledDeliveries)}
          hint="En attente de publication"
        />
        <MetricCard
          icon={<Webhook className="h-5 w-5" />}
          label="Canaux"
          value={String(data.summary.connectedChannels)}
          hint={`${data.summary.autoPublishPosts} posts auto-pub prêts`}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Engagement"
          value={String(data.summary.totalEngagement)}
          hint={`${data.summary.totalLeads} leads générés`}
        />
      </section>

      <Tabs defaultValue="pipeline">
        <TabsList className="max-w-3xl">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="channels">Canaux</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              <Panel>
                <SectionTitle
                  icon={Send}
                  title="Création manuelle"
                  trailing={
                    <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      contrôle fin
                    </span>
                  }
                />
                <ManualPostForm
                  channelOptions={data.channelOptions}
                  goals={data.goals}
                  projects={data.projects}
                />
              </Panel>

              <Panel>
                <SectionTitle
                  icon={Sparkles}
                  title="Assistant IA"
                  trailing={
                    <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      brief → copie
                    </span>
                  }
                />
                <AiPostForm
                  channelOptions={data.channelOptions}
                  goals={data.goals}
                  projects={data.projects}
                />
              </Panel>
            </div>

            <div className="space-y-6">
              <Panel>
                <SectionTitle
                  icon={CheckCircle2}
                  title="Pipeline éditorial"
                  trailing={
                    <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {data.posts.length} posts
                    </span>
                  }
                />
                <PostsPipeline posts={data.posts} />
              </Panel>

              <Panel>
                <SectionTitle
                  icon={RefreshCcw}
                  title="File de publication"
                  trailing={
                    <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {data.deliveryQueue.length} livraisons
                    </span>
                  }
                />
                <AutomationQueue deliveryQueue={data.deliveryQueue} />
              </Panel>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="calendar">
          <Panel>
            <SectionTitle
              icon={CalendarClock}
              title="Calendrier des diffusions"
              trailing={
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  visibilité globale
                </span>
              }
            />
            <CalendarPanel calendar={data.calendar} />
          </Panel>
        </TabsContent>

        <TabsContent value="channels">
          <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <Panel>
              <SectionTitle
                icon={Link2}
                title="Nouveau canal"
                trailing={
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    webhook ou manuel
                  </span>
                }
              />
              <ChannelForm />
            </Panel>

            <Panel>
              <SectionTitle
                icon={Webhook}
                title="Canaux disponibles"
                trailing={
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {data.channels.length} connectés ou préparés
                  </span>
                }
              />
              <ChannelsPanel channels={data.channels} />
            </Panel>
          </section>
        </TabsContent>

        <TabsContent value="performance">
          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <Panel>
              <SectionTitle
                icon={TrendingUp}
                title="Top posts"
                trailing={
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    mise à jour manuelle
                  </span>
                }
              />
              <PerformancePanel topPerformers={data.topPerformers} />
            </Panel>

            <Panel>
              <SectionTitle
                icon={Bot}
                title="Lecture module"
                trailing={
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    usage
                  </span>
                }
              />
              <div className="space-y-4 text-sm leading-6 text-zinc-300">
                <p>
                  Les posts restent la ressource centrale. Les canaux décrivent les points de
                  diffusion, et les livraisons portent les statuts, les horaires et les résultats
                  par plateforme.
                </p>
                <p>
                  L’auto-publication s’active au niveau du post et/ou du canal. Le worker tente
                  uniquement les livraisons dues sur des canaux webhook marqués comme connectés.
                </p>
                <p>
                  Si une cle provider compatible est presente, le module IA genere le contenu via
                  un workflow `LangChain + LangGraph`. Sinon, le module reste fonctionnel avec un
                  fallback local pour ne pas bloquer le flux editorial.
                </p>
                <p>
                  Providers disponibles: OpenAI, Groq, Hugging Face et Google Gemini. Cles
                  reconnues: `OPENAI_API_KEY`, `GROQ_API_KEY`, `HF_TOKEN` et `GOOGLE_API_KEY`.
                </p>
                <div className="app-tile px-4 py-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Pour l’automatisation planifiée, appelle `POST /api/social-posts/publish` avec
                  `x-nurutrack-worker-secret`.
                </div>
              </div>
            </Panel>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
