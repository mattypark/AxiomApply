import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { isValidToken, MARKETING_TOPIC } from "@/lib/email/unsubscribe";

/**
 * One-click unsubscribe.
 *
 * GET  — the human clicking the footer link. Returns a plain confirmation page.
 * POST — RFC 8058 List-Unsubscribe-Post, which Gmail and Outlook fire without
 *        ever loading the page. Both paths do the same write.
 *
 * Topic-scoped: this stops network updates only. Application mail keeps
 * flowing, which is the whole point of splitting the topics.
 */

async function optOut(email: string, topic: string, token: string) {
  if (!email || !isValidToken(email, topic, token)) {
    return { ok: false, status: 400 as const };
  }

  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, status: 503 as const };

  const { error } = await supabase
    .from("email_optouts")
    .upsert(
      { email: email.toLowerCase(), topic, reason: "unsubscribe" },
      { onConflict: "email,topic", ignoreDuplicates: true },
    );

  return error ? { ok: false, status: 500 as const } : { ok: true, status: 200 as const };
}

function read(request: Request) {
  const url = new URL(request.url);
  return {
    email: url.searchParams.get("email")?.trim() ?? "",
    topic: url.searchParams.get("topic")?.trim() || MARKETING_TOPIC,
    token: url.searchParams.get("token")?.trim() ?? "",
  };
}

export async function GET(request: Request) {
  const { email, topic, token } = read(request);
  const result = await optOut(email, topic, token);

  const body = result.ok
    ? `You're unsubscribed from network updates.\n\n${email}\n\nYou'll still get email about your own application — that part isn't marketing, and turning it off would mean you never hear your decision.\n\nChanged your mind? Reply to any email from us.`
    : `That unsubscribe link isn't valid.\n\nReply to any email from Axiom and we'll take you off by hand.`;

  return new NextResponse(body, {
    status: result.status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  const { email, topic, token } = read(request);
  const result = await optOut(email, topic, token);
  return new NextResponse(null, { status: result.ok ? 200 : result.status });
}
