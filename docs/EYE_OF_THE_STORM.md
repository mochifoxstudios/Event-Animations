# Eye of the Storm

**Page:** https://claude.ai/artifact/28sZgQGvw62gEjhpE9YJCk

Files: `src/eye_scene.js`, `src/eye_scene.css`, `src/audio/score_eye.js`.
The scene also needs `duck_scene_core.js`, `duck_scenes.css` and `event_audio.js`.

## What changed

The game's version was a light-blue panel with a 60-second number. The idea stays the same: at 60%+
instability, 25+ minutes into a session, by chance, the chaos stops. Instability goes to 0, energy output is ×10
for 60 seconds, and afterwards the storm returns at 40% of what it was. Now the minute has something in it.

1. **The storm:** rain, wind, thunder, lightning flashes, and the instability reading (e.g. 74%) shaking in red.
2. **The eye:** a circle of clear sky opens in the middle and grows, and the reading drains to 0%. The storm walls
   keep turning around the edge for the whole minute.
3. **The calm, 60 s:** a ring around the eye counts it down. The side panels show instability 0%, output ×10 and
   the energy earned so far.
   - **Breathe with it (new):** the orb in the middle breathes: 4 s in, 4 s out. **Hold** (pointer or Space)
     while it grows and **release** while it shrinks. A breath counts as in time when you matched it for at least
     70% of the cycle. Each one weakens the storm that comes back: 40% of what it was, minus 4 points per breath,
     down to 12%. "IN TIME" flashes and the RETURNS AT number drops (the old 40% stays visible, struck through).
   - **Use the calm (new):** the eye shrinks into a corner widget (ring, seconds, ×10, RETURN TO THE EYE). The
     board underneath is fully playable at ×10 for the rest of the minute.

   So the choice is: weaken the storm, or play through the boost.
   - **The last 10 seconds:** the walls close in, the ring turns red, the wind comes back, and "Breathe.
     Reorganise. The chaos returns."
4. **The return:** the eye closes, thunder, "SYSTEM ALIGNMENT ENDED · The storm returns", and the new
   instability.

## Sound

- **The storm** is noise: rain, wind, thunder, and a low rumble on G.
- **The eye** is G major and almost nothing: a G drone and a few high chimes.
- **The breath is played by the scene's own clock, not the music's,** so it lands exactly with the orb.
  An inhale swells up a G 6/9; an exhale settles onto C major 7 over G. The inhale chord has no F♯ on purpose,
  so it never clashes with the C chord's tail.
- **The return** is thunder into G minor.

I checked it with a spectrum readout: G B D A E on the inhale and G B E C D on the exhale. Peaks reach 0.5.

## Data

- `opts.duration` (60), `opts.mult` (10) and `opts.breath` (ms per half-breath, 4000).
- `opts.calm` = `{ base: 0.4, perBreath: 0.04, min: 0.12 }`.
- `opts.lines` (every string) and `opts.choices`.
- `opts.autoClose`: ms to close by itself after the return, instead of CONTINUE.
- Callbacks:
  - `opts.onStart()`: apply ×mult and instability 0 here.
  - `opts.onEnd(result)`: restore here.
  - `opts.onMini(bool)`: the scene went to, or came back from, the corner.
- The result is `{ before, returnsAt, breaths, minimized, earned, action }`. `minimized` is the seconds spent
  using the calm.

In corner mode the scene makes its host click-through (`pointer-events: none`), so only the corner widget catches
clicks, and it restores the host when it closes.

## Wiring it into systems4.js

Replace the overlay in `EyeOfStorm._trigger()`:

```js
_active = true;
GlobalEventQueue.register('eyeOfStorm');
const prev = state.instability || 0;
const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:var(--z-lore);';
document.body.appendChild(ov);
EyeScene.play(ov, { state, autoClose: 2500,
    onStart: () => { state.instability = 0; state._eyeOfStormMult = 10; Instability.updateUI && Instability.updateUI(); },
    onEnd: r => { state._eyeOfStormMult = 1; state.instability = Math.min(100, r.returnsAt); Instability.updateUI && Instability.updateUI(); }
}).done.then(() => { ov.remove(); _active = false; GlobalEventQueue.dismiss('eyeOfStorm');
                      _nextCheck = Date.now() + 40 * 60 * 1000; });
```

The scene's music replaces the soundtrack's `eyeOfStorm` cue while it plays (`GameMusic.hold('event-audio')`).
