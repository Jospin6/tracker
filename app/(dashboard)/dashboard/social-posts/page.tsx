import { SocialPostsModule } from "@/components/social-posts/social-posts-module";
import { getSocialPostsPageData } from "@/lib/data/dashboard";

export default async function SocialPostsPage() {
  const data = await getSocialPostsPageData();

  return <SocialPostsModule data={data} />;
}
