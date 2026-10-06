# THE DUCK TRIBUNAL — a design, not a verdict
*2026-08-15. Written because a plan existed and was not a design.*

> **What already existed:** `PANEL_REDESIGN.md` §3 gives three rules — *trigger on fiction not clock,
> foreshadow once then pay off, leave a trace* — and step 9 of its build order says "re-trigger Duck
> Tribunal (and siblings) on fiction not clock." **It never says on what.** That is exactly the
> "verdicts, not designs" gap `MASTER_PLAN.md` §5.5 scored §8 down for. This doc closes it.
>
> **Rules kept verbatim. Everything below is the missing half.**

---

## 0. WHAT IS ACTUALLY IN THE BUILD

| | |
|---|---|
| `DuckTribunal` | `game.js:22245`. Fires **once**, when `Date.now() − state.gameCreatedAt > 20 min`. Two dialogue sets (`sentencers`, `bureaucrats`) picked by player state. Penalties: quarantine a building 90s · confiscate an asset · PP tax |
| `DuckyCouncil` | `game.js:10894`. ⭐ **The good one.** 5 named `DUCKS`, **6 verdict tiers**, per-tier deliberation lines shown *before* the label, a vote animation, and instability already feeds the verdict (`:11049`) |
| `tribunal_returns` | Lore chunk `game.js:20239`, *"THE SECOND TRIBUNAL"*, index 46/57 — **already written, already gives the Tribunal a second beat** |
| `DuckRansom` · `DuckFeather` · `RubberIII` · `rubber_duck` | Four more duck systems, none aware of each other |
| Hidden text | *"THE DUCKS WERE HERE BEFORE THE ENERGY… DO NOT TRUST THE DUCKS."* — in `index.html`, **with no in-game path to it** |

⭐ **The Tribunal is not underbuilt. It is unconnected.** `DuckyCouncil` already has the deliberation
machinery the Tribunal needs, and `tribunal_returns` already writes its sequel. Nothing here is a
new system; it is four existing pieces that have never been introduced to each other.

### ⚠ A bug found while reading it

`resetForNewRun()` sets `_fired = false`, but the gate is `state.gameCreatedAt`, which **survives
prestige**. So on every prestige after the first, `_gameAge` is already past 20 minutes and
**the Tribunal fires immediately, every Iterate, forever.** The 20-minute timer only ever means
anything once. This is why it reads as random noise: for most of the game it is not a 20-minute
event, it is a *prestige* event wearing a clock.

---

## 1. THE TRIGGER — what the player did

> **The ducks arrive when you run the machine past its rated capacity.**

Fire the Tribunal the **first time the load surcharge saturates** — `Instability.getSurcharge()`
reaching the ×8 clamp — and not before.

**Why this and not a clock:**

- ⭐ **It is the one number the fiction is about.** The surcharge is literally "you are drawing more
  than the grid can carry." The ducks are an audit. An audit triggers on an overdraft.
- ⭐ **G3 measured it and it is real.** 19,123 of 109,612 campaign purchases sit at the ×8 clamp —
  **17.4%** — so the state is reached, reached hard, and reached by ordinary play. It is not a
  corner case that half the players never see.
- **The player can feel the cause.** Shop prices visibly inflate before the ducks arrive. That is
  the connection wall-clock triggers can never give: *"prices went strange, then they came."*
- **It is already computed** (`game.js:742`) and already displayed in the HUD. No new state, no
  `SAVE_VERSION` bump. One flag: `state._tribunalSeen`.

⚠ **Do NOT use instability ≥ 90 as the trigger.** G2 measured that band: it is unreachable after
the first prestige, and when it *is* reached the meter pins at 100 and stays. A trigger there fires
never or always — the two failure modes of the current clock.

**Second and third firings** are the arc, not a repeat. See §4.

---

## 2. THE SHAPE — three beats, because a scene needs three

The current event is one beat: penalty, then gone. Give it the shape `DuckyCouncil` already has.

### Beat 1 — SUMMONS *(≈4s, non-blocking)*

The notification column, not a modal. Prices have already been climbing; this names why.

```
🦆  AUDIT NOTICE — SECTOR 7
    Your draw exceeds the rated capacity of this simulation.
    A tribunal has been convened. You will be informed of its findings.
```

⭐ **The player keeps playing.** Every second between Beat 1 and Beat 2 is a second they spend
looking at their own EPS wondering how bad it is. That dread is free and the current design throws
it away by resolving instantly.

### Beat 2 — DELIBERATION *(≈8s, modal, the ducks talk)*

Reuse `DuckyCouncil`'s deliberation renderer (`game.js:11105`) verbatim. Five named ducks; the
existing `sentencers` / `bureaucrats` sets become **two of five registers**, selected by how the
player actually played:

| Register | Selected when | Voice |
|---|---|---|
| **BUREAUCRATS** | Surcharge saturated, low instability | Paperwork. The universe was never filed. |
| **SENTENCERS** | High instability, high screams | Execution. Statistical error. |
| ⭐ **THE CONCERNED** | High walker/resident count | They are not angry. They ask, gently, whether you have considered stopping. **The worst one.** |
| **THE BORED** | Third+ tribunal | They have done this before. They do not look up. |
| **THE SILENT ONE** | Player refused a prior tribunal | Four empty chairs. One duck. It does not speak at all. |

⚠ **Keep the jokes.** `INQUISITOR QUACK` and `OFFICER WADDLE` are exactly the register the game
runs on, and the standing rule is that jokes are never on a cut list. THE CONCERNED lands *because*
the other four are funny.

### Beat 3 — VERDICT *(the player gets one choice)*

⭐ **This is the part that does not exist today, and it is the whole difference between an event
and a scene.** Two buttons:

| | Immediate | Later |
|---|---|---|
| **COMPLY** | Pay the levy: PP tax + one building quarantined 90s *(today's penalty, unchanged)* | Ducks get **quieter** each time. By the third, they barely convene. |
| **REFUSE** | ⭐ **No penalty at all.** The ducks leave. | The next tribunal is **THE SILENT ONE**. Refuse twice and `DuckRansom` — an existing, unconnected system — becomes their answer |

**REFUSE must be genuinely free in the moment.** A choice with an immediate cost on both sides is
not a choice, it is a toll booth with two lanes. The cost of refusing is that *the ducks stop being
funny*, which the player cannot see coming and cannot undo.

---

## 3. FORESHADOW — the line that already exists

*"THE DUCKS WERE HERE BEFORE THE ENERGY… DO NOT TRUST THE DUCKS."* is sitting in `index.html` with
no path to it. Give it exactly one: surface it in the **flavour ticker** once, at ~60% of the way to
the surcharge clamp — before the first Tribunal, never after.

One line, one time, no explanation. When the ducks arrive the player remembers reading something.

---

## 4. THE ARC — three tribunals, then the ducks stop coming

| # | Fires on | Beat |
|---|---|---|
| **I** | Surcharge first saturates | The audit. Establishes them as bureaucracy. |
| **II** | Next Iterate after Tribunal I | ⭐ **`tribunal_returns` already exists** (`game.js:20239`) — *"prior dismissal entered into evidence."* Wire it here; it is written and unused. |
| **III** | BEYOND era (`data-era`, sustained EPS ≥ 1e28) | ⭐ **They do not judge you.** They convene, look at the number, and **adjourn without a verdict.** Nothing is confiscated. Nothing is said. |

⭐ **Tribunal III is the payoff.** The joke system that has been taxing you for the whole game
arrives at the top of the curve and finds it has no jurisdiction. That is the same beat as Duck Rain
at BEYOND (D12) and it costs one dialogue set — **and it lands only because I and II were funny.**

---

## 5. LEAVE A TRACE

All three tribunals `Terminal.record()` into the Archive with `art: 'wishbird'` (already the
`tribunal_returns` art) and an `◈ EFFECT` badge, so the existing chapter renderer picks them up with
no new code. Rule 3 of §3, applied.

⚠ Record the **verdict the player got**, not a generic summary. An Archive entry that says
`YOU REFUSED` is a different object from one that says `LEVY PAID`.

---

## 6. WHAT THIS COSTS

| Piece | Work |
|---|---|
| Trigger swap: clock → `getSurcharge() >= 8`, plus `state._tribunalSeen` | **Small.** Deletes the `gameCreatedAt` gate and its prestige bug |
| Beat 1 summons notification | **Small.** `showNotif`, existing |
| Beat 2 — point Tribunal at `DuckyCouncil._renderDeliberation` | **Small.** Renderer exists |
| 3 new dialogue registers (CONCERNED / BORED / SILENT) | **Writing only.** ~20 lines |
| Beat 3 — two-button verdict + `state._tribunalRefusals` | **Medium.** The one genuinely new mechanic |
| Wire `tribunal_returns` to Tribunal II | **Trivial.** Chunk is written |
| Tribunal III at BEYOND | **Small.** Needs `data-era` (D12) |
| Archive recording | **Small.** Same `Terminal.record()` fix as the lore chunks |

**No new system. No `SAVE_VERSION` bump** — two booleans and a counter merge into existing state.

---

## 7. ⚠ SEQUENCING

- **Depends on D12 (`body[data-era]`)** for Tribunal III only. I and II ship without it.
- **Depends on nothing in Steps 5–14.** The trigger reads `getSurcharge()`, which exists today and
  is not changed by Step 5.
- ⚠ **But G3 recommends raising `STABLE_PER_ITER`**, which will make the surcharge saturate *less
  often*. **Set the Tribunal's trigger threshold after that lands**, or tune it to a fraction of the
  clamp (e.g. `>= 6`) so it survives the re-balance. **Do not hard-code ×8 and forget.**

---

## 8. THE ONE-LINE VERSION

> **The Duck Tribunal is not a random event that needs a better roll. It is a scene that has never
> been given a cause, a middle, or a choice — and every part needed to fix that is already written
> somewhere else in the codebase.**

---

## 9. ⛔⛔ THE ART — WHY IT LOOKS LIKE THAT, AND THE PLAN TO FIX IT *(owner-directed 2026-08-29)*

> ### ✅ BUILT 2026-08-29 — **BUT NOT AS SPECIFIED. READ §10 FIRST.**
> ⛔⛔ **The one instruction in this section that was wrong is "draw FIVE judges", and it was
> wrong for a reason worth more than the rest of the plan put together: this section was written
> from the SOURCE and never from the SCREEN.** The overlay was already depicting the same five
> ducks **twice**. §10 has the measurement and what shipped instead.
> ⚠ Everything else below held — hand-authored, not a generator change; animate the verdict, not
> the idle; `currentColor` and no baked hex; verified by rendering it and looking at it.

> **The ask, verbatim:** *"Why is this used for the duck tribunal, it was supposed to be a very
> detailed and animated SVG, we need a plan for that, and add it to the agenda."*

### ⛔ WHAT IS ON SCREEN TODAY, AND EXACTLY WHY

`UI_PLATES.event_tribunal` — **fourteen primitives**, and here is the whole of it:

| | |
|---|---|
| one `rect` | the bench |
| **four `circle` + `line` pairs** | heads on necks |
| one ghost `circle` | THE ABSTAINER, who does not vote |
| one `rect` | the dock |

⭐ **It is not a duck and it was never going to be one.** `gen_ui_plates.js` has eight primitives —
`box · fill · line · poly · ring · plate · scan · arc` — and **no curve**. PART SIX of `CLAUDE.md`
records this being learned the hard way: the Ducky Council was routed into the same file and came
out as *"seven keyrings"*, and the five judges as *"a motorcycle helmet"*. The rule written that day
is the one that explains this panel:

> ▶ **Check the primitive list before routing anything organic. The WHICH-TOOL rule routes on size
> and set-consistency, and neither can override *can the tool draw this shape at all*.**

⚠ **So this is a known-bad routing that was only half-corrected.** The Council was moved to raster
(`duck_rain*`) that day; the *bench* was redrawn as geometry the generator is good at and left. The
panel below it draws real duck art — which is precisely why the contrast reads as wrong: **detailed
rasters sitting under a stick-figure bench.**

### ▶ THE PLAN — a hand-authored, animated SVG, and NOT a generator change

⛔ **DO NOT ADD A CURVE PRIMITIVE TO `gen_ui_plates.js` FOR THIS.** It is tempting and it is the
wrong tool twice over: a bézier primitive would let the generator draw *a* duck, but the generator's
whole purpose is **sets of flat symbols that must agree at 44px** — nav glyphs, tier badges, event
plates. A detailed character scene has no set to agree with, is seen at 256px+, and wants
hand-tuned curves. Adding curves would also invite the next organic shape back into a file that
should keep refusing them.

▶ **`duck_tribunal.svg`, hand-authored, one file, checked in as source.**

| | |
|---|---|
| **Size** | 512×320 viewBox. The panel renders ~256–420px wide; the extra headroom is for the 3840×2160 mode |
| **Cast** | **FIVE** judges. ⚠ `DUCKS` has five entries and every `voteMap` tier has five votes — `event_tribunal` currently draws **four heads plus a ghost**, and `qa_glyph_wiring` already counts council pips for exactly this class of mismatch. The bench must be countable and correct |
| **Colour** | `currentColor` + the `--p-*` class vocabulary the other plates use, so the phase theme re-tints it. ⛔ Never a baked hex — `game.css`'s per-chapter palette would stop reaching it |
| **Detail level** | The register of `duck_rain1` (the owner's delivered art): a readable rubber-duck silhouette, bill, eye, a suggestion of body. Not photoreal, not a pictogram |
| **The player's duck is NOT on the bench** | `CONDUCT_ROUTES` §9.5, already asserted by two suites: the bench must read as *"OTHER ducks, and yours conspicuously not among them"* |

### ⭐ THE ANIMATION, AND WHAT IT IS FOR

⚠ **Animate the VERDICT, not the idle.** §2 gives the scene three beats — convene, deliberate,
rule — and the art should carry those and nothing else. A permanently-wiggling bench is chrome; a
bench that *turns to look at you* is the mechanic.

| beat | motion |
|---|---|
| **CONVENE** | the five fade/slide up onto the bench, staggered ~80ms. The dock stays empty |
| **DELIBERATE** | slow head-turns toward each other, then toward the player. ⭐ This is the only beat that loops, and it must loop *slowly* — it is a pause, not an idle |
| **RULE** | the ruling duck leans forward; the others still. THE ABSTAINER never moves at all, which is his whole characterisation |

⭐ **CSS-driven, on classes the panel already toggles**, in the same pattern as `nav_glyphs.js`:
inline SVG so the page's CSS can reach individual parts, `transform` and `opacity` only, and every
rule inside a `@media (prefers-reduced-motion: no-preference)` guard plus the `safe-mode` /
`accessibility-mode` suppression every other animation in this build already honours.
⚠ **`transform`/`opacity` only** is not a style preference — anything else composites on the main
thread, and this panel opens while the income loop is running.

### ⚠ THE WEAR LADDER STILL APPLIES, AND IT IS NOT AN EXTRA FILE

`duck_rain1…6` degrade factory-new → shards, and the Council uses that to cast: THE ABSTAINER is
pristine because he has never voted; RUBBER III is the shards because the verdict text says the
Council is not sure what Rubber III is. ⭐ **In SVG that is a CLASS, not six files** — one silhouette
plus crack paths revealed per rung. ⚠ And the rung must change the **silhouette**, not the surface:
the Council skips `duck_rain2` today precisely because a single hairline crack is invisible at 44px.

### ✅ HOW IT GETS VERIFIED — the part that is not optional

⛔ **Every suite passed while the bench read as four keyrings.** `qa_glyph_wiring`, `qa_vector_sets`
and `qa_playfeedback` assert plates exist, are named, are distinct and fit their viewBox — **none of
that can see that a shape is unrecognisable**, and the owner called it within a day of it shipping.

▶ So the gate is: **render it offscreen and look at it** (`show:false` + `offscreen:true`, the
documented route), plus asserts for the countable facts — five judges, `duck.png` absent, the
`--p-*` classes present so the theme reaches it, and reduced-motion suppression live.

### ⭐ THE ONE-LINE VERSION

**The bench is fourteen primitives from a generator that cannot draw a curve; the fix is one
hand-authored inline SVG that animates the verdict, not the idle — and the check is looking at it,
because every existing suite passed on the version that reads as keyrings.**


---

## 10. ✅ WHAT ACTUALLY SHIPPED — *2026-08-29, and the plan changed at the measurement*

### ⛔⛔ THE FINDING: THERE WERE ALREADY TWO BENCHES, 203px APART

`tools/probe_tribunal.js` (new) opens the real overlay at 1920×1080 and reports what is in it.
It found the tribunal drawing the same five ducks **twice**:

| | |
|---|---|
| `UI_PLATES.event_tribunal` | 82×82px at the top of the panel. **11 primitives, 5 circles** — four heads on necks, one ghost, a bench and a dock. ⚠ §9 above says "fourteen primitives"; the number is 11, counted from the live DOM |
| `#tribunal-ducks` | 403×70px, 203px below it. **Five 65px rasters of the owner's own art** — `duck_rain2…6` |

⭐ **§9 already noticed this and drew the wrong conclusion from it.** It described the contrast
as *"detailed rasters sitting under a stick-figure bench"* — correct — and then specified an art
plan that adds **five more judges**, which would have made three depictions of one bench.

▶ **So the SVG is the COURTROOM and the owner's art is the CAST.** The screenshot showed five
ducks floating in a void: no bench, no chairs, no dock, nothing under their feet. `duck_tribunal_art.js`
draws the room and they sit in it. **It satisfies every real requirement in §9 — detailed, animated,
hand-authored, curves the generator cannot draw — without drawing a duck at all.**
⚠ `event_tribunal` is removed from `EventPlates.MAP` for the same reason. The **key** stays in
`ui_plates.js`, where `qa_glyph_wiring`'s `PLATES_REQUIRED` still names it.

### ⭐ THE BENCH IS A REPEATED SEGMENT, WHICH IS WHY IT NEEDS NO ALIGNMENT

The row is five inline-blocks sized in `rem`, so **its width moves with the root font size** —
measured at 19.1px here, not the 16 a reading of the CSS would assume. A single wide background
image would have to be aligned against five duck positions that are not knowable from the
stylesheet: right once, silently wrong after any type change.

▶ **Each duck carries its own stall, and the stalls abut into one continuous bench at any size.**
⛔ `margin: 0` on `.tribunal-duck` is therefore load-bearing. The rule it replaced was `margin: 0 8px`,
which now puts a 16px hole in the bench between every judge. `qa_tribunal_art` measures the gap.

### ✅ THE THREE BEATS, ON CLASSES `DuckTribunal` ALREADY COMPUTED

| beat | when | what moves |
|---|---|---|
| **CONVENE** | `_trigger`, as the bench is built | stalls rise and fade in, staggered 90ms |
| **DELIBERATE** | when the dialogue ends and the 5s countdown starts | slow turns, 5.4s, the **only** looping beat |
| **RULE** | when the verdict is picked | the deciding judge leans in and blooms; the other four go still and dim to 0.46 |

⛔ **THE FIFTH STALL NEVER MOVES IN ANY BEAT AND NEVER RULES.** `THE SILENT ONE` has a line in the
`sentencers` dialogue that is a squeak; the shards of `duck_rain6` are already on that stall; its
nameplate has one full-width bar because there is no name left on it to break up. ⚠ Verdict index 4
is **GUILTY**, so without the guard the loudest verdict in the table would have been delivered by
the judge whose whole characterisation is that he never participates. It falls to the centre.

⚠ **`tb-deliberate` is removed before `tb-rule` is added**, and that is not tidiness: the deliberate
selector carries a `:not(.tb-silent)`, which counts as a class, so with both set it outranks the rule
and the bench sways through its own verdict.

### ⛔⛔ AND THE VERDICT BEAT CAUGHT WHAT THE BENCH HAD JUST BROKEN

The verdict list renders five more rows and the dialogue box has grown, so **the panel is at its
tallest exactly during BEAT 3** — and with the first cut of the bench it measured **1074px of
content in a 1080px window.** Six pixels from the clip `MASTER_PLAN` §6.8 A2 is an open agenda item
about, on an overlay that had **372px of headroom before this courtroom existed**.

⚠⚠ **The first version of the probe reported "0px overflow, plenty of room" — from the DIALOGUE
beat.** Same shape as the number-format correction earlier the same day: *measuring the state I
happened to be looking at rather than the state the player ends up in.*

✅ Two fixes, and the bench pays for both:
- The stall viewBox went **168 → 148 units** — the dead band above the arch and half the under-shadow.
- ⭐ **`game.css` now derives the entire courtroom from one custom property**,
  `--tb-h: min(7rem, 11.4vh)`. Stall width, image size, image offset and the dock are all **ratios**
  of it taken from the viewBox. A short window shrinks the bench instead of pushing the BANISH button
  off the bottom. ⚠ Hard-coding any of those in `rem` again is how the ducks' feet leave the bench.

### ✅ `qa_tribunal_art.js` — 30/30, and the four checks that earn their keep

⛔ §9's own note is why this file exists: *"every suite passed while the bench read as four
keyrings."* A suite cannot see that a courtroom looks like a courtroom. It can see these:

| | |
|---|---|
| **the bench TILES** | max gap between adjacent stalls **0px**. This is what catches a `margin` being restored |
| **the ducks stand ON the bench** | feet land within **0.01px** of `BENCH_TOP`. ⭐ `game.css` and `duck_tribunal_art.js` share three numbers written twice, and **nothing else in the build would ever report that they had drifted** |
| **it FITS at its tallest** | `scrollHeight <= clientHeight` measured during BEAT 3, not before it |
| **suppressed, it is STILL DRAWN** | ⛔ base state is `opacity: 1` and the keyframe animates FROM hidden. Backwards, and the courtroom does not exist under reduced motion, safe mode, or any beat class that fails to be set |

Plus: five stalls, five ducks, none broken; the chair contains a **cubic curve** (the cheapest proof
the hand-authoring reason still holds); **no colour is baked into any of the three SVGs**; `duck.png`
appears nowhere on the bench (`CONDUCT_ROUTES` §9.5); the generated plate is **not** also mounted;
and the five nameplates are not identical tiles.

⚠ **One check was wrong before the code was.** The suppression test first measured `opacity 0.46`
and failed — while `tb-rule` was still set, where dimming the four judges who did not rule **is the
verdict reading**. The check now returns the panel to beat 1 first. *A failing check is a claim about
the code and about itself.*

### ▶ WHAT IS STILL OPEN HERE

- ✅ **The wear ladder IS a class now — closed by §11.** §9 asked for one silhouette plus damage
  revealed per rung, and this line used to say the cast was five separate rasters because that is
  what the owner had delivered. `duck_cast_art.js` is exactly the structure §9 described: one shared
  `SILHOUETTE` constant, and `marks[]` per member. ⭐ It arrived as a side effect of a different
  instruction — the owner withdrawing `duck_rain*` — rather than because anyone chose to do it.
- ⚠ **The dock label is a string under this arc**, so it obeys `STORY_ARC` §6: *state the fact, name
  the cost, do not draw the conclusion.* — `// DOCK · THE OPERATOR IS NOT REQUIRED TO ATTEND`.


## 11. ✅✅ §9 WAS REINSTATED AND BUILT — *2026-09-01*

> ⭐⭐ **THE PLAN WAS RIGHT; IT WAS RIGHT FOR A REASON THAT HAD NOT ARRIVED YET.**

§9 asked for *"a very detailed and animated SVG"* of five judges. §10 below measured the screen,
found the owner's rasters already on the bench, and argued §9 down to a courtroom — on the explicit
grounds that **the rasters were the cast** and a third depiction of the same five ducks would have
been the bug the complaint was about, drawn better.

⛔ **The owner removed that premise on 2026-08-31:** *"I don't want the art that is used for the duck
rain to be used for the tribunal/council."* With `duck_rain*` withdrawn, §10's argument no longer
holds and §9's instruction is exactly the right one — so it was built. `duck_cast_art.js`, five
hand-authored members, one cast seating this bench **and** the Ducky Council.

⚠ **§10 IS NOT WRONG AND SHOULD NOT BE EDITED.** It was correct on the evidence it had, and the
courtroom it produced is still what the five sit in. What changed is an input, not the reasoning.
▶ That is the whole lesson of this section: *a plan overruled by a measurement can still be the
plan, and it becomes the plan again the moment the measurement changes.*

⭐ **THE COURTROOM'S STAGING IS NOW SHARED, AND IT WAS ALWAYS THE BETTER HALF.** On 2026-09-01
nine declarations left `#duck-tribunal-overlay` for a `.event-stage` class, and **not one of them was
tribunal-specific** — the Ducky Council had every one of them too, as an inline hand-copy of this
overlay's rule. What is left on this panel is its tint. ▶ `MASTER_PLAN` §6.8d.

⭐ **What §9's own verification rule caught, and nothing else could.** §9 said render it and look at
it. Six drafts: a circle balanced on a bag · a chess pawn · a hawk's bill and a spiked tail · a
flipper · a fish, a frown and speed lines where the wing should be. **No suite saw any of it.**
Full record: `ART_NEVER_MADE.md` §25. Guarded by `tools/qa_duck_cast.js`, reviewed by
`tools/probe_cast.js`.

---
