import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("homepage Free AI Wave Check", () => {
  it("lets visitors start the free Wave Check from the hero and offer block", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(html.match(/href="\/wave-check"/g)).toHaveLength(3);
    expect(html).toContain("Get My Free AI Wave Check™");
    expect(html).toContain("Can AI find, understand, and recommend your business?");
    expect(html).toContain("Start Free");
  });
});
