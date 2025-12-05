"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteCard } from "@/actions/cards";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function DeleteCardButton({ cardId }: { cardId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations("DeleteCardButton");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCard(cardId);
      toast.success(t("success"));
    } catch (error) {
      console.error(error);
      toast.error(t("error"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="text-gray-400 hover:text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
