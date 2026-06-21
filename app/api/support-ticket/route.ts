import { createSupportTicket, SUPPORT_TICKET_TYPES_FALLBACK } from "@/lib/clientexec";
import { verifyTurnstile } from "@/lib/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TYPES = new Set(SUPPORT_TICKET_TYPES_FALLBACK.map((t) => t.value));

export async function POST(request: Request): Promise<Response> {
  let name = "", email = "", subject = "", message = "", ticketType = "", turnstileToken = "";
  try {
    const body = await request.json();
    name = typeof body?.name === "string" ? body.name.trim() : "";
    email = typeof body?.email === "string" ? body.email.trim() : "";
    subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    message = typeof body?.message === "string" ? body.message.trim() : "";
    ticketType = typeof body?.ticketType === "string" ? body.ticketType.trim() : "";
    turnstileToken = typeof body?.turnstileToken === "string" ? body.turnstileToken : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!name || !email || !subject || !message || !ticketType) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!VALID_TYPES.has(ticketType)) {
    return Response.json({ error: "Choose a topic from the list." }, { status: 400 });
  }
  if (!turnstileToken) {
    return Response.json({ error: "Please complete the verification." }, { status: 400 });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? undefined;
  try {
    const human = await verifyTurnstile(turnstileToken, ip);
    if (!human) {
      return Response.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Verification is temporarily unavailable. Please try again." }, { status: 502 });
  }

  try {
    const sent = await createSupportTicket({ name, email, subject, message, ticketType });
    if (sent) return Response.json({ ok: true });
    return Response.json({ ok: false, error: "We couldn't submit your ticket. Please try again or email help@serverizz.com." });
  } catch {
    return Response.json({ error: "Support is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
