# Event Catalogue — where every event comes from

The owner, 2026-09-25: *"Our next phase will probably be a lot of optimization to cut down of usage of the computer, as
well as figuring out where all these events are coming from."*

Every event that puts something on the screen, gathered from two sources:
- **Reading the code.** 172 modules; 52 of them add elements to the page.
- **Watching it happen** (`tools/probe_event_census.js`): a late-game save left running and clicked, with instability
  held at 35, then 65, then 88. Each element, overlay and notification is traced back to the module that made it.

**Frequency** is the census count over its run. A "p/check" figure is the chance per check in the code.

> **Status:** first version, 2026-09-26. The keep / merge / cut column is empty on purpose: that is the owner's call.
> Rows marked ⛔ were defects found while writing this, and they are fixed.

---

## 1. World events — the ticker events (`WorldEvents`, game.js)

Checked by `WorldEvents.tick`. One at a time, then a 60-second cooldown, and never the same one twice in a row. Each
is announced in the notification stream through the world-event ticker.

| Event | Lasts | Needs | Chance | What it does |
|---|---|---|---|---|
| ↯ QUANTUM SURGE | 20s | 5,000 energy | 0.7% | income ×3 |
| ◎ DATA STORM | 14s | 200 energy | 0.5% | 7 clickable orbs to absorb |
| ⊘ WALKER STRIKE | 16s | 1e15 energy | 0.4% | the city mints no People Points |
| ≋ MOMENTUM CASCADE | 10s | 5,000 energy, and a click in the last 4s | 0.25% | combo held at OVERDRIVE ×4 |
| ☓ CORRUPT PACKET | 12s | 1e12 energy | 0.3% | a 30-second income burst, income ×5; but ~5% of one random generator is deleted, and +15% instability |
| ✻ TIME FREEZE | 12s | 1e8 energy | 0.15% | passive income paused; clicks only |
| ✧ MEMORY PURGE | 30s | 1e15 energy | 0.2% | energy halved, then income ×2 |

## 2. Crises — full-screen events that go through the queue (`GlobalEventQueue`)

At most one at a time. The queue enforces an 18-minute gap and caps total threat. The weight is how much of the threat
budget each one takes.

| Event | Weight | Raised by | What it does |
|---|---|---|---|
| Existential Crisis | 100 | 1,000,000 clicks, once | a four-way choice (POWER / NUMBERS / VOID / FUN), each with a permanent mark; FUN plants the duck |
| Null Interrogation | 100 | prestige ≥ 1 and 5,000 clicks, 0.6% a tick; certain at 10,000 clicks; once | NULL asks; you answer or leave with Escape (+20% instability) |
| Reality Breach (`AnomalyBoss`) | 80 | 1e7 energy, 0.4% a tick × noise | click it 8–12 times; it escapes for +15% instability |
| Ransom Protocol | 60 | prestige ≥ 1, clicks past 80% of the prestige threshold, once | pay or decline |
| Duck Tribunal | 50 | a save older than 20 minutes, a session floor, not AFK, once | the ducks judge; a guilty verdict takes a nav button (`DuckRansom`) |
| Prisoner's Dilemma | 40 | prestige ≥ 1, 1e8 energy, 0.05% a tick; 30s warning first | SHARE / STEAL against a fake operator |
| CAPTCHA | 20 | prestige ≥ 1, two generators owned, not AFK, on a timer | prove you are human; a feather skips it |
| Eye of the Storm | 20 | instability ≥ 60, 0.3% a 2s tick | a calm window inside the storm |

## 3. The corner widgets — now in the side dock

These are persistent cards, not moments. Since 2026-09-26 they stack in two lanes above the nav bar
(`SideDock`); before that they were placed by hand and drew over one another.

| Widget | Lane | Appears when | What it does |
|---|---|---|---|
| ⚙ SYSTEM DIAGNOSTICS | left | EPS over 1,000 | a CPU meter that follows EPS; at 100% it fires the thermal crash once, which leaves a ×25 EPS / 30-minute dividend behind the crash screen |
| ⚙ GENERATOR NETWORK CHAT | left | EPS over 1e10 | a complaint every 18s; after six, a 30% chance with each one of a STRIKE (−50% output) until you NEGOTIATE (10% of your energy) or PURGE (−2% output, permanently) |
| Blissful Spore | left | prestige ≥ 1 | a companion you feed instability; hats; it cries when hungry (it used to blur the shop — removed 2026-09-26) |
| ↯ INTERCEPTED SIGNALS | right | instability ≥ 55 and prestige ≥ 1 | SIPHON takes 30% of another operator's energy and raises VISIBILITY; at 100%, 15 seconds with income frozen |
| ▤ JUNK DATA (RAM) | right | EPS over 10,000 | fills over ~15 min; costs income ×0.85 / ×0.6 / ×0.2 past 40 / 60 / 80%; FLUSH clears it. ⛔ It also stuttered the game on purpose; removed 2026-09-26 |
| Overseer-Chan | right | her own gate | commentary; click her for a Sugar Rush (×1.5 income for 15s) |

## 4. Things that cross the board

| Event | Raised by | What it does |
|---|---|---|
| Anomaly birds (`Birds`) | a spawn timer (5s grace after returning) | click one for a weighted bonus; some are timed multipliers |
| Lucky Pulse | a combo reaching FRENZY (55 hits), or a 10–15 min fallback | click it: energy surge (50%), ×3 for 60s (35%) or jackpot (15%) |
| Fragile Anomaly | a crystalline bird | do not click anything for 60s for a large payout; clicking erodes it |
| Data Storm orbs | the DATA STORM world event | seven orbs to click |
| Suspicious Button | every 4,000–8,000 clicks | 50% a large reward, 50% a −60% EPS curse for 20s |
| Dead pixels | an ambient chance, at most three on screen | 3×3 tears to click |
| The marchers (`MicroProtesters`) | a city with five or more buildings | protesters with banners walk across the bottom |
| Typographical Rot | instability ≥ 70 | digits fall off the numbers |
| Duck feather | after the Duck Tribunal | catch it; a feather skips a CAPTCHA |
| Button feelings | 2,000+ clicks, 12% per check | the ACQUIRE button says how it feels |
| Numerical overflow | energy past 1e18, once | the counter "falls" until you buy Gravitational UI Containment |

## 5. Tricks on the player: the cursor, the desktop and the screen

These are the jokes that pretend the game or the computer is misbehaving. ⚠ Two of them looked like real faults, and
both were defects:
- **The junk-data "RAM" widget stuttered the game on purpose.** It skipped two of every three income ticks, and five of
  six at 90%. Removed on 2026-09-26, playtest review §1.
- **The Firewall Entity could only be beaten with DevTools,** which the Steam build switches off. It now has an in-game
  inspector.

| Event | Raised by | What it does |
|---|---|---|
| Fake crash (`FakeCrash`) | 13,333 / 66,666 / 123,456 clicks | the screen "crashes", then JUST KIDDING and +50% energy. Covers everything and stops the game since 2026-09-26 |
| Thermal crash (`SysDiag`) | the diagnostics CPU reaching 100%, once a session | the same screen, then a ×25 EPS dividend to claim |
| Firewall Entity | prestige ≥ 2 or 1M clicks, 0.2% a tick, until beaten | a full-screen wall; delete its div for ×8 EPS, permanently. ⛔ Needed DevTools, so it could not be beaten in the Steam build; F12 / right-click opens an in-game inspector since 2026-09-26 |
| Memory Leak Boss | prestige ≥ 2, instability > 75, 2% every 30s | red particles pile up until you type EXECUTE GARBAGE_COLLECTION (3 tries; failing is +25% instability) |
| Desktop invasion | instability ≥ 60 | fake operating-system notifications, at most two |
| Past self | instability ≥ 75, 0.3% a tick, once 10+ moves are recorded | your own first minutes of mouse movement, replayed as a ghost cursor |
| Parasitic cursor | instability ≥ 92 and the mouse still for 60s | a cursor drifts toward your priciest building; shake the mouse |
| Mimic cursor / Ghost operator | high instability / occasionally | a decoy cursor; a dead operator's cursor |
| Phantom notification | instability ≥ 60, 0.3% a tick | a notification that runs from your mouse |
| Schrödinger's tooltips | hovering 5s | a tooltip that changes when looked at |
| Sentient tab | leaving the tab | the page escalates while you are away |
| Minigame decoy | prestige ≥ 1, 1e6 energy, 0.8% a minute | tic-tac-toe while the simulation drains 2% of your energy |
| Console whispers | always, in the browser console | lore lines, and `window.OperatorOverride = true` for ×3. ⚠ Console-only: unreachable in the Steam build (no DevTools). Not changed; see Found, not fixed |

## 6. What the census saw

Six minutes of a late-game save. Prestige 10, ~1e30 energy, 60,000 clicks, 40 buildings, a click every 300ms, and
instability held at 35, then 65, then 88 for two minutes each (`tools/probe_event_census.js`, 2026-09-26, V1.21.2.2).
**2,757 events from 49 sources.** Each one is traced to the module whose code produced it.

| Source | On screen | Notifications | First at | What it was |
|---|--:|--:|---|---|
| the click itself (`Game`) | 2,366 | 0 | 0s | the floating "+energy" numbers — one per click, as designed |
| **Combo Resonance** | 0 | **59** | 23s | "FRENZY RESONANCE — passive +8%" — ⚠ the loudest line in the stream: ten a minute for a player who clicks fast |
| Achievements | 0 | 47 | 0s | first unlocks on a fresh profile (the fixture's doing) |
| Blissful Spore | **116** | 2 | 0s | tears while it starved, and its tribute demand ("delete your tent") |
| Typographical Rot | 26 | 0 | 135s | digits falling off the counter at high instability |
| Global event queue | 0 | 23 | 0s | milestone cards it announces |
| Prestige | 0 | 12 | 0s | "PRESTIGE UNLOCKED" and related |
| Overseer-Chan | 1 | 9 | 0s | her comments |
| Button Feelings | 7 | 0 | 24s | the button's speech bubbles |
| GC lore | 0 | 6 | 319s | "Storage Full" lines as the RAM meter filled |
| Spore AFK lore | 0 | 5 | 45s | the gardener / hivemind dialogue |
| Early events · Instability events | 0 | 4 · 4 | 1s | the milestone and threshold lines |
| Desktop invasion · Phantom notification | 3 · 1 | 0 | 165s · 196s | fake operating-system pop-ups |
| Parasitic cursor · Mimic cursor · Ghost operator | 1 · 1 · 1 | 3 · 0 · 0 | 353s · 241s · 286s | the cursor tricks, all at 88% instability |
| **Firewall Entity** | 1 | 1 | **288s** | the full-screen wall (beatable in the Steam build since 2026-09-26) |
| Fake crash · Null Interrogation | overlay · overlay | — | 0s · 0s | both fired at once on this save (60,000 clicks crosses both gates) |
| the corner widgets | 1 each | — | 7s–121s | system diagnostics, junk data, intercepted signals, the generator chat — all into the dock |
| 25 other sources | | 1–3 each | | one-off unlock and milestone lines |

⚠ **What the census cannot see:** anything gated on a real absence, like offline returns or the tab hidden for 5
minutes; anything a real choice opens, like tribunal verdicts or expeditions; and anything rarer than six minutes at
these odds. Crises are paced by the queue's 18-minute gap, so six minutes shows at most one or two. The static tables
above cover what the census could not reach.

▶ **For the owner's keep / merge / cut pass:**
- **The spam:** Combo Resonance is the one line that talks constantly.
- **The widgets that read as unfinished:** junk data, system diagnostics, intercepted signals, the generator chat, the
  spore, Overseer-Chan. They are in one dock now, and whether each stays is §3.
- **The tricks a player can mistake for a broken game:** the fake OS pop-ups, the falling digits and the cursor ghosts.
  They are easter eggs, so the rule is to keep them. Say if any should go.
