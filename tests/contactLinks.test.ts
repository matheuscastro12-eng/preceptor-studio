import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyContactHref, ctaLabel } from "../lib/contactLinks";
import { buildMetaEvent } from "../lib/metaCapi";

test("classifica links de contato", () => {
  assert.equal(classifyContactHref("https://wa.me/5535999191919?text=Ol%C3%A1"), "whatsapp_comercial");
  assert.equal(classifyContactHref("https://wa.me/5535987035957"), "whatsapp_automacao");
  assert.equal(classifyContactHref("https://api.whatsapp.com/send?phone=5535987035957"), "whatsapp_automacao");
  assert.equal(classifyContactHref("https://www.instagram.com/preceptorstudio/"), "instagram");
  assert.equal(classifyContactHref("https://instagram.com/preceptorstudio"), "instagram");
  assert.equal(classifyContactHref("https://instagram.com/outra"), null);
  assert.equal(classifyContactHref("https://wa.me/5511999999999"), null);
  assert.equal(classifyContactHref("/obrigado/automacao"), null);
  assert.equal(classifyContactHref(null), null);
});

test("rótulo do CTA", () => {
  assert.equal(ctaLabel("hero_whatsapp", "Falar"), "hero_whatsapp");
  assert.equal(ctaLabel(undefined, "  Falar   no WhatsApp "), "Falar no WhatsApp");
  assert.equal(ctaLabel(null, ""), "sem_rotulo");
  assert.equal(ctaLabel(null, "x".repeat(100)).length, 60);
});

test("evento CAPI leva o mesmo event_id do Pixel", () => {
  const ev = buildMetaEvent({ eventName: "Contact", eventId: "abc", fbp: "fb.1.1.2", customData: { content_name: "nav" } }, 1_000_000);
  assert.equal(ev.event_name, "Contact");
  assert.equal(ev.event_id, "abc");
  assert.equal(ev.event_time, 1000);
  assert.equal(ev.action_source, "website");
  assert.deepEqual(ev.user_data, { fbp: "fb.1.1.2" });
});

import { buildTrackRow } from "../lib/trackRow";
import { consentModeState } from "../lib/consent";

test("track sem consentimento não grava IP, UA nem sessão", () => {
  const ctx = { ip: "1.2.3.4", userAgent: "UA" };
  const anon = buildTrackRow({ event_type: "page_view", session_id: "s1", path: "/" }, ctx)!;
  assert.equal(anon.ip, null);
  assert.equal(anon.user_agent, null);
  assert.equal(anon.session_id, null);
  const ok = buildTrackRow({ event_type: "page_view", session_id: "s1", consent: true }, ctx)!;
  assert.equal(ok.ip, "1.2.3.4");
  assert.equal(ok.session_id, "s1");
  const click = buildTrackRow({ event_type: "contact_click", path: "/", destination: "instagram", cta_label: "rodape" }, ctx)!;
  assert.equal(click.path, "/ | instagram | rodape");
  assert.equal(buildTrackRow({ event_type: "x" }, ctx), null);
});

test("Consent Mode v2: quatro sinais", () => {
  assert.deepEqual(consentModeState(false), { ad_storage: "denied", analytics_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  assert.equal(consentModeState(true).ad_user_data, "granted");
});

test("Lead genérico leva em/ph com hash e event_id", () => {
  const ev = buildMetaEvent({ eventName: "Lead", eventId: "L1", email: " A@B.com ", phone: "(35) 9999" });
  const ud = ev.user_data as Record<string, string[]>;
  assert.equal(ev.event_id, "L1");
  assert.equal(ud.em[0].length, 64);
  assert.equal(ud.ph[0].length, 64);
});
