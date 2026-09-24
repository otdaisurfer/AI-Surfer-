import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SitesLanding from "./SitesLanding";

describe("SitesLanding product collection", () => {
  it("keeps each product’s information and a destination", () => {
    const document = new JSDOM(renderToStaticMarkup(<SitesLanding />)).window.document;
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".product-card"));
    expect(cards).toHaveLength(11);
    for (const card of cards) {
      expect(card.querySelector("h3")?.textContent?.trim()).toBeTruthy();
      expect(card.querySelector(".product-description")?.textContent?.trim()).toBeTruthy();
      expect(card.querySelector<HTMLAnchorElement>(".product-card-cta")?.getAttribute("href")).toBeTruthy();
    }
  });

  it("keeps artwork only on Wave Check and Lead Leak Finder cards", () => {
    const document = new JSDOM(renderToStaticMarkup(<SitesLanding />)).window.document;
    const images = Array.from(document.querySelectorAll<HTMLImageElement>(".product-card-art img"));
    expect(images.map((image) => image.getAttribute("src"))).toEqual([
      "/images/file_00000000544481f9b024eea769829050.png",
      "/images/file_00000000a1e481f9b0737d59a06238ce.png",
    ]);
    expect(document.querySelectorAll(".product-card-monogram")).toHaveLength(9);
    expect(document.querySelector(".approved-showcase, .product-ladder-media-card")).toBeNull();
  });
});
