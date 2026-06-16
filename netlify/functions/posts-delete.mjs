const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export const handler = async (event) => {
  if (event.httpMethod !== "DELETE") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { id, author_id } = JSON.parse(event.body ?? "{}");
  if (!id || !author_id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing id or author_id" }) };
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/feed_posts?id=eq.${encodeURIComponent(id)}&author_id=eq.${encodeURIComponent(author_id)}`,
    {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
    },
  );

  return { statusCode: res.ok ? 200 : 500, body: res.ok ? "ok" : "error" };
};
