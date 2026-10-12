import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateResponse } from "@/lib/slv-assistant";
import chatIcon from "@/assets/icons/chat-icon.jpg";

const suggestions = [
  "3 BHK ready-to-move flat under ₹80L in Vijayawada",
  "Best gated villa near Penamaluru",
  "Villa plots for investment near Gannavaram",
  "Ongoing apartments on Inner Ring Road",
];

export const OPEN_AI_ASSISTANT_EVENT = "open-ai-assistant";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global open trigger (e.g. from the hero button)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_AI_ASSISTANT_EVENT, handler);
    return () => window.removeEventListener(OPEN_AI_ASSISTANT_EVENT, handler);
  }, []);

  // Auto-scroll + focus
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const submit = useCallback(
    (text: string) => {
      const value = text.trim();
      if (!value || isTyping) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: value,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      // Simulate a brief "thinking" delay for natural UX
      setTimeout(
        () => {
          const response = generateResponse(value);
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            role: "assistant",
            text: response,
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsTyping(false);
        },
        400 + Math.random() * 400,
      );
    },
    [isTyping],
  );

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Ask the AI Property Assistant"
        className="group fixed bottom-16 right-4 z-40 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border-2 border-gold bg-black backdrop-blur-lg text-gold-foreground shadow-lg transition-transform hover:scale-110 sm:bottom-24 sm:right-6 cursor-pointer"
      >
        <img src={chatIcon} alt="Chat" className="h-7 w-7 md:h-8 md:w-8" />
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/70" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-gold" />
        </span>
      </button>

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[60] w-full max-w-md transform transition-transform duration-500 sm:p-4",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <div className="flex h-full flex-col glass-dark text-background sm:rounded-3xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div className="flex items-center gap-2.5">
              <img src={chatIcon} alt="Chat" className="h-8 w-8" />
              <div className="leading-tight">
                <p className="font-display text-lg font-semibold">SLV Property Assistant</p>
                <p className="text-[0.65rem] uppercase tracking-wider text-gold">
                  Smart Search · Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="text-background/70 hover:text-background"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 p-4 text-sm text-background/90">
                    Namaste! I'm your SLV property advisor. Tell me your budget, preferred area, and
                    home type — I'll suggest the best-matching SLV projects instantly.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pl-11">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="rounded-full border border-gold/30 px-3 py-1.5 text-left text-xs text-gold transition-colors hover:bg-gold/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
                  {!isUser && (
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold">
                      <Bot className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl p-4 text-sm",
                      isUser
                        ? "rounded-tr-sm bg-gradient-gold text-gold-foreground"
                        : "rounded-tl-sm bg-white/10 text-background/90",
                    )}
                  >
                    {isUser ? (
                      m.text
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-a:font-semibold prose-a:text-gold prose-strong:text-background">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => {
                              if (href && href.startsWith("/")) {
                                return (
                                  <Link to={href} onClick={() => setOpen(false)}>
                                    {children}
                                  </Link>
                                );
                              }
                              return (
                                <a href={href} target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              );
                            },
                          }}
                        >
                          {m.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white/10 px-4 py-4">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gold" />
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-white/10 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-center gap-2 rounded-2xl bg-white/10 p-2 pl-4"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about budgets, areas, villas, plots…"
                className="flex-1 bg-transparent text-sm text-background placeholder:text-background/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                aria-label="Send message"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-gold text-gold-foreground transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[0.65rem] text-background/40">
              Answers are based on SLV project catalog — confirm details with our team before
              deciding.
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-obsidian/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
