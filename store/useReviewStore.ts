import { create } from 'zustand';

interface ReviewState {
  currentCardIndex: number;
  isReviewing: boolean;
  results: Record<string, number>; // cardId -> quality (0-5)
  
  startReview: () => void;
  endReview: () => void;
  nextCard: () => void;
  recordResult: (cardId: string, quality: number) => void;
  reset: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  currentCardIndex: 0,
  isReviewing: false,
  results: {},

  startReview: () => set({ isReviewing: true, currentCardIndex: 0, results: {} }),
  endReview: () => set({ isReviewing: false }),
  
  nextCard: () => set((state) => ({ currentCardIndex: state.currentCardIndex + 1 })),
  
  recordResult: (cardId, quality) => set((state) => ({
    results: { ...state.results, [cardId]: quality }
  })),

  reset: () => set({ currentCardIndex: 0, isReviewing: false, results: {} }),
}));
