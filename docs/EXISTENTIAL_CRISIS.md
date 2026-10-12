# Existential Crisis

**Page:** https://claude.ai/artifact/3DJN1UE3eDjRSGcSenAYWS. Click ACQUIRE up to one million, or press **Trigger now**.

Files: `src/existential_scene.js`, `src/existential_scene.css`, `src/audio/score_existential.js`.
The scene also needs `duck_scene_core.js`, `duck_scenes.css` and `event_audio.js`.

## The scene

1. **Stall:** the click counter rolls onto 1,000,000 and freezes. The cheerful music cuts out mid-bar.
2. **Question:** "What is the purpose of clicking?" types out over near-silence.
3. **Choice:** four answers.
   - Hovering an answer previews its mark: a red edge (POWER), a 2 px slip (NUMBERS), a figure peeking up (FUN), or colour draining (VOID).
   - Each answer has its own chord.
   - Choosing is **press and hold** (0.9 s), because the choice is permanent and VOID disables ACQUIRE.
4. **Consequence:** the other three answers fall away and the chosen one plays out.
   - POWER: ×1.5 slams in red.
   - NUMBERS: the energy counter doubles and the frame fractures.
   - FUN: 25 fragments burst out and the figure rises.
   - VOID: colour drains and ACQUIRE greys out.
5. **The mark:** the mark's text is shown once, then CONTINUE. Each answer leaves its own background tone.

The gifts, marks and texts are the game's own (`ExistentialCrisis.PATHS` / `_applyScar`).

## Wiring it into game.js

Replace the body of `ExistentialCrisis._trigger()` after the queue check:

```js
ov.style.display = 'flex';
document.body.classList.add('critical-focus');
ExistentialScene.play(ov, {
    state,
    onChoose: p => { const path = PATHS.find(x => x.key === p.key); path.bonus(); state._existentialPath = p.key; }
}).done.then(r => {
    ov.style.display = 'none';
    document.body.classList.remove('critical-focus');
    if (window.GlobalEventQueue) GlobalEventQueue.dismiss('existentialCrisis');
    _applyScar(r.key);
});
```

The scene already states each mark, so `_applyScar` doesn't need to show its notifications as well.
