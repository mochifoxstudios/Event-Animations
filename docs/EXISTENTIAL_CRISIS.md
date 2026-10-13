# Existential Crisis

**Page:** https://claude.ai/artifact/3DJN1UE3eDjRSGcSenAYWS. Click ACQUIRE up to one million, or press **Trigger now**.

Files: `src/existential_scene.js`, `src/existential_scene.css`, `src/audio/score_existential.js`.
The scene also needs `duck_scene_core.js`, `duck_scenes.css` and `event_audio.js`.

## The scene

1. **The break:** the counter rolls onto 1,000,000, glitches (a red and cyan split, then tearing bands), and **cuts to black**. Total silence.
2. **The fall:** out of the dark, the seven digits come loose and fall away to a heartbeat. A field of numbers starts rising out of the abyss.
3. **The question:** "What is the purpose of clicking?" lands one heavy letter at a time. The camera slowly pushes in, and whispers surface at the edges ("who is counting?", "you could stop.", "it would not notice.").
4. **The answers:** four large answers.
   - **Hovering changes the world:**
     - POWER: the numbers turn red and race, and the edges burn.
     - NUMBERS: the numbers multiply outward and the frame slips.
     - FUN: glitter falls and a figure peeks up.
     - VOID: the numbers stop, and the colour drains.
   - **Choosing is press and hold** (1.1 s), and the frame closes in while you hold.
5. **The consequence:** a full-screen moment for each answer.
   - POWER: shockwave rings and a ×1.5 with a chromatic split.
   - NUMBERS: a flood of numbers, the energy counter doubling, then the screen fractures.
   - FUN: 25 fragments burst, and the figure rises into a spotlight and tilts its head.
   - VOID: the colour drains, a giant ACQUIRE ring cracks and dies, then silence.
6. **The mark:** stated once, then CONTINUE. Each answer leaves its own background tone.

Whispers, the question and the answers are all data: `opts.whispers`, `opts.question`, `opts.paths`.

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
