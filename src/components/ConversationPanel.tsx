import { useEffect, useRef, useState } from "react";
import { Send, X, Volume2, VolumeX } from "lucide-react";
import { VoiceOrb } from "./VoiceOrb";
import { useVoice } from "@/hooks/use-voice";
import { Mood } from "./MoodSelector";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aethel-chat`;

export function ConversationPanel({
  open,
  onClose,
  mood,
  initialPrompt,
}: {
  open: boolean;
  onClose: () => void;
  mood: Mood;
  initialPrompt?: string | null;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const voice = useVoice();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef<string | null>(null);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  // Sync voice transcript into input
  useEffect(() => {
    if (voice.transcript) setInput(voice.transcript);
  }, [voice.transcript]);

  // Send initial prompt when opened with one
  useEffect(() => {
    if (open && initialPrompt && sentInitial.current !== initialPrompt) {
      sentInitial.current = initialPrompt;
      void send(initialPrompt);
    }
    if (!open) {
      sentInitial.current = null;
      voice.stopSpeaking();
      voice.stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialPrompt]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;
    voice.stopSpeaking();
    voice.stopListening();
    setInput("");
    voice.setTranscript("");

    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setIsThinking(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, mood }),
      });

      if (resp.status === 429) { toast.error("The sanctuary is resting. Try again in a moment."); setIsThinking(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted. Add credits to continue."); setIsThinking(false); return; }
      if (!resp.ok || !resp.body) { toast.error("Could not reach Aethel."); setIsThinking(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      setIsThinking(false);

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }

      // Speak the final assistant message
      if (voiceEnabled && assistantSoFar) {
        voice.speak(assistantSoFar);
      }
    } catch (e) {
      console.error(e);
      toast.error("Something interrupted the silence.");
      setIsThinking(false);
    }
  };

  const toggleMic = () => {
    if (voice.isListening) {
      voice.stopListening();
      if (input.trim()) void send(input);
    } else {
      voice.stopSpeaking();
      voice.startListening();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl animate-fade-up">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-60"
           style={{ background: "var(--gradient-ambient)" }} />

      <div className="relative h-full flex flex-col max-w-3xl mx-auto px-6 sm:px-12 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-ash">In conversation with</p>
            <h2 className="font-serif italic text-3xl text-candle">Aethel</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setVoiceEnabled((v) => !v); voice.stopSpeaking(); }}
              className="size-10 rounded-full border border-foreground/10 flex items-center justify-center hover:border-candle/40 hover:text-candle transition-colors text-ash"
              aria-label="Toggle voice output"
            >
              {voiceEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            </button>
            <button
              onClick={onClose}
              className="size-10 rounded-full border border-foreground/10 flex items-center justify-center hover:border-candle/40 hover:text-candle transition-colors text-ash"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        {/* Orb (compact when there are messages) */}
        <div className={`flex justify-center transition-all duration-700 ${messages.length > 0 ? "scale-75 -mt-4 -mb-4" : "my-6"}`}>
          <VoiceOrb
            isListening={voice.isListening}
            isSpeaking={voice.isSpeaking}
            isThinking={isThinking}
            onClick={toggleMic}
            label={voice.supported.stt ? "Hold to speak" : "Type below"}
          />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
          {messages.length === 0 && (
            <p className="text-center text-ash font-serif italic text-lg max-w-md mx-auto">
              Tap the orb and share what weighs on you. Aethel listens without judgment.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] px-5 py-3 rounded-3xl rounded-br-md bg-velvet-elevated border border-foreground/5 text-foreground/90 text-[15px] leading-relaxed"
                    : "max-w-[85%] px-1 text-foreground/90 text-[17px] leading-[1.7] font-light font-serif italic"
                }
              >
                {m.content || (isThinking && i === messages.length - 1 ? "…" : "")}
              </div>
            </div>
          ))}
          {isThinking && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 items-center px-2">
                <span className="size-1.5 rounded-full bg-candle/60 animate-pulse" />
                <span className="size-1.5 rounded-full bg-candle/60 animate-pulse" style={{ animationDelay: "200ms" }} />
                <span className="size-1.5 rounded-full bg-candle/60 animate-pulse" style={{ animationDelay: "400ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); void send(input); }}
          className="mt-4 flex items-center gap-3 card-velvet rounded-full pl-6 pr-2 py-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={voice.isListening ? "Listening…" : "Share what's on your mind…"}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-ash/60 py-2 text-[15px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="size-11 rounded-full bg-candle text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:scale-105 transition-transform"
            aria-label="Send"
          >
            <Send className="size-4" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
}
