// PENDENTE (copy v3, pendência 18): a correção do /api/leads aberto (GET e POST sem login) e do banner de cookies (Pixel e GA4 carregam sem consentimento) seguem pendentes. Este formulário só usa /api/public/automation-lead e não muda a lógica de segurança de nenhuma rota.
"use client";

import { useEffect, useRef, useState } from "react";
import { getAttribution } from "@/lib/funnelTrack";
import { fbqTrack } from "@/lib/metaEvents";
import { CTA_TEXTO } from "./CtaLink";

const SEGMENTOS = [
  { value: "", label: "Selecione" },
  { value: "logistica", label: "Logística e transporte" },
  { value: "medicina", label: "Clínica" },
  { value: "outro", label: "Outro" },
];

const PROCESSOS = [
  "Digitação de documentos",
  "Conciliação e financeiro",
  "Atendimento no WhatsApp",
  "Emissão de CT-e e MDF-e",
  "Retomada de contatos",
  "Rotas e ocorrências de entrega",
  "Outro",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MSG = {
  nome: "Escreva seu nome.",
  email: "Confira o e-mail.",
  telefone: "Confira o número com DDD.",
  empresa: "Escreva o nome da empresa.",
  segmento: "Selecione o segmento.",
  consent: "Para enviar, marque a autorização.",
  sucesso: "Recebido. A gente vai falar com você para marcar o diagnóstico de 30 min.",
};

type Campo = "nome" | "email" | "telefone" | "empresa" | "segmento" | "consent";
const ORDEM: Campo[] = ["nome", "email", "telefone", "empresa", "segmento", "consent"];
const IDS: Record<Campo, string> = {
  nome: "lf-nome",
  email: "lf-email",
  telefone: "lf-whatsapp",
  empresa: "lf-empresa",
  segmento: "lf-segmento",
  consent: "lf-consent",
};

type Status = "idle" | "sending" | "success" | "error";

export function LeadForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [segmento, setSegmento] = useState("");
  const [processo, setProcesso] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Campo, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement | null>(null);

  // Meta Pixel: dispara ViewContent quando o formulário entra na tela (uma vez).
  // Se o pixel ainda não carregou, tenta a cada 500ms (máx ~10s) antes de desistir.
  useEffect(() => {
    const el = formRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let fired = false;
    let poll: ReturnType<typeof setInterval> | null = null;

    const fire = () => {
      if (fired) return;
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        fired = true;
        fbqTrack("ViewContent", { content_name: "automacao_form" });
        if (poll) clearInterval(poll);
        obs.disconnect();
      } else if (!poll) {
        let tries = 0;
        poll = setInterval(() => {
          tries += 1;
          if (fired || tries > 20) {
            if (poll) clearInterval(poll);
            return;
          }
          fire();
        }, 500);
      }
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            fire();
            break;
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" }
    );
    obs.observe(el);
    return () => {
      if (poll) clearInterval(poll);
      obs.disconnect();
    };
  }, []);

  function validar(): Partial<Record<Campo, string>> {
    const e: Partial<Record<Campo, string>> = {};
    if (!nome.trim()) e.nome = MSG.nome;
    if (!EMAIL_RE.test(email.trim())) e.email = MSG.email;
    const digitos = telefone.replace(/\D/g, "");
    if (digitos.length < 10 || digitos.length > 13) e.telefone = MSG.telefone;
    if (!empresa.trim()) e.empresa = MSG.empresa;
    if (!segmento) e.segmento = MSG.segmento;
    if (!consent) e.consent = MSG.consent;
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (status === "sending" || status === "success") return;
    const e = validar();
    setErrors(e);
    const primeiro = ORDEM.find((c) => e[c]);
    if (primeiro) {
      setStatus("idle");
      document.getElementById(IDS[primeiro])?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/public/automation-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: { nome, email, telefone, empresa },
          mensagem: processo,
          category: segmento,
          consent: true,
          attribution: getAttribution(),
        }),
      });
      // 429 (limite de envios) e qualquer outra falha mostram a mesma mensagem da copy.
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !data.ok) throw new Error("envio");
      setStatus("success");
      // Navegação real (não SPA) para o Pixel registrar o PageView de /obrigado/automacao.
      window.setTimeout(() => window.location.assign("/obrigado/automacao"), 1200);
    } catch {
      setStatus("error");
    }
  }

  const erroProps = (c: Campo) =>
    errors[c]
      ? { "aria-invalid": true as const, "aria-describedby": `${IDS[c]}-erro` }
      : { "aria-invalid": false as const };

  const Erro = ({ c }: { c: Campo }) =>
    errors[c] ? (
      <p id={`${IDS[c]}-erro`} className="lp2-field__erro">
        {errors[c]}
      </p>
    ) : null;

  const sending = status === "sending";

  return (
    <form ref={formRef} className="lp2-form" onSubmit={submit} noValidate>
      <div className="lp2-field">
        <label htmlFor={IDS.nome}>Seu nome</label>
        <input
          id={IDS.nome}
          name="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como podemos te chamar"
          autoComplete="name"
          required
          {...erroProps("nome")}
        />
        <Erro c="nome" />
      </div>

      <div className="lp2-form__row">
        <div className="lp2-field">
          <label htmlFor={IDS.email}>E-mail de trabalho</label>
          <input
            id={IDS.email}
            name="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com.br"
            autoComplete="email"
            required
            {...erroProps("email")}
          />
          <Erro c="email" />
        </div>
        <div className="lp2-field">
          <label htmlFor={IDS.telefone}>WhatsApp</label>
          <input
            id={IDS.telefone}
            name="telefone"
            type="tel"
            inputMode="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
            autoComplete="tel"
            required
            {...erroProps("telefone")}
          />
          <Erro c="telefone" />
        </div>
      </div>

      <div className="lp2-form__row">
        <div className="lp2-field">
          <label htmlFor={IDS.empresa}>Empresa</label>
          <input
            id={IDS.empresa}
            name="empresa"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Nome da empresa"
            autoComplete="organization"
            required
            {...erroProps("empresa")}
          />
          <Erro c="empresa" />
        </div>
        <div className="lp2-field">
          <label htmlFor={IDS.segmento}>Segmento</label>
          <select
            id={IDS.segmento}
            name="segmento"
            value={segmento}
            onChange={(e) => setSegmento(e.target.value)}
            required
            {...erroProps("segmento")}
          >
            {SEGMENTOS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Erro c="segmento" />
        </div>
      </div>

      <div className="lp2-field">
        <label htmlFor="lf-processo">O que mais toma tempo hoje?</label>
        <select
          id="lf-processo"
          name="processo"
          value={processo}
          onChange={(e) => setProcesso(e.target.value)}
        >
          <option value="">Selecione</option>
          {PROCESSOS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="lp2-field lp2-field--check">
        <div className="lp2-check">
          <input
            id={IDS.consent}
            name="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            {...erroProps("consent")}
          />
          <label htmlFor={IDS.consent}>
            Autorizo a PRECEPTOR! a usar estes dados para responder este contato e agendar o
            diagnóstico, conforme a{" "}
            <a href="/privacidade" target="_blank" rel="noopener">
              Política de Privacidade
            </a>
            . Posso pedir acesso, correção ou exclusão a qualquer momento pelo{" "}
            <a href="/privacidade#lgpd" target="_blank" rel="noopener">
              canal do titular
            </a>
            .
          </label>
        </div>
        <Erro c="consent" />
      </div>

      <p className="lp2-form__aviso">
        Não envie dados de pacientes nem informações de saúde neste formulário.
      </p>

      <button type="submit" className="lp2-btn" disabled={sending} aria-disabled={sending}>
        {sending ? "Enviando..." : CTA_TEXTO}
      </button>

      <p className="lp2-form__micro">
        30 minutos, sem compromisso de piloto. A resposta vem para marcar a conversa.
      </p>
      {/* PENDENTE copy v3 (pendência 4): prazo "em até 1 dia útil" só entra se confirmado. */}

      <div role="status" aria-live="polite" className="lp2-form__status">
        {status === "success" ? <p className="lp2-form__ok">{MSG.sucesso}</p> : null}
        {status === "error" ? (
          <p className="lp2-form__falha">
            Não conseguimos enviar agora. Tente de novo em alguns minutos ou fale com a gente pelo{" "}
            <a href="https://wa.me/5535999191919" target="_blank" rel="noopener">
              WhatsApp
            </a>
            .
          </p>
        ) : null}
      </div>
    </form>
  );
}
