import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function environmentSecurityErrors(paths, environment) {
  const errors = [];
  for (const path of paths) {
    const name = path.split("/").at(-1);
    if ((name === ".env" || name.startsWith(".env.")) &&
        name !== ".env.example" && !name.endsWith(".example")) {
      errors.push("Tracked environment file: " + path);
    }
  }
  for (const [name, value] of Object.entries(environment)) {
    if (!name.startsWith("VITE_") || !value) continue;
    const serverOnlyName = /SECRET|SERVICE_ROLE|ACCESS_TOKEN|API_TOKEN|PRIVATE_KEY/.test(name) ||
      /^VITE_(OPENAI|RESEND|GITHUB|HUBSPOT)_/.test(name) ||
      /^VITE_STRIPE_(API|RESTRICTED)_KEY$/.test(name);
    const serverOnlyValue = /^(sk_|rk_|sk-proj-)/.test(String(value).trim());
    if (serverOnlyName || serverOnlyValue) {
      errors.push("Server credential must not use a VITE_ variable: " + name);
    }
  }
  return errors;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const paths = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
    const errors = environmentSecurityErrors(paths, process.env);
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exitCode = 1;
    } else {
      console.log("Environment security check passed.");
    }
  } catch {
    console.error("Environment security check could not inspect tracked files.");
    process.exitCode = 1;
  }
}
