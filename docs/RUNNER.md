# Runner deployment and operations

## Trust boundary

GitHub Pages serves static files. The Express proxy validates requests, selects trusted tests, constructs language harnesses, and makes HTTP requests to Judge0. It never calls a local interpreter/compiler for user code. Judge0 workers must provide the actual sandbox and per-job process/filesystem isolation.

The integration follows the [official Judge0 CE submission API](https://ce.judge0.com/#submissions), including resource fields, base64 transport, asynchronous tokens, and server-side authentication. Language IDs and supported resource ceilings vary by instance; query your instance's `/languages` and `/config_info` during deployment. The supplied IDs are configurable defaults, not a promise about a provider's current versions.

## Provisioning

1. Provision a maintained Judge0-compatible service on an execution host isolated from the frontend, proxy, and other workloads. Use its supported installation instructions. Keep the worker sandbox enabled and patch the execution host and judge. Restrict the judge API so only the proxy can reach it; require its authentication token.
2. Disable execution-worker network access at both the judge and host/network policy layers. A job-level request cannot replace host-level isolation. Do not mount credentials or host directories into job sandboxes. Set service-level maxima that prevent jobs from raising requested limits.
3. Deploy one proxy instance using Node 24 or the included Dockerfile. Example commands from the repository root:

   ```sh
   docker build -f server/Dockerfile -t pattern-runner .
   docker run --env-file .env -p 8787:8787 pattern-runner
   ```

4. Set server-only environment variables: `JUDGE0_URL`, `JUDGE0_AUTH_TOKEN`, `ALLOWED_ORIGINS`, language IDs, and `PORT` (default 8787). Put secrets in hosting secret storage; never in a `VITE_` variable. Use TLS for browser-to-proxy and proxy-to-judge traffic in production. The local Docker example is not TLS termination.
5. Set `ALLOWED_ORIGINS=https://YOUR-USER.github.io` (an origin has no repository path). Configure additional origins only if intended. By default, untrusted `X-Forwarded-For` is ignored. Set `TRUST_PROXY_HOPS` only to the exact trusted proxy topology and ensure the front proxy overwrites forwarded headers.
6. Set frontend build variable `VITE_RUNNER_URL` to the proxy's HTTPS origin and rebuild Pages. `/health` returns a configured boolean without revealing credentials.

The source chooses the specification's **guest quota** option: 12 requests/minute/IP and four concurrent requests per process. No learner login is required. CORS is a browser boundary, **not authentication**. For public hosting, place a global request/cost quota at the gateway. The supplied in-memory quota is suitable for a single proxy replica; use a shared rate-limit store/gateway before scaling horizontally. Configure host/provider spending caps and monitor queue depth and rejected requests.

## Fixed limits

| Boundary | Limit |
| --- | --- |
| JSON body | 24 KiB |
| Learner source | 20,000 characters |
| CPU per job | 2 seconds + 0.5-second reporting grace |
| Wall clock per job | 5 seconds |
| Requested memory | 128,000 KiB |
| Processes/threads | 64 (supports JVM startup; sandbox policies remain required) |
| Generated file size | 64 KiB |
| Provider response | 64 KiB total |
| Decoded displayed output | 16,000 characters |
| Overall provider request deadline | 40 seconds |
| Browser request deadline | 45 seconds |
| Poll interval while queued/running | 500 ms |

Confirm that these requests are accepted and enforced by the selected judge, especially JVM memory accounting. A provider rejecting a resource setting is reported as service unavailable; do not silently remove limits to make a language work. Compilation limits are additionally controlled by the judge service configuration.

## Grading protocol

`POST /api/grade` receives exactly:

```json
{
  "problemId": "running-totals",
  "mode": "guided",
  "language": "python",
  "sourceCode": "def solve(numbers, target):\n    return []",
  "action": "run"
}
```

`action` is `run` or `submit`; tests and resource settings cannot be supplied by callers. A random per-job marker separates harness results from learner debug output. The proxy parses arrays and compares their integer contents against backend expectations. It does not compare source text. Public samples include input/expected/actual details and compiler/runtime output. Validation responses contain only indexed pass/fail results, timing, and a generic diagnostic category; raw output, including compiler output that could mention fixture literals, is suppressed. Run samples for full diagnostics.

Private fixture confidentiality is against frontend bundling and API response disclosure. The fixtures are compiled into a per-job harness, so a hostile program can inspect its own sandbox; this is an educational practice judge, not an anti-cheating assessment system. Keep the upstream API private, do not expose tokens or source retrieval endpoints, and use an independently protected grader if adversarial assessment integrity becomes a requirement.

## Required real-service acceptance checks

Use a staging judge before connecting public traffic:

- Submit every reference solution in all four languages. Confirm public and private tests match local parity results.
- Submit differently formatted correct code; confirm it still passes.
- Submit wrong output, invalid syntax, an exception, an infinite loop, a memory-exhaustion program, and excessive stdout. Confirm each is bounded, diagnosed, and cannot stall the website or neighboring jobs.
- Attempt network access, filesystem escape, and process abuse in the staging worker. Verify isolation using the provider's supported sandbox test procedure.
- Confirm validation failures cannot disclose input/output fixtures through stdout, stderr, compiler diagnostics, or API errors.
- Exceed the IP quota and concurrency cap. Confirm 429 responses and upstream jobs stay within the operational quota. A browser cancellation stops waiting but a previously queued job may still run under its own limits.
- Stop the judge; confirm a clear service error, preserved drafts, and usable lessons.
- Verify Java/C++ compiler versions and all four configured language IDs against the running instance.

The repository tests mock the remote judge and cannot certify an unprovisioned execution host. No cloud service, paid resource, production repository, or execution-provider account is created by this implementation.
