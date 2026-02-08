import { FormEvent, useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Role = "user" | "assistant";

type Message = {
  role: Role;
  content: string;
};

const SYSTEM_PROMPT =
  "You are Fakea Vangchhia's portfolio assistant. Keep replies concise, professional, and focused on AI engineering, backend, and project work.";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const ChatbotPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, I'm your AI assistant. Ask me anything about my projects, skills, or experience.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        body: JSON.stringify({
          model: "gemini-2.0-flash",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...updatedMessages],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Request failed");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "I could not generate a response.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-panel elevated-card">
      <CardHeader>
        <CardTitle className="display-font text-2xl">Ask My AI Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 h-80 space-y-3 overflow-y-auto rounded-xl border border-border/70 bg-card/80 p-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {message.content}
            </div>
          ))}
          {loading && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about projects, skills, or collaboration..."
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary/60"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Responses are generated live by Gemini via your backend.</p>
            <Button type="submit" disabled={!canSend} className="rounded-full px-5">
              Send <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatbotPanel;
