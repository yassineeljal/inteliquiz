import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreateDeckDialog } from "@/components/CreateDeckDialog";
import { AIDeckGenerator } from "@/components/AIDeckGenerator";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { getDecks } from "@/actions/decks";
import { getUserStats } from "@/actions/user";
import { Link } from "@/i18n/routing";
import { Zap, Trophy, Star, Plus, Brain, BookOpen, Sparkles, Quote, ArrowRight } from "lucide-react";
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const decks = await getDecks();
  const user = await getUserStats();
  const t = await getTranslations('Dashboard');

  // Gamification Logic
  const xp = user?.xp || 0;
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const currentLevelBaseXp = Math.pow(level - 1, 2) * 100;
  const progressToNextLevel = ((xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100;

  const quotes = [
    t('quotes.q1'),
    t('quotes.q2'),
    t('quotes.q3'),
    t('quotes.q4')
  ];
  // Use a deterministic quote based on the day of the year to avoid hydration mismatches
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const randomQuote = quotes[dayOfYear % quotes.length];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-background p-4 md:p-8">
      {/* Header & Stats */}
      <header className="mb-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('welcome')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ModeToggle />
            <UserButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-yellow-50 dark:from-card dark:to-yellow-950/10">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('stats.dailyStreak')}</p>
                <h3 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  {user?.streak || 0} <span className="text-sm font-normal text-muted-foreground">{t('stats.days')}</span>
                </h3>
              </div>
              <div className="h-14 w-14 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center shadow-inner">
                <Zap className="h-7 w-7 text-yellow-600 dark:text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-indigo-50 dark:from-card dark:to-indigo-950/10">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('stats.currentLevel')}</p>
                <h3 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  {t('stats.lvl')} {level}
                </h3>
              </div>
              <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center shadow-inner">
                <Star className="h-7 w-7 text-indigo-600 dark:text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50 dark:from-card dark:to-green-950/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-muted-foreground">{t('stats.xpProgress')}</p>
                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  {xp} / {nextLevelXp} XP
                </span>
              </div>
              <Progress value={progressToNextLevel} className="h-2.5 bg-green-100 dark:bg-green-900/20" indicatorClassName="bg-green-500" />
              <p className="text-xs text-muted-foreground mt-3 text-right font-medium">
                {t('stats.xpToNextLevel', { xp: Math.round(nextLevelXp - xp), level: level + 1 })}
              </p>
            </CardContent>
          </Card>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Daily Inspiration Banner */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 flex items-center justify-between border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex gap-4 items-start">
            <div className="bg-white dark:bg-card p-2 rounded-full shadow-sm mt-1">
              <Quote className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-lg font-medium text-indigo-900 dark:text-indigo-100 italic">"{randomQuote}"</p>
              <p className="text-sm text-muted-foreground mt-1">{t('dailyInspiration')}</p>
            </div>
          </div>
          <div className="hidden md:block">
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                <Sparkles className="w-3 h-3 mr-1" /> {t('proTip')}
             </span>
          </div>
        </div>

        {/* Decks Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-500" />
            {t('myLibrary')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Action Cards */}
            <CreateDeckDialog />
            <AIDeckGenerator />

            {/* User Decks */}
            {decks.map((deck) => (
              <Card key={deck.id} className="group hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 bg-white dark:bg-card overflow-hidden relative flex flex-col h-[320px]">
                {/* Decorative Gradient Top Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                
                <CardHeader className="pb-4 flex-grow">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <CardTitle className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {deck.title}
                    </CardTitle>
                    {Number(deck.dueCards) > 0 && (
                      <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                        {Number(deck.dueCards)} {t('due')}
                      </span>
                    )}
                  </div>
                  <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                    {deck.description || "No description provided for this deck."}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 mt-auto pb-6 px-6">
                  <Link href={`/decks/${deck.id}`} className="w-full block">
                    <Button className="w-full bg-gray-50 hover:bg-indigo-600 text-gray-900 hover:text-white border border-gray-200 hover:border-transparent transition-all duration-300 shadow-sm group-hover:shadow-md h-10 font-medium">
                      {t('studyDeck')} <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
