import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { isActiveMember, isActiveRole } from "../lib/memberRole";
import { proxy } from "../proxy";

// Auditoria 2026-10-22. Só mocks: nenhum fetch sai para Supabase real.
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54329";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "fixture-only";
process.env.SUPABASE_SERVICE_ROLE_KEY = "fixture-only";

function mockProfiles(roles: Record<string, string | null>) {
  const original = global.fetch;
  global.fetch = async (input) => {
    const url = new URL(String(input));
    assert.equal(url.origin, "http://127.0.0.1:54329", "teste nunca acessa serviço real");
    if (url.pathname.endsWith("/profiles")) {
      const id = (url.searchParams.get("id") ?? "").replace(/^eq\./, "");
      const role = roles[id];
      return new Response(JSON.stringify(role === undefined ? null : { role }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("{}", { status: 404 });
  };
  return () => {
    global.fetch = original;
  };
}

test("S3: só owner/admin/member são papéis ativos", () => {
  for (const r of ["owner", "admin", "member"]) assert.equal(isActiveRole(r), true);
  for (const r of ["pending", "", null, undefined, "OWNER"]) assert.equal(isActiveRole(r), false);
});

test("S3: conta pending ou sem profile não é membro ativo (fail-closed)", async () => {
  const restore = mockProfiles({ ativo: "member", novo: "pending" });
  try {
    assert.equal(await isActiveMember("ativo"), true);
    assert.equal(await isActiveMember("novo"), false);
    assert.equal(await isActiveMember("sem-profile"), false);
  } finally {
    restore();
  }
});

test("S1/S2: GET de leads sem login é barrado no proxy; request-contact segue público", async () => {
  const lista = await proxy(new NextRequest("http://localhost/api/leads"));
  assert.equal(lista.status, 401);
  const um = await proxy(new NextRequest("http://localhost/api/leads/abc"));
  assert.equal(um.status, 401);
  const publico = await proxy(
    new NextRequest("http://localhost/api/leads/abc/request-contact", { method: "POST" })
  );
  assert.notEqual(publico.status, 401);
});
