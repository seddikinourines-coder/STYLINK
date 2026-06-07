const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function query(sql, params = []) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ query: sql, params }),
  });
  return res;
}

async function supabase(path, method, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": method === "POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

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

  const { type, name, contactName, email, password, city, role } = body;

  if (!type || !name || !email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: "Champs obligatoires manquants." }) };
  }

  // Check if email already exists
  const checkRes = await supabase(
    `stylink_users?email=eq.${encodeURIComponent(email)}&select=id`,
    "GET"
  );
  const existing = await checkRes.json();
  if (existing.length > 0) {
    return {
      statusCode: 409,
      body: JSON.stringify({ error: "Un compte avec cet email existe déjà." }),
    };
  }

  // Insert new user
  const insertRes = await supabase("stylink_users", "POST", {
    type,
    name,
    contact_name: contactName || null,
    email,
    password, // plain text for demo; upgrade to hashed in production
    city: city || null,
    role: role || null,
  });

  if (!insertRes.ok) {
    const err = await insertRes.json();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Erreur lors de la création du compte." }),
    };
  }

  const [user] = await insertRes.json();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  };
};
