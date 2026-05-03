import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Mood } from "@/components/MoodSelector";
import { Loader2, ArrowRight, Heart, Wind, Sparkles, Sprout, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Step = 0 | 1 | 2 | 3 | 4; // 0 share, 1 reflect, 2 breathe, 3 activity, 4 affirm

interface Reflection { acknowledgement: string; reframe: string; }
interface Breathing { pattern_name: string; inhale_seconds: number; hold_seconds: number; exhale_seconds: number; cycles: number; intention: string; }
interface Activity { title: string; description: string; category: string; }
interface Affirmation { affirmation: string; intention: string; }

const STEP_META = [
  { label: "Share", icon: Heart },
  { label: "Reflect", icon: Sparkles },
  { label: "Breathe", icon: Wind },
  { label: "Act", icon: Sprout },
  { label: "Carry", icon: Check },
];

export function WorkflowJourney({
  open,
  onClose,
  mood,
}: {
  open: boolean;
  onClose: () => void;
  mood: Mood;
}) {
  const [step, setStep] = useState<Step>(0);
  const [share, setShare] = useState("");
  const [loading, setLoading] = useState(false);
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [breathing, setBreathing] = useState<Breathing | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);

  useEffect(() => {
    if (!open) {
      // reset on close after a short delay
      const t = setTimeout(() => {
        setStep(0); setShare(""); setReflection(null);
        setBreathing(null); setActivities(null); setAffirmation(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const callStep = async (which: "reflect" | "breathe" | "activity" | "affirm") => {
    const { data, error } = await supabase.functions.invoke("aethel-workflow", {
      body: { step: which, mood: mood.toLowerCase(), share },
    });
    if (error) throw error;
    if ((data as any)?.error) throw new Error((data as any).error);
    return (data as any).data;
  };

  const advance = async () => {
    setLoading(true);
    try {
      if (step === 0) { setReflection(await callStep("reflect")); setStep(1); }
      else if (step === 1) { setBreathing(await callStep("breathe")); setStep(2); }
      else if (step === 2) { setActivities(await callStep("activity")); setStep(3); }
      else if (step === 3) { setAffirmation(await callStep("affirm")); setStep(4); }
    } catch (e: any) {
      toast({ title: "A pause", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl bg-background border-foreground/10 p-0 overflow-hidden">
        {/* Progress rail */}
        <div className="px-8 pt-8">
          <div className="flex items-center justify-between gap-2">
            {STEP_META.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div key={s.label} className="flex-1 flex items-center gap-2">
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center border transition-all duration-500",
                      active && "border-candle bg-candle/10 text-candle shadow-[0_0_20px_-4px_hsl(var(--candle)/0.6)]",
                      done && "border-candle/60 bg-candle/5 text-candle/80",
                      !active && !done && "border-foreground/10 text-ash/50"
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  {i < STEP_META.length - 1 && (
                    <div className={cn("h-px flex-1 transition-colors duration-500", i < step ? "bg-candle/50" : "bg-foreground/10")} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[10px] tracking-[0.3em] uppercase text-ash text-center">
            Step {step + 1} of 5 · {STEP_META[step].label}
          </div>
        </div>

        <div className="px-8 pb-10 pt-8 min-h-[360px] flex flex-col">
          {step === 0 && (
            <ShareStep share={share} setShare={setShare} mood={mood} />
          )}
          {step === 1 && reflection && <ReflectStep r={reflection} />}
          {step === 2 && breathing && <BreatheStep b={breathing} />}
          {step === 3 && activities && <ActivityStep activities={activities} />}
          {step === 4 && affirmation && <AffirmStep a={affirmation} />}

          <div className="mt-auto pt-8 flex justify-between items-center">
            <button onClick={onClose} className="text-xs tracking-[0.2em] uppercase text-ash hover:text-candle transition-colors">
              Close
            </button>
            {step < 4 ? (
              <Button
                onClick={advance}
                disabled={loading || (step === 0 && share.trim().length === 0)}
                className="bg-candle/10 hover:bg-candle/20 text-candle border border-candle/40 rounded-full px-6"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : (
                  <>
                    {step === 0 ? "Begin journey" : "Continue"}
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={onClose}
                className="bg-candle/10 hover:bg-candle/20 text-candle border border-candle/40 rounded-full px-6"
              >
                Carry it with you
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShareStep({ share, setShare, mood }: { share: string; setShare: (s: string) => void; mood: Mood }) {
  return (
    <div className="animate-fade-up">
      <h2 className="font-serif italic text-3xl text-foreground mb-3">What weighs on you tonight?</h2>
      <p className="text-ash text-sm leading-relaxed mb-6">
        You feel <span className="text-candle italic">{mood.toLowerCase()}</span>. Share a sentence — or a paragraph. Aethel will guide you through five quiet steps.
      </p>
      <Textarea
        value={share}
        onChange={(e) => setShare(e.target.value)}
        maxLength={2000}
        rows={6}
        placeholder="Today, I've been feeling..."
        className="bg-foreground/5 border-foreground/10 text-foreground placeholder:text-ash/50 focus-visible:ring-candle/30"
      />
    </div>
  );
}

function ReflectStep({ r }: { r: Reflection }) {
  return (
    <div className="animate-fade-up space-y-5">
      <div className="text-[10px] tracking-[0.4em] uppercase text-candle/70">A gentle reflection</div>
      <p className="font-serif italic text-2xl text-foreground leading-relaxed">{r.acknowledgement}</p>
      <div className="h-px w-16 bg-candle/30" />
      <p className="text-ash text-base leading-relaxed">{r.reframe}</p>
    </div>
  );
}

function BreatheStep({ b }: { b: Breathing }) {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const start = () => {
    setRunning(true);
    setCycle(0);
    setPhase("inhale");
    runPhase("inhale", 0);
  };

  const runPhase = (p: "inhale" | "hold" | "exhale", c: number) => {
    setPhase(p);
    const dur = (p === "inhale" ? b.inhale_seconds : p === "hold" ? b.hold_seconds : b.exhale_seconds) * 1000;
    timerRef.current = window.setTimeout(() => {
      if (p === "inhale" && b.hold_seconds > 0) runPhase("hold", c);
      else if (p === "inhale" || p === "hold") runPhase("exhale", c);
      else {
        const next = c + 1;
        if (next >= b.cycles) { setRunning(false); return; }
        setCycle(next);
        runPhase("inhale", next);
      }
    }, dur);
  };

  const scale = phase === "inhale" ? "scale-100" : phase === "hold" ? "scale-100" : "scale-50";
  const dur = phase === "inhale" ? b.inhale_seconds : phase === "hold" ? b.hold_seconds : b.exhale_seconds;

  return (
    <div className="animate-fade-up flex flex-col items-center text-center">
      <div className="text-[10px] tracking-[0.4em] uppercase text-candle/70 mb-2">{b.pattern_name}</div>
      <p className="text-ash text-sm max-w-md mb-6">{b.intention}</p>

      <div className="relative size-44 flex items-center justify-center mb-4">
        <div
          className={cn("absolute inset-0 rounded-full bg-gradient-to-br from-candle/30 to-candle/5 transition-transform ease-in-out blur-sm")}
          style={{ transform: running ? (phase === "exhale" ? "scale(0.5)" : "scale(1)") : "scale(0.7)", transitionDuration: `${dur}s` }}
        />
        <div
          className={cn("absolute inset-4 rounded-full border border-candle/40 transition-transform ease-in-out", running ? scale : "scale-75")}
          style={{ transitionDuration: `${dur}s` }}
        />
        <div className="relative z-10 text-candle font-serif italic text-lg capitalize">
          {running ? phase : "Ready"}
        </div>
      </div>

      <div className="text-xs text-ash mb-4 tabular-nums">
        {b.inhale_seconds}s in · {b.hold_seconds > 0 ? `${b.hold_seconds}s hold · ` : ""}{b.exhale_seconds}s out · {b.cycles} cycles
      </div>
      {running ? (
        <div className="text-xs text-candle">Cycle {cycle + 1} of {b.cycles}</div>
      ) : (
        <Button
          onClick={start}
          variant="ghost"
          className="text-candle hover:bg-candle/10 border border-candle/30 rounded-full"
        >
          {cycle > 0 ? "Begin again" : "Begin breathing"}
        </Button>
      )}
    </div>
  );
}

function ActivityStep({ activities }: { activities: Activity[] }) {
  return (
    <div className="animate-fade-up">
      <div className="text-[10px] tracking-[0.4em] uppercase text-candle/70 mb-2">Small acts of care</div>
      <h3 className="font-serif italic text-2xl text-foreground mb-6">Pick one — just one</h3>
      <div className="space-y-3">
        {activities.map((a, i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-foreground/10 bg-foreground/5 hover:border-candle/40 hover:bg-candle/5 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-serif italic text-lg text-foreground">{a.title}</div>
                <p className="text-ash text-sm mt-1 leading-relaxed">{a.description}</p>
              </div>
              <span className="text-[9px] tracking-[0.2em] uppercase text-candle/70 border border-candle/30 rounded-full px-2 py-1 whitespace-nowrap">
                {a.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AffirmStep({ a }: { a: Affirmation }) {
  return (
    <div className="animate-fade-up flex flex-col items-center text-center justify-center h-full">
      <div className="text-[10px] tracking-[0.4em] uppercase text-candle/70 mb-6">Carry this with you</div>
      <p className="font-serif italic text-3xl sm:text-4xl text-foreground leading-tight max-w-lg text-balance">
        “{a.affirmation}”
      </p>
      <div className="mx-auto my-8 h-px w-24 bg-gradient-to-r from-transparent via-candle/40 to-transparent" />
      <div className="text-[10px] tracking-[0.3em] uppercase text-ash mb-2">Tiny intention</div>
      <p className="text-ash text-base max-w-md">{a.intention}</p>
    </div>
  );
}
