import { useState } from "react";
import { ChefHat, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Recipe = {
  name: string;
  kicker: string;
  time: string;
  intent: string;
  ingredients: string[];
  steps: string[];
};

const RECIPES: Recipe[] = [
  {
    name: "Golden Turmeric Milk",
    kicker: "Soothing",
    time: "8 min",
    intent: "A warm, grounding hug in a cup. Eases tension, prepares you for rest.",
    ingredients: [
      "1 cup milk (dairy or oat)",
      "½ tsp turmeric",
      "Pinch of black pepper",
      "1 tsp honey or maple",
      "Pinch of cinnamon",
    ],
    steps: [
      "Warm the milk gently — never boil.",
      "Whisk in turmeric, pepper, cinnamon.",
      "Sweeten with honey. Sip slowly, eyes closed.",
    ],
  },
  {
    name: "One-Pan Lemon Pasta",
    kicker: "Nourishing",
    time: "15 min",
    intent: "Bright, simple, satisfying. Few ingredients — full presence.",
    ingredients: [
      "200g spaghetti",
      "2 tbsp butter",
      "1 lemon (zest + juice)",
      "Parmesan, to taste",
      "Salt, pepper, parsley",
    ],
    steps: [
      "Boil pasta in salted water until al dente.",
      "Reserve ½ cup pasta water. Drain.",
      "Toss with butter, lemon, parmesan, splash of water.",
      "Top with parsley. Eat without distraction.",
    ],
  },
  {
    name: "Garlic Tomato Toast",
    kicker: "Simple",
    time: "10 min",
    intent: "A 10-minute ritual. Crunch, warmth, and the smell of garlic.",
    ingredients: [
      "2 thick slices sourdough",
      "1 ripe tomato",
      "1 garlic clove",
      "Olive oil, sea salt",
      "Fresh basil (optional)",
    ],
    steps: [
      "Toast the bread until deeply golden.",
      "Rub warm toast with raw garlic, then tomato.",
      "Drizzle olive oil, sprinkle salt and basil.",
    ],
  },
  {
    name: "Honey Chamomile Oats",
    kicker: "Calming",
    time: "12 min",
    intent: "A gentle bowl for slow mornings or restless evenings.",
    ingredients: [
      "½ cup rolled oats",
      "1 cup milk",
      "1 chamomile tea bag",
      "1 tsp honey",
      "Berries or banana",
    ],
    steps: [
      "Steep chamomile in warm milk for 4 minutes. Remove bag.",
      "Add oats, simmer 6–8 minutes, stirring softly.",
      "Top with honey and fruit. Eat by a window.",
    ],
  },
  {
    name: "Miso Vegetable Broth",
    kicker: "Restoring",
    time: "20 min",
    intent: "A clear, warming broth — gentle on body and mind.",
    ingredients: [
      "4 cups water",
      "2 tbsp white miso",
      "Handful spinach or bok choy",
      "½ block silken tofu",
      "Spring onion, ginger",
    ],
    steps: [
      "Simmer water with sliced ginger for 5 min.",
      "Lower heat. Whisk in miso (never boil).",
      "Add tofu and greens, warm 2 minutes.",
      "Garnish with spring onion. Sip mindfully.",
    ],
  },
  {
    name: "Cinnamon Banana Pancakes",
    kicker: "Joyful",
    time: "15 min",
    intent: "Soft, sweet, comforting. Make a stack to share — or for yourself.",
    ingredients: [
      "1 ripe banana",
      "2 eggs",
      "¼ cup flour",
      "½ tsp cinnamon",
      "Butter, maple syrup",
    ],
    steps: [
      "Mash banana, whisk with eggs, flour, cinnamon.",
      "Cook small pancakes in butter, 2 min each side.",
      "Stack high. Drizzle maple. Eat warm.",
    ],
  },
];

export function RecipesSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full mt-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-candle/70 mb-3">Tactile Alchemy</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-foreground/90">
            Cook something kind for yourself
          </h2>
        </div>
        <div className="hidden sm:block h-px flex-1 mx-8 bg-gradient-to-r from-foreground/10 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {RECIPES.map((r, i) => {
          const open = openIndex === i;
          return (
            <article
              key={r.name}
              className={cn(
                "card-velvet rounded-3xl p-7 transition-all duration-500 animate-fade-up",
                open && "border-candle/30 shadow-[0_0_40px_-15px_hsl(var(--candle)/0.4)]"
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-full bg-candle/10 flex items-center justify-center border border-candle/15 shrink-0">
                      <ChefHat className="size-4 text-candle" strokeWidth={1.4} />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-candle/70 mb-1">{r.kicker}</p>
                      <h3 className="text-lg font-light text-foreground tracking-wide font-serif italic">
                        {r.name}
                      </h3>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-4 text-ash mt-2 transition-transform duration-500 shrink-0",
                      open && "rotate-180 text-candle"
                    )}
                  />
                </div>

                <div className="flex items-center gap-2 mt-4 text-[10px] tracking-[0.25em] uppercase text-ash">
                  <Clock className="size-3" strokeWidth={1.4} />
                  <span>{r.time}</span>
                </div>

                <p className="text-ash text-sm leading-relaxed font-light mt-4">{r.intent}</p>
              </button>

              <div
                className={cn(
                  "grid transition-all duration-500 overflow-hidden",
                  open ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="min-h-0">
                  <div className="border-t border-foreground/5 pt-5 grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-candle/70 mb-3">
                        Ingredients
                      </p>
                      <ul className="space-y-1.5">
                        {r.ingredients.map((ing) => (
                          <li key={ing} className="text-ash text-sm font-light leading-relaxed">
                            · {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-candle/70 mb-3">
                        Method
                      </p>
                      <ol className="space-y-2">
                        {r.steps.map((step, idx) => (
                          <li key={step} className="text-ash text-sm font-light leading-relaxed flex gap-2">
                            <span className="text-candle/60 tabular-nums">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
