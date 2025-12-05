"use client";

import { useState, useEffect, useCallback } from "react";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useReviewStore } from "@/store/useReviewStore";
import { ArrowLeft, RotateCcw, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { saveCardReview } from "@/actions/review";
import { toast } from "sonner";
import { Mic, MicOff } from "lucide-react";
import { VoiceExaminer } from "@/components/VoiceExaminer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import confetti from "canvas-confetti";
import { useTranslations } from "next-intl";

interface StudySessionProps {
  deckId: string;
  cards: {
    id: string;
    front: string;
    back: string;
  }[];
}

export function StudySession({ deckId, cards }: StudySessionProps) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const { 
    currentCardIndex, 
    isReviewing, 
    startReview, 
    nextCard, 
    recordResult, 
    reset 
  } = useReviewStore();
  const t = useTranslations("StudySession");

  // Initialize session on mount
  useEffect(() => {
    startReview();
    return () => reset();
  }, [startReview, reset]);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  // Handle voice result
  const handleVoiceResult = (score: number) => {
    setIsFlipped(true); // Show back of card
    handleResult(score);
  };

  const handleResult = useCallback(async (quality: number) => {
    const currentCard = cards[currentCardIndex];
    
    // Optimistic update (move to next card immediately)
    recordResult(currentCard.id, quality);
    nextCard();

    // Save to DB in background
    try {
      await saveCardReview(currentCard.id, quality);
    } catch (error) {
      console.error("Failed to save review", error);
      toast.error("Failed to save progress");
    }
  }, [cards, currentCardIndex, recordResult, nextCard]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (!isReviewing || currentCardIndex >= cards.length) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (isFlipped) {
        // Only allow rating if flipped
        if (e.key === "1") handleResult(1); // Hard
        if (e.key === "2") handleResult(3); // Good
        if (e.key === "3") handleResult(5); // Easy
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReviewing, currentCardIndex, cards.length, isFlipped, handleResult]);

  // Trigger confetti on completion
  useEffect(() => {
    if (isReviewing && currentCardIndex >= cards.length && cards.length > 0) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const random = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isReviewing, currentCardIndex, cards.length]);

  // Loading state or empty deck
  if (!isReviewing) return null;

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">This deck is empty</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Add some cards before studying!</p>
        <Link href={`/decks/${deckId}`}>
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("returnToDeck")}
          </Button>
        </Link>
      </div>
    );
  }

  // End of session
  if (currentCardIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-center bg-white dark:bg-card p-8 rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-900"
        >
          <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Trophy className="h-12 w-12 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("sessionComplete")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{t("greatJob")}</p>
          
          <div className="flex flex-col gap-3 w-full">
            <Button onClick={() => reset()} className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
              <RotateCcw className="mr-2 h-5 w-5" /> {t("restartSession")}
            </Button>
            <Link href={`/decks/${deckId}`} className="w-full">
              <Button variant="outline" className="w-full h-12 text-lg border-2 hover:bg-muted/50">
                <ArrowLeft className="mr-2 h-5 w-5" /> {t("returnToDeck")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex) / cards.length) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full flex flex-col gap-4 mb-8 px-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Card {currentCardIndex + 1} of {cards.length}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 bg-white dark:bg-card px-3 py-1.5 rounded-full border shadow-sm">
              <Switch 
                id="voice-mode" 
                checked={isVoiceMode}
                onCheckedChange={setIsVoiceMode}
              />
              <Label htmlFor="voice-mode" className="flex items-center gap-1.5 text-sm cursor-pointer font-medium">
                {isVoiceMode ? <Mic className="h-3.5 w-3.5 text-red-500" /> : <MicOff className="h-3.5 w-3.5 text-gray-400" />}
                {t("voiceMode")}
              </Label>
            </div>
            <Link href={`/decks/${deckId}`}>
              <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400">Exit</Button>
            </Link>
          </div>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="w-full py-8 relative flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <Flashcard 
              front={currentCard.front} 
              back={currentCard.back} 
              isFlipped={isFlipped}
              onFlip={() => !isVoiceMode && setIsFlipped(!isFlipped)} 
              onResult={handleResult} 
            />
          </motion.div>
        </AnimatePresence>

        {isVoiceMode && !isFlipped && (
          <div className="mt-8 w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
            <VoiceExaminer 
              question={currentCard.front}
              answer={currentCard.back}
              onResult={handleVoiceResult}
            />
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500 space-y-2">
        <p>Tap card or press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono border border-gray-200 dark:border-gray-700">Space</kbd> to flip</p>
        {isFlipped && (
          <p className="text-xs flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><kbd className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded font-mono border border-red-100 dark:border-red-900">1</kbd> Hard</span>
            <span className="flex items-center gap-1"><kbd className="px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded font-mono border border-yellow-100 dark:border-yellow-900">2</kbd> Good</span>
            <span className="flex items-center gap-1"><kbd className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded font-mono border border-green-100 dark:border-green-900">3</kbd> Easy</span>
          </p>
        )}
      </div>
    </div>
  );
}
