# SRS v1.1 implementation traceability

| Requirements | Implementation | Verification / remaining deployment work |
| --- | --- | --- |
| FR-01–03 | Hash-routed overview, Learn, Practice, Progress; 15 lessons with concept, complexity, example, practice | Content validator; learner browser journey |
| FR-04–06 | Difficulty, mode, title, topic, completion filtering; original descriptions/examples/constraints/signatures | Browser filter journey and schema validation |
| FR-07–08, FR-15A–B | 60 language fixtures; guided blanks/hints; minimal unguided scaffolding | Schema checks, browser mode/hint tests |
| FR-09, FR-15D | CodeMirror, language switch, independent drafts, reset confirmation | Browser draft/reset journey |
| FR-10–13, FR-15C | Judge0 adapter, language wrappers, separate samples/validation, consistent result shapes | 18 unit/API tests plus compiler parity; requires real judge acceptance testing |
| FR-11 | Separate remote judge; job CPU/wall/memory/process/network limits | Adapter request assertions; actual isolation must be verified on deployed provider |
| FR-14–15 | Explicit reference reveal; links to matching guided/unguided challenge | Implemented in coding workspace |
| FR-16–17 | Browser progress per problem/mode/language, attempts, lessons, breakdowns | Backup schema tests; persisted-completion browser journey |
| FR-18–21 | Versioned public JSON, backend validation JSON, typed schema, generator, import/export, validator | Build validation and generated-file CI check |
| NFR-01–02 | Responsive layout, labeled controls, keyboard focus, skip link, live feedback, reduced motion | Mobile overflow and browser tests; full WCAG audit remains a deployment-quality review |
| NFR-03 | Lazy editor/solutions, small static shell, visible queued/running state | Build bundle sizes; actual 3-second/10-second targets depend on network/judge and are not certified locally |
| NFR-04 | Timeouts, quotas, service errors, bounded output, storage warnings, invalid import/content states | API tests, backup tests, outage browser journey |
| NFR-05 | Server-only provider credentials, strict input, fixed limits, no frontend execution | API tests and adapter tests; hosting security depends on configured judge/gateway |
| NFR-06 | No account requirement; localStorage description, backup/reset; submission privacy text | About/Progress UI |
| NFR-07 | React/TS, reusable UI pieces, typed content, four-language fixtures, automated CI | Build/typecheck, tests, parity workflow |
| NFR-08, AC-07 | Vite relative assets + hash routing for Pages | Direct-link reload browser journey; production hosting not yet provisioned |
| AC-01–03, AC-08 | 5 paired problems per difficulty; four-language selector; mode-specific scaffolds | Validator + browser tests |
| AC-04–05 | Output comparison and sandbox deadlines | Mocked result/timeout tests; real isolated judge required |
| AC-06 | Persistent completed state and confirmed reset | Browser persistence/reset journeys |

## Deliberate implementation decisions

- **Mode identity:** 15 stable IDs each have guided and unguided variants, yielding the specified 30 practice entries. Draft/progress keys include mode and language.
- **Guest access:** no accounts; per-IP guest quotas. Horizontal hosting needs a shared gateway/store, documented in RUNNER.md.
- **Solution reveal:** explicit learner request, no score or penalty. Unguided mode has no progressive hints.
- **Initial content:** numeric-array signatures keep test equivalence simple. All required concepts have lessons; dedicated string/list/tree/heap problem sets are future content expansion.
- **Hosting:** GitHub Pages workflow and Docker-ready proxy are provided; no repository destination or judge credentials were supplied, so neither is claimed as live.

## Local verification record

Use the command outputs for the latest results. The initial implementation was built and all 18 unit/API tests and 4 Edge browser journeys passed on Windows with Node 24. All 30 Python/JavaScript reference implementations passed 136 sample and validation cases. Java and C++ were not available in that environment; Ubuntu CI requires them and fails if missing. Browser tests use mocked grading so they test the frontend contract, not sandbox isolation. No claim is made that a real judge, all four browsers, or production latency has been tested without those environments. Dependency audit reported zero known vulnerabilities after updating the test tooling.
