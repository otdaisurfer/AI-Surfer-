const url = process.env.LAUNCH_DESK_URL || "http://localhost:3001/api/launch";
const payload = {
  productBrief: "We are launching a production billing migration with a safer rollback path and a new activation dashboard. The goal is to reduce setup time for engineering teams.",
  audience: "Engineering teams",
  launchDate: "2026-09-01",
  constraints: "Two approvers; limited rollout window",
  assets: "Release notes, screenshots, email draft",
  channels: ["Email", "LinkedIn", "Release notes"]
};

const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
if (!response.ok || !response.body) throw new Error(`Launch API returned ${response.status}`);
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = "";
let sawTool = false;
let sawDelta = false;
let sawFinal = false;

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const chunks = buffer.split("\n\n");
  buffer = chunks.pop() || "";
  for (const chunk of chunks) {
    const line = chunk.split("\n").find((entry) => entry.startsWith("data: "));
    if (!line) continue;
    const event = JSON.parse(line.slice(6));
    if (event.type === "tool_progress") sawTool = true;
    if (event.type === "text_delta") sawDelta = true;
    if (event.type === "final") sawFinal = true;
    process.stdout.write(`event=${event.type}\n`);
  }
}

if (!sawTool || !sawDelta || !sawFinal) {
  throw new Error(`Stream verification failed: tool=${sawTool}, delta=${sawDelta}, final=${sawFinal}`);
}
console.log("Launch Desk real stream verification passed: tool_progress + text_delta + final observed.");
