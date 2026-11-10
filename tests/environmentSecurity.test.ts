// @vitest-environment node
import { describe, expect, it } from "vitest";
import { environmentSecurityErrors } from "../scripts/check-env-security.mjs";

describe("environment security boundary", () => {
  it("rejects tracked local, staging and production credentials, including nested files", () => {
    const files = [".env", ".env.production", ".env.staging", "app/.env.local"];
    expect(environmentSecurityErrors(files, {})).toHaveLength(files.length);
  });

  it("allows placeholder templates and unrelated files", () => {
    expect(environmentSecurityErrors([".env.example", "app/.env.production.example", "README.md"], {})).toEqual([]);
  });

  it("rejects server credential names and secret values under public names without logging values", () => {
    const values = {
      VITE_SUPABASE_SERVICE_ROLE_KEY: "fixture-service-value",
      VITE_STRIPE_API_KEY: "fixture-api-value",
      VITE_STRIPE_PUBLISHABLE_KEY: "sk_" + "fixture-not-a-real-key",
      VITE_OPENAI_API_KEY: "fixture-ai-value",
    };
    const errors = environmentSecurityErrors([], values);
    expect(errors).toHaveLength(4);
    for (const value of Object.values(values)) expect(errors.join("\n")).not.toContain(value);
  });

  it("allows public configuration and server credentials without the VITE_ prefix", () => {
    expect(environmentSecurityErrors([], {
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "public-fixture",
      VITE_STRIPE_PUBLISHABLE_KEY: "pk_test_fixture",
      VITE_GOOGLE_API_KEY: "public-google-fixture",
      STRIPE_SECRET_KEY: "sk_test_fixture",
      SUPABASE_SERVICE_ROLE_KEY: "server-fixture",
    })).toEqual([]);
  });
});
