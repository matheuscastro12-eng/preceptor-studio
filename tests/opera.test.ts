import { test } from "node:test";
import assert from "node:assert/strict";
import { OASIS, colheitaInicial, validarColheita, validarProjeto, validarSnapshot, type Snapshot } from "../lib/opera/model";

const snapshot = (): Snapshot => ({ atualizadoEm: "2026-09-09T12:00:00.000Z", etapa: "corpus", resumo: "Coleta iniciada.", proximaAcao: "Revisar casos com a equipe.", testes: null, corpus: null, achados: [], atividades: [] });
test("OASIS mantém 47 perguntas, fichas A/B/C e instrumento v1", () => {
  validarColheita(OASIS.colheita);
  assert.equal(OASIS.colheita.perguntas.length, 47);
  assert.deepEqual(Object.keys(OASIS.colheita.fichas), ["A", "B", "C"]);
  assert.equal(OASIS.colheita.versao, 1);
});
test("novo projeto tem colheita independente do domínio OASIS", () => {
  const c = colheitaInicial(); validarColheita(c);
  assert.doesNotMatch(JSON.stringify(c), /OASIS|TRAFLOG|CT-e/);
  const p = { ...OASIS, slug: "clinica-exemplo", nome: "Agenda", cliente: "Clínica", processo: "Organizar agendamentos", responsavel: "Pessoa da operação", tipo: "plataforma", colheita: c, painel_publico: false, colheita_publica: false };
  validarProjeto(p);
  c.perguntas[0].texto = "Modificado";
  assert.notEqual(colheitaInicial().perguntas[0].texto, "Modificado");
});
test("instrumento recusa IDs duplicados, grupos inexistentes e fichas inválidas", () => {
  const c = colheitaInicial(); c.perguntas.push(c.perguntas[0]);
  assert.throws(() => validarColheita(c), /identificadores/);
  const d = colheitaInicial(); d.perguntas[0].grupo = "inexistente";
  assert.throws(() => validarColheita(d), /grupo/);
  const e = colheitaInicial(); e.ocorrencias[0].ficha = "inexistente";
  assert.throws(() => validarColheita(e), /Ocorrência/);
});
test("instrumento recusa objetos onde a interface espera texto e chaves perigosas", () => {
  const c = colheitaInicial(); (c.perguntas[0] as any).detalhe = { mal: true };
  assert.throws(() => validarColheita(c));
  const d = colheitaInicial(); d.perguntas[0].id = "__proto__";
  assert.throws(() => validarColheita(d));
});
test("publicação distingue dado ausente de zero e valida contagens", () => {
  validarSnapshot(snapshot());
  validarSnapshot({ ...snapshot(), testes: { passaram: 0, total: 0 } });
  assert.throws(() => validarSnapshot({ ...snapshot(), testes: { passaram: 4, total: 3 } }));
  assert.throws(() => validarSnapshot({ ...snapshot(), corpus: { validados: -1, meta: 20 } }));
});
test("publicação exige data canônica, etapa conhecida e achados tipados", () => {
  assert.throws(() => validarSnapshot({ ...snapshot(), atualizadoEm: "2026-09-09T12:00:00Z,or(snapshot.is.null)" }));
  assert.throws(() => validarSnapshot({ ...snapshot(), atualizadoEm: "2026-02-30T12:00:00.000Z" }));
  assert.throws(() => validarSnapshot({ ...snapshot(), etapa: "pronto" }));
  assert.throws(() => validarSnapshot({ ...snapshot(), achados: [{ titulo: "Erro", severidade: "critico", estado: "aberto" }] }));
});
test("artefatos têm âncoras únicas, incluindo o motor determinístico", () => {
  const a = { id: "motor", titulo: "Motor determinístico", estado: "informativo", conteudo: "## Revisão\nEvidências da execução." };
  validarSnapshot({ ...snapshot(), artefatos: [a] });
  assert.throws(() => validarSnapshot({ ...snapshot(), artefatos: [a, a] }));
});
