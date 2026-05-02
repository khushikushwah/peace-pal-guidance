import { useCallback, useEffect, useRef, useState } from "react";

// Browser SpeechRecognition typing
type SR = any;

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState({ stt: false, tts: false });
  const recognitionRef = useRef<SR | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    setSupported({
      stt: !!SpeechRecognition,
      tts: typeof window !== "undefined" && "speechSynthesis" in window,
    });

    if (SpeechRecognition) {
      const r = new SpeechRecognition();
      r.continuous = false;
      r.interimResults = true;
      r.lang = "en-US";
      r.onresult = (e: any) => {
        let finalText = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          finalText += e.results[i][0].transcript;
        }
        setTranscript(finalText);
      };
      r.onend = () => setIsListening(false);
      r.onerror = () => setIsListening(false);
      recognitionRef.current = r;
    }

    // Pick a calm voice once available
    const pickVoice = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      const preferred =
        voices.find((v) => /samantha|serena|moira|karen|google uk english female|jenny/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith("en") && /female/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith("en"));
      voiceRef.current = preferred || voices[0] || null;
    };
    pickVoice();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }

    return () => {
      try { recognitionRef.current?.stop(); } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {}
  }, []);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window)) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 0.92;
    u.pitch = 1.0;
    u.volume = 1;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => { setIsSpeaking(false); onEnd?.(); };
    u.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(u);
  }, []);

  const stopSpeaking = useCallback(() => {
    try { window.speechSynthesis.cancel(); } catch {}
    setIsSpeaking(false);
  }, []);

  return {
    supported,
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setTranscript,
  };
}
