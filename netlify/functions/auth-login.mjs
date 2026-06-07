const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function supabase(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
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

  const { email, password } = body;
  if (!email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: "Email et mot de passe requis." }) };
  }

  const res = await supabase(
    `stylink_users?email=eq.${encodeURIComponent(email)}&select=*`
  );
  const users = await res.json();

  if (!users || users.length === 0) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Aucun compte trouvé avec cet email." }),
    };
  }

  const user = users[0];
  if (user.password !== password) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Mot de passe incorrect." }),
    };
  }

  // Don't send password back to client
  const { password: _pw, ...safeUser } = user;
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(safeUser),
  };
};
