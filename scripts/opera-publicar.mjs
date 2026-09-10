#!/usr/bin/env node
// Invoke from the venture: node /path/to/preceptor-studio/scripts/opera-publicar.mjs
// No secrets in command arguments or project manifests.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from 'node:crypto';

const raiz = resolve(process.argv[2] ?? process.cwd());
const base = new URL(process.env.OPERA_PORTAL_URL ?? "https://www.preceptorstudio.com");
if (base.protocol !== "https:" && !(base.protocol === "http:" && ["localhost", "127.0.0.1"].includes(base.hostname))) throw new Error("O portal precisa usar HTTPS (HTTP permitido apenas em localhost).");
const token = process.env.OPERA_PORTAL_TOKEN;
if (!token) throw new Error("Configure OPERA_PORTAL_TOKEN no ambiente. Nunca grave o token no projeto.");
const projeto = JSON.parse(await readFile(resolve(raiz, ".opera/portal.json"), "utf8"));
if (typeof projeto.slug !== "string" || !/^[a-z0-9][a-z0-9-]{1,60}$/.test(projeto.slug)) throw new Error("Slug inválido em .opera/portal.json.");
if(!projeto.construcaoId)throw new Error('Cadastre no portal e copie o manifesto com construcaoId da página de conexão.');
const snapshot = JSON.parse(await readFile(resolve(raiz, ".opera/painel.json"), "utf8"));
async function pedido(path, method = "GET", body) {
  const r = await fetch(new URL(path, base), { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30_000), redirect: "error" });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json.error ?? `Portal respondeu HTTP ${r.status}.`);
  return { status: r.status, json };
}
const h=createHash('sha256').update(JSON.stringify([projeto.construcaoId,snapshot])).digest('hex');
const eventoId=`${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;
await pedido(`/api/opera/projetos/${projeto.slug}/conexao`, 'POST', {eventoId,construcaoId:projeto.construcaoId,snapshot,artefatos:[]});
console.log(`Acompanhamento publicado: ${new URL(`/painel/${projeto.slug}`, base)}`);
console.log(`Colheita: ${new URL(`/colheita/${projeto.slug}`, base)}`);
