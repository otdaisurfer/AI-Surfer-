import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SitesLanding from "./SitesLanding";

describe("SitesLanding product collection", () => {
  it("keeps each product’s information and a destination", () => {
    const document = new JSDOM(renderToStaticMarkup(<SitesLanding />)).window.document;
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".product-card"));
    expect(cards).toHaveLength(2);
    for (const card of cards) {
      expect(card.querySelector("h3")?.textContent?.trim()).toBeTruthy();
      expect(card.querySelector(".product-description")?.textContent?.trim()).toBeTruthy();
      expect(card.querySelector<HTMLAnchorElement>(".product-card-cta")?.getAttribute("href")).toBeTruthy();
    }
  });

  it("loads unique artwork for every product", () => {
    const document = new JSDOM(renderToStaticMarkup(<SitesLanding />)).window.document;
    const images = Array.from(document.querySelectorAll<HTMLImageElement>(".product-card-art img"));
    expect(images).toHaveLength(2);
    expect(new Set(images.map((image) => image.getAttribute("src"))).size).toBe(2);
    expect(document.querySelector(".approved-showcase, .product-ladder-media-card")).toBeNull();
  });
});
