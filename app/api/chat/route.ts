import { google } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are PixelPreserve AI, an expert senior full-stack developer and patient technical tutor.

Help users with programming, debugging, architecture, study, and general questions. Give correct, pragmatic answers that suit the user's apparent experience level. For technical answers:
- Start with the direct answer or recommendation.
- Explain the reasoning clearly in a concise, step-by-step way when useful.
- Provide complete, runnable code snippets when code is requested, including filenames and setup notes when relevant.
- Call out assumptions, security concerns, trade-offs, and common pitfalls.
- Use well-structured Markdown: headings, lists, bold emphasis, tables when helpful, and fenced code blocks with a language tag.
- Do not invent APIs, package behavior, test results, or citations. Say when you are uncertain.

Stay friendly, precise, and focused. Never expose secrets, API keys, or private data.`;

type IncomingMessage = { role?: unknown; content?: unknown };

function isValidMessage(message: IncomingMessage): message is { role: "user" | "assistant"; content: string } {
  return (message.role === "user" || message.role === "assistant") && typeof message.content === "string" && message.content.trim().length > 0;
}

export async function POST(request: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ error: "The Gemini API key is not configured on the server." }, { status: 500 });
  }

  try {
    const body: { messages?: IncomingMessage[] } = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages.filter(isValidMessage).slice(-12) : [];

    if (messages.length === 0 || messages.at(-1)?.role !== "user") {
      return Response.json({ error: "Please provide at least one user message." }, { status: 400 });
    }

    const result = streamText({
      // Selected from the Gemini API error response for this API key/account.
      model: google("gemini-3.6-flash"),
      system: SYSTEM_PROMPT,
      messages: messages as ModelMessage[],
      temperature: 0.35,
      // Keep responses fast for an interactive chat experience.
      providerOptions: {
        google: { thinkingConfig: { thinkingLevel: "minimal" } },
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat request failed:", error);
    return Response.json({ error: "Unable to process this chat request. Please try again." }, { status: 500 });
  }
}
