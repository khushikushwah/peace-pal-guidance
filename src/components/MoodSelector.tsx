import { cn } from "@/lib/utils";

export type Mood = "Heavy" | "Restless" | "Seeking Stillness" | "Drifting" | "Light";

const MOODS: Mood[] = ["Heavy", "Restless", "Seeking Stillness", "Drifting", "Light"];

export function MoodSelector({
  mood,
  onChange,
}: {
  mood: Mood;
  onChange: (m: Mood) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {MOODS.map((m) => {
        const active = m === mood;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs tracking-[0.2em] uppercase font-light transition-all duration-500",
              active
                ? "border border-candle/50 bg-candle/10 text-candle shadow-[0_0_30px_-5px_hsl(var(--candle)/0.3)]"
                : "border border-foreground/5 text-ash hover:text-candle hover:border-candle/25"
            )}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
