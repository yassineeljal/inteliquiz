"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { validateSpokenAnswer } from "@/actions/voice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";

interface VoiceExaminerProps {
  question: string;
  answer: string;
  onResult: (score: number) => void;
}

export function VoiceExaminer({ question, answer, onResult }: VoiceExaminerProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const recognitionRef = useRef<any>(null);
  const t = useTranslations("VoiceExaminer");
  const locale = useLocale();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = locale === "fr" ? "fr-FR" : "en-US";

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          toast.error(t("errorMic"));
        };
      }
    }
  }, [t]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error(t("errorSupport"));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      handleSubmission();
    } else {
      setTranscript("");
      setFeedback(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmission = async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      const result = await validateSpokenAnswer(transcript, answer, question, locale);
      
      setFeedback({
        isCorrect: result.isCorrect,
        message: result.feedback,
      });

      // Map 0-100 score to our 1-5 rating system roughly
      // > 90 = 5 (Easy)
      // > 70 = 3 (Good)
      // < 70 = 1 (Hard)
      let rating = 1;
      if (result.score > 90) rating = 5;
      else if (result.score > 60) rating = 3;
      
      // We don't auto-advance immediately so they can read feedback
      // But we pass the score up
      // onResult(rating); 
    } catch (error) {
      toast.error(t("errorValidate"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto mt-6">
      <div className={cn(
        "w-full p-4 rounded-lg border min-h-[100px] flex items-center justify-center text-center transition-colors",
        isListening ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-gray-200 dark:border-gray-800"
      )}>
        {transcript ? (
          <p className="text-lg text-gray-800 dark:text-gray-200">{transcript}</p>
        ) : (
          <p className="text-gray-400 italic">{t("tapToSpeak")}...</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          className={cn("rounded-full h-16 w-16 shadow-lg transition-all", isListening && "animate-pulse")}
          onClick={toggleListening}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      </div>

      {feedback && (
        <div className={cn(
          "w-full p-4 rounded-lg border animate-in fade-in slide-in-from-bottom-2",
          feedback.isCorrect 
            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
            : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
        )}>
          <div className="flex items-start gap-3">
            {feedback.isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div>
              <p className={cn("font-semibold", feedback.isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300")}>
                {feedback.isCorrect ? t("correct") : t("incorrect")}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {feedback.message}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => onResult(feedback.isCorrect ? 5 : 1)}
             >
               Continue
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}
