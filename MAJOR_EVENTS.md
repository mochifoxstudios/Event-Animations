# Major Events — Just a Clicker Game

Major events take over the screen, stop normal play, or carry the story. These descriptions follow the
owner's notes from 2026-10-12, which supersede `reference/EVENT_CATALOGUE.md` where they differ.

Pacing: `GlobalEventQueue` shows one crisis at a time, leaves an 18-minute gap after each one, and has a
threat budget of 100. Reality Breach and Severance skip the queue's pacing. They only wait until no other
crisis is on screen.

Status: ✅ animated · 🔨 in progress · ⬜ not started

Every event gets its own scene, its own synthesised score and effects (`src/audio/`), and its own viewable page.

---

## 1. Duck events

| Event | Status | Trigger | What happens |
|---|---|---|---|
| **Ducky Council** (`DuckyCouncil`) | ✅ scene built, see `docs/DUCK_SCENES.md` | 20 min into a game, then every 1–3 h; "the ducks are gathering" warning 30 s before | Scores clicks, prestiges, energy, city size, instability → grades Platinum…Quacked. Five ducks argue, then vote. Platinum = ×8 income for 5 min + 3 fragments |
| **Duck Tribunal** (`DuckTribunal`) | ✅ scene built, see `docs/DUCK_SCENES.md` | Once per run, 20 min in | Courtroom, speech bubbles over stalls. Charges you by play style, deliberates, sentences you. **Sentence now follows the charge** (was a random roll) |

## 2. Story moments

| Event | Status | Trigger | What happens |
|---|---|---|---|
| **Existential Crisis** | ⬜ | Once, at 1,000,000 clicks | Board blurs behind a question. Power ×1.5 income · Numbers doubles energy · Fun +25 fragments · Void ×3 income. Each leaves a permanent mark: red vignette, board shifted 2 px, drained colour, or a small figure watching |
| **NULL Interrogation** | ⬜ | After first prestige, 5,000–10,000 clicks | NULL types and speaks one of four monologues, then you type an answer. Emotional → "WE UNDERSTAND." and easier run. Generic or Escape → "Disappointing", +20% instability |

*The Boot Sequence is not on this list: the "Shift 15" film replaced it on 10-08 (Settings → WATCH INTRO).
The End is out of scope.*

## 3. Crises and bosses

| Event | Status | Trigger | What happens |
|---|---|---|---|
| **Reality Breach** | ⬜ | 30 min into a run, then every 35–55 min | Warning band, then boss bar. 36–44 hits in 45 s. Eats 10/20/30% of income; kill it to get it back plus a bonus, or it escapes with it (+15% instability). Doesn't currently move |
| **Firewall Entity** | ⬜ | Once per save | Full-screen "INVINCIBLE" wall that ignores clicks. Beaten by inspecting the page (F12 / Ctrl+Shift+I / right-click opens a built-in inspector) and deleting its element → permanent ×8 income |
| **Prisoner's Dilemma** | ⬜ | After first prestige | An operator "appears on your frequency". Currently no choice: auto "MUTUAL COOPERATION" after a 5 s countdown, pays 20% of bank. Share/Steal would need rebuilding |
| **Severance Package** | ⬜ | Once per save, after a prestige, when run clicks near the LP threshold | Corporate dialog offers 5–12 LP + 100–300 Data. ACCEPT closes the game and pays on next launch; DECLINE carries on |
| **Fake Crash** | ⬜ | 13,333 / 66,666 / 123,456 clicks | "Your simulation ran into a problem" screen freezes the game, % climbs to 100, then "JUST KIDDING", +50% energy |
| **Thermal Crash** | ⬜ | System Diagnostics CPU meter hits 100% | Same crash screen, ends on "Thermal event contained" + CLAIM CRASH DIVIDEND: ×25 income for 30 min |
| **Eye of the Storm** | ⬜ | 60%+ instability, 25+ min into a session, by chance | Calm "SYSTEM ALIGNMENT, MOMENT OF CLARITY" screen, own music, 60 s countdown. Instability 0, income ×10; afterwards instability returns at 40% |
| **CAPTCHA** (inverted) | ⬜ | Every 45 min after a prestige | Prove you're a machine. 3×3 grid of your generators' art (best in the middle), traffic lights or hydrants. Correct tiles fail ("biological compliance detected"); wrong, none, or < 0.2 s passes: +5% energy, +50 Data. Failing = temporary −30% income (first is a warning) |

## 4. World events (banner across the top, own sound)

| Event | Effect |
|---|---|
| Quantum Surge | +300% output for 20 s |
| Data Storm | 7 data orbs to catch |
| Walker Strike | City People Points stop for 16 s |
| Momentum Cascade | Combo locked at ×4 for 10 s |
| Corrupt Packet | Energy burst, but ~5% of one generator is lost |
| Time Freeze | Only clicks count for 12 s |
| Memory Purge | Energy halved, output ×2 for 30 s |
