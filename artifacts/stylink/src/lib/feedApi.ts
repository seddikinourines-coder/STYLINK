import { FeedPost } from "@/data/mockData";

const API_BASE = "/api/feed-posts";

function formatTimestamp(createdAt: string): string {
  const date = new Date(createdAt);
  return date.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toFeedPost(record: any): FeedPost {
  return {
    id: record.id,
    authorId: record.author_id,
    authorName: record.author_name,
    authorRole: record.author_role,
    body: record.body,
    image: record.image ?? undefined,
    timestamp: record.created_at
      ? formatTimestamp(record.created_at)
      : "à l'instant",
    likes: 0,
    comments: 0,
  };
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error?.error || res.statusText);
  }

  return res.json();
}

export async function fetchFeedPosts(): Promise<FeedPost[]> {
  const records = await request(API_BASE, { method: "GET" });
  return Array.isArray(records) ? records.map(toFeedPost) : [];
}

export async function createFeedPost(payload: {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  body: string;
  image?: string | null;
}): Promise<FeedPost> {
  const body = {
    id: payload.id,
    author_id: payload.authorId,
    author_name: payload.authorName,
    author_role: payload.authorRole,
    body: payload.body,
    image: payload.image ?? null,
  };
  const [record] = await request(API_BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return toFeedPost(record);
}

export async function updateFeedPost(postId: string, patch: {
  body?: string;
  image?: string | null;
}): Promise<FeedPost> {
  const payload: Record<string, any> = {};
  if (patch.body !== undefined) payload.body = patch.body;
  if (patch.image !== undefined) payload.image = patch.image;

  const [record] = await request(`${API_BASE}?id=eq.${encodeURIComponent(postId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return toFeedPost(record);
}

export async function deleteFeedPost(postId: string): Promise<void> {
  await request(`${API_BASE}?id=eq.${encodeURIComponent(postId)}`, {
    method: "DELETE",
  });
}
