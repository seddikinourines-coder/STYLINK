const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { id, author_id, author_name, author_role, post_body, image } = body;
  if (!id || !author_id || !author_name || !author_role || !post_body) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/feed_posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      id,
      author_id,
      author_name,
      author_role,
      body: post_body,
      image: image ?? null,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { statusCode: 500, body: JSON.stringify({ error: data.message ?? "Insert failed" }) };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data[0]),
  };
};
