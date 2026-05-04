import { useEffect, useMemo, useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";

const SYMBOLS = ["☾", "✦", "❀", "☘", "✿", "❉", "✧", "❄"];

type Card = { id: number; symbol: string; flipped: boolean; matched: boolean };

const buildDeck = (): Card[] => {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  return pairs
    .map((symbol, i) => ({ id: i, symbol, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5)
    .map((c, i) => ({ ...c, id: i }));
};

export const PuzzleGame = () => {
  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [picked, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  const won = useMemo(() => cards.every((c) => c.matched), [cards]);

  const reset = () => {
    setCards(buildDeck());
    setPicked([]);
    setMoves(0);
    setLock(false);
  };

  const flip = (id: number) => {
    if (lock) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;
    const next = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    const nextPicked = [...picked, id];
    setCards(next);
    setPicked(nextPicked);
    if (nextPicked.length === 2) {
      setMoves((m) => m + 1);
      setLock(true);
    }
  };

  useEffect(() => {
    if (picked.length !== 2) return;
    const [a, b] = picked;
    const ca = cards.find((c) => c.id === a);
    const cb = cards.find((c) => c.id === b);
    if (!ca || !cb) return;
    const match = ca.symbol === cb.symbol;
    const t = setTimeout(() => {
      setCards((prev) =>
        prev.map((c) =>
          c.id === a || c.id === b
            ? { ...c, matched: match, flipped: match }
            : c,
        ),
      );
      setPicked([]);
      setLock(false);
    }, match ? 400 : 800);
    return () => clearTimeout(t);
  }, [picked, cards]);

  return (
    <section className="mt-24 sm:mt-32 animate-fade-up">
      <div className="text-center mb-10">
        <p className="text-[10px] tracking-[0.4em] uppercase text-candle/70 mb-3">
          A Quiet Pause
        </p>
        <h2 className="font-serif italic text-4xl sm:text-5xl text-foreground">
          Mind, at play
        </h2>
        <p className="mt-4 text-ash font-light max-w-[44ch] mx-auto leading-relaxed">
          Match the gentle symbols. Let your thoughts soften as your hands move.
        </p>
      </div>

      <div className="flex items-center justify-center gap-8 mb-6 text-[10px] tracking-[0.3em] uppercase text-ash">
        <span>Moves · <span className="text-candle tabular-nums">{moves}</span></span>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-candle/30 bg-candle/5 text-candle hover:bg-candle/10 transition-colors"
        >
          <RotateCcw className="size-3" />
          Reset
        </button>
      </div>

      <div className="mx-auto grid grid-cols-4 gap-3 sm:gap-4 max-w-md">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => flip(card.id)}
            disabled={card.matched}
            className="aspect-square rounded-2xl border border-candle/20 bg-card/60 backdrop-blur-sm flex items-center justify-center text-3xl sm:text-4xl transition-all duration-500 hover:border-candle/50"
            style={{
              transform: card.flipped ? "rotateY(0deg)" : "rotateY(180deg)",
              opacity: card.matched ? 0.55 : 1,
            }}
          >
            <span
              className={
                card.flipped
                  ? "text-candle drop-shadow-[0_0_8px_hsl(var(--candle)/0.6)]"
                  : "text-transparent"
              }
            >
              {card.flipped ? card.symbol : "·"}
            </span>
          </button>
        ))}
      </div>

      {won && (
        <div className="mt-8 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-candle/40 bg-candle/10 text-candle text-xs tracking-[0.3em] uppercase">
            <Sparkles className="size-3" />
            Stillness found in {moves} moves
          </div>
        </div>
      )}
    </section>
  );
};
