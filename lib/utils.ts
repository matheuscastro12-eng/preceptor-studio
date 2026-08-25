import { clsx, type ClassValue } from "clsx";

// Helper padrao shadcn (sem tailwind-merge: as classes usadas aqui nao conflitam).
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
