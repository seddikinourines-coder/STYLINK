const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export const handler = async (event) => {
  if (event.httpMethod !== "PATCH") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { id, author_id, post_body } = JSON.parse(event.body ?? "{}");
  if (!id || !author_id || !post_body) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/feed_posts?id=eq.${encodeURIComponent(id)}&author_id=eq.${encodeURIComponent(author_id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({ body: post_body }),
    },
  );

  const data = await res.json();
  return {
    statusCode: res.ok ? 200 : 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(res.ok ? data[0] : { error: "Update failed" }),
  };
};
