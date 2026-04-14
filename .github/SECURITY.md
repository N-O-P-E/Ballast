# Security Policy

Ballast is a local-first PWA — it has no backend, no authentication, no server-side code, and no user accounts. The app stores all data in the browser's `localStorage` on the user's own device. As a result, the realistic attack surface is small, but we still take security reports seriously.

## Supported versions

Only the latest version on the `main` branch is supported with security fixes.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, email: **security@studionope.nl**

Include:

- A description of the issue
- Steps to reproduce (ideally with a minimal proof of concept)
- The commit SHA or deployed URL you tested against
- Your name/handle if you'd like to be credited

We'll acknowledge your report within 5 business days and aim to provide a remediation plan within 14 days. Coordinated disclosure is appreciated — please give us reasonable time to ship a fix before disclosing publicly.

## Scope

In scope:

- Ballast source code in this repository
- The official demo deployment at https://ballast-sigma.vercel.app

Out of scope:

- Vulnerabilities in third-party dependencies (please report upstream; we'll update the lockfile)
- Self-hosted forks or modified deployments — they are the operator's responsibility
- Social-engineering attacks that require tricking a user into importing a crafted backup file (we've added schema validation to the import handler, but we cannot defend against a user manually pasting malicious data into their own `localStorage`)

## Known considerations

- All data is client-side. There is no network transport of user data to defend. A malicious browser extension or a compromised device can read `localStorage` — that is outside the app's threat model.
- The PWA service worker caches static assets. It does not cache or transmit user data.
- The import feature validates uploaded JSON against a schema before accepting it.

Thanks for helping keep Ballast safe.
