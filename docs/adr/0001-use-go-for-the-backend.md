ADR-0001 - Use Go for the website backend

Status: Proposed — awaiting tech lead review
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

I would revisit this decision if the frontend needs much more interaction, if Go conflicts with an important company-wide technical constraint, or if an early test shows that this approach makes the PRD performance targets difficult to reach.
