import { cn } from "@/lib/utils";
import { Mic, Loader2 } from "lucide-react";

export function VoiceOrb({
  isListening,
  isSpeaking,
  isThinking,
  onClick,
  label = "Begin",
}: {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Ambient glow */}
      <div className="absolute -inset-32 rounded-full pointer-events-none blur-[120px]"
           style={{ background: "var(--gradient-candle)" }} />

      <button
        onClick={onClick}
        aria-label="Start voice conversation"
        className={cn(
          "relative size-56 sm:size-64 rounded-full flex flex-col items-center justify-center",
          "border border-candle/15 glow-candle overflow-hidden group",
          "transition-transform duration-700",
          (isListening || isSpeaking) && "animate-orb-breathe"
        )}
        style={{ background: "var(--gradient-ember)" }}
      >
        {/* Inner radial */}
        <div className="absolute inset-0"
             style={{ background: "radial-gradient(circle at 50% 40%, hsl(var(--candle) / 0.18) 0%, transparent 70%)" }} />

        {/* Ring */}
        <div className="absolute inset-0 rounded-full border border-candle/8 scale-105 group-hover:scale-110 transition-transform duration-1000" />

        {/* Content */}
        <div className="relative flex flex-col items-center">
          {isListening ? (
            <div className="flex items-end gap-1 h-10">
              {[0, 100, 200, 300, 200, 100].map((d, i) => (
                <span
                  key={i}
                  className="w-1 bg-candle rounded-full animate-wave-bar"
                  style={{ animationDelay: `${d}ms`, height: "60%" }}
                />
              ))}
            </div>
          ) : isThinking ? (
            <Loader2 className="size-7 text-candle animate-spin" />
          ) : isSpeaking ? (
            <div className="flex items-end gap-1 h-10">
              {[0, 150, 300, 150].map((d, i) => (
                <span
                  key={i}
                  className="w-1 bg-candle rounded-full animate-wave-bar"
                  style={{ animationDelay: `${d}ms`, height: "70%" }}
                />
              ))}
            </div>
          ) : (
            <Mic className="size-6 text-candle/80 mb-2" strokeWidth={1.2} />
          )}

          <span className="font-serif italic text-3xl text-candle mt-3 leading-none">
            {isListening ? "Listening" : isSpeaking ? "Speaking" : isThinking ? "Reflecting" : label}
          </span>
          <span className="mt-2 text-[10px] tracking-[0.4em] uppercase text-candle/60 font-medium">
            Voice Sanctuary
          </span>
        </div>
      </button>
    </div>
  );
}
