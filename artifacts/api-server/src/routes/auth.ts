import { Router } from "express";
import bcrypt from "bcrypt";
import { db, stylink_users } from "@workspace/db";
import { eq } from "drizzle-orm";

const authRouter = Router();

authRouter.post("/auth/register", async (req, res) => {
  const { type, name, contactName, email, password, city, role } = req.body;

  if (!type || !name || !email || !password) {
    res.status(400).json({ error: "Champs requis manquants." });
    return;
  }

  if (type === "business" && !role) {
    res.status(400).json({ error: "Le rôle est requis pour un compte professionnel." });
    return;
  }

  try {
    const existing = await db
      .select({ id: stylink_users.id })
      .from(stylink_users)
      .where(eq(stylink_users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Un compte existe déjà avec cet email." });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [inserted] = await db
      .insert(stylink_users)
      .values({
        type,
        name,
        contact_name: contactName ?? null,
        email: email.toLowerCase().trim(),
        password_hash,
        city: city ?? null,
        role: role ?? null,
      })
      .returning();

    res.status(201).json({
      id: inserted.id,
      type: inserted.type,
      name: inserted.name,
      contact_name: inserted.contact_name,
      email: inserted.email,
      city: inserted.city,
      role: inserted.role,
      bio: inserted.bio,
      avatar_url: inserted.avatar_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

authRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email et mot de passe requis." });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(stylink_users)
      .where(eq(stylink_users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Email ou mot de passe incorrect." });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Email ou mot de passe incorrect." });
      return;
    }

    res.json({
      id: user.id,
      type: user.type,
      name: user.name,
      contact_name: user.contact_name,
      email: user.email,
      city: user.city,
      role: user.role,
      bio: user.bio,
      avatar_url: user.avatar_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

authRouter.get("/auth/me", async (req, res) => {
  const { email } = req.query as { email?: string };
  if (!email) { res.status(400).json({ error: "Email requis." }); return; }
  try {
    const [user] = await db
      .select()
      .from(stylink_users)
      .where(eq(stylink_users.email, email.toLowerCase().trim()))
      .limit(1);
    if (!user) { res.status(404).json({ error: "Utilisateur introuvable." }); return; }
    res.json({
      id: user.id,
      type: user.type,
      name: user.name,
      contact_name: user.contact_name,
      email: user.email,
      city: user.city,
      role: user.role,
      bio: user.bio,
      avatar_url: user.avatar_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

export default authRouter;
