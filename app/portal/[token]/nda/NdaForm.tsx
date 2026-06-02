"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NDA_TEXT = `# Acordo de Confidencialidade (NDA)

**Entre as partes:** o estúdio PRECEPTOR! e o signatário identificado abaixo.

## 1. Objeto
Este acordo cobre todo material confidencial compartilhado pelo estúdio através
deste portal, incluindo estudos, briefings de marca, planos comerciais,
cronogramas de execução e quaisquer documentos anexos ou derivados.

## 2. Obrigações
O signatário se compromete a:

- Tratar todo conteúdo como estritamente confidencial.
- Não divulgar, copiar, reproduzir ou compartilhar com terceiros sem
  autorização prévia e por escrito do estúdio.
- Usar o material exclusivamente para os fins do projeto em questão.
- Restringir o acesso a colaboradores diretamente envolvidos no projeto, sob a
  mesma obrigação de confidencialidade.

## 3. Prazo
A obrigação de confidencialidade vigora por 24 (vinte e quatro) meses a partir
da data de assinatura, mesmo após o término do projeto.

## 4. Propriedade
Todo o conteúdo permanece de propriedade intelectual do estúdio até que
contrato específico estabeleça transferência de direitos.

## 5. Foro e jurisdição
Este acordo é regido pelas leis da República Federativa do Brasil. Fica
eleito o foro da comarca de São Paulo, SP, para dirimir quaisquer
controvérsias.

## 6. Assinatura eletrônica
Ao marcar a caixa de concordância e clicar em assinar, o signatário
manifesta consentimento expresso, equiparado à assinatura física para os
fins deste acordo, conforme Lei 14.063/2020 e MP 2.200-2/2001.`;

export function NdaForm({
  token,
  studyTitle,
  defaultName,
  defaultEmail,
}: {
  token: string;
  studyTitle: string;
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError("Você precisa concordar com o NDA para continuar.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/${token}/sign-nda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signed_by_name: name,
          signed_by_email: email,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Erro ao assinar");
      }
      router.push(`/portal/${token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-cyan text-[10px] font-bold tracking-[0.25em] uppercase">
            <span className="w-1.5 h-1.5 bg-cyan rounded-sm rotate-45" />
            PRECEPTOR! Studio
          </div>
          <h1 className="mt-3 text-3xl font-black text-navy tracking-tight">
            Antes de acessar o conteúdo
          </h1>
          <p className="mt-2 text-ink-soft text-sm">
            Para liberar o portal de {studyTitle}, pedimos a assinatura de um
            NDA simples.
          </p>
        </div>

        <form onSubmit={submit} className="surface rounded-2xl p-8 space-y-5">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-ink-mute block mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-ink-mute block mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-ink-soft leading-snug">
              Li e concordo com o NDA.{" "}
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-navy underline font-semibold hover:text-cyan transition"
              >
                Ler NDA completo
              </button>
            </span>
          </label>

          {error && (
            <div className="text-sm text-red-600 font-semibold">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full text-sm"
            style={{ padding: "12px 16px" }}
          >
            {submitting ? "Assinando..." : "Assinar e continuar"}
          </button>
        </form>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-black text-navy">NDA completo</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-ink-soft hover:text-navy text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-ink-soft font-sans leading-relaxed">
              {NDA_TEXT}
            </pre>
            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-ghost text-sm"
                style={{ padding: "8px 16px" }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
