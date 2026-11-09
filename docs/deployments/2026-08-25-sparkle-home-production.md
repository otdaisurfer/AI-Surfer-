# Sparkle homepage production deployment

This deployment promotes the sparkle-enabled landing page already present on `main` at commit `d112e0c47f915f7aefe8f3ee654eddcf181a12ec`.

Verified before promotion:

- The production Vite build passes in CI.
- The homepage keeps the business-question → solution → next-step flow.
- The sparkle overlay uses the installed `framer-motion` dependency.
- Existing `/pricing`, `/wave-check`, `/login`, and members routes remain unchanged.
