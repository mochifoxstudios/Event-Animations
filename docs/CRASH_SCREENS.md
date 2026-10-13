# Fake Crash and Thermal Crash

**Pages:** Fake Crash https://claude.ai/artifact/NG14QUp5vw3YEUe1Kc98HU · Thermal Crash https://claude.ai/artifact/S8ocsUgTsejJKwHA6FmdKX

Files: `src/crash_scene.js`, `src/crash_scene.css`, `src/audio/score_crash.js` (two scores: `FakeCrashScore`
and `ThermalCrashScore`). The scene also needs `duck_scene_core.js`, `duck_scenes.css` and `event_audio.js`.

In the game, one overlay (`#fake-crash-overlay`) serves both events. Here it's one scene with two variants:
`CrashScene.play(host, { variant: 'fake' | 'thermal' })`. Each variant has its own score and its own page.

## Both: the dread

The owner's note in game.js asked for "the split second feeling of dread that their computer crashed". So:

1. **The freeze.** The fake crash opens with the game tearing for 0.65 s. The thermal crash opens with an orange
   heat haze and a flashing **CPU 100%** warning while fans whine up for 1.4 s. In both, the scene draws over the
   live game.
2. **The cut.** The music dies on one dead click and the screen cuts to blue instantly, with no fade. For the first
   second it doesn't say whose screen it is: no eyebrow, no link, no QR code, no cursor. Under it there's a mains hum.
3. **The crash screen:** ":(", the stop code lines and a QR-looking block (it encodes nothing). The percentage
   climbs irregularly, ticks like a disk, and stalls at 37% and 99%.
4. **Clicking during a crash is noticed.**
   - **Fake:** "Additional click received during crash (n)", then "Please stop clicking." and "We can feel that.".
     At 14 clicks it's "Fine. You win." and the crash ends early. The stop code is TOO_MANY_CLICKS, after all.
   - **Thermal:** "Touching the CPU is not recommended (n)", with a sizzle.

The crash screen has no SKIP button; it's short, and skipping would break the illusion.

## Fake Crash (13,333 / 66,666 / 123,456 clicks)

**The joke:**
- ":(" rotates into ":)" and the screen turns green: **JUST KIDDING**.
- "False alarm. Nothing crashed. The simulation is fine. Everything is working as intended."
- **CRASH BONUS: +50% energy · the simulation apologizes.**
- If you clicked during the crash: "You clicked n times during a crash. Respect."

Sound: C major. A brass ta-da with timpani and chimes, then a bouncy tune.

## Thermal Crash (System Diagnostics CPU hits 100%)

1. **Contained:** "Thermal event contained. Nothing crashed. The simulation kept one thing from the wreckage."
   RECOVERED, and the temperature line keeps climbing as it counts.
2. **The crack:** the crash screen splits along a glowing seam and the two halves slide apart. Behind them is a
   molten **×25** core: **CLAIM CRASH DIVIDEND · ×25 EPS (30 min)**, "ONLY ACCESSIBLE THROUGH SYSTEM FAILURE".
3. **The gap cools:** a cooling bar and a seconds count run for 20 s, flashing for the last 5. Then one of:
   - **Claim:** a flash, the core swells, "CRASH DIVIDEND CLAIMED · ×25 EPS for 30 minutes · absurd."
   - **Wait:** the halves slam shut: "The gap closed. It will open again the next time something melts."
   - **DISMISS CRASH SCREEN:** closes it straight away, as in the game.

   The game's button had no time limit. The window is new, it's data (`opts.window`), and setting it very high
   gives back the old behaviour.

Sound: E minor. The fans rise, then the hum, then a warm "contained" chord. The crack is a thump and a rising
whoosh. The core pulses, and claiming lands on E major with timpani and cymbal.

## Data

- `opts.lines`: every string, including `pokeAt` (the lines at given click counts).
- `opts.info`: the stop-code lines (`{temp}` is live).
- `opts.pokes`: clicks that end the fake crash early (0 = never).
- `opts.bonus` (0.5), `opts.window` (20), `opts.autoClose` (ms), `opts.choices`.
- Callbacks: `opts.onBonus(amount)` and `opts.onClaim()`.
- The result is `{ variant, clicks, bonus, claimed, action }`.
- `opts.see: false` starts on black when nothing is underneath.

## Wiring it into game.js

`CrashScreen.open/count/reveal` become one call. Keep `_freeze()` / `_thaw()` around it.

```js
// FakeCrash._trigger(clickNum)
_freeze();
const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:var(--z-crash);';
document.body.appendChild(ov);
CrashScene.play(ov, { variant: 'fake', clicks: clickNum, state,
    onBonus: g => { state.energy += g; Game.update && Game.update(); } })
  .done.then(() => { ov.remove(); _thaw(); });

// SysDiag._triggerBSOD()
CrashScene.play(ov, { variant: 'thermal', state, onClaim: () => SysDiag.claimCrashUpgrade() })
  .done.then(() => { ov.remove(); _thaw(); });
```

`claimCrashUpgrade()` closes the old overlay; with the scene it only needs to set the dividend and show its
notification. Keep the 45 s backstop above the longest path (about 35 s with the 20 s window).
