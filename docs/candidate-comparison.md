# Candidate comparison: Go SSR vs Astro + TypeScript

Status: In progress — data collection  
Last updated: 2026-08-30

## Purpose

This document collects evidence for the v1 technology decision.

The goal is not to choose a winner during the experiment. The goal is to implement the same small Careers slice in two different ways, compare the real behavior, and make the stack decision after the evidence is available.

## What is being compared

Both candidates implement the same limited Careers vertical slice:

- Home page;
- Careers listing;
- single role page;
- custom 404 page;
- repository-based `roles.json`;
- validation of role data;
- empty data behavior;
- malformed or unavailable data behavior;
- automated tests;
- build checks.

The current development role model has four fields:

- `slug`;
- `title`;
- `department`;
- `location`.

All current vacancy content is test data and is marked with `[TEST]`.

## Candidates

### Candidate A — Go SSR

Location in repository:

```text
cmd/web/
templates/
data/
```

Main characteristics:

- Go standard library;
- `net/http` and `ServeMux`;
- `html/template`;
- server-side rendering;
- deployed as a running Go process on Render;
- public `/healthz` endpoint.

### Candidate B — Astro + TypeScript

Location in repository:

```text
candidate-b-astro/
```

Main characteristics:

- Astro;
- TypeScript in strict mode;
- static site generation;
- file-based routing;
- Vitest for domain tests;
- static HTML generated into `dist/`.

## Fairness rules

1. Both candidates use the same development role data.

2. `data/roles.json` and `candidate-b-astro/data/roles.json` are kept identical during the comparison.

3. CI contains a `diff` check to detect accidental differences between the two data files.

4. Both candidates implement the same small Careers scope instead of two different websites.

5. Both candidates currently use a minimal HTML-only UI. Design and CSS are intentionally outside this comparison.

6. The same main scenarios are checked where the two architectures allow a fair comparison:
   - valid data;
   - empty data;
   - malformed data;
   - unavailable data;
   - unknown role;
   - unknown URL.

7. The duplicate Astro copy of `roles.json` is temporary comparison scaffolding. It should be removed after the final stack is selected.

## Decision criteria

The criteria were fixed before making the final technology decision.

| Criterion                   | Weight | What is being evaluated                                                                                   |
| --------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| PRD architecture fit        | High   | Static-first architecture, TypeScript strictness, validation at data boundaries, repository-based content |
| Behavior with bad data      | High   | What the user sees and where failures are detected                                                        |
| URL and routing stability   | High   | How clearly routes and unknown URLs are controlled                                                        |
| Fit for the design stage    | High   | How much additional work the final visual website is likely to require                                    |
| Ability to explain the code | High   | Whether the implementation and trade-offs can be defended in review                                       |
| Testability                 | Medium | How easy the domain logic is to test                                                                      |
| Developer experience        | Medium | Edit-to-result loop and clarity of tooling                                                                |
| Dependency cost             | Medium | Number of external tools and packages that need maintenance                                               |
| Build and deployment model  | Medium | What is built and what must run in production                                                             |

## Measured so far

| Area                               | Candidate A — Go SSR                                                                                             | Candidate B — Astro static                                                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Routing                            | Routes are registered explicitly in `ServeMux` in `main.go`                                                      | Routes are defined by the file tree under `src/pages/`                                                                          |
| Home route                         | `GET /` handled by `homeHandler`                                                                                 | `src/pages/index.astro` generates `/`                                                                                           |
| Careers route                      | `GET /careers` handled by `careersHandler`                                                                       | `src/pages/careers/index.astro` generates `/careers`                                                                            |
| Dynamic role route                 | `GET /careers/{slug}` is handled at request time and uses `findRoleBySlug`                                       | `[slug].astro` uses `getStaticPaths()` during build and generates one HTML page for every valid role                            |
| Unknown role                       | `roleHandler` searches the in-memory roles and returns the custom 404 when no role is found                      | No HTML page is generated for an unknown slug, so the static server handles it as a 404                                         |
| General 404                        | HTTP status is written explicitly in Go with `http.StatusNotFound`                                               | A custom `404.html` is generated; final HTTP status behavior depends on the static hosting platform                             |
| When role data is read             | Once when the Go application starts                                                                              | During the Astro build                                                                                                          |
| When HTML is created               | Templates are rendered during HTTP requests                                                                      | HTML is generated before deployment during `npm run build`                                                                      |
| Valid role validation              | Manual validation in Go                                                                                          | Manual runtime validation in TypeScript                                                                                         |
| Type safety                        | Go compiler checks Go types                                                                                      | TypeScript strict mode checks application types, while external JSON is accepted as `unknown` and validated manually            |
| Empty role list                    | Supported by the Careers template                                                                                | Supported by an explicit empty-state branch                                                                                     |
| Malformed JSON                     | `loadRoles()` returns an error; the application starts with `rolesLoadError` and Careers shows fallback behavior | `loadRoles()` returns `status: "malformed"` and Careers builds a fallback state                                                 |
| Missing data file                  | `loadRoles()` returns an error; the application starts with fallback state                                       | `loadRoles()` returns `status: "unavailable"` and Careers builds a fallback state                                               |
| One invalid role among valid roles | Current Go implementation fails the whole `loadRoles()` call on the first invalid role                           | Current Astro implementation skips the invalid role, keeps valid roles and records the problem                                  |
| Error logging                      | Runtime/server logs                                                                                              | Build and CI logs                                                                                                               |
| Role lookup helper                 | `findRoleBySlug([]Role, slug) (Role, bool)`                                                                      | `findRoleBySlug(Role[], slug): Role \| undefined`                                                                               |
| Go tests                           | Uses built-in `go test`                                                                                          | Not applicable                                                                                                                  |
| Astro tests                        | Not applicable                                                                                                   | Uses Vitest                                                                                                                     |
| Current Astro domain tests         | —                                                                                                                | Covers valid file, empty file, partially invalid data, malformed source, unavailable source, validation failure and slug lookup |
| Type checking                      | Part of normal Go compilation                                                                                    | Separate `npm run check` command using Astro/TypeScript                                                                         |
| Formatting                         | `gofmt` is part of the Go toolchain                                                                              | No formatter has been added yet                                                                                                 |
| Build artifact                     | Go executable plus runtime template/data files                                                                   | Static files in `dist/`                                                                                                         |
| Production runtime                 | A Go process is running                                                                                          | No application process is required for a static deployment                                                                      |
| Health check                       | `/healthz` exists and is used by Render                                                                          | Not applicable to a static site because there is no application process to health-check                                         |
| Current deployment                 | Deployed on Render and publicly reachable                                                                        | Not deployed yet                                                                                                                |
| Edit → result loop                 | Go process must be restarted after code changes                                                                  | Astro dev server updates automatically during development                                                                       |
| Main application dependencies      | Current Go implementation uses the standard library                                                              | Astro is an application dependency                                                                                              |
| Development dependencies           | Go test, formatting and vet are part of the Go toolchain                                                         | Current project includes `@astrojs/check`, TypeScript, Node types and Vitest                                                    |
| PRD static-first direction         | Current SSR implementation is not static-first                                                                   | Static generation is Astro's current default configuration                                                                      |

## Build evidence for Candidate B

The Astro build currently generates:

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

This confirms that the dynamic role route is converted into real static HTML pages during the build.

## CI

Candidate A has a GitHub Actions workflow that runs:

- formatting check;
- `go vet`;
- Go tests with the race detector;
- Go build.

Candidate B has a separate GitHub Actions workflow intended to run:

- fixture parity check;
- `npm ci`;
- TypeScript/Astro check;
- Vitest tests;
- Astro build.

The fixture parity guard was deliberately broken once and then restored. The Git history contains both commits, which gives evidence that the guard can detect a difference instead of only existing as configuration.

## Important architectural difference

The biggest difference is not the syntax of Go versus TypeScript.

The main difference is **when the work happens**.

Candidate A keeps a live application process in production. It loads the role data at application startup and renders templates when HTTP requests arrive.

Candidate B moves most of this work to build time. It reads and validates the data, calculates the known role URLs and creates the final HTML before deployment.

This changes where failures are seen:

- Candidate A can discover application or data problems while the application is starting or running;
- Candidate B can discover many data problems during the build, before the generated files are deployed.

## Important difference in current validation behavior

The two candidates are not yet identical when only one role entry is invalid.

Current Candidate A behavior:

```text
valid role
invalid role
      ↓
loadRoles returns an error
      ↓
the complete role load is treated as failed
```

Current Candidate B behavior:

```text
valid role
invalid role
      ↓
invalid role is skipped
      ↓
valid role is kept
      ↓
problem is logged
```

This difference must either be aligned before the final decision or explicitly accepted as a design difference.

It should not be hidden in the comparison.

## PRD static-first observation

The PRD describes the website as static-first.

Candidate B currently matches this direction directly: the site is pre-rendered into static HTML.

Candidate A is currently implemented as SSR, so it does not match static-first behavior in its current form.

This does not automatically select Astro. A static generation approach could also be designed in Go, but that would be a different implementation from the Candidate A that is being measured here.

## Not yet comparable

| Area                              | Why it is not yet fair to compare                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| Production deployment             | Candidate A is deployed; Candidate B is not                                               |
| Production 404 behavior for Astro | Static HTTP status handling depends on the final host and has not been tested there       |
| Health check                      | Candidate A has a live process; a static deployment has no equivalent application process |
| Performance                       | No controlled measurements have been taken                                                |
| Core Web Vitals                   | There is no final CSS, image strategy or real production content yet                      |
| Editor content workflow           | Not implemented for either candidate                                                      |
| ATS integration                   | Not implemented for either candidate                                                      |
| Long-term maintenance cost        | Only factors can be identified now; it cannot be measured from a short experiment         |
| Final design implementation cost  | No real design has been implemented yet                                                   |

## Open questions

### Graceful degradation or fail-fast build?

The Astro experiment currently allows malformed or unavailable role data to generate a fallback page instead of failing the complete build.

A stricter static-first approach could fail the build and prevent deployment of bad content.

The final product behavior still needs a decision.

### Should invalid individual roles be skipped?

Candidate B currently keeps valid roles when one entry is invalid.

Candidate A currently treats an invalid role as a failed complete load.

The final contract should be the same regardless of the selected technology.

### Who owns HTTP 404 for a static deployment?

Candidate A controls the status code directly in application code.

Candidate B generates a `404.html`, but the hosting platform decides how unknown paths map to that file and which HTTP status is returned.

This must be tested on the selected static host.

### Manual validation or schema validation?

Candidate B currently validates JSON manually to keep the comparison close to the Go implementation.

For the final implementation, a schema tool such as Zod or Astro content collections may reduce repetitive validation code.

That decision has not been made.

### Repository structure after the stack decision

The current repository is intentionally asymmetric:

- Go remains at the repository root;
- Astro lives in `candidate-b-astro/`.

This avoids moving the working Go production candidate during the experiment.

After the stack is selected, the losing candidate and comparison scaffolding can be removed and the final project structure can be simplified.

## Current conclusion

No final stack decision is recorded in this document yet.

Candidate B currently has a stronger direct match with the PRD static-first direction.

Candidate A currently has stronger production evidence because it is already deployed as a working service.

The remaining decision should be based on the full comparison, especially architecture fit, failure behavior, design-stage cost and production deployment behavior.
