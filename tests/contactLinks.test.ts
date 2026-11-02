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
