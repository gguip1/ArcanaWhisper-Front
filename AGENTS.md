# Frontend Agent Rules

## Goal
- Keep the frontend PR and deploy pipeline green.
- Prefer executable guardrails over reminder-only docs.

## Local Harness
- Install repo hooks once with `npm run setup:hooks`.
- The pre-commit hook runs `eslint --fix` on staged `js/jsx/ts/tsx` files.
- The commit-msg hook enforces `emoji + conventional type + summary`.
- If lint still fails after auto-fix, stop the commit and patch the touched files before retrying.
- Do not bypass hooks with `--no-verify` unless the user explicitly asks for it.

## Before Commit
- Run `npm run lint` when changes touch shared code, workflow files, or config.
- Run `npm run build` before opening or updating a PR.
- If lint or build fails, fix the code instead of weakening the check.
- Use commit messages like `✨ feat: ...`, `🐛 fix: ...`, `♻️ refactor: ...`, `👷 ci: ...`.

## CI Contract
- PRs must pass lint and build.
- `main` must pass the same checks before S3 and CloudFront deployment.

## Editing Guidance
- Keep app-consumed environment-specific URLs in env vars.
- Keep static SEO files aligned with the production domain.
- When adding automation, prefer deterministic scripts over manual checklists.
