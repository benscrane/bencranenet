---
title: 'mockd'
description: A mock API server built on Cloudflare Workers, with real-time request logging over WebSockets.
publishDate: 'Jan 26 2026'
isFeatured: true
---

**Project Overview:**
mockd is a mock API server for developers who are blocked on a backend that doesn't exist yet. Describe an endpoint, get a live URL, point your app at it. The goal is to get from "I need a mock endpoint" to "here's the URL" in under a minute, without signing up first.

## The Problem

Frontend work stalls waiting on an API. The usual workarounds — hardcoded fixtures, a local Express server, commenting out the fetch call — all drift from the real thing and none of them help a teammate. A hosted mock is better, but most hosted tools put a signup form between you and the first working request.

## How It Works

- **Endpoints** — a method, a path, and a response body. Status code defaults to 200, content-type to JSON. Everything else is optional.
- **Rules** — return different responses based on the incoming request, so you can exercise error paths without editing the mock.
- **Template variables** — `{{$uuid}}`, `{{$datetime}}`, and about a hundred others, plus values pulled from the request itself like `{{request.body.email}}`. There's a repeat block for generating arrays. It's string substitution, not evaluation, so there's no sandbox to escape.
- **Live request log** — every request to your mock streams into the dashboard over a WebSocket as it happens. This turned out to be the feature people actually use it for.

## Architecture

Two independent Cloudflare Workers, split along the control-plane/data-plane line:

- **API worker** — the dashboard. Authenticated CRUD, user and project metadata in D1.
- **Endpoint worker** — the mocks. Unauthenticated, bursty, latency-sensitive, routed by subdomain.

They ship separately, so deploying a dashboard change can't take down a live mock endpoint someone's demo depends on.

Each project gets its own Durable Object with a SQLite database holding that project's endpoints, rules, variables, and request logs. Per-project isolation comes free, and because the same Durable Object both serves the mock requests and holds the dashboard's WebSocket connections, live log streaming needs no pub/sub layer at all — the writer and the broadcaster are the same object.

## Onboarding

There's no signup wall. Creating a project without an account returns a working subdomain and a claim token; sign up later and the token attaches the project to your account. The ask comes after the value, not before it.

## Technology Stack

- Runtime: Cloudflare Workers, Durable Objects
- Backend: Hono (TypeScript)
- Frontend: React, Vite, Tailwind CSS, daisyUI
- Storage: D1 for metadata, Durable Object SQLite for per-project data
- Build: pnpm workspaces, Turborepo
