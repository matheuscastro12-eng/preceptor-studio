// Transactional email via Resend REST API (no SDK, fetch puro).
// Best-effort: nunca lanca excecao pro caller. Se faltar config, retorna ok:false.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://preceptorstudio.com";

const STUDIO_EMAIL = "thiago@ospreceptores.com";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  if (!apiKey || !emailFrom) {
    return { ok: false, error: "email not configured" };
  }

  const from = `PRECEPTOR! Studio <${emailFrom}>`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      let detail = `resend ${res.status}`;
      try {
        const body = (await res.json()) as { message?: string };
        if (body?.message) detail = body.message;
      } catch {
        // ignore parse failure
      }
      return { ok: false, error: detail };
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "timeout"
          : err.message
        : "unknown error";
    return { ok: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Layout HTML da marca (inline-styled) ──────────────────────────────────

export interface EmailLayoutInput {
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailLayout(input: EmailLayoutInput): string {
  const { heading, bodyHtml, ctaLabel, ctaUrl, footerNote } = input;

  const cta =
    ctaUrl && ctaLabel
      ? `
        <tr>
          <td style="padding:8px 0 4px 0;">
            <a href="${esc(ctaUrl)}" target="_blank" rel="noopener"
              style="display:inline-block;background:linear-gradient(135deg,#0A1F44 0%,#06122A 100%);color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;border-radius:10px;padding:12px 20px;">
              ${esc(ctaLabel)}
            </a>
          </td>
        </tr>`
      : "";

  const note = footerNote
    ? `<div style="margin-top:6px;color:#94A3B8;font-size:12px;line-height:1.5;">${esc(
        footerNote
      )}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#06122A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#06122A;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FBFCFE;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:10px;vertical-align:middle;">
                      <span style="display:inline-block;width:16px;height:16px;background-color:#52E1E7;transform:rotate(45deg);"></span>
                    </td>
                    <td style="vertical-align:middle;">
                      <span style="font-size:18px;font-weight:800;color:#0A1F44;letter-spacing:0.02em;">PRECEPTOR!</span>
                      <span style="font-size:13px;font-weight:700;color:#52E1E7;letter-spacing:0.22em;margin-left:6px;">STUDIO</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <h1 style="margin:0;font-size:24px;line-height:1.25;font-weight:800;color:#0A1F44;">${esc(
                  heading
                )}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 32px 8px 32px;color:#475569;font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 28px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">${cta}</table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 28px 32px;border-top:1px solid #E2E8F0;">
                <div style="color:#94A3B8;font-size:12px;line-height:1.5;">PRECEPTOR! Venture Studio &middot; Itajuba, MG</div>
                ${note}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export { STUDIO_EMAIL };
