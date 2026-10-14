# Adding text, decisions and sound to an event

Every scene takes its words, its decisions and its sound as data. Adding or changing any of them
in the game means editing a table or passing an option to `play()`. The animation code doesn't change.

## Text

| Event | What you can replace | How |
|---|---|---|
| Ducky Council | Any grade's debate lines, ruling text, label, reward text, votes, and the Chairman's opening line | `CouncilScene.play(host, { verdicts: { gold: { deliberation: [...], textLines: [...] } }, votes: { gold: [...] }, opening: '...' })`, or edit `VERDICTS` in `council_scene.js` |
| Duck Tribunal | The hearing dialogue, the charge, the exhibit line and the ruling line | `{ lines: [...] }` and a `judgement` with any `charge` / `exhibit` / `ruling` text. New registers and charges are new entries in `DIALOGUES` / `CHARGES` |
| Existential Crisis | The question, and every answer's label, description, gift text and mark text | `ExistentialScene.play(host, { question: '...', paths: [...] })` |
| NULL Interrogation | The monologues and the verdict texts | `NullScene.VERDICTS`, `{ variant }`; see `docs/NULL_INTERROGATION.md` |
| Prisoner's Dilemma | Opponents (name, trust, record, how they decide, every line), payoffs, time | `{ opponents, opponent, payoffs, time }` |
| Severance Package | Every line, the fine print, button labels, names, the offer, negotiation odds | `{ lines, fine, labels, people, offer, negotiate }` |
| Fake / Thermal Crash | Every string (including the lines at given click counts), the stop-code lines, bonus, window | `CrashScene.play(host, { variant, lines, info, pokes, bonus, window })` |
| Eye of the Storm | Every string, duration, multiplier, breath length, how much a breath weakens the storm | `{ lines, duration, mult, breath, calm }` |
| CAPTCHA | The grid (label, cells, which are correct), every string, reason codes, log lines, reward | `{ grid, lines, reward, firstFail }` |
| World events | Label, detail, colour, duration, signs, orb count, the corrupt victim | `WorldScene.play(host, { event, lines, dur, signs, orbs, victim })`, defaults in `WorldScene.EVENTS` |

The dialogue line format is the one the game already uses:
- `'NAME: "words"'` is speech in that member's bubble, with their voice.
- `'NAME: (does something)'` is an action.
- `'[STAGE DIRECTION]'` is a caption.

## Decisions

- **Duck scenes:** these take `choices: [{ id, label, title?, alt? }]`. Pass any number of buttons and the scene returns the `id` the player picked. For example, the Tribunal could add a third option:
  ```js
  TribunalScene.play(ov, { judgement: j, choices: [
      { id: 'accept', label: 'ACCEPT SENTENCE' },
      { id: 'appeal', label: 'APPEAL', title: 'Costs 10% of energy; the bench may reconsider' },
      { id: 'banish', label: 'BANISH TO OMEGA', alt: true }
  ] }).done.then(r => { /* r.action is 'accept', 'appeal' or 'banish' */ });
  ```
- **Existential Crisis:** its answers are the decisions, and `paths` can hold any number of them. Each one picks one of the built-in marks: `vignette`, `shift`, `figure`, `drain` or `none`.
- **Every other scene** that ends on a button takes the same `choices: [...]` list. Its in-scene decisions (SHARE/STEAL, SIGN/ASK/DECLINE, breathe or USE THE CALM, QUARANTINE, the CAPTCHA tiles) report back through the scene's callbacks and its result object, as described in each event's doc.

## Sound

Each event's score (`src/audio/score_*.js`) is a table of music cues, effects and voices. A new line of
dialogue gets its speaker's voice automatically. A new decision or moment needs one line, `au.sfx('name')`,
plus one entry in that event's `sfx` table.
