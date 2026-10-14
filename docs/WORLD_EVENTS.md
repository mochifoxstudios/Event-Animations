# World events

**Pages:** one per event (links in `MAJOR_EVENTS.md`).

Files: `src/world_scene.js`, `src/world_scene.css`, `src/audio/score_world.js` (seven scores in `WorldScores`).
The scene also needs `duck_scene_core.js`, `duck_scenes.css` and `event_audio.js`.

## What they share

World events never take the screen away. The board stays live underneath, and the scene is see-through and
click-through except for what it hands you to click: orbs, strikers, the QUARANTINE button. It doesn't take
Space or Enter either.

Each world event:
1. **Arrives:** a banner sweeps across the top with the icon, the name, what it does, a seconds count and a
   draining bar. It plays a one-second sting over the whole screen and starts its own music.
2. **Runs:** its own effect on the board. A chip on the banner shows what it's doing for you, live.
3. **Ends:** the banner reports what came of it (e.g. "Caught 5 of 7 · +6.2e12 E"), then slides away.

## The seven

| Event | Duration | What it does | New |
|---|---|---|---|
| ↯ Quantum Surge | 20 s | Output ×3. Rings burst from the centre and energy streams up the edges. | The banner counts the extra energy |
| ◎ Data Storm | 14 s | 7 orbs drift over the board (clear of ACQUIRE and the banner). Each catch gives 0.2–0.7% of energy. | Every catch is the next note up; catching all 7 plays a chord |
| ⊘ Walker Strike | 16 s | City PP is offline. A red stamp, a muted board, and six strikers march in with signs. | **Click a striker to talk them down with a coffee.** Settle all six and the strike ends early |
| ≋ Momentum Cascade | 10 s | Combo locked at ×4 (🔒). Chevrons cascade down. | Your clicks play the tune, with sparks at the button |
| ☠ Corrupt Packet | 12 s | A burst of 30 s of output, but ~5% + 1 of one generator is corrupting. Glitch blocks and a skull. | **QUARANTINE within 3 s and you lose half as many** |
| ❄ Time Freeze | 12 s | Passive income paused, only clicks count. Frost grows in from the edges and snow falls. | Every click is a crystal (a note and ice sparks); the frost thaws as it ends |
| ⌫ Memory Purge | 30 s | Energy halved (the number is visibly deleted, digit by digit), then output ×2. | **Every click restores a 1% fragment of what was purged, up to half.** A bar shows how much you've won back |

The three NEW interactions keep each event's idea and add a decision. The Memory Purge one exists because, in the
game, ×2 for 30 s won back almost nothing of a halved bank (about 0.1% in the sample), so the event was simply a loss.

## Sound

Each event has its own key, tempo and texture, so a player can tell them apart with their eyes shut:

| Event | Key | Tempo | Texture |
|---|---|---|---|
| Surge | A major | 128 bpm | four-on-the-floor, rising arpeggios |
| Storm | C minor | 116 bpm | glitch ticks pitched to the key; catches climb the pentatonic |
| Strike | D minor | 104 bpm | a protest march (snare cadence, low brass, chants); settling it resolves to D major |
| Cascade | B♭ major | 150 bpm | the clicks play a B♭ major run |
| Corrupt | E♭ minor | 110 bpm | a dark pulse; the quarantine clanks shut |
| Freeze | F♯ major | 72 bpm | a music box; each click is a crystal from F♯ major |
| Purge | C♯ minor | 124 bpm | minimal and clinical; the deletion sweeps down, fragments blip up |

The ticks used to be random pitches. Now every tick is a note of its event's key. Peaks reach 0.48.

## Data

- `opts.event` (`surge`, `storm`, `strike`, `cascade`, `corrupt`, `freeze`, `purge`), `opts.dur`, `opts.lines`
  (overrides the label, detail and colour), `opts.signs`, `opts.orbs`, `opts.victim` (`{ id, name, count }`) and
  `opts.linger`.
- `WorldScene.EVENTS` holds every default (durations, the corrupt window, the purge fragment size and cap).
- Callbacks: `onStart(ev)`, `onEnd(result)`, `onEnergy(delta)` and `onCorrupt(id, lost)`.
- `scene.click(clientX, clientY)`: call it from the ACQUIRE handler. Cascade, Freeze and Purge answer clicks.

## Wiring it into game.js

`WorldEvents` keeps its timing, chances and gain multipliers. In `tick()`, where an event starts, replace the
ticker with the scene:

```js
const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:var(--z-board-float);pointer-events:none;';
document.body.appendChild(ov);
WorldEvents._scene = WorldScene.play(ov, { event: SCENE_ID[ev.id], state, dur: ev.dur / 1000,
    victim: pickVictim(),
    onStart: () => ev.onStart && ev.onStart(),
    onEnergy: d => { state.energy = Math.max(0, state.energy + d); },
    onCorrupt: (id, lost) => { state.items[id] = Math.max(0, state.items[id] - lost); },
    onEnd: () => { ev.onEnd && ev.onEnd(); } });
WorldEvents._scene.done.then(() => ov.remove());
// in Game's click handler: if (WorldEvents._scene) WorldEvents._scene.click(e.clientX, e.clientY);
```

`SCENE_ID` maps `momentum_cascade → cascade`, `corrupt_packet → corrupt`, `time_freeze → freeze` and
`memory_purge → purge`; the rest keep their ids.

When the scene drives them, the corrupt packet's item loss and the purge's halving move into `onCorrupt` and
`onEnergy`. Remove them from `ev.onStart`.
