import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Role = "user" | "assistant";

type Message = {
  role: Role;
  content: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// flint: a LoRA fine-tune of Gemma 4 E4B trained on Fakea's own answers, served
// from a scale-to-zero GPU. The model is named here only so the backend can
// reject anything off its allowlist; the system prompt and the service token
// live server-side and are deliberately not shipped to the browser.
const MODEL = "flint";

// flint sleeps when nobody is chatting, and waking it means loading ~15 GB of
// weights. After this long, "Thinking..." has stopped being an honest label.
const COLD_START_NOTICE_MS = 8000;

type ChatbotPanelProps = {
  /** A suggestion clicked elsewhere on the page, dropped into the composer. */
  pendingQuestion?: string;
  onPendingQuestionUsed?: () => void;
};

const ChatbotPanel = ({ pendingQuestion, onPendingQuestionUsed }: ChatbotPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, I'm flint — Fakea's fine-tuned assistant. Ask me about his projects, skills, or experience.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [waking, setWaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  // Wake the model while the visitor is still reading the page. The backend's
  // health check pings the GPU service, which starts a container booting, so a
  // question asked thirty seconds from now lands on a warm one instead of
  // paying the cold start. Fire-and-forget: nothing here is worth an error.
  useEffect(() => {
    void fetch(`${API_BASE_URL}/assistant/health`).catch(() => undefined);
  }, []);

  // Swap the "Thinking..." label once a wait stops looking like thinking.
  useEffect(() => {
    if (!loading) {
      setWaking(false);
      return;
    }
    const timer = window.setTimeout(() => setWaking(true), COLD_START_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [loading]);

  // Keep the newest message in view instead of leaving it below the fold.
  useEffect(() => {
    const node = transcriptRef.current;
    if (!node) return;
    node.scrollTo({
      top: node.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [messages, loading]);

  // Load a clicked suggestion and hand focus to the composer so the visitor can
  // edit it or just hit Enter.
  useEffect(() => {
    if (!pendingQuestion) return;
    setInput(pendingQuestion);
    inputRef.current?.focus();
    onPendingQuestionUsed?.();
  }, [pendingQuestion, onPendingQuestionUsed]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, messages: updatedMessages }),
      });

      // A cold-started or missing backend can answer with HTML or nothing at
      // all, and `.json()` would then throw something unreadable at the visitor.
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data?.detail ||
            (response.status === 503
              ? "The assistant is not configured on the server yet."
              : `The assistant is unavailable right now (${response.status}).`),
        );
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "I could not generate a response.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (submitError) {
      // `fetch` rejects with a bare "Failed to fetch" when the API is asleep or
      // unreachable, which tells a visitor nothing. Say what to do instead.
      const message =
        submitError instanceof TypeError
          ? "Could not reach the assistant. It may be waking up — try again, or email fakeavangchhia@gmail.com."
          : submitError instanceof Error
            ? submitError.message
            : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  // Enter sends, Shift+Enter inserts a newline — the convention every chat UI
  // uses, and the current build forces a mouse trip to the Send button.
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void sendMessage();
  };

  return (
    <Card className="glass-panel elevated-card">
      <CardHeader>
        <CardTitle className="display-font text-2xl">Ask flint</CardTitle>
        <p className="text-xs text-muted-foreground">
          My fine-tune of Gemma 4 E4B, trained on my own answers.
        </p>
      </CardHeader>
      <CardContent>
        <div
          ref={transcriptRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          className="mb-4 h-80 space-y-3 overflow-y-auto rounded-xl border border-border bg-card/80 p-4"
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              // whitespace-pre-wrap, because the system prompt allows the
              // assistant short bullet lists on technical questions and this is
              // a plain text node -- without it every line collapses into one.
              className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-relaxed ${
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              <span className="sr-only">
                {message.role === "user" ? "You said: " : "Assistant said: "}
              </span>
              {message.content}
            </div>
          ))}
          {loading && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{" "}
              {waking
                ? "Waking the model — the first question after a quiet spell takes about a minute."
                : "Thinking..."}
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="assistant-input" className="sr-only">
            Ask the assistant a question
          </label>
          <textarea
            id="assistant-input"
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about projects, skills, or collaboration..."
            rows={3}
            aria-describedby="assistant-hint"
            className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-foreground/40"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p id="assistant-hint" className="text-xs text-muted-foreground">
              Press <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-sans text-[0.7rem]">Enter</kbd> to send,{" "}
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-sans text-[0.7rem]">Shift</kbd>
              {" + "}
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-sans text-[0.7rem]">Enter</kbd> for a new line.
            </p>
            <Button type="submit" disabled={!canSend} className="rounded-full px-5">
              Send <Send className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          {/* Inverted to stay distinguishable from an assistant bubble, which is
              also grey-on-white in this palette. */}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground"
            >
              {error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatbotPanel;
