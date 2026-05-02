import { Phone, MapPin, ChefHat, Music, Footprints, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  { icon: Phone, kicker: "Connection", title: "The Voice of Home", body: "Reach out to family. Let their familiar resonance ground you in this moment." },
  { icon: MapPin, kicker: "Escape", title: "Map a Sanctuary", body: "Quietly plan a small holiday — somewhere green, somewhere slow." },
  { icon: ChefHat, kicker: "Ritual", title: "Tactile Alchemy", body: "Cook a meal with deliberate care. Feel the texture of grain and heat." },
  { icon: Music, kicker: "Atmosphere", title: "Sonic Immersion", body: "Let refreshing music wash over you. Move, sway, or simply breathe." },
  { icon: Footprints, kicker: "Movement", title: "An Unhurried Walk", body: "Step outside. Notice five things you can see, three you can hear." },
  { icon: Sparkles, kicker: "Presence", title: "Pure Joy", body: "Play with your children or call an old friend. Rediscover lightness." },
];

export function SuggestionGrid({ onPick }: { onPick: (s: string) => void }) {
  return (
    <section className="w-full">
      <div className="flex items-end justify-between mb-10">
        <h2 className="font-serif italic text-3xl sm:text-4xl text-foreground/90">
          Nourish your inner state
        </h2>
        <div className="hidden sm:block h-px flex-1 mx-8 bg-gradient-to-r from-foreground/10 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SUGGESTIONS.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              onClick={() => onPick(`Help me with: ${s.title.toLowerCase()}. ${s.body}`)}
              className="card-velvet rounded-3xl p-8 text-left group hover:border-candle/25 transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="size-12 rounded-full bg-candle/10 mb-7 flex items-center justify-center border border-candle/15">
                <Icon className="size-5 text-candle" strokeWidth={1.4} />
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-candle/70 mb-2">{s.kicker}</p>
              <h3 className="text-xl font-light text-foreground mb-3 tracking-wide font-serif italic">{s.title}</h3>
              <p className="text-ash text-sm leading-relaxed font-light">{s.body}</p>
              <div className="mt-7 text-[10px] tracking-[0.3em] uppercase text-candle/0 group-hover:text-candle transition-all duration-500">
                Begin Ritual →
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
