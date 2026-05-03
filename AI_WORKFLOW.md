# Aethel — AI Workflow

This document describes the end-to-end AI workflow that powers Aethel, a calming companion for stress relief. It covers the user journey, the components involved, the backend edge functions, the model choices, and the data flow between them.

---

## 1. Overview

Aethel uses **Lovable AI Gateway** (Google Gemini models) to deliver two complementary AI experiences:

1. **Conversational chat** — free-form, empathetic dialogue (`aethel-chat`).
2. **Guided 5-step journey** — a structured, multi-stage stress-relief flow (`aethel-workflow`).

Both flows are stateless on the backend and orchestrated from the client.

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       Client (React)                         │
│                                                              │
│  MoodSelector ──► ConversationPanel ──► VoiceOrb            │
│        │                  │                                  │
│        │                  ▼                                  │
│        │          aethel-chat (edge fn) ──► Lovable AI       │
│        │                                                     │
│        └─► WorkflowJourney ──► aethel-workflow ──► Lovable AI│
│                                                              │
│  SuggestionGrid · RecipesSection · SongsSection (static)     │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. The 5-Step Guided Journey

Triggered from the **"Begin a 5-step journey"** CTA on the home screen.

| Step | Name     | Purpose                                              | AI involved |
|------|----------|------------------------------------------------------|-------------|
| 1    | Share    | User picks a mood and types what's on their mind     | No          |
| 2    | Reflect  | AI mirrors the feeling with a short, warm reflection | Yes         |
| 3    | Breathe  | AI returns a breathing pattern; UI animates the orb  | Yes         |
| 4    | Act      | AI suggests a small grounding activity               | Yes         |
| 5    | Carry    | AI offers a one-line affirmation to take away        | Yes         |

The edge function returns a single structured JSON payload containing all four AI outputs so the journey runs without further round-trips.

---

## 4. Conversational Chat Flow

1. User selects a mood (`MoodSelector`).
2. User types or dictates a message (`ConversationPanel` + `useVoice`).
3. Client calls `supabase.functions.invoke("aethel-chat", { body: { mood, message, history } })`.
4. Edge function validates input, calls Lovable AI, streams/returns reply.
5. Reply renders in the conversation thread; `VoiceOrb` reflects activity state.

---

## 5. Edge Functions

### `aethel-chat`
- **Model**: `google/gemini-2.5-flash`
- **Input**: `{ mood, message, history[] }`
- **Output**: `{ reply: string }`
- **Guardrails**: mood whitelist, length limits, system prompt enforcing empathetic, non-clinical tone.

### `aethel-workflow`
- **Model**: `google/gemini-2.5-flash`
- **Input**: `{ mood, context }`
- **Output**:
  ```json
  {
    "reflection": "string",
    "breathing": { "inhale": 4, "hold": 4, "exhale": 6, "cycles": 4 },
    "activity":   { "title": "string", "steps": ["..."] },
    "affirmation": "string"
  }
  ```
- **Guardrails**: response forced to JSON, schema-validated client-side.

Both functions run with `verify_jwt = false` (public, anonymous-friendly) and use the managed `LOVABLE_API_KEY` — no user-supplied keys.

---

## 6. Model Selection Rationale

- **Gemini 2.5 Flash** — chosen for low latency, multimodal capability, and strong instruction following at low cost. Ideal for short empathetic replies and structured JSON.
- **Upgrade path**: switch to `google/gemini-2.5-pro` for deeper reasoning if conversations become long or multi-turn complexity grows.

---

## 7. Data & Privacy

- No conversation history is persisted server-side.
- No user accounts are required for the current flows.
- Mood + message payloads are sent only to the Lovable AI Gateway through the edge function.

---

## 8. Error Handling

| Layer        | Strategy                                                    |
|--------------|-------------------------------------------------------------|
| Client       | Toast on failure, retry button, graceful fallbacks          |
| Edge function| 400 on invalid input, 429 surfaced for rate limits, 500 otherwise |
| Model        | JSON parse fallback in `aethel-workflow`; default breathing pattern if schema invalid |

---

## 9. Extending the Workflow

Ideas that fit cleanly into this architecture:

- **Memory** — add a `journeys` table keyed by anonymous client ID for streaks.
- **Voice replies** — add a TTS edge function and play through `VoiceOrb`.
- **Personalized recipes/songs** — let the AI pick from `RecipesSection` / `SongsSection` based on mood.
- **Crisis routing** — detect distress keywords and surface helpline resources before the model replies.

---

## 10. File Map

```
src/
  pages/Index.tsx              # Orchestrates the home experience
  components/
    MoodSelector.tsx           # Step 1 input
    ConversationPanel.tsx      # Chat UI
    VoiceOrb.tsx               # Visual feedback
    WorkflowJourney.tsx        # 5-step guided dialog
    SuggestionGrid.tsx         # Static suggestions
    RecipesSection.tsx         # Calming recipes
    SongsSection.tsx           # Calming songs
  hooks/use-voice.ts           # Speech-to-text helper

supabase/
  functions/
    aethel-chat/index.ts       # Conversational endpoint
    aethel-workflow/index.ts   # Structured 5-step endpoint
  config.toml                  # Function registration
```
