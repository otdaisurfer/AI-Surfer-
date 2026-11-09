import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

function parsedKeyframeSelectors(animationName: string) {
  const css = readFileSync(resolve(process.cwd(), "src/pages/home/SitesLanding.css"), "utf8");
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>");
  const style = dom.window.document.createElement("style");
  style.textContent = css;
  dom.window.document.head.appendChild(style);

  const keyframes = Array.from(style.sheet?.cssRules ?? []).find(
    (rule) =>
      rule.type === dom.window.CSSRule.KEYFRAMES_RULE &&
      (rule as CSSKeyframesRule).name === animationName,
  ) as CSSKeyframesRule | undefined;

  return Array.from(keyframes?.cssRules ?? []).map(
    (rule) => (rule as CSSKeyframeRule).keyText,
  );
}

describe("SitesLanding button animation", () => {
  it("gives the primary-button shimmer a browser-valid destination keyframe", () => {
    expect(parsedKeyframeSelectors("sites-button-shimmer")).toEqual(["to"]);
  });
});
