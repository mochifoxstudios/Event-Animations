# Adding text, decisions and sound to an event

Every scene takes its words, its decisions and its sound as data. Adding or changing any of them
in the game means editing a table or passing an option to `play()`. The animation code doesn't change.

## Text

| Event | What you can replace | How |
|---|---|---|
| Ducky Council | Any grade's debate lines, ruling text, label, reward text, votes, and the Chairman's opening line | `CouncilScene.play(host, { verdicts: { gold: { deliberation: [...], textLines: [...] } }, votes: { gold: [...] }, opening: '...' })`, or edit `VERDICTS` in `council_scene.js` |
| Duck Tribunal | The hearing dialogue, the charge, the exhibit line and the ruling line | `{ lines: [...] }` and a `judgement` with any `charge` / `exhibit` / `ruling` text. New registers and charges are new entries in `DIALOGUES` / `CHARGES` |
| Existential Crisis | The question, and every answer's label, description, gift text and mark text | `ExistentialScene.play(host, { question: '...', paths: [...] })` |

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

## Sound

Each event's score (`src/audio/score_*.js`) is a table of music cues, effects and voices. A new line of
dialogue gets its speaker's voice automatically. A new decision or moment needs one line, `au.sfx('name')`,
plus one entry in that event's `sfx` table.
