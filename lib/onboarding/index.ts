import type { Onboarding } from "./model";
import { MOVIMENTE } from "./movimente";

// Um formulário por cliente. Para um cliente novo: crie lib/onboarding/<slug>.ts e registre aqui.
const FORMULARIOS: Record<string, Onboarding> = {
  [MOVIMENTE.slug]: MOVIMENTE,
};

export function onboardingDe(slug: string): Onboarding | null {
  return Object.hasOwn(FORMULARIOS, slug) ? FORMULARIOS[slug]! : null;
}

export function onboardingsRegistrados(): Onboarding[] {
  return Object.values(FORMULARIOS);
}

/** Onde as respostas moram: a tabela colheita_respostas, com este prefixo em `venture`. */
export const ventureDoOnboarding = (slug: string) => `onboarding-${slug}`;
