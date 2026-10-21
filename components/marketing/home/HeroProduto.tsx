"use client";

import { useState } from "react";
import { Glifo } from "./Glifo";

/*
 * A tela do produto no hero, em HTML (data-ui): o fluxo do agente na emissão
 * de um CT-e, da NF-e que chega até a pessoa que aprova. O botão "Aprovar" do
 * painel funciona: aprova o exemplo e o último nó vira "CT-e emitido".
 * Todos os dados são fictícios e a tela está marcada como demonstração.
 */

const CONFERE = ["Remetente bate com o pedido", "Peso: 12.400 kg", "Valor da carga", "Destino e prazo"];

export function HeroProduto() {
  const [aprovado, setAprovado] = useState(false);
  const [corrigindo, setCorrigindo] = useState(false);

  return (
    <div className="mb-px" data-ui>
      <div className="mb-px__barra">
        <span className="mb-px__trilha">
          Torre de expedição <span aria-hidden="true">/</span> <b>Emissão de CT-e</b>
        </span>
        <span className={`mb-px__estado${aprovado ? " is-ok" : ""}`}>
          {aprovado ? "Concluído" : "Aguardando aprovação"}
        </span>
        <span className="mb-px__demo">
          Demonstração<span className="mb-px__demo-x"> · dados fictícios</span>
        </span>
      </div>

      <div className="mb-px__corpo">
        <ol className="mb-px__fluxo" aria-label="Fluxo do agente">
          <li className="mb-px__no mb-px__no--1">
            <p className="mb-px__no-t">NF-e recebida</p>
            <p className="mb-px__no-s">Por e-mail, às 08:12</p>
            <ul className="mb-px__det">
              <li><span>NF-e</span><b>4.512</b></li>
              <li><span>Pedido</span><b>2231</b></li>
              <li><span>Carga</span><b>14 paletes</b></li>
            </ul>
          </li>
          <li className="mb-px__liga mb-px__liga--1" aria-hidden="true"><span>ok</span></li>
          <li className="mb-px__no mb-px__no--2">
            <p className="mb-px__no-t">Agente lê e confere</p>
            <p className="mb-px__no-s">Pedido × NF-e, 4 de 4 campos</p>
            <ul className="mb-px__det mb-px__det--checks">
              {CONFERE.map((c) => (
                <li key={c}>
                  <span>{c}</span>
                  <b className="mb-px__ok"><Glifo nome="certo" /></b>
                </li>
              ))}
            </ul>
          </li>
          <li className="mb-px__liga mb-px__liga--2" aria-hidden="true"><span>ok</span></li>
          <li className={`mb-px__no mb-px__no--3 mb-px__no--pessoa${aprovado ? "" : " is-foco"}`}>
            <p className="mb-px__no-t">Equipe aprova</p>
            <p className="mb-px__no-s">
              <span className="mb-px__avatar" aria-hidden="true">CA</span>
              {aprovado ? "Aprovado por Carla às 08:14" : "Carla, da expedição"}
            </p>
          </li>
          <li className="mb-px__liga mb-px__liga--3" aria-hidden="true" />
          <li className={`mb-px__no mb-px__no--4${aprovado ? " is-feito" : " is-espera"}`}>
            <p className="mb-px__no-t">CT-e emitido</p>
            <p className="mb-px__no-s">{aprovado ? "CT-e 000.184, enviado ao motorista" : "Só depois do aprovo"}</p>
          </li>
        </ol>

        <aside className="mb-px__painel" aria-label="Aguardando você">
          <p className="mb-px__painel-t">
            Aguardando você <span>{aprovado ? 2 : 3}</span>
          </p>
          <div className="mb-px__item">
            <p className="mb-px__item-t">CT-e do pedido 2231</p>
            <dl>
              <div><dt>Remetente</dt><dd>Distribuidora Exemplo</dd></div>
              <div><dt>Destinatário</dt><dd>Atacado Modelo</dd></div>
              <div><dt>Frete</dt><dd>R$ 1.840,00</dd></div>
            </dl>
            <p className="mb-px__aviso" aria-live="polite">
              {aprovado
                ? "Aprovado. O CT-e 000.184 foi emitido."
                : corrigindo
                  ? "Você ajusta o campo e o agente confere de novo antes de emitir."
                  : "O agente conferiu tudo. Falta o seu aprovo."}
            </p>
            <div className="mb-px__botoes">
              {aprovado ? (
                <button type="button" className="mb-px__btn mb-px__btn--sec" onClick={() => { setAprovado(false); setCorrigindo(false); }}>
                  Ver de novo
                </button>
              ) : (
                <>
                  <button type="button" className="mb-px__btn" onClick={() => setAprovado(true)}>
                    Aprovar
                  </button>
                  <button type="button" className="mb-px__btn mb-px__btn--sec" onClick={() => setCorrigindo(true)}>
                    Corrigir
                  </button>
                </>
              )}
            </div>
          </div>
          <ul className="mb-px__fila">
            <li><span>CT-e do pedido 2232</span><b>pronto</b></li>
            <li className="is-erro"><span>Pedido 2235</span><b>peso diverge</b></li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
