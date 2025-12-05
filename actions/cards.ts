"use server";

import { db } from "@/db";
import { cards, decks } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCard(deckId: string, front: string, back: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify deck ownership
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
  });

  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  await db.insert(cards).values({
    deckId,
    front,
    back,
  });

  revalidatePath(`/decks/${deckId}`);
}

export async function getCards(deckId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify deck ownership (optional but good for security)
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
  });

  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  const deckCards = await db.select()
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(desc(cards.createdAt));

  return deckCards;
}

export async function deleteCard(cardId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // We need to verify the card belongs to a deck owned by the user
  // Join cards -> decks -> check userId
  const card = await db.select({
      id: cards.id,
      deckId: cards.deckId,
      userId: decks.userId
    })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(eq(cards.id, cardId))
    .limit(1);

  if (card.length === 0 || card[0].userId !== userId) {
    throw new Error("Card not found or unauthorized");
  }

  await db.delete(cards).where(eq(cards.id, cardId));

  revalidatePath(`/decks/${card[0].deckId}`);
}

export async function updateCard(cardId: string, front: string, back: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const card = await db.select({
      id: cards.id,
      deckId: cards.deckId,
      userId: decks.userId
    })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(eq(cards.id, cardId))
    .limit(1);

  if (card.length === 0 || card[0].userId !== userId) {
    throw new Error("Card not found or unauthorized");
  }

  await db.update(cards)
    .set({ front, back })
    .where(eq(cards.id, cardId));

  revalidatePath(`/decks/${card[0].deckId}`);
}
