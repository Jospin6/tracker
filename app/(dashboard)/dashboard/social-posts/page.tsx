import { Megaphone, Plus } from "lucide-react";

import { createSocialPostAction } from "@/app/actions";
import { ResponsiveFormDialog } from "@/components/dashboard/responsive-form-dialog";
import {
  EmptyState,
  FormField,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
  formControlClassName,
  formSelectClassName,
  formTextareaClassName,
  primaryButtonClassName,
} from "@/components/dashboard/ui";
import { SubmitButton } from "@/components/shared/submit-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSocialPostsPageData } from "@/lib/data/dashboard";
import { formatDateTime } from "@/lib/utils/format";

function SocialPostForm({
  activities,
  goals,
  projects,
}: {
  activities: Array<{ id: string; label: string }>;
  goals: Array<{ id: string; label: string }>;
  projects: Array<{ id: string; label: string }>;
}) {
  return (
    <form action={createSocialPostAction} className="space-y-4">
      <FormField label="Titre">
        <input name="title" required placeholder="Titre du post" className={formControlClassName} />
      </FormField>

      <FormField label="Contenu">
        <textarea name="content" rows={5} placeholder="Contenu" className={formTextareaClassName} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Plateforme">
          <select name="platform" defaultValue="linkedin" className={formSelectClassName}>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="x">X</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <FormField label="Statut">
          <select name="status" defaultValue="idea" className={formSelectClassName}>
            <option value="idea">Idea</option>
            <option value="drafted">Drafted</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>
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

        <FormField label="Objectif">
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
        <FormField label="Activite">
          <select name="activityId" defaultValue="" className={formSelectClassName}>
            <option value="">Sans activite</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Planification">
          <input name="scheduledAt" type="datetime-local" className={formControlClassName} />
        </FormField>
      </div>

      <FormField label="Hashtags">
        <input name="hashtags" placeholder="#hashtags" className={formControlClassName} />
      </FormField>

      <SubmitButton idleLabel="Ajouter le post" className={`w-full ${primaryButtonClassName}`} />
    </form>
  );
}

export default async function SocialPostsPage() {
  const { activities, goals, posts, projects } = await getSocialPostsPageData();

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Posts" title="Calendrier editorial" description="Contenus relies au travail." />

      <ResponsiveFormDialog
        title="Nouveau post"
        description="Idee, planification, rattachement."
        triggerLabel="Nouveau post"
        triggerClassName={primaryButtonClassName}
        mobileContent={
          <Panel>
            <SectionTitle icon={Plus} title="Nouveau post" description="Idee, planification, rattachement." />
            <SocialPostForm activities={activities} goals={goals} projects={projects} />
          </Panel>
        }
      >
        <SocialPostForm activities={activities} goals={goals} projects={projects} />
      </ResponsiveFormDialog>

      <Tabs defaultValue="posts">
        <TabsList className="max-w-xl">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="schedule">Planification</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Panel>
            <SectionTitle title="Posts" description="Publies, planifies, idees." />
            <div className="space-y-3">
              {posts.length ? (
                posts.map((post) => (
                  <article key={post.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                          <StatusBadge value={post.status} />
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                          {post.platform} | {post.projectName || "Sans projet"} | {post.goalName || "Sans objectif"}
                        </p>
                      </div>
                      <p className="text-sm text-zinc-500">{formatDateTime(post.scheduledAt)}</p>
                    </div>
                    <p className="mt-4 text-sm text-zinc-300">{post.content || "Aucun contenu."}</p>
                  </article>
                ))
              ) : (
                <EmptyState title="Aucun post" description="Ajoute un premier contenu." />
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="schedule">
          <Panel>
            <SectionTitle icon={Megaphone} title="Planification" description="Lecture calendrier." />
            <div className="space-y-3">
              {posts.length ? (
                posts.map((post) => (
                  <article key={post.id} className="rounded-xl bg-black p-5 ring-1 ring-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">{post.title}</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                          {formatDateTime(post.scheduledAt)} | {post.platform}
                        </p>
                      </div>
                      <StatusBadge value={post.status} />
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="Aucune planification" description="Rien de programme." />
              )}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
