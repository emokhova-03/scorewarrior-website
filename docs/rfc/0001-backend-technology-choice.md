# RFC-0001 - Backend technology choice

Status: In Discussion
Date: 2026-08-21
Author: Elizaveta Mokhova
Reviewer: Petr
Related: Corporate Website PRD v0.18 §6, §8, §9

Context

The PRD suggests Next.js or Astro with TypeScript, but leaves the final stack to tech-lead approval (PRD §8). I propose Go for the backend, with server-side rendering for the website.

The main constraints are the two-week delivery window and the request to put real attention on the backend. The site also needs content that can be changed without editing application code (PRD F4.AC3, F5.AC8), and external data such as vacancies must be checked before the application uses it (PRD §6).

Options considered

1. Next.js / Astro + TypeScript

This matches the stack suggested in the PRD and gives more frontend tooling out of the box. It is a strong option for a content-heavy website. For this project, however, it would mean learning TypeScript, a framework and its deployment model while delivering the site in two weeks. It would also require me to spend part of the limited project time learning the frontend framework itself.

2. Go + server-side rendering - proposed

Go can cover the server, routing, HTML rendering, JSON handling and tests with its standard library. For example, net/http already supports routes such as GET /path in ServeMux, so a third-party router is not required for the current needs. Source: Go routing enhancements, https://go.dev/blog/routing-enhancements

With this option, the backend stays an important part of the project and I do not need a separate frontend application. The same Go application can render pages, load repository-based content, work with careers data and expose technical endpoints such as /healthz.

It also keeps the first version relatively small: one application and one backend stack. I am already learning Go, so I can spend the project time going deeper into one language instead of learning two stacks in parallel.

The main disadvantage is that Go gives less frontend tooling than Next.js or Astro. Image handling, page templates and some UI work will be more manual. That matters because the PRD has strict performance requirements (§6), and the interface still needs to meet the quality principles in the Interface Cheat Sheet shared for the project: https://interfaces.dev/cheat-sheet

3. Go API + separate JavaScript frontend

This would give a very clear separation between frontend and backend, but it creates two applications and two stacks. I do not think that extra complexity is justified for the current website and deadline.

Decision

I propose Go with server-side rendering.

The main reasons are:

- it gives the backend a meaningful role in the project;
- the first version can stay as one application instead of two;
- the Go standard library already covers the basic HTTP and rendering needs;
- content can be stored separately from the Go code, so text and images can be updated through the repository;
- I can concentrate the two-week learning and implementation time on one backend stack.

This is a proposal, not an approved change to the PRD. If Go is accepted, the Tech Spec and stack notes should be updated to match the implementation.

Risks

The biggest risk is my current Go experience. I am still learning the language, so development and debugging may take longer than they would with an experienced Go developer. I would manage that by keeping the architecture small, building working pieces early and cutting optional scope before lowering the required quality bar (PRD §9).

The second risk is frontend work. Go does not give us the same frontend and image tooling as Next.js/Astro, so performance and UI quality will need to be checked explicitly rather than assumed.

I would revisit this proposal if the frontend needs much more interaction, if Go conflicts with an important company-wide technical constraint, or if an early test shows that this approach makes the PRD performance targets difficult to reach.

### Deployment evidence (2026-08-25)

The Go candidate is deployed and publicly reachable at
https://scorewarrior-website.onrender.com.

Build and start commands are documented in the README. The port is supplied by the platform through the `PORT` environment variable.

Health checks are wired to `/healthz`. Every push to `main` triggers an automatic rebuild and deploy, and GitHub Actions runs formatting, vet, tests and build on every push and pull request.

Known limitation: templates and data are still read from disk relative to the working directory, so the binary is not yet self-contained.

### Candidate B experiment (2026-08-30)

The technology decision is still **In Discussion**.

After Candidate A was implemented and taken through CI, build, deployment and a public health check, I added a second implementation to collect real comparison data instead of making the final decision from assumptions.

Candidate B is an Astro + TypeScript implementation in:

```text
candidate-b-astro/
```

It is intentionally inside the same repository as Candidate A.

The Go candidate was not moved into another folder because it is already the working production baseline. Moving it during the experiment would change existing paths used by deployment, CI and documentation without improving the comparison.

The repository structure is therefore temporarily asymmetric.

### Scope of Candidate B

Candidate B is not a second full website.

It implements the same limited Careers vertical slice used for the comparison:

- Home;
- Careers listing;
- role detail;
- custom 404;
- repository-based test role data;
- runtime validation of external JSON data;
- empty source behavior;
- malformed source behavior;
- unavailable source behavior;
- domain tests;
- type check;
- production build.

Design, ATS integration and production content are outside this experiment.

### Fairness rules

The comparison uses the following rules:

1. Both candidates use the same development role data.
2. The two `roles.json` files are checked for parity in CI.
3. The compared UI scope is intentionally minimal and has no design work.
4. The same Careers behavior is implemented where the architectures allow a fair comparison.
5. Candidate-specific capabilities that have not been implemented on both sides are listed as not comparable instead of being used as evidence.
6. No final stack decision is made until the measured comparison is complete.

The detailed comparison is recorded in:

```text
docs/candidate-comparison.md
```

### Candidate B implementation

Candidate B uses Astro with TypeScript strict mode.

Its current role model matches the development fixture used by Candidate A:

```text
slug
title
department
location
```

Role data is treated as external input.

The TypeScript code does not cast parsed JSON directly to `Role[]`. JSON is accepted as `unknown` and validated before it becomes a `Role`.

The domain logic is kept in:

```text
candidate-b-astro/src/lib/roles.ts
```

This keeps file loading, validation and role lookup separate from page rendering and makes the logic testable without rendering Astro components.

### Static generation model

Candidate B uses Astro's static output.

During the build:

1. role data is read;
2. the data is validated;
3. `getStaticPaths()` creates the list of known role paths;
4. Astro generates final HTML files.

The current build produces pages including:

```text
dist/index.html
dist/careers/index.html
dist/careers/test-backend-engineer/index.html
dist/careers/test-game-designer/index.html
dist/404.html
```

This is the main architectural difference from Candidate A.

Candidate A keeps a live Go process in production and renders templates during requests.

Candidate B creates the site before deployment and can be served as static files without an application process.

### Data-loading timing

One correction to the original high-level comparison is important.

Candidate A does not currently read `roles.json` on every request.

The current Go application reads the file once during application startup:

```text
main()
  -> loadRoles("data/roles.json")
  -> roles kept in memory
```

The templates are still rendered during HTTP requests, but the role data itself is loaded at startup.

Candidate B reads and validates the role data during the static build.

This distinction is recorded in the comparison document.

### Validation behavior found during the experiment

The experiment found one current behavioral difference that needs an explicit decision.

Candidate A currently stops the full role load when one role fails validation.

Candidate B currently skips the invalid role, keeps the valid roles and records the validation problem.

This means the two candidates do not yet have exactly the same partial-data behavior.

Before the final stack decision, this should either be aligned or accepted as an intentional product rule.

### Tests and checks

Candidate A uses the Go toolchain:

```text
gofmt
go vet
go test
go build
```

Candidate B currently uses:

```text
npm run check
npm run test
npm run build
```

Vitest tests cover the domain logic, including:

- valid data;
- empty data;
- partially invalid data;
- malformed JSON;
- unavailable file;
- invalid role validation;
- existing and missing slug lookup.

Candidate B also has a separate GitHub Actions workflow.

The workflow includes a fixture parity guard and the Git history contains a deliberate break-and-restore test of that guard.

### Current evidence

Candidate A currently has stronger deployment evidence:

- deployed on Render;
- public HTTPS URL;
- live Go process;
- `/healthz`;
- automatic deployment after changes to `main`.

Candidate B currently has stronger direct evidence for the PRD static-first architecture:

- static output is the default configuration;
- role pages are generated during build;
- the production artifact is a directory of static files;
- no Node.js application process is required to serve the generated site.

Candidate B has not yet been deployed, so production hosting behavior must not yet be compared as if it were proven.

### Open questions

The following questions remain open:

1. **Graceful degradation vs fail-fast build**

   Candidate B currently allows malformed or unavailable role data to generate a fallback page.

   A stricter static build could instead fail CI and block deployment.

   The desired production rule has not been selected yet.

2. **Partial invalid data**

   Candidate A currently fails the complete load when one role is invalid.

   Candidate B currently keeps valid roles and skips the invalid one.

   The final product contract should be explicit and consistent.

3. **Static 404 behavior**

   Astro generates a custom `404.html`, but the hosting platform controls the HTTP response for unknown URLs.

   This must be verified on the selected static host.

4. **Manual validation vs schema tooling**

   Candidate B currently uses manual validation to keep this experiment comparable with the Go candidate.

   The final TypeScript implementation could use Zod or another schema-based approach if Astro is selected.

5. **Repository structure**

   `candidate-b-astro/` and the duplicated role fixture are comparison scaffolding.

   After the technology decision, the losing candidate should be removed and the final repository structure simplified.

### Decision status

> No final technology decision is made in this update.
> Update 2026-08-30: this proposal is now being tested against Candidate B (Astro + TypeScript). No final decision has been approved yet; the RFC remains In Discussion.

The RFC remains:

**Status: In Discussion**

The next step is to finish the comparison, close the remaining production questions and then update this RFC with the final decision and its evidence.
