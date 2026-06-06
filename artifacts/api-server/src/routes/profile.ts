import { Router } from "express";
import { db, stylink_users, user_products } from "@workspace/db";
import { eq } from "drizzle-orm";

const profileRouter = Router();

profileRouter.put("/profile/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "ID invalide." }); return; }

  const { name, contact_name, city, bio, avatar_url } = req.body;
  try {
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (contact_name !== undefined) updates.contact_name = contact_name;
    if (city !== undefined) updates.city = city;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const [updated] = await db
      .update(stylink_users)
      .set(updates)
      .where(eq(stylink_users.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Utilisateur introuvable." }); return; }

    res.json({
      id: updated.id,
      type: updated.type,
      name: updated.name,
      contact_name: updated.contact_name,
      email: updated.email,
      city: updated.city,
      role: updated.role,
      bio: updated.bio,
      avatar_url: updated.avatar_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

profileRouter.get("/businesses", async (req, res) => {
  try {
    const businesses = await db
      .select({
        id: stylink_users.id,
        name: stylink_users.name,
        contact_name: stylink_users.contact_name,
        city: stylink_users.city,
        role: stylink_users.role,
        bio: stylink_users.bio,
        avatar_url: stylink_users.avatar_url,
      })
      .from(stylink_users)
      .where(eq(stylink_users.type, "business"))
      .orderBy(stylink_users.created_at);
    res.json(businesses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

profileRouter.get("/businesses/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "ID invalide." }); return; }
  try {
    const [business] = await db
      .select({
        id: stylink_users.id,
        name: stylink_users.name,
        contact_name: stylink_users.contact_name,
        city: stylink_users.city,
        role: stylink_users.role,
        bio: stylink_users.bio,
        avatar_url: stylink_users.avatar_url,
      })
      .from(stylink_users)
      .where(eq(stylink_users.id, id))
      .limit(1);
    if (!business) { res.status(404).json({ error: "Introuvable." }); return; }
    const products = await db
      .select()
      .from(user_products)
      .where(eq(user_products.user_id, id))
      .orderBy(user_products.created_at);
    res.json({ ...business, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

profileRouter.get("/products", async (req, res) => {
  try {
    const products = await db
      .select({
        id: user_products.id,
        user_id: user_products.user_id,
        name: user_products.name,
        description: user_products.description,
        price: user_products.price,
        category: user_products.category,
        image_url: user_products.image_url,
        created_at: user_products.created_at,
        seller_name: stylink_users.name,
        seller_role: stylink_users.role,
      })
      .from(user_products)
      .innerJoin(stylink_users, eq(user_products.user_id, stylink_users.id))
      .orderBy(user_products.created_at);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

profileRouter.get("/products/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) { res.status(400).json({ error: "ID invalide." }); return; }
  try {
    const products = await db
      .select()
      .from(user_products)
      .where(eq(user_products.user_id, userId))
      .orderBy(user_products.created_at);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

profileRouter.get("/products/item/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "ID invalide." }); return; }
  try {
    const [product] = await db
      .select({
        id: user_products.id,
        user_id: user_products.user_id,
        name: user_products.name,
        description: user_products.description,
        price: user_products.price,
        category: user_products.category,
        image_url: user_products.image_url,
        sizes: user_products.sizes,
        measurements: user_products.measurements,
        created_at: user_products.created_at,
        seller_name: stylink_users.name,
        seller_role: stylink_users.role,
        seller_city: stylink_users.city,
        seller_avatar: stylink_users.avatar_url,
      })
      .from(user_products)
      .innerJoin(stylink_users, eq(user_products.user_id, stylink_users.id))
      .where(eq(user_products.id, id))
      .limit(1);
    if (!product) { res.status(404).json({ error: "Article introuvable." }); return; }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

profileRouter.post("/products", async (req, res) => {
  const { user_id, name, description, price, category, image_url, sizes, measurements } = req.body;
  if (!user_id || !name || price === undefined) {
    res.status(400).json({ error: "Champs requis manquants." });
    return;
  }
  try {
    const [product] = await db
      .insert(user_products)
      .values({ user_id, name, description, price: String(price), category, image_url, sizes, measurements })
      .returning();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

profileRouter.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "ID invalide." }); return; }
  try {
    await db.delete(user_products).where(eq(user_products.id, id));
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

export default profileRouter;
