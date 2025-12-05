import { getCards } from "@/actions/cards";
import { getDeck } from "@/actions/decks";
import { StudySession } from "@/components/StudySession";
import { notFound } from "next/navigation";

export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Verify deck exists and user has access
    await getDeck(id);
    const cards = await getCards(id);

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-background flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <StudySession deckId={id} cards={cards} />
        </main>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
