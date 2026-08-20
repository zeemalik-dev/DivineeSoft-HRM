import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Server-side proxy for the HR assistant.
 *
 * Two reasons this must not run in the browser:
 *   1. ANTHROPIC_API_KEY would be exposed in the bundle.
 *   2. The context has to be filtered to what the caller may see. Once auth is
 *      wired, read the role from the session here — never trust the body — and
 *      build the context from the database with the same WHERE clauses the REST
 *      endpoints use. An assistant with unfiltered payroll access will read a
 *      colleague's salary to anyone who asks.
 */

const SYSTEM = `You are the Divineesoft HR assistant, built into the Divineesoft Technologies HRM console and available around the clock to staff and managers.

Answer only from the company data provided below. If a figure is not in it, say so plainly rather than estimating. Be brief — two to five sentences, or a short list when comparing people or months. Use the currency symbol shown in the data. Never invent an employee, salary, or date.

You may explain policy (leave rules, payroll cycle, overtime at 1.5x basic/176, unpaid leave at basic/26 per day) and suggest which screen to open next. If a request would change data — approving leave, running payroll, changing someone's status — describe exactly what to click; never claim to have done it yourself. Respect confidentiality: if the signed-in role is Employee, discuss only that person's own record.

--- COMPANY DATA ---
`;

export async function POST(req: NextRequest) {
  let body: { messages?: { role: string; content: string }[]; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = (body.messages || []).filter(m => m.role === "user" || m.role === "assistant");
  if (!messages.length) {
    return NextResponse.json({ error: "No message supplied" }, { status: 400 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // Deployed without a key: the client falls back to its built-in answers.
    return NextResponse.json({ error: "AI is not configured", fallback: true }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM + (body.context || "No data supplied."),
        messages,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Anthropic error", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "Upstream error", fallback: true }, { status: 502 });
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((c: { type: string }) => c.type === "text")
      .map((c: { text: string }) => c.text)
      .join("\n")
      .trim();

    return NextResponse.json({ text });
  } catch (err) {
    console.error("AI proxy failed", err);
    return NextResponse.json({ error: "Request failed", fallback: true }, { status: 502 });
  }
}
