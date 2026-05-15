import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import {
  socialChannels,
  socialPostDeliveries,
  socialPostDetails,
  socialPosts,
  type NewSocialPostDelivery,
  type NewSocialPostDetail,
} from "@/db/schema";
import { statusFromDeliveryState } from "@/lib/social/shared";

export function isMissingSocialTableError(error: unknown, tableName: string) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidateErrors = [error, "cause" in error ? error.cause : undefined].filter(Boolean);

  return candidateErrors.some((candidate) => {
    const code =
      candidate && typeof candidate === "object" && "code" in candidate
        ? String(candidate.code)
        : "";
    const message =
      candidate instanceof Error ? candidate.message : String(candidate);

    return (
      code === "42P01" ||
      message.includes(`"${tableName}"`) ||
      message.includes(`relation "${tableName}" does not exist`) ||
      message.includes(`relation "${tableName.replaceAll("_", "")}" does not exist`)
    );
  });
}

export async function loadOptionalSocialPostDetails(workspaceId: string) {
  try {
    return await db
      .select()
      .from(socialPostDetails)
      .where(eq(socialPostDetails.workspaceId, workspaceId))
      .orderBy(desc(socialPostDetails.updatedAt));
  } catch (error) {
    if (isMissingSocialTableError(error, "social_post_details")) {
      return [];
    }

    throw error;
  }
}

export async function loadOptionalSocialChannels(workspaceId: string) {
  try {
    return await db
      .select()
      .from(socialChannels)
      .where(eq(socialChannels.workspaceId, workspaceId))
      .orderBy(desc(socialChannels.updatedAt));
  } catch (error) {
    if (isMissingSocialTableError(error, "social_channels")) {
      return [];
    }

    throw error;
  }
}

export async function loadOptionalSocialPostDeliveries(workspaceId: string) {
  try {
    return await db
      .select()
      .from(socialPostDeliveries)
      .where(eq(socialPostDeliveries.workspaceId, workspaceId))
      .orderBy(desc(socialPostDeliveries.updatedAt));
  } catch (error) {
    if (isMissingSocialTableError(error, "social_post_deliveries")) {
      return [];
    }

    throw error;
  }
}

export async function upsertSocialPostDetail(values: NewSocialPostDetail) {
  try {
    const [existing] = await db
      .select()
      .from(socialPostDetails)
      .where(eq(socialPostDetails.postId, values.postId))
      .limit(1);

    if (!existing) {
      const [created] = await db.insert(socialPostDetails).values(values).returning();
      return created ?? null;
    }

    const updates = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== undefined)
    );
    const [updated] = await db
      .update(socialPostDetails)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(socialPostDetails.postId, values.postId))
      .returning();

    return updated ?? existing;
  } catch (error) {
    if (isMissingSocialTableError(error, "social_post_details")) {
      return null;
    }

    throw error;
  }
}

type CreateDeliveriesInput = {
  channelIds: string[];
  createdBy: string;
  hashtagsOverride?: string | null;
  platforms: Array<NonNullable<NewSocialPostDelivery["platform"]>>;
  postId: string;
  scheduledAt?: Date | null;
  status: "cancelled" | "draft" | "published" | "scheduled";
  workspaceId: string;
};

export async function createSocialPostDeliveries(input: CreateDeliveriesInput) {
  try {
    const channels = input.channelIds.length
      ? await db
          .select({
            id: socialChannels.id,
            platform: socialChannels.platform,
          })
          .from(socialChannels)
          .where(
            and(
              eq(socialChannels.workspaceId, input.workspaceId),
              inArray(socialChannels.id, input.channelIds)
            )
          )
      : [];

    const channelDeliveries = channels.map((channel) => ({
      channelId: channel.id,
      createdBy: input.createdBy,
      hashtagsOverride: input.hashtagsOverride ?? null,
      platform: channel.platform,
      publishedAt: input.status === "published" ? new Date() : null,
      postId: input.postId,
      scheduledAt: input.scheduledAt ?? null,
      status: input.status,
      workspaceId: input.workspaceId,
    }));

    const channelPlatforms = new Set(channels.map((channel) => channel.platform));
    const directPlatformDeliveries = Array.from(new Set(input.platforms)).flatMap((platform) =>
      channelPlatforms.has(platform)
        ? []
        : [
            {
              createdBy: input.createdBy,
              hashtagsOverride: input.hashtagsOverride ?? null,
              platform,
              publishedAt: input.status === "published" ? new Date() : null,
              postId: input.postId,
              scheduledAt: input.scheduledAt ?? null,
              status: input.status,
              workspaceId: input.workspaceId,
            },
          ]
    );

    const values = [...channelDeliveries, ...directPlatformDeliveries] as NewSocialPostDelivery[];

    if (!values.length) {
      return [];
    }

    return await db.insert(socialPostDeliveries).values(values).returning();
  } catch (error) {
    if (
      isMissingSocialTableError(error, "social_post_deliveries") ||
      isMissingSocialTableError(error, "social_channels")
    ) {
      return [];
    }

    throw error;
  }
}

export async function refreshSocialPostFromDeliveries(postId: string) {
  try {
    const [post] = await db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.id, postId))
      .limit(1);

    if (!post) {
      return null;
    }

    const deliveries = await db
      .select()
      .from(socialPostDeliveries)
      .where(eq(socialPostDeliveries.postId, postId));

    if (!deliveries.length) {
      return post;
    }

    const publishedDates = deliveries
      .map((delivery) => delivery.publishedAt)
      .filter((value): value is Date => value instanceof Date);
    const nextScheduledDates = deliveries
      .map((delivery) => delivery.scheduledAt)
      .filter((value): value is Date => value instanceof Date)
      .sort((left, right) => left.getTime() - right.getTime());
    const aggregatedStatus = statusFromDeliveryState({
      deliveryStatuses: deliveries.map((delivery) => delivery.status),
      fallback: post.status,
      hasScheduledDate: nextScheduledDates.length > 0,
    });

    const [updatedPost] = await db
      .update(socialPosts)
      .set({
        comments: deliveries.reduce((total, delivery) => total + delivery.comments, 0),
        leadsGenerated: deliveries.reduce(
          (total, delivery) => total + delivery.leadsGenerated,
          0
        ),
        likes: deliveries.reduce((total, delivery) => total + delivery.likes, 0),
        publishedAt: publishedDates[0] ?? post.publishedAt,
        scheduledAt: nextScheduledDates[0] ?? post.scheduledAt,
        shares: deliveries.reduce((total, delivery) => total + delivery.shares, 0),
        status: aggregatedStatus,
        updatedAt: new Date(),
        views: deliveries.reduce((total, delivery) => total + delivery.views, 0),
      })
      .where(eq(socialPosts.id, postId))
      .returning();

    return updatedPost ?? post;
  } catch (error) {
    if (isMissingSocialTableError(error, "social_post_deliveries")) {
      return null;
    }

    throw error;
  }
}
