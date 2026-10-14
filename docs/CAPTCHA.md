# CAPTCHA (inverted)

**Page:** https://claude.ai/artifact/QiVZXG74E1ftHL4rBGgQ33

Files: `src/captcha_scene.js`, `src/captcha_scene.css`, `src/audio/score_captcha.js`.
The scene also needs `duck_scene_core.js`, `duck_scenes.css` and `event_audio.js`.

## The rules (unchanged from game.js `AntiCaptcha`)

You have to prove you are a machine.

| You select | Result |
|---|---|
| only tiles that do **not** match | **pass**: +5% energy, +50 Data |
| nothing | **pass** |
| anything, in under 0.2 s | **pass** |
| any tile that **does** match | **fail**. The first time is a warning that explains the rule; after that, −30% income for 90 s |

## What's new

1. **The checkbox:** first, the familiar little card: ☐ "I am not a human", OVERSEER-CAPTCHA, Privacy · Terms ·
   Compliance. Tick it, a spinner turns, and it unfolds into the challenge.
2. **The grid:** "Select all squares with TRAFFIC LIGHTS", in a 3×3 grid. Selected tiles shrink and get a blue
   tick, like the real thing. The grids:
   - traffic lights;
   - fire hydrants (the game's grid had no hydrant art, so it now has one);
   - people crossing;
   - **your own generators**, with your most advanced one in the middle. Pass `opts.grid` with `{ svg }` or
     `{ img }` cells (`SHOP_ICON_IMG_DATA`).
3. **The watchers:** either side of the card, the audit watches you.
   - **The audit log** records what your cursor does: "subject lingered on light", "subject selected light ·
     correctly · concerning", "stillness noted · 3s".
   - **HUMAN PROBABILITY** moves with you: picking a matching tile +16, picking a wrong one −11, hovering a
     matching tile +2. Moving the cursor around nudges it up; holding still nudges it down. Below 50% it reads
     MACHINE.

   This teaches the inverted rule while you play, without saying it. The reading is a guide; the verdict
   follows the game's rules above.
4. **The verdict:** "Verifying…", then the grid shrinks up and the result appears under it.
   - **Pass:** MACHINE BEHAVIOUR CONFIRMED, a green tick in the checkbox, a red NOT HUMAN stamp, and the reward.
   - **Fail:** your matching tiles turn red, and you get either BIOLOGICAL INSTINCTS DETECTED (the warning, with
     an UNDERSTOOD button) or BIOLOGICAL COMPLIANCE DETECTED · SIMULATION TAX −30% EPS for 90 s.

   Each verdict shows the game's reason code (e.g. `NULL_INPUT_ACCEPTED: OPTIMAL NON-ENGAGEMENT`).

The tiles and buttons are real buttons, so it can be played with the keyboard.

## Sound

The music is a sterile machine audit in B minor at 120 bpm: a quiet sixteenth-note arpeggio, a clean pulse and
a clock.
- **Tiles:** each one plays a note of the chord, higher with every tile you select.
- **The reading:** it blips up or down as it moves.
- **Pass:** bright bleeps into D major.
- **Fail:** a two-note "error" falling F♯ → B, then a low B, plus a sinking tone for the tax.

Peaks reach 0.28.

## Data

- `opts.grid`: `{ label, cells, correct }` or a key: `lights`, `hydrants` or `crosswalks`.
- `opts.lines`: every string, including the reason codes (`lines.reasons`) and log lines (`lines.log`).
- `opts.reward` = `{ energy: 0.05, data: 50 }`.
- `opts.firstFail`: true once the player has had the warning.
- `opts.choices`.
- `opts.onResult(result)`: apply the reward or the tax here.
- The result is `{ pass, outcome: 'pass'|'warn'|'tax', reason, selected, correct, elapsed, energy, data, action }`.

## Wiring it into game.js

In `AntiCaptcha._fire()`, build the same grid `g` (personal or classic), then:

```js
const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:var(--z-lore);';
document.body.appendChild(ov);
GlobalEventQueue.register('captcha');
CaptchaScene.play(ov, { state, grid: g, firstFail: !!state._captchaFirstFailed,
    onResult: r => {
        if (r.pass) { state.energy += r.energy; DataResource.grant(r.data);
                      if (!state._captchaPassed) { state._captchaPassed = true; Achieve.forceUnlock('captcha_passed'); } }
        else if (r.outcome === 'warn') state._captchaFirstFailed = true;
        else state._captchaTaxEnd = Date.now() + 90000;
    } }).done.then(() => { ov.remove(); _open = false; GlobalEventQueue.dismiss('captcha'); });
```

For the personal grid, cells become `{ img: SHOP_ICON_IMG_DATA[id], name: item.name }`.
