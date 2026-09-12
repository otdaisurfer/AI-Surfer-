import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import MemberToolDock from "./MemberToolDock";

describe("MemberToolDock", () => {
  it("renders all four tools with a launch control", () => {
    const markup = renderToStaticMarkup(<MemberToolDock />);

    expect(markup).toContain("Members Tool Dock");
    expect(markup).toContain("Prompt Wave Builder");
    expect(markup).toContain("Follow-Up Message Maker");
    expect(markup).toContain("Offer Builder");
    expect(markup).toContain("My 30-Day Wave Plan");
    expect(markup.match(/>Open Tool</g)).toHaveLength(4);
  });
});
