import { test } from "node:test";
import assert from "node:assert/strict";
import { MOVIMENTE } from "../lib/onboarding/movimente";
import { EXTENSOES_PERMITIDAS, extensao, limparValores, pareceSegredo, todosOsCampos } from "../lib/onboarding/model";

test("definição da Movimente: ids únicos, escolhas com opções, extensões conhecidas", () => {
  const campos = todosOsCampos(MOVIMENTE);
  assert.equal(new Set(campos.map((c) => c.id)).size, campos.length);
  assert.equal(new Set(MOVIMENTE.secoes.map((s) => s.id)).size, MOVIMENTE.secoes.length);
  for (const c of campos) {
    assert.match(c.id, /^[a-z0-9_]+$/);
    if (c.tipo === "escolha") assert.ok(c.opcoes.length >= 2, c.id);
    if (c.tipo === "tabela") assert.equal(new Set(c.colunas.map((x) => x.id)).size, c.colunas.length, c.id);
    if (c.tipo === "arquivos") for (const e of c.aceita) assert.ok(Object.hasOwn(EXTENSOES_PERMITIDAS, e), `${c.id}: ${e}`);
  }
});

test("limparValores descarta campo desconhecido, opção inválida e coluna fora da lista", () => {
  const v = limparValores(
    {
      inventado: "x",
      email_dominio: "  grupomovimente.com.br  ",
      email_provedor: { escolha: "Yahoo", outro: "Zimbra" },
      brudam_homologacao: { escolha: "Sim" },
      operadores: [{ nome: "Fulana", papel: "Diretora", email: "f@x.example" }, {}, { nome: "" }],
    },
    MOVIMENTE,
  );
  assert.equal(v.inventado, undefined);
  assert.equal(v.email_dominio, "grupomovimente.com.br");
  assert.deepEqual(v.email_provedor, { escolha: null, outro: "Zimbra" });
  assert.deepEqual(v.brudam_homologacao, { escolha: "Sim", outro: null });
  assert.deepEqual(v.operadores, [{ nome: "Fulana", email: "f@x.example" }]);
});

test("limparValores ignora corpo que não é objeto", () => {
  assert.deepEqual(limparValores(null, MOVIMENTE), {});
  assert.deepEqual(limparValores(["a"], MOVIMENTE), {});
});

test("pareceSegredo pega senha e chaves, e deixa texto comum passar", () => {
  assert.ok(pareceSegredo("usuario COCKPIT senha: abc123"));
  assert.ok(pareceSegredo("token sk-ant-api03abcdefghijklmnop"));
  assert.ok(pareceSegredo("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.abc"));
  assert.ok(!pareceSegredo("A senha vai ser enviada pelo Matheus por telefone."));
  assert.ok(!pareceSegredo("Reentrega em até 2 dias úteis."));
});

test("extensao lê só o sufixo final, em minúsculas", () => {
  assert.equal(extensao("Carteira Clientes.XLSX"), "xlsx");
  assert.equal(extensao("sem-extensao"), "");
  assert.equal(extensao("arquivo.tar.gz"), "gz");
});
