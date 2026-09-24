import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SitesLanding from "./SitesLanding";

const approvedImages = [
  "/images/approved-landing/customer-care-cove.png",
  "/images/approved-landing/big-kahuna-visibility.png",
];

const approvedVideos = [
  "/images/approved-landing/ai-visibility-animated.mp4",
  "/images/approved-landing/product-ladder-animated.mp4",
];

describe("SitesLanding approved media", () => {
  it("gives every product one image and leaves the Lead Leak badge text unobstructed", () => {
    const document = new JSDOM(renderToStaticMarkup(<SitesLanding />)).window.document;
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".product-card"));
    const sources = cards.map((card) => card.querySelector(".product-card-image-link img")?.getAttribute("src"));

    expect(cards).toHaveLength(11);
    expect(sources.every(Boolean)).toBe(true);
    expect(new Set(sources).size).toBe(cards.length);
    expect(document.querySelector(".lead-leak-badge-title, .lead-leak-badge-url")).toBeNull();
    expect(document.querySelector(".product-card video, .product-agent-icon")).toBeNull();
  });

  it("keeps the approved showcase and product ladder media", () => {
    const markup = renderToStaticMarkup(<SitesLanding />);
    const document = new JSDOM(markup).window.document;

    const images = Array.from(document.querySelectorAll<HTMLImageElement>("img.approved-landing-image"));
    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video.approved-landing-video"));

    expect(images.map((image) => image.getAttribute("src")).sort()).toEqual([...approvedImages].sort());
    expect(videos.map((video) => video.getAttribute("data-src")).sort()).toEqual([...approvedVideos].sort());
    expect(videos.every((video) => !video.hasAttribute("src"))).toBe(true);
    expect(images).toHaveLength(2);
    expect(videos).toHaveLength(2);
  });

  it("keeps portrait media framed, accessible, and fallback-ready", () => {
    const markup = renderToStaticMarkup(<SitesLanding />);
    const document = new JSDOM(markup).window.document;
    const media = Array.from(document.querySelectorAll<HTMLElement>(".approved-landing-image, .approved-landing-video"));
    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video.approved-landing-video"));

    expect(media).toHaveLength(4);
    for (const element of media) {
      expect(element.style.aspectRatio).toBe("4 / 5");
      expect(element.style.objectFit).toBe("contain");
      expect(Number.parseFloat(element.style.maxHeight)).toBeLessThanOrEqual(560);
      expect(element.getAttribute("aria-label") || element.getAttribute("alt")).toBeTruthy();
    }

    for (const video of videos) {
      expect(video.autoplay).toBe(true);
      expect(video.preload).toBe("none");
      expect(video.loop).toBe(true);
      expect(video.playsInline).toBe(true);
      expect(video.getAttribute("poster")).toMatch(/^\/images\/approved-landing\/.+\.png$/);
    }
  });
});
