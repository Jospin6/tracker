import { createSocialPostAction } from "@/app/actions";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  EmptyState,
  PageIntro,
  Panel,
  SectionTitle,
  StatusBadge,
} from "@/components/dashboard/ui";
import { getSocialPostsPageData } from "@/lib/data/mvp";
import { formatDateTime } from "@/lib/utils/format";

export default async function SocialPostsPage() {
  const { activities, goals, posts, projects } = await getSocialPostsPageData();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Social"
        title="Calendrier editorial"
        description="Planifie tes posts et rattache-les a tes objectifs ou projets."
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <Panel>
          <SectionTitle
            title="Nouveau post"
            description="Une vue simple pour l'idee, la planification et le rattachement metier."
          />
          <form action={createSocialPostAction} className="space-y-4">
            <input
              name="title"
              required
              placeholder="Titre du post"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <textarea
              name="content"
              rows={5}
              placeholder="Contenu"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="platform"
                defaultValue="linkedin"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="x">X</option>
                <option value="other">Other</option>
              </select>
              <select
                name="status"
                defaultValue="idea"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="idea">Idea</option>
                <option value="drafted">Drafted</option>
                <option value="approved">Approved</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="projectId"
                defaultValue=""
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="">Sans projet</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.label}
                  </option>
                ))}
              </select>
              <select
                name="goalId"
                defaultValue=""
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="">Sans objectif</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="activityId"
                defaultValue=""
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="">Sans activite</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.label}
                  </option>
                ))}
              </select>
              <input
                name="scheduledAt"
                type="datetime-local"
                className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
            <input
              name="hashtags"
              placeholder="#hashtags"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-500"
            />
            <SubmitButton
              idleLabel="Ajouter le post"
              className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </Panel>

        <Panel>
          <SectionTitle
            title="Posts et brouillons"
            description="Un suivi leger pour voir ce qui est publie, planifie ou encore en idee."
          />
          <div className="space-y-4">
            {posts.length ? (
              posts.map((post) => (
                <article key={post.id} className="rounded-3xl bg-slate-950/80 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {post.title}
                        </h3>
                        <StatusBadge value={post.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        {post.platform} | Projet: {post.projectName || "Sans projet"} |
                        Objectif: {post.goalName || "Sans objectif"}
                      </p>
                    </div>
                    <p className="text-sm text-slate-400">
                      {formatDateTime(post.scheduledAt)}
                    </p>
                  </div>
                  <p className="mt-4 text-sm text-slate-300">
                    {post.content || "Aucun contenu."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <span>Vues: {post.views}</span>
                    <span>Likes: {post.likes}</span>
                    <span>Leads: {post.leadsGenerated}</span>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Aucun post"
                description="Ajoute un premier contenu pour organiser ton calendrier editorial."
              />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}
