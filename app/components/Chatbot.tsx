"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatStream, type ChatMessage } from "../hooks/useChatStream";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm **SHOFIDEV_TOOLS AI**. Ask me about coding, study, debugging, or anything else.",
};

export function Chatbot() {
  const { messages, input, setInput, isLoading, error, sendMessage } =
    useChatStream({ initialMessages: [WELCOME_MESSAGE] });

  const [isOpen, setIsOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

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
          className="mb-3 flex h-[min(640px,calc(100vh-7.5rem))] w-[calc(100vw-2.5rem)] max-w-105 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]"
        >
          <header className="flex items-center justify-between bg-linear-to-r from-[var(--accent)] to-[#0e8a6a] px-4 py-3 text-white">
            <div>
              <h2 className="font-semibold">SHOFIDEV_TOOLS AI</h2>
              <p className="text-xs opacity-80">
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
          <div className="flex-1 space-y-4 overflow-y-auto bg-[var(--bg-card)] p-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user" ? "ml-auto rounded-br-md bg-[var(--bg-button)] text-white" : "rounded-bl-md bg-[var(--bg-surface)] text-[var(--text-primary)] ring-1 ring-[var(--border)]"}`}
              >
                {message.content ? (
                  <div className="chatbot-markdown wrap-break-word">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-[var(--text-secondary)]"
                    aria-label="Thinking"
                  >
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)]" />
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:150ms]" />
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:300ms]" />
                  </span>
                )}
              </article>
            ))}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-[var(--status-danger-bg)] p-3 text-sm text-[var(--status-danger)]"
              >
                {error}
              </p>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => void sendMessage(e)}
            className="border-t border-[var(--border)] bg-[var(--bg-surface)] p-3"
          >
            <div className="flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-2 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask anything…"
                disabled={isLoading}
                className="max-h-28 min-h-6 flex-1 resize-none bg-transparent px-1 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] disabled:opacity-60"
                aria-label="Chat message"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <p className="mt-1.5 text-center text-[11px] text-[var(--text-secondary)]">
              Enter to send · Shift + Enter for a new line
            </p>
          </form>
        </section>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-linear-to-br from-[var(--accent)] to-[#0e8a6a] text-2xl text-white transition hover:scale-105 hover:border-white/50 focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/30"
        aria-label={isOpen ? "Close chat" : "Open AI chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? "×" : "✦"}
      </button>
    </div>
  );
}
