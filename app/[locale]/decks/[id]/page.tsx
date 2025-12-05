import { getDeck } from "@/actions/decks";
import { getCards } from "@/actions/cards";
import { CreateCardDialog } from "@/components/CreateCardDialog";
import { DeleteDeckButton } from "@/components/DeleteDeckButton";
import { DeleteCardButton } from "@/components/DeleteCardButton";
import { EditCardDialog } from "@/components/EditCardDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MindMap } from "@/components/MindMap";
import { ArrowLeft, Play, FileText, Network, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function DeckPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const t = await getTranslations("DeckDetails");
  
  try {
    const deck = await getDeck(id);
    const cards = await getCards(id);

    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-background p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center mb-6 text-sm font-medium">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("backToDashboard")}
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{deck.title}</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">{deck.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {cards.length} {t("cards")}
                  </span>
                  {deck.summary && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      {t("aiSummary")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <DeleteDeckButton deckId={deck.id} />
                <CreateCardDialog deckId={deck.id} />
                <Link href={`/decks/${deck.id}/study`} className="flex-1 md:flex-none">
                  <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105" disabled={cards.length === 0}>
                    <Play className="mr-2 h-4 w-4" /> {t("startStudy")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* AI Summary Section */}
          {deck.summary && (
            <Card className="mb-8 border-none shadow-md bg-gradient-to-br from-white to-indigo-50/50 dark:from-card dark:to-indigo-950/10 overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                  {t("courseSummary")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                  {deck.summary.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="cards" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="cards" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                <Layers className="h-4 w-4 mr-2" /> {t("flashcards")}
              </TabsTrigger>
              <TabsTrigger value="mindmap" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                <Network className="h-4 w-4 mr-2" /> {t("mindMap")}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cards" className="mt-0">
              <div className="grid gap-4">
                {cards.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layers className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t("noCards")}</h3>
                    <p className="text-muted-foreground mb-6">Add some cards manually or generate them with AI.</p>
                    <CreateCardDialog deckId={deck.id} />
                  </div>
                ) : (
                  cards.map((card) => (
                    <Card key={card.id} className="relative group hover:shadow-md transition-all duration-200 border-none shadow-sm bg-white dark:bg-card">
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <EditCardDialog card={card} />
                        <DeleteCardButton cardId={card.id} />
                      </div>
                      <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                        <div className="relative">
                          <span className="absolute -top-2 -left-2 text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">{t("front")}</span>
                          <p className="text-gray-900 dark:text-gray-100 mt-4 text-lg leading-relaxed">{card.front}</p>
                        </div>
                        <div className="relative md:border-l md:pl-6 dark:border-gray-800">
                          <span className="absolute -top-2 -left-2 md:left-4 text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">{t("back")}</span>
                          <p className="text-gray-900 dark:text-gray-100 mt-4 text-lg leading-relaxed">{card.back}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="mindmap" className="mt-0">
              <Card className="border-none shadow-md overflow-hidden h-[600px] bg-white dark:bg-card">
                {deck.mindMap ? (
                  <MindMap data={deck.mindMap as any} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <Network className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-muted-foreground">{t("noMindMap")}</p>
                    <p className="text-sm text-muted-foreground mt-2">Try generating a new deck with AI to get a mind map.</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
