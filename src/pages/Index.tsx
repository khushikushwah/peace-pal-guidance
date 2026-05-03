import { useEffect, useState } from "react";
import { MoodSelector, Mood } from "@/components/MoodSelector";
import { VoiceOrb } from "@/components/VoiceOrb";
import { SuggestionGrid } from "@/components/SuggestionGrid";
import { ConversationPanel } from "@/components/ConversationPanel";
import { RecipesSection } from "@/components/RecipesSection";
import { SongsSection } from "@/components/SongsSection";
import { WorkflowJourney } from "@/components/WorkflowJourney";
import { Sparkles } from "lucide-react";

const greet = () => {
  const h = new Date().getHours();
  if (h < 5) return "The night is still";
  if (h < 12) return "The morning is quiet";
  if (h < 17) return "The afternoon settles";
  if (h < 21) return "The evening unfolds";
  return "The world is at rest";
};

const Index = () => {
  const [mood, setMood] = useState<Mood>("Seeking Stillness");
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState<string | null>(null);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTime(t);
  }, []);

  const beginConversation = (prompt?: string) => {
    setInitial(prompt ?? null);
    setOpen(true);
  };

  return (
    <main className="min-h-dvh text-foreground">
      {/* Top nav */}
      <nav className="px-6 sm:px-12 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-candle animate-candle-pulse shadow-[0_0_12px_hsl(var(--candle))]" />
          <div className="font-serif italic text-2xl text-candle leading-none">Aethel</div>
        </div>
        <div className="hidden sm:flex gap-10 text-[10px] tracking-[0.3em] uppercase font-light text-ash">
          <span className="text-foreground/70">Sanctuary</span>
          <span>Reflect</span>
          <span>Journey</span>
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase text-ash tabular-nums">
          {time}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 pb-24 pt-8">
        {/* Hero */}
        <section className="flex flex-col items-center text-center pt-8 sm:pt-16 mb-14 sm:mb-20 animate-fade-up">
          <p className="text-[10px] tracking-[0.4em] uppercase text-candle/70 mb-6">A Stress-Free AI Companion</p>
          <h1 className="font-serif italic text-5xl sm:text-7xl lg:text-8xl text-foreground leading-[1.05] text-balance max-w-4xl">
            {greet()},
            <br />
            <span className="text-ash">how is your heart?</span>
          </h1>
          <p className="mt-8 text-ash text-lg sm:text-xl font-light max-w-[42ch] leading-relaxed text-pretty">
            Share what weighs on you. Aethel will listen — and gently guide you toward calm,
            presence, and quiet joy.
          </p>
        </section>

        {/* Mood */}
        <section className="mb-16 sm:mb-20 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <p className="text-center text-[10px] tracking-[0.4em] uppercase text-ash mb-6">
            Tonight, you feel
          </p>
          <MoodSelector mood={mood} onChange={setMood} />
        </section>

        {/* Orb */}
        <section className="flex flex-col items-center mb-24 sm:mb-32 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <VoiceOrb
            isListening={false}
            isSpeaking={false}
            isThinking={false}
            onClick={() => beginConversation()}
            label="Begin"
          />
          <p className="mt-10 text-ash font-serif italic text-xl text-center max-w-[36ch]">
            Aethel is listening, with patience and warmth.
          </p>

          <button
            onClick={() => setJourneyOpen(true)}
            className="mt-10 group inline-flex items-center gap-3 px-7 py-3 rounded-full border border-candle/40 bg-candle/5 text-candle text-xs tracking-[0.3em] uppercase font-light hover:bg-candle/10 hover:shadow-[0_0_30px_-5px_hsl(var(--candle)/0.5)] transition-all duration-500"
          >
            <Sparkles className="size-3.5 group-hover:rotate-12 transition-transform" />
            Begin a 5-step journey
          </button>
          <p className="mt-3 text-[10px] tracking-[0.3em] uppercase text-ash/70">
            Share · Reflect · Breathe · Act · Carry
          </p>
        </section>

        {/* Suggestions */}
        <SuggestionGrid onPick={(p) => beginConversation(p)} />

        {/* Recipes */}
        <RecipesSection />

        {/* Songs */}
        <SongsSection />

        {/* Footer affirmation */}
        <footer className="mt-32 text-center">
          <div className="mx-auto mb-6 h-px w-24 bg-gradient-to-r from-transparent via-candle/40 to-transparent" />
          <p className="font-serif italic text-ash text-lg">You are doing enough. You are enough.</p>
        </footer>
      </div>

      <ConversationPanel
        open={open}
        onClose={() => setOpen(false)}
        mood={mood}
        initialPrompt={initial}
      />

      <WorkflowJourney
        open={journeyOpen}
        onClose={() => setJourneyOpen(false)}
        mood={mood}
      />
    </main>
  );
};

export default Index;
