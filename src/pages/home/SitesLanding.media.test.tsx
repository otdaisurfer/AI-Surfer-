import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SitesLanding from "./SitesLanding";

describe("SitesLanding approved media", () => {
  it("renders the approved animations in stable mobile-sized frames", () => {
    const markup = renderToStaticMarkup(<SitesLanding />);

    expect(markup).toContain('src="/images/sales-rider-sparkle-animated.mp4"');
    expect(markup).toContain('src="/images/big-kahuna-strategy-sparkle-animated.mp4"');
    expect(markup).toContain('src="/images/product-ladder-sparkle-animated.mp4"');
    expect(markup.match(/aspect-ratio:4 \/ 5/g)).toHaveLength(3);
    expect(markup).not.toContain("new-landing-hero.png");
    expect(markup).not.toContain("ocean_ai_yacht.png");
  });
});
