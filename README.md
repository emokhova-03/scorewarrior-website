# Scorewarrior Website

Development repository for the Scorewarrior corporate website.

The project currently contains two technical candidates that implement the same small Careers vertical slice.

The purpose of having two candidates is to collect real implementation evidence before making the final technology decision.

The technology decision is still **In Discussion**.

## Technology candidates

### Candidate A — Go SSR

Candidate A is the original Go server-side rendered implementation.

It is located mainly in the repository root:

```text
cmd/web/
templates/
data/
```

It uses:

- Go;
- `net/http`;
- `html/template`;
- repository-based JSON data;
- server-side rendering.

Candidate A is currently deployed on Render.

### Candidate B — Astro + TypeScript

Candidate B is the static implementation created for the technology comparison.

It is located in:

```text
candidate-b-astro/
```

It uses:

- Astro;
- TypeScript in strict mode;
- static site generation;
- file-based routing;
- repository-based JSON data;
- Vitest for domain tests.

Candidate B is an experimental comparison candidate, not a second full website.

## Repository structure

The repository is temporarily asymmetric.

Candidate A remains in the repository root:

```text
cmd/
templates/
data/
```

Candidate B lives inside:

```text
candidate-b-astro/
```

This structure is intentional during the comparison.

Candidate A was already the working baseline when Candidate B was introduced. Moving the Go application only to make the folder structure symmetrical would change existing paths used by the application, CI, deployment and documentation without improving the comparison.

After the final technology decision, the losing candidate and temporary comparison scaffolding can be removed and the repository structure can be simplified.

## Requirements

### Candidate A

Go is required to build and run Candidate A.

Check the installed version with:

```bash
go version
```

### Candidate B

Candidate B requires:

```text
Node.js >= 22.12
```

Check the installed versions with:

```bash
node --version
npm --version
```

## Run Candidate A locally

From the repository root:

```bash
go run ./cmd/web
```

The server starts on:

```text
http://localhost:8080
```

Useful routes:

```text
/
 /healthz
 /careers
 /careers/{slug}
```

For example:

```text
http://localhost:8080/
http://localhost:8080/healthz
http://localhost:8080/careers
http://localhost:8080/careers/test-backend-engineer
```

Stop the server with:

```text
Ctrl+C
```

## Check Candidate A

From the repository root, run:

```bash
gofmt -w cmd/web/main.go cmd/web/main_test.go
go vet ./...
go test ./...
go build ./cmd/web
```

These commands:

1. format the Go source files;
2. run Go static analysis;
3. run the Go tests;
4. verify that the application builds successfully.

## Run Candidate B locally

From the repository root, enter the Astro project:

```bash
cd candidate-b-astro
```

Install the exact dependencies recorded in `package-lock.json`:

```bash
npm ci
```

Start the Astro development server:

```bash
npm run dev
```

The terminal will print the local URL for the development server.

Open that URL in the browser to view Candidate B.

Stop the development server with:

```text
Ctrl+C
```

## Check Candidate B

From inside:

```text
candidate-b-astro/
```

run:

```bash
npm run check
npm run test
npm run build
```

The checks have different purposes:

- `npm run check` runs Astro and TypeScript checks;
- `npm run test` runs the Vitest tests;
- `npm run build` creates the production static site.

A successful build creates:

```text
candidate-b-astro/dist/
```

The generated output currently includes pages such as:

```text
dist/
├── index.html
├── 404.html
└── careers/
    ├── index.html
    ├── test-backend-engineer/
    │   └── index.html
    └── test-game-designer/
        └── index.html
```

## Preview Candidate B production build

After:

```bash
npm run build
```

run:

```bash
npm run preview
```

This serves the generated production build locally.

The terminal will print the preview URL.

While the preview server is running, that terminal is occupied by the server. Use another terminal if you want to run additional commands.

## Careers data

Both candidates currently use the same development fixture.

Candidate A reads:

```text
data/roles.json
```

Candidate B reads:

```text
candidate-b-astro/data/roles.json
```

The duplicate file is intentional and temporary.

It exists only so both candidates can be developed and built independently during the comparison.

This duplication is **comparison scaffolding**, not the intended final content architecture.

The two files must remain identical.

CI checks their parity with `diff` so that the candidates cannot accidentally be tested with different input data.

After the final technology decision, the duplicated fixture and other comparison-only scaffolding should be removed.

## Development data warning

The current role entries are development fixtures.

They are marked with:

```text
[TEST]
```

They must not be treated as real Scorewarrior vacancies or production company content.

The current development role model contains:

```text
slug
title
department
location
```

## Candidate comparison

The detailed comparison between Candidate A and Candidate B is recorded in:

```text
docs/candidate-comparison.md
```

The comparison covers areas including:

- routing;
- data loading;
- validation;
- failure behavior;
- tests;
- build artifacts;
- production runtime;
- static-first architecture;
- deployment evidence.

No final winner should be inferred only from the existence of Candidate B.

The final technology decision is still being evaluated.

## RFC

The technology discussion is documented in:

```text
docs/rfc/0001-backend-technology-choice.md
```

The RFC remains:

```text
Status: In Discussion
```

The RFC should be updated with the final decision only after the comparison evidence is complete.

## CI

Candidate A and Candidate B have separate CI checks.

Candidate A checks the Go implementation.

Candidate B checks the Astro + TypeScript implementation and includes a parity check for the duplicated `roles.json` fixture.

The goal is to make failures visible before changes are accepted.

## Production status

Candidate A is currently deployed on Render.

The deployment provides a public HTTPS service and a health endpoint:

```text
/healthz
```

Candidate B has not yet been deployed.

Because of this, production behavior that depends on the static hosting platform — especially unknown-route and HTTP 404 behavior — should not yet be treated as measured evidence for Candidate B.

## Quick start

### Candidate A

From the repository root:

```bash
go run ./cmd/web
```

Then open:

```text
http://localhost:8080
```

### Candidate B

From the repository root:

```bash
cd candidate-b-astro
npm ci
npm run dev
```

Then open the local URL printed by Astro.

### Candidate B checks

```bash
npm run check
npm run test
npm run build
```

## Current project state

The repository currently contains two implementations for comparison:

```text
Candidate A
Go + SSR
repository root
currently deployed

Candidate B
Astro + TypeScript
candidate-b-astro/
static build
not deployed yet
```

This is a temporary comparison state.

The final repository should contain one selected production architecture rather than two permanent implementations.
