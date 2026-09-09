import { redirect } from "next/navigation";
import { membroOpera } from "@/lib/opera/server";
import "./opera.css";
export const metadata = { title: "OPERA · Construções", robots: { index: false, follow: false } };
export default async function OperaLayout({ children }: { children: React.ReactNode }) {
  if (!await membroOpera()) redirect("/login?redirect=/dashboard/opera");
  return <main className="op-root">{children}</main>;
}
