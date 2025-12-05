"use server";

import { db } from "@/db";
import { decks, users, cards } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, desc, sql, getTableColumns, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createDeck(title: string, description?: string, summary?: string) {
  const user = await currentUser();
  
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  // Ensure user exists in DB
  await db.insert(users).values({
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "no-email",
    name: user.firstName ? `${user.firstName} ${user.lastName || ""}` : "User",
  }).onConflictDoNothing().execute();

  await db.insert(decks).values({
    userId: user.id,
    title,
    description,
    summary,
  });

  revalidatePath("/dashboard");
}

export async function getDecks() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const userDecks = await db.select({
      ...getTableColumns(decks),
      dueCards: sql<number>`count(case when ${cards.nextReviewDate} <= now() or ${cards.nextReviewDate} is null then 1 else null end)`
    })
    .from(decks)
    .leftJoin(cards, eq(decks.id, cards.deckId))
    .where(eq(decks.userId, userId))
    .groupBy(decks.id)
    .orderBy(desc(decks.createdAt));

  return userDecks;
}

export async function getDeck(deckId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const deck = await db.query.decks.findFirst({
    where: eq(decks.id, deckId),
  });

  if (!deck || deck.userId !== userId) {
    throw new Error("Deck not found or unauthorized");
  }

  return deck;
}

export async function deleteDeck(deckId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
  });

  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  await db.delete(decks).where(eq(decks.id, deckId));

  revalidatePath("/dashboard");
}
