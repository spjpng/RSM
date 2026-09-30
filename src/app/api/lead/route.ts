import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/content-server";
import { validateLead } from "@/lib/lead";

// Server-only: GOOGLE_SHEET_WEBHOOK_URL is read here and never sent to the browser.
export const runtime = "nodejs";

const fail = (status: number, error: string, extra?: object) =>
  NextResponse.json({ ok: false, error, ...extra }, { status });

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
  } catch {
    return fail(400, "Invalid request body.");
  }

  // Honeypot: real users never fill this hidden field. Pretend success for bots.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const values = body.fields;
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return fail(400, "Invalid request body.");
  }

  // Validate against the form schema stored in Firestore (or the defaults if unreachable),
  // so the server enforces whatever fields the admin has configured.
  const { form } = await getSiteContent();
  const { lead, errors } = validateLead(form.fields, values as Record<string, unknown>);
  if (Object.keys(errors).length > 0) {
    return fail(422, "Please check the highlighted fields.", { errors });
  }

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("GOOGLE_SHEET_WEBHOOK_URL is not set");
    return fail(500, "Signups are not configured yet. Please try again later.");
  }

  // The Apps Script matches keys to the sheet's header row and adds a column for any
  // key it hasn't seen, so the payload just follows the form's field order.
  const payload = { timestamp: new Date().toISOString(), ...lead };

  try {
    // Apps Script answers a POST with a 302 to script.googleusercontent.com;
    // fetch follows it and returns the script's output.
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const text = await res.text().catch(() => "");

    // Apps Script returns HTTP 200 with an HTML page when the script throws or when the
    // deployment isn't public (a Google sign-in page), so a 200 alone isn't proof of success.
    // The script also reports its own errors as {"ok": false, "error": "..."}.
    const isHtml = (res.headers.get("content-type") ?? "").includes("text/html");
    const noReturnValue = text.includes("The script completed but did not return anything");
    const reportedFailure = !isHtml && parseOk(text) === false;
    if (!res.ok || (isHtml && !noReturnValue) || reportedFailure) {
      console.error("Lead webhook failed", res.status, text.slice(0, 500));
      return fail(502, "We couldn't save your details. Please try again in a moment.");
    }
  } catch (err) {
    console.error("Lead webhook request failed", err);
    return fail(502, "We couldn't save your details. Please try again in a moment.");
  }

  return NextResponse.json({ ok: true });
}

function parseOk(text: string): boolean | undefined {
  try {
    const data = JSON.parse(text);
    return typeof data?.ok === "boolean" ? data.ok : undefined;
  } catch {
    return undefined;
  }
}
