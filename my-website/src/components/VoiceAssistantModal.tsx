"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Briefcase,
  BookOpen,
  Users,
  Compass,
  DollarSign,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { SupportedLocale } from "@/lib/i18n/translations";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (destination: string) => void;
}

interface Message {
  sender: "user" | "assistant";
  text: string;
  actionDestination?: string;
  actionLabel?: string;
}

export function VoiceAssistantModal({
  isOpen,
  onClose,
  onNavigateTo,
}: VoiceAssistantModalProps) {
  const { locale, setLocale, t } = useTranslation();

  // Consent & permissions
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [textInput, setTextInput] = useState<string>("");
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<SupportedLocale>(locale);

  // Chat conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      text: "Vanakkam and Namaste! I am your GFG Voice Guide. You can speak or type to ask about returning to work, starting a business, finding mentors, or calculating service pricing. How may I assist you today?",
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync voice language with platform language
  useEffect(() => {
    setSelectedVoiceLang(locale);
  }, [locale]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check Web Speech API availability
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Text to speech helper
  const speakText = (text: string) => {
    if (isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoiceLang === "ta") {
        utterance.lang = "ta-IN";
      } else if (selectedVoiceLang === "hi") {
        utterance.lang = "hi-IN";
      } else {
        utterance.lang = "en-IN";
      }
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  };

  // Start speech recognition
  const startListening = () => {
    if (!speechSupported) {
      alert("Speech recognition is not supported in this browser. Please use the text input below.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Assign appropriate BCP-47 language tag
      if (selectedVoiceLang === "ta") {
        recognition.lang = "ta-IN";
      } else if (selectedVoiceLang === "hi") {
        recognition.lang = "hi-IN";
      } else {
        recognition.lang = "en-IN";
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleUserQuery(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Intelligent intent triage based on user voice/text
  const handleUserQuery = (query: string) => {
    const userMsg: Message = { sender: "user", text: query };
    const lower = query.toLowerCase();

    let reply = "";
    let dest = "";
    let label = "";

    // Language switch intent
    if (lower.includes("tamil") || lower.includes("தமிழ்")) {
      setLocale("ta");
      setSelectedVoiceLang("ta");
      reply = "நான் தமிழுக்கு மாறினேன். இப்போது நீங்கள் தமிழில் கேட்கலாம்.";
    } else if (lower.includes("hindi") || lower.includes("हिंदी")) {
      setLocale("hi");
      setSelectedVoiceLang("hi");
      reply = "मैंने हिंदी भाषा चुन ली है। अब आप हिंदी में पूछ सकते हैं।";
    } else if (lower.includes("english")) {
      setLocale("en");
      setSelectedVoiceLang("en");
      reply = "Switched to English. How can I help with your career continuity?";
    }
    // Business & Freelancing
    else if (
      lower.includes("business") ||
      lower.includes("freelance") ||
      lower.includes("pricing") ||
      lower.includes("consulting") ||
      lower.includes("proposal") ||
      lower.includes("தொழில்") ||
      lower.includes("வியாபாரம்") ||
      lower.includes("வணிகம்") ||
      lower.includes("व्यापार") ||
      lower.includes("व्यवसाय")
    ) {
      reply =
        selectedVoiceLang === "ta"
          ? "தொழில்முனைவு மற்றும் ஃப்ரீலான்சிங் மையத்தில் வணிகத் திட்டங்கள், சேவை கட்டணக் கணக்கீடுகள் மற்றும் வாடிக்கையாளர் முன்மொழிவுக் கருவிகள் உள்ளன."
          : selectedVoiceLang === "hi"
          ? "उद्यमिता केंद्र में बिजनेस आइडिया प्लानर, सर्विस प्राइसिंग वर्कशीट और क्लाइंट प्रपोजल जनरेटर उपलब्ध हैं।"
          : "Our Entrepreneurship Hub includes business planners, a service pricing calculator, monthly expense tracking, and client proposal generators.";
      dest = "open_entrepreneurship";
      label = t("guided.opt5.action");
    }
    // Flexible work / Work-life balance
    else if (
      lower.includes("flexible") ||
      lower.includes("remote") ||
      lower.includes("part-time") ||
      lower.includes("part time") ||
      lower.includes("childcare") ||
      lower.includes("commute") ||
      lower.includes("நெகிழ்வான") ||
      lower.includes("லचीला")
    ) {
      reply =
        selectedVoiceLang === "ta"
          ? "குடும்பக் காரணங்களை வெளிப்படுத்தாமல் வீட்டிலிருந்து வேலை, பகுதிநேரப் பணி மற்றும் க்ரீச் வசதி உள்ள வேலைகளைத் தேர்ந்தெடுக்கலாம்."
          : selectedVoiceLang === "hi"
          ? "आप निजी कारण बताए बिना रिमोट, पार्ट-टाइम और क्रेच सुविधा वाली नौकरियों के लिए वर्क-लाइफ फिल्टर लगा सकते हैं।"
          : "You can filter strictly for remote, part-time, self-scheduled hours, and crèche support without disclosing private caregiving reasons.";
      dest = "open_flexible_filter";
      label = t("guided.opt4.action");
    }
    // Mentors & Circles
    else if (
      lower.includes("mentor") ||
      lower.includes("circle") ||
      lower.includes("community") ||
      lower.includes("guidance") ||
      lower.includes("வழிகாட்டி") ||
      lower.includes("मेंटर")
    ) {
      reply =
        selectedVoiceLang === "ta"
          ? "தொழில் இடைவெளியைக் கடந்து மீண்டும் பணியில் இணைந்த பெண் வழிகாட்டிகளுடன் 1:1 ஆலோசனைகள் மற்றும் சிறு குழுக்களில் இணையலாம்."
          : selectedVoiceLang === "hi"
          ? "आप 1:1 मेंटरशिप बुक कर सकते हैं या 15 सदस्यों के कमबैक सर्कल में शामिल हो सकते हैं।"
          : "You can book 1:1 sessions with women mentors who returned from career pauses or join small peer comeback circles.";
      dest = "open_mentorship";
      label = t("guided.opt6.action");
    }
    // Learning & Roadmaps
    else if (
      lower.includes("learn") ||
      lower.includes("skill") ||
      lower.includes("roadmap") ||
      lower.includes("course") ||
      lower.includes("கற்க") ||
      lower.includes("திறன்") ||
      lower.includes("सीखना") ||
      lower.includes("कौशल")
    ) {
      reply =
        selectedVoiceLang === "ta"
          ? "உங்கள் நேரத்திற்கேற்ப 5 நிமிட சிறு பாடங்கள் முதல் வாராந்திர திட்டங்கள் வரை மாற்றியமைக்கும் கற்றல் திட்டம் உள்ளது."
          : selectedVoiceLang === "hi"
          ? "आप अपनी गति से कौशल निखारने के लिए अडैप्टिव लर्निंग रोडमैप लॉन्च कर सकते हैं।"
          : "We have adaptive 8-week learning roadmaps with microlearning modules that skip skills you already master.";
      dest = "open_roadmap";
      label = t("guided.opt2.action");
    }
    // Returnships & Jobs
    else if (
      lower.includes("job") ||
      lower.includes("career") ||
      lower.includes("restart") ||
      lower.includes("returnship") ||
      lower.includes("வேலை") ||
      lower.includes("नौकरी")
    ) {
      reply =
        selectedVoiceLang === "ta"
          ? "தொழில் இடைவெளியை மதிக்கும் சரிபார்க்கப்பட்ட நிறுவனங்களின் பிரத்யேக ரிட்டர்ன்ஷிப் வேலை வாய்ப்புகளைப் பாருங்கள்."
          : selectedVoiceLang === "hi"
          ? "कैरियर ब्रेक का सम्मान करने वाले सत्यापित नियोक्ताओं के साथ रिटर्नशिप अवसर देखें।"
          : "Explore verified returnship opportunities with empathetic employers who value seasoned life leadership.";
      dest = "open_opportunities";
      label = t("guided.opt3.action");
    }
    // Where to start / Onboarding
    else {
      reply =
        selectedVoiceLang === "ta"
          ? "எங்கு தொடங்குவது என்று தெரியவில்லையா? எங்கள் எளிய அறிமுக வழிகாட்டி மூலம் உங்கள் முந்தைய அனுபவத்தை அமைதியாக ஆராயலாம்."
          : selectedVoiceLang === "hi"
          ? "क्या आप शुरुआत को लेकर असमंजस में हैं? हमारी सरल ऑनबोर्डिंग यात्रा आपकी प्राथमिकताओं को समझने में मदद करेगी।"
          : "I can guide you step by step. Try our Gentle Onboarding journey or choose from our 6 pathways.";
      dest = "open_onboarding";
      label = t("guided.opt1.action");
    }

    const assistantMsg: Message = {
      sender: "assistant",
      text: reply,
      actionDestination: dest,
      actionLabel: label,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setTextInput("");
    speakText(reply);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserQuery(textInput.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-xl bg-[#181818] border border-[#D8C2A6]/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[#F1E7DB]"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#D8C2A6]/10 flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A56F7C]/20 border border-[#A56F7C]/40 flex items-center justify-center text-[#A56F7C]">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 id="voice-modal-title" className="text-base font-serif text-[#F1E7DB]">
                {t("voice.assistant_title")}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-[#9A9A9A]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t("voice.privacy_badge")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector inside Voice Guide */}
            <div className="flex items-center bg-[#222] border border-[#D8C2A6]/15 rounded-full p-0.5 text-[11px] font-mono">
              {(["en", "ta", "hi"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setLocale(l);
                    setSelectedVoiceLang(l);
                  }}
                  className={`px-2.5 py-0.5 rounded-full uppercase transition-all ${
                    selectedVoiceLang === l
                      ? "bg-[#D8C2A6] text-[#111111] font-bold"
                      : "text-[#9A9A9A] hover:text-[#F1E7DB]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Mute TTS button */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute Spoken Responses" : "Mute Spoken Responses"}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              className="w-8 h-8 rounded-full bg-[#242424] hover:bg-[#333] flex items-center justify-center text-[#D8C2A6]"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="w-8 h-8 rounded-full bg-[#242424] hover:bg-[#333] flex items-center justify-center text-[#D8C2A6]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Microphone Consent Gate if not yet accepted */}
        {!hasConsent ? (
          <div className="p-6 sm:p-8 space-y-5 bg-[#1C1C1C]">
            <div className="w-12 h-12 rounded-2xl bg-[#A56F7C]/15 border border-[#A56F7C]/30 flex items-center justify-center text-[#A56F7C]">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F1E7DB] mb-2">
                {t("voice.mic_permission_title")}
              </h3>
              <p className="text-xs text-[#C4B5A5] leading-relaxed">
                {t("voice.mic_permission_desc")}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#D8C2A6]/10 text-[11px] text-[#9A9A9A] space-y-1 font-mono">
              <div>• Audio processing: Browser Web Speech API on-device</div>
              <div>• Data retention: 0 seconds (never stored or transmitted)</div>
              <div>• Languages supported: English (en-IN), Tamil (ta-IN), Hindi (hi-IN)</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setHasConsent(true);
                  startListening();
                }}
                className="flex-1 py-3 px-4 rounded-full bg-[#D8C2A6] text-[#111111] text-xs font-semibold uppercase tracking-wider hover:bg-[#F1E7DB] transition-all flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                <span>{t("voice.consent_accept")}</span>
              </button>
              <button
                type="button"
                onClick={() => setHasConsent(true)}
                className="py-3 px-4 rounded-full bg-[#242424] text-[#D8C2A6] text-xs font-medium hover:bg-[#333] transition-all"
              >
                {t("voice.consent_decline")}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation Stream */}
            <div
              className="flex-1 p-5 overflow-y-auto space-y-4 min-h-[260px] bg-[#141414]"
              role="log"
              aria-live="polite"
              aria-label="Voice conversation log"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-[#D8C2A6] text-[#111111] font-medium rounded-tr-sm"
                        : "bg-[#202020] border border-[#D8C2A6]/15 text-[#F1E7DB] rounded-tl-sm"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Optional Action Button */}
                  {m.actionDestination && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTo(m.actionDestination!);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A56F7C] hover:bg-[#8c5764] text-[#F1E7DB] text-[11px] font-semibold tracking-wide uppercase shadow-sm transition-all"
                    >
                      <span>{m.actionLabel || "Proceed"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Sample Prompts */}
            <div className="px-5 py-2.5 bg-[#181818] border-t border-[#D8C2A6]/10 overflow-x-auto flex items-center gap-2 no-scrollbar">
              <span className="text-[10px] text-[#888] font-mono whitespace-nowrap">Try:</span>
              {[
                "I want to start a business",
                "I need flexible work",
                "Connect with a mentor",
                "Calculate service pricing",
                "நான் தொழில் தொடங்க விரும்புகிறேன்",
                "मुझे मेंटर चाहिए",
              ].map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleUserQuery(prompt)}
                  className="px-2.5 py-1 rounded-full bg-[#222] hover:bg-[#333] border border-[#D8C2A6]/10 text-[10px] text-[#D8C2A6] whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Mic Pulse / Live Control Area */}
            <div className="p-4 bg-[#1C1C1C] border-t border-[#D8C2A6]/10 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {isListening ? (
                  <button
                    type="button"
                    onClick={stopListening}
                    aria-label="Stop recording speech"
                    className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center animate-pulse shadow-lg shrink-0"
                  >
                    <MicOff className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startListening}
                    aria-label="Start recording speech"
                    className="w-12 h-12 rounded-full bg-[#D8C2A6] hover:bg-[#F1E7DB] text-[#111111] flex items-center justify-center shadow-lg shrink-0 transition-transform hover:scale-105"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}

                {/* Text alternative input */}
                <form onSubmit={handleTextSubmit} className="flex-1 flex items-center gap-2">
                  <label htmlFor="voice-text-fallback" className="sr-only">
                    {t("voice.text_alternative")}
                  </label>
                  <input
                    id="voice-text-fallback"
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={
                      isListening
                        ? t("voice.listening")
                        : t("voice.text_alternative")
                    }
                    className="flex-1 bg-[#141414] border border-[#D8C2A6]/20 rounded-full px-4 py-2.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!textInput.trim()}
                    aria-label="Send message"
                    className="w-9 h-9 rounded-full bg-[#A56F7C] disabled:opacity-40 text-[#F1E7DB] flex items-center justify-center shrink-0 hover:bg-[#8c5764] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {isListening && (
                <div className="flex items-center justify-center gap-2 text-[11px] text-amber-300 font-mono animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{t("voice.listening")}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
