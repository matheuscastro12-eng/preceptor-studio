import puppeteer from "puppeteer-core";
const qs = ["truck-loading-warehouse","doctor-clinic","paperwork-office","tractor-field","accountant-receipts","phone-message-hand"];
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
const p = await b.newPage(); await p.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36");
for (const q of qs) {
  await p.goto(`https://unsplash.com/s/photos/${q}?license=free`, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(e=>console.log("nav",e.message));
  await new Promise(r=>setTimeout(r,3500));
  const r = await p.evaluate(() => [...document.querySelectorAll('a[href^="/photos/"]')].slice(0,30).map(a => { const img=a.querySelector("img"); return img && img.src.includes("images.unsplash.com/photo") ? (a.getAttribute("href")+" | "+(img.alt||"").slice(0,60)+" | "+img.src.split("?")[0]) : null; }).filter(Boolean));
  console.log("==", q, r.length); [...new Set(r)].slice(0,6).forEach(x=>console.log("  ", x));
}
await b.close();
