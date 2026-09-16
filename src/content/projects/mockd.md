---
title: 'mockd'
description: A mock API server built on Cloudflare Workers, with real-time request logging over WebSockets.
publishDate: 'Jan 26 2026'
isFeatured: true
draft: true
---

**Project Overview:**
mockd is a mock API server for developers waiting on a backend that doesn't exist yet. Describe an endpoint, get a live URL, point your app at it. No signup required.

## The Problem

Frontend work stalls waiting on an API. Fixtures and local stub servers work for a while, but they drift from the real API and only help the person who wrote them. Hosted mocks are better, but most make you sign up first.

## How It Works

- **Endpoints**: a method, a path, a response body. Status defaults to 200, content-type to JSON.
- **Rules**: return different responses based on the request, so you can test error paths without editing the mock.
- **Template variables**: `{{$uuid}}`, `{{$datetime}}`, and about a hundred more, plus values from the request like `{{request.body.email}}`. A repeat block generates arrays. It's string substitution, not evaluation.
- **Live request log**: every request streams into the dashboard over a WebSocket. This is what most people use mockd for.

## Architecture

Two Cloudflare Workers that deploy separately:

- **API worker**: the dashboard. Authenticated CRUD, metadata in D1.
- **Endpoint worker**: the mocks. Unauthenticated, bursty, routed by subdomain.

Keeping them apart means a dashboard deploy can't take down a live mock.

Each project gets a Durable Object with its own SQLite database for endpoints, rules, variables, and logs. The same object serves the mock requests and holds the dashboard's WebSocket, so log streaming needs no pub/sub layer.

## Onboarding

You can create a project without an account. You get a subdomain and a claim token. Sign up later and the token attaches the project to your account.

## Technology Stack

- Runtime: Cloudflare Workers, Durable Objects
- Backend: Hono (TypeScript)
- Frontend: React, Vite, Tailwind CSS, daisyUI
- Storage: D1 for metadata, Durable Object SQLite for per-project data
- Build: pnpm workspaces, Turborepo
