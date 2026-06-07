import { FeedPost } from "@/data/mockData";

const API_BASE = "/api/feed-posts";

function formatTimestamp(createdAt: string): string {
  const date = new Date(createdAt);
  return date.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function parseImageValue(record: any): string[] | undefined {
  const raw = record.images ?? record.image;
  if (Array.isArray(raw)) {
    return raw.filter((item) => typeof item === "string");
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "string");
      }
    } catch {
      // not JSON, continue
    }
    return raw ? [raw] : undefined;
  }
  return undefined;
}

function toFeedPost(record: any): FeedPost {
  const images = parseImageValue(record);
  return {
    id: record.id,
    authorId: record.author_id,
    authorName: record.author_name,
    authorRole: record.author_role,
    body: record.body,
    image: images?.[0],
    images,
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

function normalizeRecord(result: any) {
  if (Array.isArray(result)) {
    return result[0];
  }
  return result;
}

function requireRecord(result: any) {
  const record = normalizeRecord(result);
  if (!record || typeof record !== "object") {
    throw new Error("Invalid feed post response from server.");
  }
  return record;
}

export async function createFeedPost(payload: {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  body: string;
  images?: string[] | null;
}): Promise<FeedPost> {
  const images = payload.images?.filter(Boolean) ?? [];
  const body = {
    id: payload.id,
    author_id: payload.authorId,
    author_name: payload.authorName,
    author_role: payload.authorRole,
    body: payload.body,
    image:
      images.length > 1
        ? JSON.stringify(images)
        : images.length === 1
          ? images[0]
          : null,
  };
  const result = await request(API_BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const record = requireRecord(result);
  return toFeedPost(record);
}

export async function updateFeedPost(postId: string, patch: {
  body?: string;
  images?: string[] | null;
}): Promise<FeedPost> {
  const payload: Record<string, any> = {};
  if (patch.body !== undefined) payload.body = patch.body;
  if (patch.images !== undefined) {
    const images = patch.images?.filter(Boolean) ?? [];
    payload.image = images.length > 1 ? JSON.stringify(images) : images.length === 1 ? images[0] : null;
  }

  const result = await request(`${API_BASE}?id=eq.${encodeURIComponent(postId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  const record = requireRecord(result);
  return toFeedPost(record);
}

export async function deleteFeedPost(postId: string): Promise<void> {
  await request(`${API_BASE}?id=eq.${encodeURIComponent(postId)}`, {
    method: "DELETE",
  });
}
