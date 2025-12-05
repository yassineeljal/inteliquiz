import { pgTable, text, timestamp, uuid, integer, boolean, json } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk ID
  email: text("email").notNull(),
  name: text("name"),
  xp: integer("xp").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastStudyDate: timestamp("last_study_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const decks = pgTable("decks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  summary: text("summary"), // AI Generated summary
  mindMap: json("mind_map"), // React Flow nodes and edges
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cards = pgTable("cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  deckId: uuid("deck_id").references(() => decks.id, { onDelete: "cascade" }).notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  tag: text("tag"), // Category
  
  // SRS Fields
  nextReviewDate: timestamp("next_review_date"),
  interval: integer("interval").default(0), // Days
  easeFactor: integer("ease_factor").default(250), // 2.5x scaled by 100
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
