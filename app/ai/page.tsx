"use client";

import Link from "next/link";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatStream, type ChatMessage } from "../hooks/useChatStream";
import { ThemeProvider, useTheme } from "../components/ThemeProvider";
import { ToastProvider } from "../components/Toast";
import { ErrorBoundary } from "../components/ErrorBoundary";

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const STORAGE_KEY = "shofidev-ai-conversations-v1";
const STARTER_PROMPTS = [
  "Tell me about SHOFIDEV_TOOLS and its developer tools",
  "Explain React Server Components simply",
  "Help me debug a TypeScript error",
  "Make a 7-day study plan for JavaScript",
];
const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "# How can I help you today?\n\nI can help with coding, study plans, debugging, writing, and everyday questions.",
};

function newConversationId() {
  return crypto.randomUUID();
}

function conversationTitle(messages: ChatMessage[]) {
  const question =
    messages.find((message) => message.role === "user")?.content.trim() ??
    "New conversation";
  return question.length > 42 ? `${question.slice(0, 42)}…` : question;
}

function AIPageContent() {
  const {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    error,
    setError,
    sendMessage,
    hasConversation,
  } = useChatStream({ initialMessages: [welcomeMessage] });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [isReady, setIsReady] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ??
        localStorage.getItem("pixelpreserve-ai-conversations-v1") ??
        "[]";
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        const history = parsed.filter(
          (item): item is Conversation =>
            Boolean(item) &&
            typeof item.id === "string" &&
            Array.isArray(item.messages),
        );
        if (history.length) {
          setConversations(history);
          setCurrentId(history[0].id);
          setMessages(history[0].messages);
        } else setCurrentId(newConversationId());
      } else setCurrentId(newConversationId());
    } catch {
      setCurrentId(newConversationId());
    }
    setIsReady(true);
  }, [setMessages]);

  useEffect(() => {
    if (!isReady || isLoading || messages.length < 2 || !currentId) return;
    const updated: Conversation = {
      id: currentId,
      title: conversationTitle(messages),
      messages: messages.slice(-50),
      updatedAt: Date.now(),
    };
    setConversations((current) => {
      const next = [
        updated,
        ...current.filter((chat) => chat.id !== currentId),
      ].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [messages, isLoading, currentId, isReady]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [input]);

  function startNewChat() {
    setCurrentId(newConversationId());
    setMessages([welcomeMessage]);
    setInput("");
    setError("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function openConversation(chat: Conversation) {
    if (isLoading) return;
    setCurrentId(chat.id);
    setMessages(chat.messages);
    setError("");
  }

  function deleteConversation(
    event: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) {
    event.stopPropagation();
    const next = conversations.filter((chat) => chat.id !== id);
    setConversations(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (id === currentId) startNewChat();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-[var(--bg-card)] text-[var(--text-primary)]">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-primary)] p-4 lg:flex">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 px-2 text-sm font-semibold tracking-wide text-[var(--text-primary)]"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[var(--accent)] text-white">
              ✦
            </span>{" "}
            SHOFIDEV_TOOLS
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="grid size-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm transition hover:border-[var(--accent)]"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
        <button
          type="button"
          onClick={startNewChat}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-[var(--bg-button)] px-3 py-3 text-left text-sm font-medium text-white transition hover:bg-[var(--accent)] disabled:opacity-50"
        >
          <span className="text-lg">+</span> New chat
        </button>
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
          <p className="mb-2 px-2 font-mono text-[10px] tracking-widest text-[var(--text-secondary)]">
            RECENT CHATS
          </p>
          {conversations.length ? (
            <div className="space-y-1">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center rounded-lg border ${chat.id === currentId ? "border-[var(--border)] bg-[var(--bg-surface)]" : "border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-surface)]/70"}`}
                >
                  <button
                    type="button"
                    onClick={() => openConversation(chat)}
                    className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-sm text-[var(--text-secondary)]"
                  >
                    {chat.title}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => deleteConversation(event, chat.id)}
                    className="mr-1 hidden rounded p-1.5 text-[var(--text-secondary)] hover:bg-[var(--status-danger-bg)] hover:text-[var(--status-danger)] group-hover:block"
                    aria-label={`Delete ${chat.title}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-2 text-xs leading-5 text-[var(--text-secondary)]">
              Your chats will be saved here on this device.
            </p>
          )}
        </div>
        <p className="mt-4 px-2 text-[11px] leading-4 text-[var(--text-secondary)]">
          Stored locally in this browser. AI can make mistakes—verify important
          information.
        </p>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col bg-[var(--bg-surface)]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="grid size-8 place-items-center rounded-lg bg-[var(--accent)] text-sm text-white lg:hidden"
            >
              ✦
            </Link>
            <div>
              <h1 className="font-semibold text-[var(--text-primary)]">
                SHOFIDEV_TOOLS AI
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Fast answers, clear explanations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="grid size-8 place-items-center rounded-lg border border-[var(--border)] text-sm lg:hidden"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "light" ? "🌙" : "☀️"}
            </button>
            <button
              type="button"
              onClick={startNewChat}
              disabled={isLoading}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card)] disabled:opacity-50 lg:hidden"
            >
              New chat
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto w-full max-w-4xl space-y-7">
            {!hasConversation && (
              <div className="py-8 text-center sm:py-14">
                <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl border border-white/20 bg-[var(--accent)] text-2xl text-white">
                  ✦
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                  What would you like to explore?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                  Ask a question, paste code, or choose a suggestion to get
                  started.
                </p>
                <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(undefined, prompt)}
                      className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm leading-5 text-[var(--text-secondary)] transition hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) =>
              message.id === "welcome" && hasConversation ? null : (
                <article
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-sm text-white">
                      ✦
                    </div>
                  )}
                  <div
                    className={`min-w-0 max-w-[90%] rounded-2xl px-4 py-3 text-[15px] leading-7 sm:max-w-[82%] ${message.role === "user" ? "rounded-br-md bg-[var(--bg-button)] text-white" : "rounded-bl-md bg-[var(--bg-surface)] text-[var(--text-primary)] ring-1 ring-[var(--border)]"}`}
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
                        <i className="size-1.5 animate-bounce rounded-full bg-[var(--accent)]" />
                        <i className="size-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:150ms]" />
                        <i className="size-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                </article>
              ),
            )}
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)] px-4 py-3 text-sm text-[var(--status-danger)]"
              >
                {error}
              </p>
            )}
            <div ref={endRef} />
          </div>
        </div>
        <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4 sm:px-8">
          <form
            onSubmit={(e) => void sendMessage(e)}
            className="mx-auto max-w-4xl"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-2 transition focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isLoading}
                placeholder="Message SHOFIDEV_TOOLS AI…"
                className="min-h-7 flex-1 resize-none overflow-hidden bg-transparent px-2 py-1.5 text-[15px] leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] disabled:opacity-60"
                aria-label="Message SHOFIDEV_TOOLS AI"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-[var(--text-secondary)]">
              Enter to send · Shift + Enter for a new line
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

// Wrap in providers since /ai route bypasses AppShell
export default function AIPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary>
          <AIPageContent />
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}
