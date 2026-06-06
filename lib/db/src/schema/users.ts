import { pgTable, serial, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";

export const stylink_users = pgTable("stylink_users", {
  id:           serial("id").primaryKey(),
  type:         text("type").notNull(),
  name:         text("name").notNull(),
  contact_name: text("contact_name"),
  email:        text("email").notNull().unique(),
  password_hash:text("password_hash").notNull(),
  city:         text("city"),
  role:         text("role"),
  bio:          text("bio"),
  avatar_url:   text("avatar_url"),
  created_at:   timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const user_products = pgTable("user_products", {
  id:          serial("id").primaryKey(),
  user_id:     integer("user_id").notNull().references(() => stylink_users.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  description: text("description"),
  price:       numeric("price", { precision: 10, scale: 2 }).notNull(),
  category:    text("category"),
  image_url:    text("image_url"),
  sizes:        text("sizes"),
  measurements: text("measurements"),
  created_at:   timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type DbUser = typeof stylink_users.$inferSelect;
export type DbProduct = typeof user_products.$inferSelect;
