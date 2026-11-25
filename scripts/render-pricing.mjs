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
  const url = "https://otdaisurfer.surf/pricing";
  const description = "Explore AI SURFER pricing and the $97 AEO + GEO Wave Audit for Charleston-area small businesses.";
  document.title = "AEO + GEO Wave Audit and Pricing | Ocean Tide Drop AI SURFER";
  document.querySelector('[rel="canonical"]').setAttribute("href", url);
  document.querySelector('[property="og:url"]').content = url;
  document.querySelector('[property="og:title"]').content = document.title;
  document.querySelector('[name="description"]').content = description;
  document.querySelector('[property="og:description"]').content = description;
  document.querySelector("#root").innerHTML = renderToString(createElement(Pricing));
  await writeFile("dist/pricing.html", page.serialize());
} finally {
  await server.close();
}
