"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const EXPERIMENT = "hero_cta";
const SID_KEY = "preceptor_sid";
const VARIANT_KEY = "preceptor_ab_hero_cta";
const IMPRESSION_KEY = "preceptor_ab_hero_cta_imp";
const HREF = "/diagnostico?start=1";

type Variant = "A" | "B";

const VARIANT_LABEL: Record<Variant, string> = {
  A: "Descobrir se a minha ideia dá dinheiro",
  B: "Fazer o diagnóstico do meu negócio",
};

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

function getOrCreateSessionId(): string {
  const existing = readStorage(SID_KEY);
  if (existing) return existing;
  const generated =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  writeStorage(SID_KEY, generated);
  return generated;
}

// Deterministic, stable hash of the session id mapped to a variant index.
function hashToVariant(sessionId: string): Variant {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i += 1) {
    hash = (hash * 31 + sessionId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2 === 0 ? "A" : "B";
}

function resolveVariant(sessionId: string): Variant {
  const stored = readStorage(VARIANT_KEY);
  if (stored === "A" || stored === "B") return stored;
  const variant = hashToVariant(sessionId);
  writeStorage(VARIANT_KEY, variant);
  return variant;
}

function track(
  eventType: "impression" | "click",
  variant: Variant,
  sessionId: string
): void {
  try {
    const payload = JSON.stringify({
      experiment: EXPERIMENT,
      variant,
      event_type: eventType,
      session_id: sessionId,
    });
    // keepalive lets the click event flush even as navigation begins.
    void fetch("/api/ab/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Swallow: the link must keep working even if tracking fails.
    });
  } catch {
    // Never block navigation on tracking.
  }
}

export function HeroCta() {
  // Render the control label on the server / first paint to avoid hydration
  // mismatch; swap to the resolved variant once mounted.
  const [variant, setVariant] = useState<Variant>("A");
  const sessionRef = useRef<string | null>(null);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    sessionRef.current = sessionId;
    const resolved = resolveVariant(sessionId);
    setVariant(resolved);

    if (!readStorage(IMPRESSION_KEY)) {
      writeStorage(IMPRESSION_KEY, "1");
      track("impression", resolved, sessionId);
    }
  }, []);

  function handleClick() {
    const sessionId = sessionRef.current ?? getOrCreateSessionId();
    track("click", variant, sessionId);
  }

  const label = VARIANT_LABEL[variant];

  return (
    <Link
      href={HREF}
      className="mkt-btn mkt-btn--primary mkt-btn--lg"
      aria-label={label}
      data-ab-variant={variant}
      onClick={handleClick}
    >
      {label}
      <span className="mkt-btn__icon" aria-hidden="true">→</span>
    </Link>
  );
}
