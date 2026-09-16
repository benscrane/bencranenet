---
title: 'One SQLite Database per Tenant with Durable Objects'
publishDate: 'Sep 16 2026'
draft: true
tags: [Cloudflare, Architecture]
excerpt: 'Giving every project its own database, and getting real-time streaming for free.'
---

*Draft — notes only.*

## The idea

Most multi-tenant apps put everything in one database and add a `project_id` column to every table. On Cloudflare, Durable Objects with SQLite storage let you do the other thing: give every project its own database. Writing up what that bought and what it cost in mockd.

## Points to make

- The three options actually considered: D1 with `project_id` foreign keys everywhere, Durable Objects with the KV-style storage API, Durable Objects with SQLite. Why the third won.
- Isolation stops being something you enforce in every query. There is no `WHERE project_id = ?` to forget.
- Storage is local to the object, so no network hop to D1 on the hot path. That matters when the product's whole pitch is a fast mock response.
- **The part worth the post:** the Durable Object that serves the mock requests is also the one holding the dashboard's WebSocket connections. Writer and broadcaster are the same object, so live request logging needed no pub/sub, no queue, no fan-out layer. This is the thing I'd have wanted to read beforehand.
- Cloudflare handles placement and scaling per object. Each project is just an actor.

## The trade-offs, honestly

- Cross-project queries are genuinely awkward. Anything aggregate — usage totals, admin views, analytics — has to be designed for up front, because you can't just `GROUP BY`.
- Migrations run per object rather than once. Needs a story.
- Local development and debugging are worse than pointing a SQL client at one database.

## Pair with

The two-worker split — control plane (dashboard, authenticated, low volume) versus data plane (mocks, unauthenticated, bursty). Same instinct applied at the deployment layer: a dashboard deploy should not be able to break someone's live endpoint. Could be one post or two.
