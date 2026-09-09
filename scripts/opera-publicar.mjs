#!/usr/bin/env node
// Invoke from the venture: node /path/to/preceptor-studio/scripts/opera-publicar.mjs
// No secrets in command arguments or project manifests.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const raiz = resolve(process.argv[2] ?? process.cwd());
const base = new URL(process.env.OPERA_PORTAL_URL ?? "https://www.preceptorstudio.com");
if (base.protocol !== "https:" && !(base.protocol === "http:" && ["localhost", "127.0.0.1"].includes(base.hostname))) throw new Error("O portal precisa usar HTTPS (HTTP permitido apenas em localhost).");
const token = process.env.OPERA_PORTAL_TOKEN;
if (!token) throw new Error("Configure OPERA_PORTAL_TOKEN com uma sessão válida de membro. Nunca grave o token no projeto.");
const projeto = JSON.parse(await readFile(resolve(raiz, ".opera/portal.json"), "utf8"));
if (typeof projeto.slug !== "string" || !/^[a-z0-9][a-z0-9-]{1,60}$/.test(projeto.slug)) throw new Error("Slug inválido em .opera/portal.json.");
const snapshot = JSON.parse(await readFile(resolve(raiz, ".opera/painel.json"), "utf8"));
async function pedido(path, method = "GET", body) {
  const r = await fetch(new URL(path, base), { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30_000), redirect: "error" });
  const json = await r.json().catch(() => ({}));
  if (!r.ok && r.status !== 404) throw new Error(json.error ?? `Portal respondeu HTTP ${r.status}.`);
  return { status: r.status, json };
}
const path = `/api/opera/projetos/${projeto.slug}`;
const existe = await pedido(path);
if (existe.status === 404) await pedido("/api/opera/projetos", "POST", { ...projeto, snapshot: null });
// A retry of the identical publication is a no-op.
if (existe.status === 404 || JSON.stringify(existe.json.snapshot) !== JSON.stringify(snapshot)) await pedido(path, "PATCH", { snapshot });
console.log(`Acompanhamento publicado: ${new URL(`/painel/${projeto.slug}`, base)}`);
console.log(`Colheita: ${new URL(`/colheita/${projeto.slug}`, base)}`);
