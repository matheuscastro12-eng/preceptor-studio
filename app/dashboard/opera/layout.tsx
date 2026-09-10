import { redirect } from "next/navigation";
import { membroOpera } from "@/lib/opera/server";
import "./opera.css";
import Atualizar from '@/components/opera/Atualizar';
export const metadata = { title: "OPERA · Construções", robots: { index: false, follow: false } };
export default async function OperaLayout({ children }: { children: React.ReactNode }) {
  if (!await membroOpera()) redirect("/login?redirect=/dashboard/opera");
  return <main className="op-root"><Atualizar />{children}</main>;
}
