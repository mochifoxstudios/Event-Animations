# Duck Scenes — Ducky Council and Duck Tribunal

Two full-screen scenes that replace how both duck events are presented. They reuse the game's own art
(`duck_cast_art.js`, `duck_council_art.js`, `duck_tribunal_art.js`); nothing new is rasterised.

**Preview:** open `demo/index.html` in a browser. Pick a grade, or a charge and register, and press ▶.
`?play=council&grade=gold` and `?play=tribunal&charge=buyer&register=bureaucrats` open one directly.

| File | What it is |
|---|---|
| `src/duck_scenes.css` | All styling, scoped under `.dks` |
| `src/duck_scene_core.js` | `DuckScene`: pacing, skip, bench, speech bubbles, gavel |
| `src/council_scene.js` | `CouncilScene.play / evaluate / gathering` |
| `src/tribunal_scene.js` | `TribunalScene.play / judge` |
| `src/audio/event_audio.js` | `EventAudio`: synth engine, sequencer, voices |
| `src/audio/score_*.js` | Each event's music, effects and voices |

Load order: the three art files, then `duck_scene_core.js`, then the two scenes.

---

## What changed for the player

### Ducky Council (~25 s, or ~2 s with SKIP)
1. **Convene.** The lights come up and the members come in, each in character. Four waddle in. Rubber III glides, because a toy has no legs. The Abstainer is simply there. The Chairman arrives last and calls the session to order.
2. **The record.** Dr. Mallard reads the five scored metrics into a ledger (clicks, prestiges, energy, city, instability), and the points light up one by one. *New: the player sees what is being graded.* The total stays hidden.
3. **Debate.** The tier's lines play in speech bubbles over whoever is speaking, and the rest of the bench turns to look.
4. **Vote.** Placards go up one at a time. Rubber III holds his upside down. The Abstainer raises nothing, except in Platinum and Quacked, where the bench turns to watch him vote.
5. **Ruling.** The gavel comes down, the score runs along a grade track, and the medal drops. In Platinum, the sigil the verdict text describes actually rotates above the chamber. In Quacked, the room turns red and a feather falls.
6. **Accept.** The player closes it. Rewards are applied at the gavel, as before.

### Duck Tribunal (~35 s, or ~2 s with SKIP)
1. **All rise.** Three knocks bring the lights up on an empty bench, except for the fifth stall: the Silent One is already seated.
2. **Convene.** The four judges rise into their stalls.
3. **Charge.** A case docket slides in, the charge is stamped on it, and Exhibit A is the player's own number (for example *"2100 clicks a minute, sustained."*).
4. **Hearing.** The register's dialogue plays in speech bubbles, and the bench turns toward each speaker. The Silent One never turns or blinks.
5. **Confer.** The bench leans in toward the centre over five dots.
6. **Sentence.** The last judge to speak rules while the others dim. The gavel comes down, the judge explains the sentence, and it's stamped onto the same docket as the charge.
7. **ACCEPT SENTENCE or BANISH TO OMEGA.** This used to auto-close after 3.5 s; now the player chooses.

The colour follows the register: Sentencers red, Bureaucrats teal, Philosophers yellow.

### ⭐ The sentence now follows the charge

| Charge | Sentence | Game verdict |
|---|---|---|
| Frantic Clicker | **Sentenced to rest.** Your machines will work instead | DUCK: passive ×5 for 60 s |
| Idle Observer | **Sentenced to overtime.** Your machines run double while you keep watching | POWER: ×2 for 5 min |
| Obsessive Buyer | **Guilty.** Purchasing privileges revoked | GUILTY: confiscates the **buy-quantity selector** |
| Void Researcher | **Notes seized**, annotated and returned | WISDOM: +8 fragments, +2 LP |
| Spore Neglector | **Taken into care**: a city sector until you learn | QUARANTINE: 90 s |
| Average Operator | The court finds nothing remarkable and **flips a coin** | The old instability-weighted roll |

Both scenes:
- **Skipping:** click anywhere to finish the current line, Space/Enter does the same, and **SKIP ▸▸** jumps to the decision.
- **Reduced motion:** under reduced motion, `safe-mode` or `accessibility-mode`, everything still appears, but nothing moves.
- **Style constraints:** only `transform` and `opacity` are animated, and the art draws in `currentColor`.

---

## Wiring it into game.js

### Ducky Council: replace the body of `DuckyCouncil.summon()`

```js
function summon() {
    if (_active) return;
    _active = true;
    const overlay = document.getElementById('ducky-council-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    if (window.PanelNav) PanelNav.close();
    CouncilScene.play(overlay, {
        state,
        onRuling: _applyVerdict,                       // the existing reward block from summon(), moved into a function
        onMemberClick: i => { if (window.RubberIII) RubberIII.onDuckCardClick(i); },
        sound: name => { if (name === 'gavel' && window.GameSound) GameSound.play('sfx:gavel'); }
    }).done.then(dismiss);
}
```

`_evaluate`, `_animateDucks`, `_revealVotes`, `_typeDeliberation` and the `VERDICTS` text can be removed,
because `CouncilScene` now owns them. `CouncilScene.evaluate(state)` returns the same grade as `_evaluate()`.

**Optional:** to animate the 30-second warning, add `CouncilScene.gathering()` to the "ducks are gathering"
notification. It shows five small silhouettes waddling past.

### Duck Tribunal: replace the body of `_trigger()` after the queue check

```js
const j = TribunalScene.judge(state);              // charge, register, sentence
ov.style.display = 'flex';
TribunalScene.play(ov, { judgement: j }).done.then(r => {
    if (r.action === 'banish') return banishToOmega();
    _choose(VERDICTS[r.verdict], j.confiscate);       // j.confiscate = 'buy-qty-wrap' for Obsessive Buyer
});
```

`_confiscateUI(preferred)` should take `preferred` first when it exists and hasn't already been confiscated.
After the swap, `CHARGES`, `TRIBUNAL_DIALOGUES`, `_typeDialogue`, `_deliverRandomVerdict` and the
bubble helpers are unused.

### ⚠ Things to check when wiring
- **Overlay contents:** `play(host)` replaces the host's contents. `#ducky-council-modal`, `#tribunal-ducks` and
  the `EventPlates` plate disappear while the scene is up. Any QA probes that read those IDs need
  pointing at `.dks` instead. You could also mount the scene in a child element, but then the old markup stays on screen.
- **Overlay styling:** the scenes paint their own background. If `.event-stage` adds padding or a card frame, set it to
  `padding: 0` for these two overlays.
- **Sound:** see the Sound section above. The scenes bring their own music, so `music.js`'s duck cues are held while they play.
- **`DuckyCouncil.isActive()`:** `music.js` reads it, so `_active` must stay true until `dismiss()`, which the code above does.

---

## Sound — every event has its own score

All sound is synthesised in the browser by `src/audio/event_audio.js` (Web Audio, no files). Each event brings a score:

| | Ducky Council (`score_council.js`) | Duck Tribunal (`score_tribunal.js`) |
|---|---|---|
| Music | F major chamber march, 100 bpm: harpsichord, tuba, one ambitious brass player | D minor courtroom, 66 bpm: organ, timpani, low drone |
| Cues by beat | convene (oom-pah march) → ledger (ticking clock, walking bass) → debate (wandering bassoon line) → vote (snare roll over a held chord) → after (warm or deflated) | all rise (organ swell) → hearing, one per register (Sentencers: heavy brass and a wrong semitone · Bureaucrats: typewriter, pizzicato, desk bell · Philosophers: choir and bells) → confer (heartbeat, climbing ostinato) → after |
| Rulings | A fanfare per grade: Platinum (fanfare, cymbal, bell cascade) down to Quacked (sad trombone) | A timpani roll into an orchestral hit; GUILTY adds a dissonant cluster |
| Effects | Gavel, footsteps per arrival, Rubber III's squeaky glide, the Abstainer's faint chime, ledger pips rising in pitch, placards (approve chime / reject buzz / abstain thud), score count, medal, sigil shimmer, falling feather | Knocks, judges rising, docket swish, both stamps, murmurs while conferring, the Silent One's squeak, flash |
| Voices | Each member babbles while their line types: the Chairman booms, Mallard is nasal, Rubber III squeaks, the Senator is mid-range, the Abstainer has no voice | Same five bodies |

In the game, a scene's session holds `GameMusic` (`'event-audio'`) so the soundtrack director goes quiet while the scene plays, and releases it on close. It follows Settings: sound off silences it; the Music and Effects sliders scale it (call `EventAudio.refresh()` when they change). Load `event_audio.js` and both score files before the scenes. Pass `audio: false` to `play()` to run a scene silent.

---

## Viewable pages

Each event is also built as one self-contained page in `artifacts/` (`node tools/build_artifacts.js`). Rebuild them after any change to `src/` or the art files.

| Event | Page |
|---|---|
| Ducky Council | https://claude.ai/artifact/HHEUhtckLdBPEXdy6rjQnm |
| Duck Tribunal | https://claude.ai/artifact/N8CidxjtuYA56EnRAmhfDU |
