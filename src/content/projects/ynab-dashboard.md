---
title: 'ynab-dashboard'
description: A Rust terminal dashboard for YNAB, backed by a local SQLite mirror so it starts instantly and works offline.
publishDate: 'May 30 2026'
isFeatured: true
---

**Project Overview:**
`ynab-dash` is a full-screen terminal dashboard for [YNAB](https://ynab.com). It shows the state of the budget at a glance and lets you clear the approve-and-categorize queue without leaving the terminal. Still a work in progress.

## The Problem

Two things pull me into the YNAB web app that don't deserve a browser tab. The first is checking the budget, which is a read-only glance. The second is triaging the pile of unapproved and uncategorized transactions, which is a few dozen keystrokes of very repetitive work. Both are a better fit for a terminal than a web UI.

## What It Does

- **Dashboard** — category progress, net worth trend, age of money, and recent activity in one view.
- **Review queue** — approve and categorize transactions a keystroke at a time. Anything genuinely complicated opens ynab.com rather than growing a worse version of YNAB's editor inside the TUI.
- **Wrapped** — a year-in-review rendered as a terminal story, exportable as a shareable card.

## Local Cache and Delta Sync

The first version fetched everything from the API on every launch, which meant a few seconds of staring at an empty screen. It now keeps a complete SQLite mirror of the YNAB state in the XDG data directory.

YNAB's API hands back a `server_knowledge` cursor with each response. Pass it on the next request and you get only what changed. Combined with the local mirror, startup reads from disk and paints immediately while the sync runs behind it, and subsequent syncs move almost no data.

A few decisions that made it manageable:

- A background thread owns the SQLite connection for its entire lifetime. The main thread never touches the database — it sends commands and receives messages over channels.
- Each endpoint commits independently, so a sync that fails halfway keeps the progress it made.
- The store is a full mirror. Filtering out deleted, hidden, and closed items happens in SQL `WHERE` clauses rather than in Rust.
- Writes route through the same background thread, which calls the API, upserts the returned record, and hands it back so the review queue drains immediately instead of waiting for a round trip.
- The schema version lives in `PRAGMA user_version`. On mismatch the cache is deleted and rebuilt, which makes schema changes a non-event.

## Technology Stack

- Language: Rust
- TUI: ratatui
- Storage: SQLite (rusqlite)
- HTTP: ureq
- CLI: clap

*Not affiliated with or endorsed by YNAB.*
