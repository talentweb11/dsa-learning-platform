# Pattern — DSA learning platform

Implementation of `DSA_Learning_Platform_SRS_v1.1.docx` (20 October 2026). React + TypeScript + Vite frontend, CodeMirror editor, and a separately hosted Express proxy for an isolated Judge0-compatible execution service.

## Run locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Lessons, practice, editing, and local backups work without any backend. Run/Submit explicitly reports that the runner is disconnected until configured; the app does not simulate successful execution.

To connect a judge, copy `.env.example` to `.env`, configure the values, and run `npm run runner` in a second terminal. Restart Vite after changing `VITE_RUNNER_URL`.

## What is implemented

- Responsive overview, Learn, Practice, coding workspace, Progress, and About pages.
- All 15 required lesson topics, each with explanation, complexity, worked steps, and related practice.
- 15 original problems × 2 modes = 30 practice variants, with 5 guided and 5 unguided variants at each of Easy/Medium/Hard. Modes deliberately share a stable problem ID; their progress remains independent.
- Python, Java, C++, and JavaScript signatures, guided blanks, minimal unguided scaffolds, syntax highlighting, resets with confirmation, and independent saved drafts.
- Title search and difficulty/mode/topic/completion filters. Progressive hints appear only in guided mode. Full reference explanations and solutions require an explicit reveal.
- Separate public samples and backend-only validation fixtures, behavior-based result comparison, compilation/runtime/timeout feedback, and public stdout/stderr diagnostics.
- Local progress by problem/mode/language, submitted attempt counts, lesson completion, aggregate topic/difficulty/mode/language statistics, JSON import/export, and reset.
- Strict request/content schemas, guest rate limits, concurrency limit, bounded requests/results, controlled origins, and resource-limited remote jobs.
- Content validation, automated API/backup/judge tests, browser journeys, language parity verification, CI, and GitHub Pages deployment workflow.

No real judge or GitHub repository was configured by the supplied document. **Live four-language grading and public deployment require the external setup below.** The proxy is not a sandbox: only the separately provisioned execution workers provide process isolation.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Frontend development server |
| `npm run runner` | Backend proxy, using `.env` if present |
| `npm run build` | Validate content, typecheck, and build `dist/` |
| `npm run preview` | Preview the built static frontend |
| `npm test` | Unit and HTTP integration tests |
| `npm run test:parity` | Execute trusted reference fixtures in every available local language |
| `npm run test:e2e` | Browser journeys, with a mocked external runner |
| `python scripts/generate_content.py` | Regenerate version-controlled problem and reference fixtures |

Parity checks require `python`, `node`, `javac`/`java`, and `g++` on PATH. Locally, missing compilers are explicitly reported as skipped; CI treats a missing compiler as a failure. Browser tests use installed Microsoft Edge on Windows and Playwright Chromium elsewhere (`npx playwright install chromium` on Linux). Only repository-owned reference code is run locally by the parity script. Never point this script at user submissions.

## Deploy the static frontend to GitHub Pages

1. Put this project in your chosen GitHub repository. Commit `package-lock.json`; do not commit `.env`.
2. In Settings → Pages, choose **GitHub Actions** as the build source.
3. Configure the repository Actions variable `VITE_RUNNER_URL` with your HTTPS proxy origin, such as `https://runner.example.com`. It is a public URL, not a credential.
4. Push to `main` or manually run **Deploy GitHub Pages**. Tests, parity checks, and build must succeed before the Pages artifact is uploaded.

Vite uses relative asset paths and React uses hash routes (for example `https://owner.github.io/repo/#/problem/pair-budget/guided`), so direct links and refresh work on project Pages without a rewrite server. Publish only `dist/`, never the whole repository: the backend fixtures belong outside the frontend deployment. If the source repository is public, its test fixtures are naturally readable there; use a private repository or separately managed private fixture repository if those fixtures must also be confidential from source readers.

## Deploy the runner and judge

See [docs/RUNNER.md](docs/RUNNER.md) for deployment, isolation settings, limits, and provider acceptance tests. This app targets the [Judge0 CE API](https://ce.judge0.com/), using asynchronous submissions and the `X-Auth-Token` server-side header. It does not use a public demo judge or embed provider credentials in the frontend.

## Repository layout

```text
src/                    React UI, local progress, typed schemas
src/content/            Public problems, lessons, lazily revealed solutions
server/                 Express proxy, Judge0 adapter, language wrappers
server/content/         Validation tests (never imported by the frontend)
scripts/                Content generation, validation, reference parity
tests/                  Unit / HTTP integration tests
e2e/                    Browser user journeys
.github/workflows/      CI and GitHub Pages publishing
docs/                   Operations and requirement traceability
```

## Content conventions

The seed curriculum uses `solve(numbers, target) -> integer array` across languages, making fixtures equivalent. Java wraps `solve` in `class Solution`. C++ uses `vector<int>`; required standard-library headers are supplied by the judge harness. Where a task needs a scalar result, return a one-element array. The merging exercise uses flat start/end pairs. Unused `target` parameters are called out in each task. Returned arrays are compared in order.

The first exercises focus on arrays, maps, two pointers, binary search, stacks, windows, sorting, and dynamic programming. Strings, linked lists, trees, and heaps have concept lessons with related transfer exercises, rather than dedicated advanced problem suites. The fewest-hops exercise teaches an implicit graph traversal.

Edit `scripts/generate_content.py` and regenerate JSON when changing problems. Edit `src/content/lessons.ts` for lessons. `npm run validate` catches schema failures, duplicate identifiers, missing language fixtures, missing lessons, and accidental reuse of public inputs for private validation.

## Privacy and verification limits

Progress is browser/device-specific. Storage failures produce a visible warning, with in-session use and export still available. No analytics or accounts are included. Running code sends it to the configured proxy/judge; operators should define retention, quotas, and access in their hosting setup. Google Fonts is used with system fallbacks and may receive ordinary browser connection metadata.

The source includes automated checks for the acceptance criteria; see [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md). A build and mocked test suite do not prove a deployed judge is isolated. Before enabling live execution, verify the actual worker configuration and run the real-service checks in the operations guide. Cross-browser accessibility/performance targets require measurement in your deployment.
