---
title: 'ynab-dashboard'
description: A Rust terminal dashboard for YNAB, backed by a local SQLite mirror so it starts instantly and works offline.
publishDate: 'May 30 2026'
isFeatured: true
---

**Project Overview:**
`ynab-dash` is a full-screen terminal dashboard for [YNAB](https://ynab.com). It shows the budget at a glance and lets you clear the approve-and-categorize queue without leaving the terminal. Still a work in progress.

## The Problem

Two things send me to the YNAB web app: checking the budget, and approving and categorizing new transactions. The first is reading numbers. The second is a few dozen keystrokes of repetitive work. A terminal handles both fine.

## What It Does

- **Dashboard**: category progress, net worth trend, age of money, and recent activity in one view.
- **Review queue**: approve and categorize transactions one keystroke at a time. Complicated edits open ynab.com instead.
- **Wrapped**: a year in review rendered as a terminal story, exportable as a card.

## Local Cache and Delta Sync

The first version fetched everything on every launch, so startup meant a few seconds of empty screen. It now keeps a full SQLite mirror in the XDG data directory.

YNAB's API returns a `server_knowledge` cursor with each response. Pass it on the next request and you get back only what changed. Startup reads from disk and draws right away while the sync runs. Later syncs move almost nothing.

Some things that helped:

- A background thread owns the SQLite connection. The main thread sends it commands over channels and never touches the database.
- Each endpoint commits independently, so a sync that fails halfway keeps what it wrote.
- The store mirrors everything. Deleted, hidden, and closed items get filtered out in SQL, not in Rust.
- Writes go through the same thread, which calls the API, saves the record, and hands it back. The review queue drains without waiting for a round trip.
- The schema version lives in `PRAGMA user_version`. On a mismatch the cache is deleted and rebuilt.

## Technology Stack

- Language: Rust
- TUI: ratatui
- Storage: SQLite (rusqlite)
- HTTP: ureq
- CLI: clap

*Not affiliated with or endorsed by YNAB.*
