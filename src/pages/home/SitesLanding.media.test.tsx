import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SitesLanding from "./SitesLanding";

describe("SitesLanding launch-safe media", () => {
  it("renders the complete landing page without image or video elements", () => {
    const markup = renderToStaticMarkup(<SitesLanding />);

    expect(markup).not.toMatch(/<(img|video)\b/i);
    expect(markup).toContain("Ride the Wave.");
    expect(markup).toContain("AEO Wave Audit™");
    expect(markup).toContain("Big Kahuna™");
  });
});
