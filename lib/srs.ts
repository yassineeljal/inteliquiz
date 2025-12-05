export interface SRSResult {
  interval: number; // Days until next review
  easeFactor: number; // Multiplier for next interval
  nextReviewDate: Date;
}

export function calculateSRS(
  currentInterval: number,
  currentEaseFactor: number,
  quality: number // 0-5 (0=blackout, 5=perfect)
): SRSResult {
  let newInterval: number;
  let newEaseFactor: number;

  // If quality is less than 3, start over
  if (quality < 3) {
    newInterval = 1;
    newEaseFactor = currentEaseFactor; // Don't punish ease factor too much on fail
  } else {
    // Success
    if (currentInterval === 0) {
      newInterval = 1;
    } else if (currentInterval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * (currentEaseFactor / 100));
    }

    // Update Ease Factor (SM-2 formula)
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // We store EF multiplied by 100 to keep it integer in DB (250 = 2.5)
    const q = quality;
    const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    newEaseFactor = currentEaseFactor + Math.round(delta * 100);
  }

  // Cap Ease Factor (minimum 130 = 1.3)
  if (newEaseFactor < 130) newEaseFactor = 130;

  // Calculate Date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewDate,
  };
}
