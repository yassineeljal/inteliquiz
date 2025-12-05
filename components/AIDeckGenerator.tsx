"use client";

import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { generateDeckFromPDF } from "@/actions/generate";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function AIDeckGenerator() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const t = useTranslations("AIDeckGenerator");

  return (
    <Card className="border-2 border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors h-[320px] flex flex-col justify-center">
      <CardContent className="flex flex-col items-center justify-center p-6">
        {isGenerating ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
            <p className="text-indigo-900 dark:text-indigo-100 font-medium">{t("analyzing")}</p>
            <p className="text-indigo-600 dark:text-indigo-400 text-sm">{t("crafting")}</p>
          </div>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-lg text-indigo-900 dark:text-indigo-100 mb-2">{t("generate")}</h3>
            <div className="w-full max-w-xs">
              <UploadButton
                endpoint="pdfUploader"
                onClientUploadComplete={async (res) => {
                  if (res && res[0]) {
                    setIsGenerating(true);
                    try {
                      const result = await generateDeckFromPDF(res[0].url);
                      router.push(`/decks/${result.deckId}`);
                    } catch (error) {
                      console.error(error);
                      setIsGenerating(false);
                      toast.error(t("error"));
                    }
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`${t("errorPrefix")} ${error.message}`);
                }}
                appearance={{
                  button: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-sm px-4 py-2 rounded-md w-full",
                  allowedContent: "hidden"
                }}
                content={{
                  button({ ready }) {
                    if (ready) return t("upload");
                    return t("loading");
                  }
                }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
