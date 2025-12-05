import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Sparkles, Zap, Trophy, Clock, Upload, ArrowRight, GraduationCap } from "lucide-react";

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
            <Brain className="h-6 w-6" />
            Inteliquiz
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ModeToggle />
            <Link href="/sign-in">
              <Button variant="ghost">{t('signIn')}</Button>
            </Link>
            <Link href="/dashboard">
              <Button>{t('getStarted')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center container mx-auto px-4 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-3xl -z-10" />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border border-indigo-100 dark:border-indigo-800">
            <Sparkles className="h-4 w-4" />
            <span>{t('poweredBy')}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-2" dangerouslySetInnerHTML={{ __html: t.raw('heroTitle') }} />
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 leading-relaxed">
            {t('heroSubtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                {t('startLearning')} <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted/50 transition-all">
                {t('howItWorks')}
              </Button>
            </Link>
          </div>

          {/* Stats / Social Proof */}
          <div className="mt-16 pt-8 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-200">
            {[
              { label: t('stats.activeLearners'), value: "10k+" },
              { label: t('stats.cardsGenerated'), value: "1M+" },
              { label: t('stats.successRate'), value: "98%" },
              { label: t('stats.timeSaved'), value: "100h+" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t('featuresTitle')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Large Card - AI Generation */}
              <Card className="md:col-span-2 md:row-span-2 border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-indigo-950/30 overflow-hidden relative group hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                    <Upload className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">{t('features.pdfToFlashcards.title')}</CardTitle>
                  <CardDescription className="text-lg">
                    {t('features.pdfToFlashcards.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative min-h-[300px]">
                  <div className="absolute right-0 bottom-0 w-4/5 h-4/5 bg-background rounded-tl-2xl border shadow-2xl p-6 translate-x-8 translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 w-3/4 bg-muted rounded-full" />
                        <div className="h-3 w-1/2 bg-muted rounded-full" />
                      </div>
                      <div className="h-32 w-full bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex flex-col items-center justify-center text-indigo-600/50 dark:text-indigo-400/50 gap-2">
                        <Sparkles className="h-8 w-8 animate-pulse" />
                        <span className="text-sm font-medium">{t('features.pdfToFlashcards.generating')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-20 bg-muted/50 rounded-lg border border-dashed" />
                        <div className="h-20 bg-muted/50 rounded-lg border border-dashed" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card - Spaced Repetition */}
              <Card className="bg-background hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-green-100 dark:border-green-900/30">
                <CardHeader>
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-3 text-green-600 dark:text-green-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <CardTitle>{t('features.spacedRepetition.title')}</CardTitle>
                  <CardDescription>
                    {t('features.spacedRepetition.description')}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Card - Gamification */}
              <Card className="bg-background hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-yellow-100 dark:border-yellow-900/30">
                <CardHeader>
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center mb-3 text-yellow-600 dark:text-yellow-400">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <CardTitle>{t('features.gamification.title')}</CardTitle>
                  <CardDescription>
                    {t('features.gamification.description')}
                  </CardDescription>
                </CardHeader>
              </Card>



              {/* Card - Voice Mode */}
              <Card className="bg-background hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-purple-100 dark:border-purple-900/30">
                <CardHeader>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-3 text-purple-600 dark:text-purple-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <CardTitle>{t('features.voiceMode.title')}</CardTitle>
                  <CardDescription>
                    {t('features.voiceMode.description')}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Card - Mind Maps */}
              <Card className="bg-background hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-blue-100 dark:border-blue-900/30">
                <CardHeader>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                    <Brain className="h-5 w-5" />
                  </div>
                  <CardTitle>{t('features.mindMaps.title')}</CardTitle>
                  <CardDescription>
                    {t('features.mindMaps.description')}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t bg-background">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-2 font-bold text-xl text-foreground mb-4">
              <Brain className="h-6 w-6" />
              Inteliquiz
            </div>
            <p className="mb-4">Built with Next.js 15, Tailwind, and Gemini AI.</p>
            <p className="text-sm">© 2025 Inteliquiz. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
