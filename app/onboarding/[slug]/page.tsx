import { notFound } from "next/navigation";
import { Fraunces, Inter, MuseoModerno, Poppins } from "next/font/google";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { onboardingDe, onboardingsRegistrados } from "@/lib/onboarding";

// Mesma família tipográfica do deck de onboarding da PRECEPTOR!.
const display = Poppins({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--onb-display" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--onb-body" });
const serif = Fraunces({ subsets: ["latin"], style: ["italic"], weight: ["300", "400"], variable: "--onb-serif" });
const num = MuseoModerno({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--onb-num" });

export const dynamicParams = false;
export function generateStaticParams() {
  return onboardingsRegistrados().map((o) => ({ slug: o.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const def = onboardingDe(params.slug);
  return {
    title: def ? `Onboarding ${def.cliente}` : "Onboarding",
    robots: { index: false, follow: false },
  };
}

export default function OnboardingPage({ params }: { params: { slug: string } }) {
  const def = onboardingDe(params.slug);
  if (!def) notFound();
  return (
    <div className={`${display.variable} ${body.variable} ${serif.variable} ${num.variable}`}>
      <OnboardingForm key={`${def.slug}:${def.versao}`} def={def} />
    </div>
  );
}
