import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("WaveAudit save confirmation", () => {
  it("waits for a confirmed lead save before marking the report submitted", () => {
    const sourcePath = resolve(process.cwd(), "src/pages/wave-audit/WaveAudit.tsx");
    const source = readFileSync(sourcePath, "utf8");
    const submitStart = source.indexOf("const submitLead");
    const retryStart = source.indexOf("const retryLeadSave");
    const submitBody = source.slice(submitStart, retryStart);

    const saveAwait = submitBody.indexOf("await saveWaveAuditLead");
    const submitted = submitBody.indexOf("setSubmitted(true)");

    expect(saveAwait).toBeGreaterThanOrEqual(0);
    expect(submitted).toBeGreaterThan(saveAwait);
  });
});
