---
title: "Local Postgres for Development"
date: 2020-12-26T13:57:36-06:00
draft: true
tags: [Postgres]
---

I've been working on a hobby project that uses Rails and I recently decided to start using Postgres locally instead of Sqlite.

Install PostgreSQL

```bash
$ sudo pacman -S postgresql
```

$ Initialize Database

```bash
$ sudo -iu postgres
[postgres]$ initdb -D /var/lib/postgres/data
$ sudo systemctl start postgresql.service
$ sudo systemctl enable postgresql.service
[postgres]$ createuser --interactive
[postgres]$ psql
postgres=# \password [username]
$ sudo nano /var/lib/postgres/data/pg_hba.conf
```

```
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Update database.yml with the DB username and password.

```bash
rails db:setup
rails db:migrate
```

https://wiki.archlinux.org/index.php/PostgreSQL#Installation
https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-your-ruby-on-rails-application-on-centos-7