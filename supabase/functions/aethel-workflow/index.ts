import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_MOODS = new Set([
  "heavy", "restless", "light", "anxious", "sad", "tired",
  "calm", "hopeful", "overwhelmed", "lonely", "grateful", "neutral",
  "seeking stillness", "drifting",
]);

const ALLOWED_STEPS = new Set(["reflect", "breathe", "activity", "affirm"]);

const SYSTEM = `You are Aethel, a serene, deeply empathetic AI guide. Your voice is warm, unhurried, and quietly poetic — like a wise friend speaking by candlelight. Never clinical. Never lecturing. Use sensory, gentle language. Never mention you are an AI.`;

const STEP_INSTRUCTIONS: Record<string, string> = {
  reflect: `Generate a REFLECTION step. Acknowledge the user's feeling in 1 sentence (make them feel heard), then offer one short, calming reframe. 50–80 words. Flowing prose.`,
  breathe: `Generate a BREATHING practice tailored to their mood. Choose a pattern (e.g., 4-7-8, box breathing 4-4-4-4, or simple deep breaths). Include the pattern name, inhale/hold/exhale seconds, total cycles (4–6), and a one-sentence intention.`,
  activity: `Suggest THREE small, life-affirming activities for the next hour, tailored to their mood. Each activity has a short title, a one-sentence description, and a category from: family, friends, cooking, music, nature, play, rest, travel.`,
  affirm: `Offer a closing AFFIRMATION — a single luminous sentence (under 20 words) the user can carry with them, plus one tiny intention they can set for the rest of the day (under 15 words).`,
};

const TOOLS: Record<string, any> = {
  reflect: {
    type: "function",
    function: {
      name: "reflection",
      description: "Acknowledge feeling and offer a calming reframe.",
      parameters: {
        type: "object",
        properties: {
          acknowledgement: { type: "string" },
          reframe: { type: "string" },
        },
        required: ["acknowledgement", "reframe"],
        additionalProperties: false,
      },
    },
  },
  breathe: {
    type: "function",
    function: {
      name: "breathing",
      description: "A breathing practice with timing.",
      parameters: {
        type: "object",
        properties: {
          pattern_name: { type: "string" },
          inhale_seconds: { type: "number" },
          hold_seconds: { type: "number" },
          exhale_seconds: { type: "number" },
          cycles: { type: "number" },
          intention: { type: "string" },
        },
        required: ["pattern_name", "inhale_seconds", "hold_seconds", "exhale_seconds", "cycles", "intention"],
        additionalProperties: false,
      },
    },
  },
  activity: {
    type: "function",
    function: {
      name: "activities",
      description: "Three calming activities.",
      parameters: {
        type: "object",
        properties: {
          activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                category: {
                  type: "string",
                  enum: ["family", "friends", "cooking", "music", "nature", "play", "rest", "travel"],
                },
              },
              required: ["title", "description", "category"],
              additionalProperties: false,
            },
          },
        },
        required: ["activities"],
        additionalProperties: false,
      },
    },
  },
  affirm: {
    type: "function",
    function: {
      name: "affirmation",
      description: "Closing affirmation and tiny intention.",
      parameters: {
        type: "object",
        properties: {
          affirmation: { type: "string" },
          intention: { type: "string" },
        },
        required: ["affirmation", "intention"],
        additionalProperties: false,
      },
    },
  },
};

function bad(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) return bad("Service unavailable.", 503);

    let body: any;
    try { body = await req.json(); } catch { return bad("Invalid JSON."); }

    const { step, mood, share } = body ?? {};
    if (typeof step !== "string" || !ALLOWED_STEPS.has(step)) return bad("Invalid step.");
    if (typeof mood !== "string") return bad("Mood required.");
    const moodNorm = mood.trim().toLowerCase();
    if (!ALLOWED_MOODS.has(moodNorm)) return bad("Invalid mood.");
    const shareText = typeof share === "string" ? share.slice(0, 2000) : "";

    const userMsg = `The user feels "${moodNorm}".${shareText ? ` They shared: "${shareText}"` : ""}\n\n${STEP_INSTRUCTIONS[step]}`;

    const tool = TOOLS[step];
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: tool.function.name } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return bad("The sanctuary is resting. Please try again shortly.", 429);
      if (resp.status === 402) return bad("Service temporarily unavailable.", 402);
      console.error("gateway error", resp.status, await resp.text());
      return bad("Could not generate guidance.", 500);
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) return bad("Empty response.", 500);

    let parsed: unknown;
    try { parsed = JSON.parse(call.function.arguments); }
    catch { return bad("Malformed response.", 500); }

    return new Response(JSON.stringify({ step, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("aethel-workflow error:", e);
    return bad("Internal error.", 500);
  }
});
