"use client";

import { FormEvent, useCallback, useState } from "react";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

type UseChatStreamOptions = {
  initialMessages?: ChatMessage[];
  endpoint?: string;
  maxHistory?: number;
};

type UseChatStreamReturn = {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (event?: FormEvent<HTMLFormElement>, prompt?: string) => Promise<void>;
  hasConversation: boolean;
};

export type { ChatMessage };

export function useChatStream({
  initialMessages = [],
  endpoint = "/api/chat",
  maxHistory = 12,
}: UseChatStreamOptions = {}): UseChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = useCallback(
    async (event?: FormEvent<HTMLFormElement>, prompt?: string) => {
      event?.preventDefault();
      const text = (prompt ?? input).trim();
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
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: requestMessages
              .slice(-maxHistory)
              .map(({ role, content }) => ({ role, content })),
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
    },
    [input, isLoading, messages, endpoint, maxHistory],
  );

  const hasConversation = messages.some((message) => message.role === "user");

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    error,
    setError,
    sendMessage,
    hasConversation,
  };
}
