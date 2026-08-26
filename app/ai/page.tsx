"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; messages: ChatMessage[]; updatedAt: number };

const STORAGE_KEY = "pixelpreserve-ai-conversations-v1";
const STARTER_PROMPTS = ["Explain React Server Components simply", "Help me debug a TypeScript error", "Make a 7-day study plan for JavaScript"];
const welcomeMessage: ChatMessage = { id: "welcome", role: "assistant", content: "# How can I help you today?\n\nI can help with coding, study plans, debugging, writing, and everyday questions." };

function newConversationId() { return crypto.randomUUID(); }
function conversationTitle(messages: ChatMessage[]) {
  const question = messages.find((message) => message.role === "user")?.content.trim() ?? "New conversation";
  return question.length > 42 ? `${question.slice(0, 42)}…` : question;
}

export default function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(parsed) && parsed.length) {
        const history = parsed.filter((item): item is Conversation => Boolean(item) && typeof item.id === "string" && Array.isArray(item.messages));
        if (history.length) { setConversations(history); setCurrentId(history[0].id); setMessages(history[0].messages); }
        else setCurrentId(newConversationId());
      } else setCurrentId(newConversationId());
    } catch { setCurrentId(newConversationId()); }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || isLoading || messages.length < 2 || !currentId) return;
    const updated: Conversation = { id: currentId, title: conversationTitle(messages), messages: messages.slice(-50), updatedAt: Date.now() };
    setConversations((current) => {
      const next = [updated, ...current.filter((chat) => chat.id !== currentId)].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [messages, isLoading, currentId, isReady]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading, error]);
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [input]);

  function startNewChat() {
    setCurrentId(newConversationId()); setMessages([welcomeMessage]); setInput(""); setError("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  function openConversation(chat: Conversation) {
    if (isLoading) return;
    setCurrentId(chat.id); setMessages(chat.messages); setError("");
  }
  function deleteConversation(event: React.MouseEvent<HTMLButtonElement>, id: string) {
    event.stopPropagation();
    const next = conversations.filter((chat) => chat.id !== id);
    setConversations(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (id === currentId) startNewChat();
  }

  async function sendMessage(event?: FormEvent<HTMLFormElement>, prompt?: string) {
    event?.preventDefault();
    const text = (prompt ?? input).trim();
    if (!text || isLoading) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();
    const requestMessages = [...messages, userMessage];
    setMessages([...requestMessages, { id: assistantId, role: "assistant", content: "" }]);
    setInput(""); setError(""); setIsLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: requestMessages.map(({ role, content }) => ({ role, content })) }) });
      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "The assistant could not respond. Please try again.");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, content: answer } : message));
      }
      answer += decoder.decode();
    } catch (caughtError) {
      setMessages((current) => current.filter((message) => message.id !== assistantId));
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong. Please try again.");
    } finally { setIsLoading(false); inputRef.current?.focus(); }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); }
  }

  const hasConversation = messages.some((message) => message.role === "user");
  return <main className="flex h-dvh w-full overflow-hidden bg-[#f5f8f6] text-[#17201e]">
    <aside className="hidden w-72 shrink-0 flex-col border-r border-[#dce5df] bg-[#edf3ef] p-4 lg:flex">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2 text-sm font-semibold tracking-wide"><span className="grid size-8 place-items-center rounded-lg bg-[#157c62] text-white">✦</span> PIXELPRESERVE</Link>
      <button type="button" onClick={startNewChat} disabled={isLoading} className="flex items-center gap-2 rounded-xl bg-[#17201e] px-3 py-3 text-left text-sm font-medium text-white transition hover:bg-[#157c62] disabled:opacity-50"><span className="text-lg">+</span> New chat</button>
      <div className="mt-6 min-h-0 flex-1 overflow-y-auto"><p className="mb-2 px-2 font-mono text-[10px] tracking-widest text-[#71807b]">RECENT CHATS</p>{conversations.length ? <div className="space-y-1">{conversations.map((chat) => <div key={chat.id} className={`group flex items-center rounded-lg ${chat.id === currentId ? "bg-white shadow-sm" : "hover:bg-white/70"}`}><button type="button" onClick={() => openConversation(chat)} className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-sm text-slate-600">{chat.title}</button><button type="button" onClick={(event) => deleteConversation(event, chat.id)} className="mr-1 hidden rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 group-hover:block" aria-label={`Delete ${chat.title}`}>×</button></div>)}</div> : <p className="px-2 text-xs leading-5 text-slate-400">Your chats will be saved here on this device.</p>}</div>
      <p className="mt-4 px-2 text-[11px] leading-4 text-[#71807b]">Stored locally in this browser. AI can make mistakes—verify important information.</p>
    </aside>
    <section className="flex min-w-0 flex-1 flex-col bg-[#fcfdfc]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4 sm:px-6"><div className="flex items-center gap-3"><Link href="/" className="grid size-8 place-items-center rounded-lg bg-[#157c62] text-sm text-white lg:hidden">✦</Link><div><h1 className="font-semibold">PixelPreserve AI</h1><p className="text-xs text-slate-500">Fast answers, clear explanations</p></div></div><button type="button" onClick={startNewChat} disabled={isLoading} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 lg:hidden">New chat</button></header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-8 sm:px-8 sm:py-10"><div className="mx-auto w-full max-w-4xl space-y-7">
        {!hasConversation && <div className="py-8 text-center sm:py-14"><div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[#157c62] text-2xl text-white shadow-[0_12px_28px_#157c6240]">✦</div><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What would you like to explore?</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Ask a question, paste code, or choose a suggestion to get started.</p><div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-3">{STARTER_PROMPTS.map((prompt) => <button key={prompt} type="button" onClick={() => void sendMessage(undefined, prompt)} className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-5 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-[#8bc3aa] hover:bg-[#f2faf5] hover:text-[#157c62]">{prompt}</button>)}</div></div>}
        {messages.map((message) => message.id === "welcome" && hasConversation ? null : <article key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>{message.role === "assistant" && <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#157c62] text-sm text-white">✦</div>}<div className={`min-w-0 max-w-[90%] rounded-2xl px-4 py-3 text-[15px] leading-7 sm:max-w-[82%] ${message.role === "user" ? "rounded-br-md bg-[#17201e] text-white" : "rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"}`}>{message.content ? <div className="chatbot-markdown break-words"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown></div> : <span className="inline-flex items-center gap-1 text-slate-400" aria-label="Thinking"><i className="size-1.5 animate-bounce rounded-full bg-[#157c62]" /><i className="size-1.5 animate-bounce rounded-full bg-[#157c62] [animation-delay:150ms]" /><i className="size-1.5 animate-bounce rounded-full bg-[#157c62] [animation-delay:300ms]" /></span>}</div></article>)}
        {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div ref={endRef} />
      </div></div>
      <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-8"><form onSubmit={sendMessage} className="mx-auto max-w-4xl"><div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-2 shadow-sm transition focus-within:border-[#157c62] focus-within:ring-2 focus-within:ring-[#b9d8c5]"><textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} rows={1} disabled={isLoading} placeholder="Message PixelPreserve AI…" className="min-h-7 flex-1 resize-none overflow-hidden bg-transparent px-2 py-1.5 text-[15px] leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60" aria-label="Message PixelPreserve AI" /><button type="submit" disabled={!input.trim() || isLoading} className="rounded-xl bg-[#157c62] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#10664f] disabled:cursor-not-allowed disabled:opacity-40">Send</button></div><p className="mt-2 text-center text-[11px] text-slate-400">Enter to send · Shift + Enter for a new line</p></form></div>
    </section>
  </main>;
}
