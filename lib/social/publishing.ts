import "server-only";

import { eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import {
  socialChannels,
  socialPostDeliveries,
  socialPostDetails,
  socialPosts,
} from "@/db/schema";
import {
  isMissingSocialTableError,
  refreshSocialPostFromDeliveries,
} from "@/lib/social/repository";

type JsonRecord = Record<string, unknown>;

type PublishDueSocialDeliveriesOptions = {
  limit?: number;
  workspaceId?: string;
};

type PublishAttemptResult =
  | {
      error: string;
      ok: false;
      skipped?: false;
    }
  | {
      ok: false;
      reason: string;
      skipped: true;
    }
  | {
      externalPostId?: string | null;
      externalUrl?: string | null;
      ok: true;
      publishedAt?: Date | null;
    };

export type PublishDueSocialDeliveriesResult = {
  failed: number;
  processed: number;
  published: number;
  skipped: number;
};

function asObject(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function getWebhookHeaders(authConfig: unknown) {
  const config = asObject(authConfig);
  const headers = new Headers({ "Content-Type": "application/json" });
  const bearerToken = typeof config.bearerToken === "string" ? config.bearerToken : null;
  const extraHeaders = asObject(config.headers);

  if (bearerToken) {
    headers.set("Authorization", `Bearer ${bearerToken}`);
  }

  for (const [key, value] of Object.entries(extraHeaders)) {
    if (typeof value === "string" && value.trim()) {
      headers.set(key, value);
    }
  }

  return headers;
}

async function markDeliveryFailure(deliveryId: string, message: string, attempts: number) {
  await db
    .update(socialPostDeliveries)
    .set({
      attempts,
      lastAttemptAt: new Date(),
      lastError: message,
      nextRetryAt:
        attempts >= 3 ? null : new Date(Date.now() + attempts * 30 * 60 * 1000),
      status: "failed",
      updatedAt: new Date(),
    })
    .where(eq(socialPostDeliveries.id, deliveryId));
}

async function publishViaWebhook(input: {
  channel: typeof socialChannels.$inferSelect | null;
  delivery: typeof socialPostDeliveries.$inferSelect;
  detail: typeof socialPostDetails.$inferSelect | null;
  post: typeof socialPosts.$inferSelect;
}): Promise<PublishAttemptResult> {
  const { channel, delivery, detail, post } = input;
  const autoPublishEnabled = Boolean(detail?.autoPublish || channel?.autoPublish);

  if (!autoPublishEnabled) {
    return {
      ok: false,
      reason: "Auto publication désactivée pour ce post ou ce canal.",
      skipped: true,
    };
  }

  if (!channel) {
    return {
      error: "Aucun canal connecté n'est associé à cette livraison.",
      ok: false,
    };
  }

  if (channel.status !== "connected") {
    return {
      error: `Canal ${channel.name} non prêt (${channel.status}).`,
      ok: false,
    };
  }

  if (channel.provider !== "webhook" || !channel.webhookUrl) {
    return {
      error: `Canal ${channel.name} sans endpoint webhook exploitable.`,
      ok: false,
    };
  }

  const response = await fetch(channel.webhookUrl, {
    method: "POST",
    headers: getWebhookHeaders(channel.authConfig),
    body: JSON.stringify({
      channel: {
        externalAccountId: channel.externalAccountId,
        handle: channel.handle,
        id: channel.id,
        name: channel.name,
        platform: channel.platform,
        provider: channel.provider,
      },
      delivery: {
        hashtags: delivery.hashtagsOverride || post.hashtags,
        id: delivery.id,
        platform: delivery.platform,
        scheduledAt: delivery.scheduledAt?.toISOString() ?? null,
      },
      post: {
        callToAction: detail?.callToAction ?? null,
        content: delivery.captionOverride || post.content,
        hashtags: delivery.hashtagsOverride || post.hashtags,
        id: post.id,
        title: post.title,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      error: errorText || `Webhook response status ${response.status}`,
      ok: false,
    };
  }

  let payload: JsonRecord = {};

  try {
    payload = asObject(await response.json());
  } catch {}

  const publishedAt =
    typeof payload.publishedAt === "string" ? new Date(payload.publishedAt) : new Date();

  return {
    externalPostId:
      typeof payload.externalPostId === "string" ? payload.externalPostId : null,
    externalUrl: typeof payload.externalUrl === "string" ? payload.externalUrl : null,
    ok: true,
    publishedAt,
  };
}

async function updateDetailSyncState(input: {
  error?: string | null;
  postId: string;
  syncedAt: Date;
}) {
  try {
    await db
      .update(socialPostDetails)
      .set({
        lastError: input.error ?? null,
        lastSyncedAt: input.syncedAt,
        updatedAt: new Date(),
      })
      .where(eq(socialPostDetails.postId, input.postId));
  } catch (error) {
    if (isMissingSocialTableError(error, "social_post_details")) {
      return;
    }

    throw error;
  }
}

function isDueDelivery(
  delivery: typeof socialPostDeliveries.$inferSelect,
  now: Date
) {
  if (delivery.status === "scheduled") {
    return !delivery.scheduledAt || delivery.scheduledAt <= now;
  }

  if (delivery.status === "failed") {
    return Boolean(delivery.nextRetryAt && delivery.nextRetryAt <= now);
  }

  return false;
}

export async function publishDueSocialDeliveries(
  options: PublishDueSocialDeliveriesOptions = {}
): Promise<PublishDueSocialDeliveriesResult> {
  let deliveryRows: typeof socialPostDeliveries.$inferSelect[] = [];

  try {
    deliveryRows = options.workspaceId
      ? await db
          .select()
          .from(socialPostDeliveries)
          .where(eq(socialPostDeliveries.workspaceId, options.workspaceId))
      : await db.select().from(socialPostDeliveries);
  } catch (error) {
    if (isMissingSocialTableError(error, "social_post_deliveries")) {
      return { failed: 0, processed: 0, published: 0, skipped: 0 };
    }

    throw error;
  }

  const now = new Date();
  const dueDeliveries = deliveryRows
    .filter((delivery) => isDueDelivery(delivery, now))
    .sort((left, right) => {
      const leftValue = left.scheduledAt?.getTime() ?? 0;
      const rightValue = right.scheduledAt?.getTime() ?? 0;
      return leftValue - rightValue;
    })
    .slice(0, options.limit ?? 25);

  if (!dueDeliveries.length) {
    return { failed: 0, processed: 0, published: 0, skipped: 0 };
  }

  const postIds = dueDeliveries.map((delivery) => delivery.postId);
  const channelIds = dueDeliveries
    .map((delivery) => delivery.channelId)
    .filter((value): value is string => Boolean(value));
  const [posts, details, channels] = await Promise.all([
    db.select().from(socialPosts).where(inArray(socialPosts.id, postIds)),
    db
      .select()
      .from(socialPostDetails)
      .where(inArray(socialPostDetails.postId, postIds))
      .catch((error) => {
        if (isMissingSocialTableError(error, "social_post_details")) {
          return [];
        }

        throw error;
      }),
    channelIds.length
      ? db
          .select()
          .from(socialChannels)
          .where(inArray(socialChannels.id, channelIds))
          .catch((error) => {
            if (isMissingSocialTableError(error, "social_channels")) {
              return [];
            }

            throw error;
          })
      : Promise.resolve([]),
  ]);
  const postMap = new Map(posts.map((post) => [post.id, post]));
  const detailMap = new Map(details.map((detail) => [detail.postId, detail]));
  const channelMap = new Map(channels.map((channel) => [channel.id, channel]));
  const result: PublishDueSocialDeliveriesResult = {
    failed: 0,
    processed: 0,
    published: 0,
    skipped: 0,
  };

  for (const delivery of dueDeliveries) {
    const post = postMap.get(delivery.postId);

    if (!post) {
      result.failed += 1;
      await markDeliveryFailure(
        delivery.id,
        "Post introuvable pour cette livraison.",
        delivery.attempts + 1
      );
      continue;
    }

    result.processed += 1;
    const channel = delivery.channelId ? channelMap.get(delivery.channelId) ?? null : null;
    const detail = detailMap.get(delivery.postId) ?? null;
    const attempt = await publishViaWebhook({
      channel,
      delivery,
      detail,
      post,
    });

    if (attempt.ok) {
      await db
        .update(socialPostDeliveries)
        .set({
          attempts: delivery.attempts + 1,
          externalPostId: attempt.externalPostId ?? null,
          externalUrl: attempt.externalUrl ?? null,
          lastAttemptAt: now,
          lastError: null,
          nextRetryAt: null,
          publishedAt: attempt.publishedAt ?? now,
          status: "published",
          updatedAt: new Date(),
        })
        .where(eq(socialPostDeliveries.id, delivery.id));

      await updateDetailSyncState({
        error: null,
        postId: post.id,
        syncedAt: now,
      });

      await refreshSocialPostFromDeliveries(post.id);
      result.published += 1;
      continue;
    }

    if (attempt.skipped) {
      result.skipped += 1;
      continue;
    }

    await markDeliveryFailure(delivery.id, attempt.error, delivery.attempts + 1);
    await updateDetailSyncState({
      error: attempt.error,
      postId: post.id,
      syncedAt: now,
    });
    await refreshSocialPostFromDeliveries(post.id);
    result.failed += 1;
  }

  return result;
}
