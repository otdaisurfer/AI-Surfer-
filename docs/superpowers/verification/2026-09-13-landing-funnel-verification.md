# Landing Funnel Verification

The landing funnel feature is implemented on `feat/landing-funnel`.

Final verification is performed by the repository CI workflow on a pull request into `main` because this chat runtime cannot clone GitHub and the connected Desktop Commander device is currently offline.

Required CI evidence:

- `npm test -- --run` exits successfully
- `npm run build` exits successfully

Additional review targets:

- homepage primary CTA points to `/wave-check`
- internal pricing and members routes are relative
- Wave Check steps, result preview, and implementation handoff render
- product and members CTA tracking attributes remain present
- mobile/reduced-motion CSS hooks remain present

Do not merge until CI is green.
