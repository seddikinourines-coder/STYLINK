const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const defaultHeaders = {
  "Content-Type": "application/json",
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

async function fetchSupabase(path, method, body) {
  const prefer = method === "POST" || method === "PATCH" ? "return=representation" : "return=minimal";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      ...defaultHeaders,
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

export const handler = async (event) => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Supabase configuration is missing." }),
    };
  }

  const method = event.httpMethod;
  const query = event.queryStringParameters || {};

  try {
    if (method === "GET") {
      const res = await fetchSupabase("feed_posts?select=*&order=created_at.desc", "GET");
      const records = await res.json();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
      };
    }

    if (method === "POST") {
      let body;
      try {
        body = JSON.parse(event.body || "{}");
      } catch {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON." }) };
      }

      const { id, author_id, author_name, author_role, body: postBody, image, images } = body;
      const isBodyEmpty = typeof postBody !== "string" || postBody.trim() === "";
      const rawImages = Array.isArray(images) ? images : image ? [image] : [];
      if (!id || !author_id || !author_name || !author_role || (isBodyEmpty && rawImages.length === 0)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: "Missing required fields for feed post creation. A body or image is required.",
          }),
        };
      }

      const imageValue = Array.isArray(images)
        ? JSON.stringify(images.filter((item) => typeof item === "string"))
        : image ?? null;

      const res = await fetchSupabase("feed_posts", "POST", {
        id,
        author_id,
        author_name,
        author_role,
        body: postBody ?? "",
        image: imageValue,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }));
        return { statusCode: res.status, body: JSON.stringify(error) };
      }

      const payload = await res.json();
      const record = Array.isArray(payload) ? payload[0] : payload;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      };
    }

    if (method === "PATCH") {
      let body;
      try {
        body = JSON.parse(event.body || "{}");
      } catch {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON." }) };
      }

      const id = query.id || body.id;
      if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing post id." }) };
      }

      const updates = {};
      if (body.body !== undefined) updates.body = body.body;
      if (body.images !== undefined) {
        const images = Array.isArray(body.images)
          ? body.images.filter((item) => typeof item === "string")
          : typeof body.images === "string"
            ? [body.images]
            : [];
        updates.image = images.length > 1 ? JSON.stringify(images) : images.length === 1 ? images[0] : null;
      } else if (body.image !== undefined) {
        updates.image = body.image;
      }

      if (Object.keys(updates).length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: "Nothing to update." }) };
      }

      const res = await fetchSupabase(`feed_posts?id=eq.${encodeURIComponent(id)}`, "PATCH", updates);
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }));
        return { statusCode: res.status, body: JSON.stringify(error) };
      }
      const payload = await res.json();
      const record = Array.isArray(payload) ? payload[0] : payload;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      };
    }

    if (method === "DELETE") {
      const id = query.id;
      if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing post id." }) };
      }
      const res = await fetchSupabase(`feed_posts?id=eq.${encodeURIComponent(id)}`, "DELETE");
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }));
        return { statusCode: res.status, body: JSON.stringify(error) };
      }
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true }),
      };
    }

    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed." }) };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error." }),
    };
  }
};
