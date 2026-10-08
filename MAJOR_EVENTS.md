# Major Events — Just a Clicker Game

Major events are the moments that take over the screen, stop normal play, or carry the story.
This list follows `reference/game.js` and `reference/systems4.js`. Where `reference/EVENT_CATALOGUE.md`
or `reference/DUCK_TRIBUNAL.md` disagree with the code, this list follows the code. Those are flagged ⚠ below.

The game's pacing system (`GlobalEventQueue`) allows one crisis at a time. After each one there's an
18-minute gap, and a threat budget of 100 limits how many can stack.
**Weight** is how much of that budget an event uses.

---

## Tier 1 — Story set pieces (one-time, highest impact)

| # | Event | Module | Trigger (from code) | What happens |
|---|---|---|---|---|
| 1 | **The End** | `EndSeq` (game.js:24883) | Buying the final shop item (`item.isEnd`) | The ending sequence; a white door. Reveals the duck companion |
| 2 | **Existential Crisis** | `ExistentialCrisis` (:29319) · weight 100 | 1,000,000 total clicks, once | "What is the purpose of clicking?" Four paths: POWER / NUMBERS / FUN / VOID, each with a permanent effect |
| 3 | **Null Interrogation** | `NullInterrogation` (systems4.js:141) · weight 100 | Prestige ≥ 1 and 5,000 clicks, 0.6% per tick; certain at 10,000 | The NULL ENTITY types one of four monologues, then you type an answer and it judges it (understood / disappointed / catalogued). Escape = silence |
| 4 | **Boot Sequence** | `BootSequence` (systems4.js:7) | New game | ~19s lore terminal prologue ("WELCOME, OPERATOR 15") |

## Tier 2 — Duck events (the cast with the most existing art)

| # | Event | Module | Trigger (from code) | What happens |
|---|---|---|---|---|
| 5 | **Duck Tribunal** | `DuckTribunal` (:29708) · weight 50 | Save older than 20 min, session floor met, not AFK, once per run | Five judges level a charge (FRANTIC CLICKER, IDLE OBSERVER…) and roll one of 5 verdicts: POWER, QUARANTINE, WISDOM, DUCK, GUILTY (a UI element is confiscated) |
| 6 | **Ducky Council** | `DuckyCouncil` (:15752) | First session 20 min after game creation, then on a repeating timer; 30s "ducks are gathering" warning | Five named ducks deliberate and vote on a 6-tier verdict; instability shapes the outcome |

⚠ `DUCK_TRIBUNAL.md` §1–4 (surcharge trigger, COMPLY/REFUSE choice, three-tribunal arc) is a **design that the code does not have**. The code still uses the 20-minute clock.
The bench art (`duck_tribunal_art.js`, `duck_council_art.js`, `duck_cast_art.js`) and its CONVENE / DELIBERATE / RULE beats do match the docs.

## Tier 3 — Crises and bosses (repeatable, full-screen)

| # | Event | Module | Trigger (from code) | What happens |
|---|---|---|---|---|
| 7 | **Reality Breach** | `AnomalyBoss` (:23762) · holds queue | ≥ 1e7 energy, random roll × System Noise (up to ×4), never on top of another crisis | Click the breach 8–12 times; it eats energy and escapes for +instability |
| 8 | **Firewall Entity** | `FirewallBoss` (:35981) | Prestige ≥ 2 or 1M clicks, 0.2% per tick, until defeated | Full-screen wall. Delete its div (in-game inspector) for ×8 EPS permanently |
| 9 | **Prisoner's Dilemma** | `PrisonersDilemma` (:36351) · weight 40 | Prestige ≥ 1, ≥ 1e8 energy, 0.05% per tick, 30s warning | SHARE / STEAL a pool of 40% of your energy against a fake operator |
| 10 | **Severance / Ransom Protocol** | `RansomProtocol` (:33167) · holds queue | Prestige ≥ 1, clicks past 80% of the prestige threshold, once ever | The Overseers offer a severance package. Accepting closes the game |
| 11 | **Fake Crash** | `FakeCrash` (:16370) | 13,333 / 66,666 / 123,456 clicks | Screen "crashes", then JUST KIDDING + bonus |
| 12 | **Thermal Crash** | `SysDiag` (:34845) | Diagnostics CPU reaches 100%, once a session | Same crash screen, then a ×25 EPS dividend to claim |
| 13 | **Eye of the Storm** | `EyeOfStorm` (systems4.js:335) · weight 20 | Instability ≥ 60, 25 min in, 0.3% per 2s tick | 60s of calm: instability 0, EPS ×10 |
| 14 | **CAPTCHA** | `AntiCaptcha` (:31116) · weight 20 | Prestige ≥ 1, not AFK, every 45 min | Prove you're human on a grid of your own buildings |

## Tier 4 — World events (timed, non-blocking ticker events)

`WorldEvents` (:15159). One at a time with a 60s cooldown. They suit a smaller animation treatment (a banner or screen tint), not a full scene.

QUANTUM SURGE · DATA STORM · WALKER STRIKE · MOMENTUM CASCADE · CORRUPT PACKET · TIME FREEZE · MEMORY PURGE

---

## Not verifiable from the uploaded files

These come from `music.js` / `EVENT_CATALOGUE.md`, but their modules aren't in the uploads:
**Memory Leak Boss, BIOS layer, Minigame Decoy, Quarantine Zone, Wipe Protocol, Expedition, Duck Ransom, Redline, Simulation Schism (Omega timeline)**.
Send the files that define them if any should be considered.

## Notes for animation work

- **Each event already has its own music cue** (`music.js` `EVENTS`), so an animation can be timed against a known track.
- **Already has bespoke SVG art:** Duck Tribunal and Ducky Council. Every other event uses a generated `event_*` plate or plain HTML.
- **Constraints the existing art follows:** `transform`/`opacity` only, `currentColor` instead of fixed hex colours, and support for reduced-motion / safe-mode.
