---
title: 'Pour Gasoline on Your Own Fire'
publishDate: 'Oct 10 2026'
draft: true
tags: [AI, Strategy]
excerpt: 'AI makes the fire you already have burn hotter. It is not a reason to start a hundred new ones.'
---

There's a question I keep hearing, and to be fair I've asked it myself: why pay a vendor for this when I have AI?

The version I run into most is healthcare integration. A digital health company needs data out of EHRs. It can pay an integration vendor to handle those connections, or it can build them itself. A couple of years ago that was an easy call for most teams. Now someone opens a coding agent, points it at an HL7 spec, and has a working ADT feed parser by lunch. And they ask a reasonable question: we need two dozen of these, so why don't I just build them myself?

I think the answer is a metaphor. AI is gasoline.

## Gasoline makes a fire bigger

Gasoline doesn't care what it lands on. Pour it on a fire that's already burning and you get a much bigger fire, fast. That's what AI does for a team that already knows what it's doing. People who understand the domain ship more. The tedious parts of the work shrink. The ceiling goes up.

So the first question isn't "can AI do this?" It's "what's my fire?"

If your fire is EHR integration, meaning it's the thing your company exists to do and the thing customers pay you for, then pour it on. You should be using AI to do integration better than you could last year. That's where it pays off most. You already have the people who know where the edge cases are, you have the test data, and you have the scar tissue from the hospital that sends timestamps in local time with no offset. AI makes all of that go further.

If your fire is something else, like a care management app, a remote monitoring program, or a trial platform, then integration isn't your fire. It's something you need so your fire can burn. Pouring gasoline on it doesn't make your fire bigger. It starts a new one.

## The prototype is the easy part

"I'll just do it myself" is tempting because AI has made the first version nearly free. The prototype really does take an afternoon now. That's true, and it isn't going back.

But the first version was never the expensive part of integration. The expensive part is everything after it:

- The twenty-third connection, which behaves nothing like the first twenty-two because that health system customized its interface engine in 2014 and everyone who did it has left.
- The 2am page when a feed silently stops, and nobody notices until a clinician asks why a patient's results are missing.
- Upgrades, certifications, security reviews, the BAA chain, and a spec that keeps changing under you.
- The one person who understands all of it leaving.

AI helps with every one of those. It doesn't make any of them go away. Someone still has to own them, and that someone is now you. A fire you started is a fire you have to tend.

## Don't start a hundred fires

This is the trap. When building gets cheap, everything starts to look like something you should build: integration, billing, auth, scheduling, notifications, the analytics pipeline. Each one is plausible on its own, and each one has a working prototype by Friday.

Then you have a hundred small fires that all need tending. The one fire you actually cared about, the product and the reason the company exists, gets the same attention it got before. Maybe less.

AI's leverage is real, but it's leverage on attention you already have. It doesn't create more of the scarce thing, which is people who understand a problem well enough to own it for years. Spending that attention on fires you weren't even trying to light before is the opposite of using AI well.

## What I'd ask instead

Not "can we build this now?" The answer to that is almost always yes. Ask these instead:

1. Is this our fire? Would we be proud to be the best in the world at it?
2. Who tends it in two years, when the prototype is a production dependency and the person who wrote it has moved on?
3. If we didn't build it, where would that gasoline go instead?

If the honest answer to the first one is yes, build it, and use every tool you have. If it's no, let someone whose fire it is carry it, and pour your gasoline on your own.
