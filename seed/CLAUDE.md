# CLAUDE.md

Starter template by @abrekov.design.
Replace everything in [square brackets], delete every line that doesn't apply to your project,
and keep the final file under 200 lines. Delete this intro too.

## Project

- [One sentence: what this project is and who it's for.]
  Example: Hebrew-first marketing site for a design studio. Audience: Israel.
- Stack: [Next.js (App Router), TypeScript, Tailwind CSS]
- Package manager: [npm]. Don't switch to yarn or pnpm.
- Node version: see `.nvmrc`.

## Where things live

Only list what isn't obvious from the folder names.

- Routes and pages: `[src/app/]`
- Shared UI components: `[src/components/ui/]`. Reuse these before creating new ones.
- User-facing text: `[src/content/he.json]` and `[src/content/en.json]`. Never hardcode copy in components.
- Generated code, don't edit by hand: `[src/generated/]`

## Commands

- Install: `npm install`
- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- Typecheck: `npx tsc --noEmit`
- All tests: `npm test`
- One test file: `npx vitest run path/to/file.test.ts`
- Env vars: copy `.env.example` to `.env.local`. Never commit `.env` files.

## Code conventions

- TypeScript strict mode. No `any`: use `unknown` and narrow it.
- React: function components with named exports. No default exports.
- File names: kebab-case (`user-card.tsx`). Component names: PascalCase (`UserCard`).
- Styling: Tailwind utility classes only. No inline styles, no new CSS files.
- 2-space indentation, single quotes, no semicolons. Prettier enforces this; run `npm run format`.
- Split a component once it passes ~150 lines.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`).
- Ask before adding a new dependency.

## RTL and Hebrew

- Hebrew is the default language. `<html lang="he" dir="rtl">` is set in `[src/app/layout.tsx]`.
- Use logical properties for layout: Tailwind `ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`, `text-start`/`text-end`.
  Never use `ml-`/`mr-`, `pl-`/`pr-`, `left-`/`right-` or `text-left`/`text-right` for layout.
- Directional icons (arrows, chevrons, "back" buttons) must flip in RTL: add `rtl:rotate-180`.
- Wrap Latin words, numbers, code, URLs and @handles inside Hebrew text in `<bdi>` (or `dir="ltr"`)
  so punctuation and symbols don't jump to the wrong side.
- Inputs for email, URL, phone number and code get `dir="ltr"`.
- Format dates, prices and numbers with `Intl` and the `he-IL` locale.
- Hebrew UI copy speaks to the user in the second person masculine singular (אתה).
  If copy is missing, leave a `TODO(copy)` and ask me. Don't machine-translate.
- Font: [Heebo] for Hebrew and Latin, loaded with `next/font`.
- Every layout change must look right in both `he` (RTL) and `en` (LTR).

## Testing and verification

- A task is done only when `npm run lint`, `npx tsc --noEmit` and `npm test` all pass.
- When you fix a bug, first write a failing test that reproduces it, then fix it.
- Test files sit next to the code they test: `user-card.test.tsx`.
- After UI changes, run the dev server and check the page in Hebrew (RTL) and English (LTR).
- In your final message, show the commands you ran and their output. Don't just say "tests pass".

## Workflow

- For changes that touch more than ~3 files, write a short plan first and wait for my OK.
- Don't refactor code that's unrelated to the task.
- Don't touch `[migrations/]` or `[.github/workflows/]` without asking.

## Known gotchas

Add one line every time you correct Claude on the same thing twice.

- [Integration tests need DATABASE_URL set. See .env.example.]
- [E2E tests need the mock API running first: `npm run mock`.]
