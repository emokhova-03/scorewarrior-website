# Scorewarrior corporate website

Go implementation of the Scorewarrior corporate website.  
Candidate A in the backend technology comparison (see
`docs/rfc/0001-backend-technology-choice.md`).

**Live:** https://scorewarrior-website.onrender.com

## Requirements

- Go 1.27 or newer

## Run locally

```bash
git clone https://github.com/emokhova-03/scorewarrior-website.git
cd scorewarrior-website
go run ./cmd/web
```

The site is then available at http://localhost:8080

To run on a different port:

```bash
PORT=3000 go run ./cmd/web
```

## Run the checks

```bash
gofmt -l .
go vet ./...
go test ./...
```

The same checks run automatically in GitHub Actions on every push and pull request.

## Routes

| Path              | Description                   |
| ----------------- | ----------------------------- |
| `/`               | Home                          |
| `/careers`        | Job listings                  |
| `/careers/{slug}` | Single role                   |
| `/healthz`        | Health check used by the host |
| anything else     | 404 page                      |

## Project structure

- `cmd/web/` — application entry point, handlers and routing
- `templates/` — HTML templates, composed around `base.html`
- `data/` — development fixtures (`roles.json`)
- `docs/rfc/` — architecture proposals under discussion

## Content

Job data currently comes from `data/roles.json`, a development fixture.

It is not production ATS data, and every title is prefixed with `[TEST]`.

## Deployment

Deployed on Render as a Go web service.

- Build command: `go build -tags netgo -ldflags '-s -w' -o app ./cmd/web`
- Start command: `./app`
- Health check path: `/healthz`
- The port is read from the `PORT` environment variable, defaulting to `8080`

Every push to `main` triggers an automatic deploy.
