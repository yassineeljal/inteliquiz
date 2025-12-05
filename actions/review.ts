"use server";

import { db } from "@/db";
import { cards, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { calculateSRS } from "@/lib/srs";
import { revalidatePath } from "next/cache";

async function updateUserProgress(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return;

  const now = new Date();
  const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
  
  let newStreak = user.streak;
  
  // Check if we need to update streak
  if (lastStudy) {
    const isToday = lastStudy.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === lastStudy.toDateString();
    
    // Reset date for other calculations
    now.setDate(new Date().getDate());

    if (!isToday) {
      if (isYesterday) {
        newStreak += 1;
      } else {
        newStreak = 1; // Reset if missed a day
      }
    }
  } else {
    newStreak = 1; // First time studying
  }

  await db.update(users)
    .set({
      xp: (user.xp || 0) + 10, // 10 XP per card
      streak: newStreak,
      lastStudyDate: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function saveCardReview(cardId: string, quality: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Get current card state
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
  });

  if (!card) throw new Error("Card not found");

  // 2. Calculate new SRS values
  const currentInterval = card.interval || 0;
  const currentEaseFactor = card.easeFactor || 250;

  const result = calculateSRS(currentInterval, currentEaseFactor, quality);

  // 3. Update DB
  await db.update(cards)
    .set({
      interval: result.interval,
      easeFactor: result.easeFactor,
      nextReviewDate: result.nextReviewDate,
    })
    .where(eq(cards.id, cardId));

  // 4. Update User Progress (XP & Streak)
  await updateUserProgress(userId);

  revalidatePath(`/decks/${card.deckId}`);
  revalidatePath(`/decks/${card.deckId}/study`);
  revalidatePath("/dashboard");
}
