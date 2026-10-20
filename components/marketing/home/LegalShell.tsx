import { MbNav } from "./MbHome";
import { HomeFooter } from "./HomeFooter";
import "./home.css";
import "./mobbin.css";

/* Páginas legais com o mesmo topo e rodapé da home. */
export function LegalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp2">
      <MbNav />
      <div className="site marketing-shell mb-legal">{children}</div>
      <HomeFooter />
    </div>
  );
}
