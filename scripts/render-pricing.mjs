import { readFile, writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

// Render the same offer cards and checkout links that the browser displays.
const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});
try {
  const { default: Pricing } = await server.ssrLoadModule("/src/pages/pricing/Pricing.tsx");
  const page = new JSDOM(await readFile("dist/index.html", "utf8"));
  const document = page.window.document;
  // Fail with a named selector instead of a bare "Cannot read properties of null"
  // so a missing meta tag in dist/index.html is diagnosable from the build log.
  const mustFind = (selector) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`render-pricing: dist/index.html is missing ${selector}`);
    return el;
  };
  const url = "https://otdaisurfer.surf/pricing";
  const description = "Explore AI SURFER pricing and the $97 AEO + GEO Wave Audit for Charleston-area small businesses.";
  document.title = "AEO + GEO Wave Audit and Pricing | Ocean Tide Drop AI SURFER";
  mustFind('[rel="canonical"]').setAttribute("href", url);
  mustFind('[property="og:url"]').content = url;
  mustFind('[property="og:title"]').content = document.title;
  mustFind('[name="description"]').content = description;
  mustFind('[property="og:description"]').content = description;
  mustFind("#root").innerHTML = renderToString(createElement(Pricing));
  await writeFile("dist/pricing.html", page.serialize());
  console.log("render-pricing: wrote dist/pricing.html");
} finally {
  await server.close();
}
