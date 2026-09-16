---
title: 'Value Before the Signup Wall'
publishDate: 'Sep 16 2026'
draft: true
tags: [Product, Onboarding]
excerpt: 'Let people use the thing before asking who they are.'
---

*Draft — notes only.*

## The idea

mockd's north star was "fastest path from nothing to a working mock API," under a minute. A signup form makes that impossible no matter how fast the rest of the product is. So the product lets you create a real project with no account at all.

## How it works

- `POST /api/projects/anonymous` returns a working subdomain immediately and a claim token.
- The anonymous project is not a demo or a sandbox. Endpoints, rules, and request logging all work exactly as they do for a signed-in user.
- Sign up later and the claim token attaches the project to the new account. Stateless, no ownership-transfer machinery.

## The argument

- The signup prompt lands after someone has a working mock and a reason to care, instead of before they know whether the product is any good.
- Most signup walls exist to capture people who would have bounced. They also repel people who would have converted. The claim-token pattern says you can have both.
- "Free tier must be useful" is the same principle one layer down — free isn't a demo, it's a product.

## Open questions to address

- Expiry and cleanup. Abandoned anonymous projects accumulate; what's the policy, and how do you communicate it without scaring people?
- Abuse. An unauthenticated create endpoint is an unauthenticated create endpoint.
- Subdomain squatting.
- Whether you lose anything real by not knowing who your early users are.
