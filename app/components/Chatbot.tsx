"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I’m **PixelPreserve AI**. Ask me about coding, study, debugging, or anything else.",
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const assistantId = crypto.randomUUID();
    const requestMessages = [...messages, userMessage];
    setMessages([
      ...requestMessages,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: requestMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });
      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          data?.error ?? "The assistant could not respond. Please try again.",
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: answer }
              : message,
          ),
        );
      }
      answer += decoder.decode();
    } catch (caughtError) {
      setMessages((current) =>
        current.filter((message) => message.id !== assistantId),
      );
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          aria-label="AI assistant"
          className="mb-3 flex h-[min(640px,calc(100vh-7.5rem))] w-[calc(100vw-2.5rem)] max-w-105 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
        >
          <header className="flex items-center justify-between bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-3 text-white">
            <div>
              <h2 className="font-semibold">PixelPreserve AI</h2>
              <p className="text-xs text-indigo-100">
                Coding, study &amp; general help
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close chat"
            >
              ×
            </button>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user" ? "ml-auto rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"}`}
              >
                {message.content ? (
                  <div className="chatbot-markdown wrap-break-word">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-slate-500"
                    aria-label="Thinking"
                  >
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" />
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]" />
                  </span>
                )}
              </article>
            ))}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={sendMessage}
            className="border-t border-slate-200 bg-white p-3"
          >
            <div className="flex items-end gap-2 rounded-xl border border-slate-300 bg-slate-50 p-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask anything…"
                disabled={isLoading}
                className="max-h-28 min-h-6 flex-1 resize-none bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
                aria-label="Chat message"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <p className="mt-1.5 text-center text-[11px] text-slate-400">
              Enter to send · Shift + Enter for a new line
            </p>
          </form>
        </section>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-violet-600 text-2xl text-white shadow-lg shadow-indigo-600/30 transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
        aria-label={isOpen ? "Close chat" : "Open AI chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? "×" : "✦"}
      </button>
    </div>
  );
}
