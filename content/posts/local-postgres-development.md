---
title: "Local Postgres for Development"
date: 2021-01-07T00:00:00-06:00
draft: false
tags: [Postgres, Linux]
---

I've been working on a hobby project that uses Rails and I recently decided to start using Postgres locally instead of SQLite.  I initially went down that path because I was thinking about using an enumerated type directly in the database which is [supported in Postgres](https://www.postgresql.org/docs/9.1/datatype-enum.html) but not SQLite.

Ultimately, I decided not to implement an enum directly in the database but figured I'd stick with running Postgres locally.  If nothing else, I'll learn a little bit and it's always easy to switch back to running SQLite.

I'm usually installing a fresh OS every couple of months on my personal laptop and I end up spending 20 minutes searching the web for the exact steps to get Postgres running again.  I'm documenting that process here for myself but maybe it'll be helpful to someone else.



### Install PostgreSQL
_I'm currently running manjaro._

```bash
$ sudo pacman -S postgresql
```

### Initialize the Database
We need to login as the `postgres` user, initialize the database, and get the service running.

```bash
$ sudo -iu postgres
[postgres]$ initdb -D /var/lib/postgres/data
$ sudo systemctl start postgresql.service
$ sudo systemctl enable postgresql.service
```

### Create the DB User for the Project
This is the user that I'll use to access the database from the project.  We have to create the user and then assign a password for that user.

One note, we need to make sure our user has the `Superuser` role so Rails can disable the database constraints when setting up test data.

```bash
[postgres]$ createuser --interactive
[postgres]$ psql
postgres=$ \password [username]
```

### Update pg_hba.conf
By default the [authentication method](https://www.postgresql.org/docs/9.1/auth-methods.html) for Postgres is `trust` but we'll need to use `md5` for Rails to be able to connect.

```bash
$ sudo nano /var/lib/postgres/data/pg_hba.conf
```
\
Find the two lines that look like below at the bottom of the pg_hba.conf file and replace `trust` with `md5`.

```bash
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
```

### Connect the DB in Rails
Update `config/database.yml` with the DB user's username and password.

```yaml
development:
  <<: *default
  database: [DB Name]
  username: [USERNAME]
  password: [PASSWORD]
```
  
\
Finally, run the Rails commands to setup the database and we're good to go.

```bash
rails db:setup
rails db:migrate
```  
\
_Sources I pieced this together from_\
[ArchWiki](https://wiki.archlinux.org/index.php/PostgreSQL#Installation)\
[DigitalOcean Blog](https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-your-ruby-on-rails-application-on-centos-7)\
[Rails Guides](https://guides.rubyonrails.org/testing.html#the-low-down-on-fixtures)