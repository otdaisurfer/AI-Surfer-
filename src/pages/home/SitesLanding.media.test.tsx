import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SitesLanding from "./SitesLanding";

const approvedImages = [
  "/images/approved-landing/customer-care-cove.png",
  "/images/approved-landing/big-kahuna-visibility.png",
  "/images/approved-landing/product-ladder.png",
];

const approvedVideos = [
  "/images/approved-landing/big-kahuna-animated.mp4",
  "/images/approved-landing/ai-visibility-animated.mp4",
  "/images/approved-landing/product-ladder-animated.mp4",
];

describe("SitesLanding approved media", () => {
  it("promotes the three founding-client spots without fake urgency", () => {
    const markup = renderToStaticMarkup(<SitesLanding />);
    const document = new JSDOM(markup).window.document;
    const announcement = document.querySelector<HTMLElement>(".announcement");
    const offer = document.querySelector<HTMLElement>(".founding-client-offer");

    expect(announcement?.textContent).toContain("Now accepting 3 founding clients");
    expect(offer?.textContent).toContain("Wave Starter");
    expect(offer?.textContent).toContain("$497");
    expect(offer?.textContent).toContain("30 days of optimization support");
    expect(offer?.querySelector('a[href="/wave-check"]')?.textContent).toContain(
      "Start My Free AI Wave Check",
    );
    expect(`${announcement?.textContent} ${offer?.textContent}`).not.toMatch(
      /countdown|expires tonight|only \d+ hours/i,
    );
  });

  it("renders exactly the six approved landing assets", () => {
    const markup = renderToStaticMarkup(<SitesLanding />);
    const document = new JSDOM(markup).window.document;

    const images = Array.from(document.querySelectorAll<HTMLImageElement>("img.approved-landing-image"));
    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video.approved-landing-video"));

    expect(images.map((image) => image.getAttribute("src")).sort()).toEqual([...approvedImages].sort());
    expect(videos.map((video) => video.getAttribute("src")).sort()).toEqual([...approvedVideos].sort());
    expect(images).toHaveLength(3);
    expect(videos).toHaveLength(3);
  });

  it("keeps portrait media framed, accessible, and fallback-ready", () => {
    const markup = renderToStaticMarkup(<SitesLanding />);
    const document = new JSDOM(markup).window.document;
    const media = Array.from(document.querySelectorAll<HTMLElement>(".approved-landing-image, .approved-landing-video"));
    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video.approved-landing-video"));

    expect(media).toHaveLength(6);
    for (const element of media) {
      expect(element.style.aspectRatio).toBe("4 / 5");
      expect(element.style.objectFit).toBe("contain");
      expect(Number.parseFloat(element.style.maxHeight)).toBeLessThanOrEqual(560);
      expect(element.getAttribute("aria-label") || element.getAttribute("alt")).toBeTruthy();
    }

    for (const video of videos) {
      expect(video.autoplay).toBe(true);
      expect(video.loop).toBe(true);
      expect(video.playsInline).toBe(true);
      expect(video.getAttribute("poster")).toMatch(/^\/images\/approved-landing\/.+\.png$/);
    }
  });
});
