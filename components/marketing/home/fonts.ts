import { JetBrains_Mono } from "next/font/google";

/* Mono dos rótulos da home (caixa alta, 12px). Bricolage e Instrument Sans
   já vêm do layout de marketing. */
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-lp",
  display: "swap",
});
