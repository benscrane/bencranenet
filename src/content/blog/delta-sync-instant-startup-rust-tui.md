---
title: 'Delta Sync and Instant Startup in a Rust TUI'
publishDate: 'Sep 16 2026'
draft: true
tags: [Rust, SQLite, TUI]
excerpt: 'Stop fetching everything on every launch.'
---

*Draft — notes only.*

## The idea

`ynab-dash` used to fetch the whole budget from the API on every launch and show an empty screen for a few seconds. A terminal tool that takes three seconds to start is a terminal tool you stop opening. Fixing that meant a local SQLite mirror plus incremental sync, and the interesting part is the threading, not the SQL.

## Points to make

- YNAB's API returns a `server_knowledge` cursor. Send it back on the next request and you get only what changed since. Lots of APIs have some version of this and it goes unused.
- Startup reads from the local SQLite file and paints immediately. Sync runs behind the already-visible UI. The network is never on the startup path after the first run.
- Dropping the `since_date` filter was right: fetch full history once, and every delta after that is tiny.

## The threading decision

The one I'd lead with. A background thread owns the `Connection` for its entire lifetime; the main thread never touches SQLite. Two channels — commands going down, messages coming up. This sidesteps the whole category of "is rusqlite `Send`, do I need a mutex, why is my UI thread blocked on a write" problems by construction rather than by care.

Writes go through the same thread: call the API, upsert the returned record, hand it back to the main thread so the review queue drains immediately instead of waiting for the next sync.

## Smaller things worth including

- Each endpoint commits independently (fetch, upsert, set cursor). A sync that dies halfway keeps what it got.
- The store mirrors everything; filtering deleted, hidden, and closed items happens in SQL, not Rust. Kept the Rust side much smaller than expected.
- `PRAGMA user_version` against a `SCHEMA_VERSION` constant. Mismatch means delete the file and resync. The cache is disposable, so schema changes stop being migrations.

## Framing

The general version: when the remote is the source of truth and your local copy is disposable, you get to make choices that a real database migration story would never allow.
