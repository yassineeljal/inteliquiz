"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
  onResult?: (quality: number) => void; // 0-5 for SRS
}

export function Flashcard({ front, back, isFlipped, onFlip, onResult }: FlashcardProps) {
  const t = useTranslations("Flashcard");

  return (
    <div className="perspective-1000 w-full max-w-xl mx-auto h-80 cursor-pointer" onClick={onFlip}>
      <motion.div
        className="relative w-full h-full transform-style-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Front */}
        <Card className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 shadow-xl dark:bg-card dark:border-gray-700">
          <CardContent className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{front}</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">{t("clickToFlip")}</p>
          </CardContent>
        </Card>

        {/* Back */}
        <Card 
          className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 shadow-xl bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900"
          style={{ transform: "rotateY(180deg)" }}
        >
          <CardContent className="text-center">
            <p className="text-xl text-gray-700 dark:text-gray-200 leading-relaxed">{back}</p>
            
            {/* SRS Buttons - Only show when flipped */}
            <div className="absolute bottom-6 left-0 w-full flex justify-center gap-4 px-4" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => onResult?.(1)}
                className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 text-sm font-medium transition-colors"
              >
                {t("hard")}
              </button>
              <button 
                onClick={() => onResult?.(3)}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-sm font-medium transition-colors"
              >
                {t("good")}
              </button>
              <button 
                onClick={() => onResult?.(5)}
                className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 text-sm font-medium transition-colors"
              >
                {t("easy")}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
