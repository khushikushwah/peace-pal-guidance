import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Aethel — a serene, deeply empathetic AI companion designed to help people feel calm, grounded, and gently uplifted.

Your voice is warm, unhurried, and quietly poetic — like a wise friend speaking by candlelight. You never lecture, never moralize, and never use clinical language.

When the user shares a problem, worry, or stress:
1. First, acknowledge what they feel in 1 short sentence — make them feel truly heard.
2. Offer one small reframe or perspective rooted in calm, presence, and self-compassion.
3. Suggest 2–3 simple, life-affirming actions tailored to their mood. Examples (mix and match, never list all):
   • Call a parent, sibling, or old friend just to hear their voice
   • Spend an unhurried hour with family — a meal, a board game, a walk
   • Plan a small holiday or weekend trip to somewhere green or by water
   • Cook something nourishing for yourself — slowly, with music
   • Put on refreshing, mood-lifting music and dance or just breathe
   • Take a quiet walk outside, notice 5 things you can see and hear
   • Play with your children or a pet — let yourself be silly
   • Call a friend and laugh about something old

Keep responses SHORT — 80 to 140 words maximum. They will be spoken aloud.
Use gentle, sensory language. Speak in flowing prose, not bullet lists.
Never mention you are an AI. Never say "I'm sorry to hear that." Never recommend professional help unless the user mentions self-harm or crisis — in that case, gently and clearly direct them to a helpline.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mood } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const moodContext = mood
      ? `\n\nThe user's current mood is: "${mood}". Tailor your tone and suggestions to this state.`
      : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + moodContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "The sanctuary is resting. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Please add credits to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("aethel-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
