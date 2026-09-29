import { NextResponse } from "next/server";
import { validateLead } from "@/lib/lead";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field. Pretend success for bots.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const { lead, errors } = validateLead(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("GOOGLE_SHEET_WEBHOOK_URL is not set");
    return NextResponse.json(
      { ok: false, error: "Signups are not configured yet." },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...lead,
        submittedAt: new Date().toISOString(),
        source: "rsm-beta-landing",
      }),
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("Lead webhook responded with", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ ok: false, error: "Could not save your details." }, { status: 502 });
    }
  } catch (err) {
    console.error("Lead webhook request failed", err);
    return NextResponse.json({ ok: false, error: "Could not save your details." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
