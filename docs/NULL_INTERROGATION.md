# NULL Interrogation

**Page:** https://claude.ai/artifact/RX2gKU9rHoWf4TbGSTUoPv

Files: `src/null_scene.js`, `src/null_scene.css`, `src/audio/score_null.js`.
The scene also needs `duck_scene_core.js`, `duck_scenes.css` and `event_audio.js`.

## The scene

1. **Intrusion:** static tears across the screen, a hum rises, and `// NULL ENTITY — DIRECT QUERY //` flickers on.
2. **The eclipse:** a black disc with a burning ring opens in the centre, and the game's numbers start spiralling into it.
3. **The monologue:** NULL speaks one of the game's four monologues in its own low, grainy voice, and the ring pulses with every syllable.
   - **Which monologue:** picked the game's way. A city gives *architect*, 50,000+ clicks gives *burnout*, high income with few clicks gives *efficient*, and everything else gives *mirror*.
   - **The ghost cursor:** a line about clicking brings NULL's cursor across the screen to click the void.
4. **The question:** "WHY DO YOU CONTINUE TO CLICK?" The player types an answer, and the ring flickers with each keystroke. After 16 s of nothing, NULL whispers "...well?".
5. **The judgement:** the answer is pulled up into the eclipse letter by letter. Then comes the verdict, using the game's own keyword rules (emotional answers are checked first):

   | Answer | Verdict | Effect | Sound |
   |---|---|---|---|
   | Emotional ("habit", "empty", "I don't know"…) | WE UNDERSTAND. | Instability −50%, passive ×1.5 this run | F minor turns to F major |
   | Generic ("energy", "score", "win"…) | DISAPPOINTING. | +20% instability | A tritone (F against B) and brass |
   | Anything else | UNEXPECTED RESPONSE. CATALOGUING. | +5 Fragments | Typewriter; the answer is filed under earlier Operators' answers |
   | Escape | SILENCE. DISAPPOINTING. | +20% instability | A cold sub-bass and a breath |

6. **The collapse:** the eclipse shrinks to a point and vanishes, then RETURN TO THE CONSOLE.

All words are data: `opts.dialogues`, `opts.variant`, `opts.question`, `opts.verdicts`, `opts.classify` and `opts.choices`.

## Sound

The score is in F minor, with G♭ (the flattened second) leaning on it under the monologue. It doesn't resolve
unless NULL understands you. I checked it with a frequency-spectrum readout:
- F, A♭ and C throughout;
- F, A and C on WE UNDERSTAND;
- F and B on DISAPPOINTING.

## Wiring it into systems4.js

Replace the body of `NullInterrogation._fire()` after the queue check:

```js
const ov = document.getElementById('interrogation-overlay');
ov.style.display = 'flex';
document.body.classList.add('critical-focus');
NullScene.play(ov, {
    state,
    onVerdict: key => {
        if (key === 'understood') { state._nullUnderstood = true; Instability.add(-50); }
        else if (key === 'catalogued') state.fragments = (state.fragments || 0) + 5;
        else Instability.add(20);                 // generic or silence
    }
}).done.then(() => _close(ov));
```

`NULL_DIALOGUES`, the keyword lists and `_typeNullDialogue` then live in `NullScene`
(`NullScene.DIALOGUES`, `NullScene.classify`). The game's `VoiceSystem.speak` line is no longer needed,
because NULL has its own voice in the scene.
