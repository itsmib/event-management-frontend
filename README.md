# Gather — Event Management Frontend

A standalone React + TypeScript application for [Event Management System](https://github.com/itsmib/event-management-system). Gather replaces the backend's embedded Thymeleaf pages with a responsive frontend that builds and deploys independently.

## What you can do

- Discover upcoming events, search by name/place/category, filter categories, and sort by date or name.
- View event details, availability, organizer, and uploaded images.
- Register, sign in/out, recover a password by email code, and edit your profile.
- Reserve tickets, view bookings, and cancel with explicit confirmation.
- As an organizer: view dashboard totals; create, edit, and delete your events; send reminders and view reminder history.

The UI includes loading, empty, and error states, mobile navigation, labeled forms, keyboard focus indicators, reduced-motion support, and role-aware navigation. All event and account data comes from the API; the frontend does not fabricate fallback records or store authentication tokens in local storage.

## Stack and project boundaries

React, TypeScript, React Router, Vite, Lucide icons, and plain CSS. Vitest and Testing Library cover the API client and key interaction behavior. The lockfile pins installed dependency versions.

This repository owns the UI, routing, API client, and frontend deployment. The Spring Boot repository owns all data, authentication, role enforcement, inventory rules, and email delivery. Route guards improve navigation; backend authorization remains the security boundary.

## Quick start

Requires Node.js 22.12+ and npm. Start the matching backend branch/release first:

```sh
# In the backend repository (Java 21)
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Then:

```sh
git clone https://github.com/itsmib/event-management-frontend.git
cd event-management-frontend
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to `http://localhost:8083`. To use another local backend, change `API_PROXY_TARGET` in `.env.local` and restart Vite. Use the frontend URL consistently; `localhost` and `127.0.0.1` have different cookie scopes.

For illustrative events and organizer/member accounts, use the backend README's explicit local demo-data command. Without demo data, start with registration; organizer access is assigned by a database administrator. The frontend cannot promote accounts.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local frontend with API proxy |
| `npm run typecheck` | Strict TypeScript validation |
| `npm test` | Vitest behavior tests |
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run preview` | Preview the production assets; not a production server |

## API integration

`src/api.ts` is the shared boundary. It requests a session-backed masked CSRF token before every mutation, sends that token under the returned header name, and includes same-origin cookies. Login uses URL-encoded credentials; event writes use multipart FormData; other mutations use JSON. Empty `204` responses are handled without parsing JSON. Mutations are never retried automatically, to avoid duplicate bookings after ambiguous network failures.

The application needs the backend's standalone-frontend API release; the old event-only REST endpoints are insufficient. See [the API contract](https://github.com/itsmib/event-management-system/blob/main/docs/API.md) and [migration guide](https://github.com/itsmib/event-management-system/blob/main/docs/MIGRATION.md). These documentation links become available on `main` when the companion backend PR merges.

## Routes

| Route | Audience |
| --- | --- |
| `/`, `/events/:id`, `/about` | Public |
| `/login`, `/register`, `/reset-password` | Public authentication screens |
| `/bookings` | Members |
| `/profile` | Signed-in members and organizers |
| `/admin` | Organizer overview |
| `/admin/events` | Organizer's own events |
| `/admin/events/new`, `/admin/events/:id/edit` | Organizer event editor |
| `/admin/reminders` | Organizer reminder history |

## Deploy

```sh
npm ci
npm test
npm run build
```

Serve `dist/` from a static web server. Use [deploy/nginx.conf](deploy/nginx.conf) as a reverse-proxy example: `/api/` goes to Spring Boot, and all frontend navigation falls back to `index.html`. Keep both behind one HTTPS origin and set backend `COOKIE_SECURE=true`. `API_PROXY_TARGET` configures Vite development/preview only; it is not embedded into production assets.

Configure TLS, your actual backend hostname/port, trusted proxy handling, upload limits, and upstream timeouts for your deployment. Keep `/api` responses out of the SPA fallback. A static-only host without an API reverse proxy will not support this session-authenticated application as configured. Deploy the frontend and companion backend as a coordinated release; do not merge one application's rollout independently.

## Structure

```text
src/
  api.ts          Fetch, CSRF, error handling
  auth.tsx        Current-user state and route guards
  hooks.ts        Abortable resource loading
  types.ts        API response types
  components/     App shell, event cards, shared feedback
  pages/          Discovery, authentication, bookings, profile, organizer UI
  test/           API and interaction tests
  styles.css      Responsive visual system
```

## Validation and limits

CI runs tests and the production build on Node 22. Backend validation tests run separately with H2 and mocked SMTP; staging must verify Oracle and real email configuration. The frontend preserves the backend's venue-local date/time convention and does not convert timezones. Payments, seat maps, and account email changes are not implemented. Profile editing preserves credentials; password changes use email recovery.

Typography uses Google Fonts with local fallback fonts. There are no third-party event image dependencies; missing event artwork uses CSS shapes. If external fonts are restricted, remove the stylesheet import or self-host the fonts.

## Project context and usage

This is the frontend split of the internship team project continued independently by [Noorul Misbah](https://github.com/itsmib). Original contributors and project history are retained in the backend README. For learning and portfolio use; request permission before commercial use. No open-source license is granted by this refactor.
