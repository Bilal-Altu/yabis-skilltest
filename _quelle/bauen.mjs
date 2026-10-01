// Baut index.html als eine Datei: Bilder, Schrift, Logo und Favicon werden eingebettet.
//   node _quelle/bauen.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HIER = dirname(fileURLToPath(import.meta.url));
const ZIEL = join(HIER, "..");
const YABIS = join(ZIEL, "..", "yabis");

const datenUri = (pfad, typ) => `data:${typ};base64,${readFileSync(pfad).toString("base64")}`;

// Das „Y“ aus dem Logo (sechs Steinstücke), Nachbau aus yabis/_quelle/helfer.mjs
const Y = `<polygon fill="#6a5a4f" points="0,3 42,3 42,9 32,9 50,36 40,46 36,55 6,9 0,9"/>
<polygon fill="#a89a8c" points="58,3 100,3 100,9 94,9 79,32 59,22.5 68,9 58,9"/>
<polygon fill="#8e7d6f" points="59,22.5 79,32 64,55 60,46 50,36"/>
<polygon fill="#7b6a5d" points="50,36 60,46 50,56 40,46"/>
<polygon fill="#574b43" points="36,55 40,46 50,56 50,97 24,97 24,92 32,92 36,88"/>
<polygon fill="#b9b0a6" points="64,55 60,46 50,56 50,97 76,97 76,92 68,92 64,88"/>`;
const logo = (fuge) => `<svg class="logo" viewBox="0 0 240 128" aria-hidden="true" focusable="false">
<g stroke="${fuge}" stroke-width="1.8" stroke-linejoin="round">${Y}</g>
<text x="70" y="97" font-weight="700" font-size="62" letter-spacing="-1">abi’s</text>
<text x="1" y="123" font-weight="600" font-size="15" textLength="232" lengthAdjust="spacing">FLIESENWELT</text>
</svg>`;

let html = readFileSync(join(HIER, "vorlage.html"), "utf8");
const bilder = new Set();
// Ersetzungen immer per Funktion, damit „$“ in base64 oder SVG nichts auslöst
html = html
  .replace(/\{\{bild:([\w.-]+)\}\}/g, (_, name) => { bilder.add(name); return datenUri(join(YABIS, "bilder", name), "image/webp"); })
  .replace(/\{\{schrift\}\}/g, () => datenUri(join(YABIS, "schrift", "albert-sans-wght.woff2"), "font/woff2"))
  .replace(/\{\{favicon\}\}/g, () => datenUri(join(YABIS, "favicon.svg"), "image/svg+xml"))
  .replace(/\{\{logo\}\}/g, () => logo("#ffffff"))
  .replace(/\{\{logo-dunkel\}\}/g, () => logo("#1c1e21"));

const rest = html.match(/\{\{[^}]+\}\}/g);
if (rest) throw new Error("Nicht ersetzt: " + rest.join(", "));
if ((html.match(/<h1[\s>]/g) || []).length !== 1) throw new Error("Genau eine h1 erwartet");

writeFileSync(join(ZIEL, "index.html"), html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
const tel = (html.match(/href="tel:/g) || []).length;
console.log(`index.html: ${kb} KB, ${bilder.size} Bilder, ${tel} Telefon-Links`);
