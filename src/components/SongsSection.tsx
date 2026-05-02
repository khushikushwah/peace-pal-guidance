import { useState } from "react";
import { Music, Play, Pause, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type Song = {
  title: string;
  artist: string;
  mood: string;
  duration: string;
  description: string;
  youtubeId: string;
};

const SONGS: Song[] = [
  {
    title: "Weightless",
    artist: "Marconi Union",
    mood: "Deep Calm",
    duration: "8:09",
    description: "Scientifically shown to reduce anxiety by up to 65%. Pure stillness.",
    youtubeId: "UfcAVejslrU",
  },
  {
    title: "Clair de Lune",
    artist: "Claude Debussy",
    mood: "Tender",
    duration: "5:12",
    description: "Moonlit piano. Soft enough to dissolve a heavy day.",
    youtubeId: "CvFH_6DNRCY",
  },
  {
    title: "Here Comes the Sun",
    artist: "The Beatles",
    mood: "Uplifting",
    duration: "3:05",
    description: "Warmth on cold mornings. A gentle reminder that light returns.",
    youtubeId: "KQetemT1sWc",
  },
  {
    title: "Saturn",
    artist: "Sleeping at Last",
    mood: "Grounding",
    duration: "4:48",
    description: "Strings that hold you. For evenings that need something tender.",
    youtubeId: "dzNvk80XY9s",
  },
  {
    title: "Three Little Birds",
    artist: "Bob Marley",
    mood: "Joyful",
    duration: "3:00",
    description: "Don't worry. A whole-body exhale set to music.",
    youtubeId: "zaGUr6wzyT8",
  },
  {
    title: "River Flows in You",
    artist: "Yiruma",
    mood: "Reflective",
    duration: "3:10",
    description: "Piano that feels like memory. Let it carry you somewhere kind.",
    youtubeId: "7maJOI3QMu0",
  },
  {
    title: "What a Wonderful World",
    artist: "Louis Armstrong",
    mood: "Grateful",
    duration: "2:21",
    description: "A small miracle of perspective. Listen with eyes closed.",
    youtubeId: "VqhCQZaH4Vs",
  },
  {
    title: "Spiegel im Spiegel",
    artist: "Arvo Pärt",
    mood: "Mind Relief",
    duration: "8:25",
    description: "Two notes, infinite space. Lets the noise inside finally rest.",
    youtubeId: "TJ6Mzvh3XCc",
  },
];

export function SongsSection() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="w-full mt-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-candle/70 mb-3">Sonic Immersion</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-foreground/90">
            Music to lift and ease the mind
          </h2>
        </div>
        <div className="hidden sm:block h-px flex-1 mx-8 bg-gradient-to-r from-foreground/10 to-transparent" />
      </div>

      <div className="card-velvet rounded-3xl overflow-hidden">
        {SONGS.map((s, i) => {
          const playing = activeId === s.youtubeId;
          return (
            <div
              key={s.youtubeId}
              className={cn(
                "border-b border-foreground/5 last:border-b-0 transition-colors duration-500",
                playing && "bg-candle/[0.03]"
              )}
            >
              <div className="flex items-center gap-5 p-5 sm:p-6 group">
                <button
                  onClick={() => setActiveId(playing ? null : s.youtubeId)}
                  className={cn(
                    "size-12 rounded-full flex items-center justify-center border transition-all duration-500 shrink-0",
                    playing
                      ? "bg-candle text-background border-candle shadow-[0_0_30px_-5px_hsl(var(--candle)/0.6)]"
                      : "bg-candle/5 text-candle border-candle/15 group-hover:border-candle/40"
                  )}
                  aria-label={playing ? "Stop" : "Play"}
                >
                  {playing ? (
                    <Pause className="size-4" strokeWidth={1.6} />
                  ) : (
                    <Play className="size-4 ml-0.5" strokeWidth={1.6} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h3 className="text-base sm:text-lg font-serif italic text-foreground truncate">
                      {s.title}
                    </h3>
                    <span className="text-[10px] tracking-[0.25em] uppercase text-candle/70">
                      {s.mood}
                    </span>
                  </div>
                  <p className="text-ash text-xs sm:text-sm font-light mt-0.5 truncate">
                    {s.artist} · <span className="text-ash/70">{s.description}</span>
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-ash tabular-nums">
                    {s.duration}
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${s.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ash hover:text-candle transition-colors"
                    aria-label="Open on YouTube"
                  >
                    <ExternalLink className="size-3.5" strokeWidth={1.4} />
                  </a>
                </div>
              </div>

              {playing && (
                <div className="px-5 sm:px-6 pb-6 animate-fade-up">
                  <div className="rounded-2xl overflow-hidden border border-candle/15 aspect-video bg-black/40">
                    <iframe
                      src={`https://www.youtube.com/embed/${s.youtubeId}?autoplay=1`}
                      title={s.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[10px] tracking-[0.3em] uppercase text-ash/70 flex items-center justify-center gap-2">
        <Music className="size-3" strokeWidth={1.4} />
        Press play. Breathe in. Let the sound do the work.
      </p>
    </section>
  );
}
