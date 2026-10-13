# Prisoner's Dilemma

**Page:** https://claude.ai/artifact/KAGACyeoh1z45zi7Wk7x3Z

Files: `src/dilemma_scene.js`, `src/dilemma_scene.css`, `src/audio/score_dilemma.js`.
The scene also needs `duck_scene_core.js`, `duck_scenes.css` and `event_audio.js`.

## What changed

The game's version had no choice: it showed "MUTUAL COOPERATION" and resolved itself after 5 seconds. This
is a real one-shot dilemma. The pool is still 40% of the player's energy, and cooperation still pays +20%.

| | They share | They steal |
|---|---|---|
| **You share** | +20% (what the game always gave) | −10% (they take your stake) |
| **You steal** | +40% (you take the pool) | 0, and +10% instability |

## Opponents (the game's five names, each given a way to decide)

| Operator | Trust | Decides |
|---|---|---|
| Operator_409 | 82% | Shares 80% of the time |
| NEXUS_PROC_Δ | 50% | Copies your previous choice (`state._pdLast`); shares on first contact |
| usr_unknown | ?? | A coin flip |
| void_entity_7 | 21% | Steals 75% of the time |
| Ω_remnant | 60% | Steals if your Existential Crisis answer was POWER or VOID, otherwise shares |

Each one has its own opening line and a closing line for each of the four outcomes.

## The scene

1. **The signal:** a scanner sweeps through static and locks on: "NEXUS_PROC_Δ HAS BEEN DETECTED ON YOUR FREQUENCY".
2. **The split screen:** you on the left, them on the right, and the pool glowing between you, with the payoff grid in real energy amounts.
   They open with a line of their own, spoken in radio blips.
3. **Decide:** SHARE or STEAL, with a 15-second ring clock.
   - **Their dossier:** trust rating and record.
   - **The tell:** while their "typing…" dots run, their cursor hovers between their own SHARE and STEAL. About 70% of the time it lingers on the one they mean, so it's a tell, not a certainty.
   - **Hovering:** hovering your own buttons highlights the outcomes that choice can lead to.
   - **Out of time:** you share, matching the old behaviour.
4. **Lock-in:** your card seals, theirs seals a beat later, and a heartbeat plays.
5. **The reveal:** both cards flip at once.
   - **Both share:** the pool splits.
   - **You steal:** it all flows to you.
   - **They steal:** it all flows to them.
   - **Both steal:** it burns.

   Then their last word.

Everything is data: `opts.opponents`, `opts.opponent`, `opts.payoffs`, `opts.time` and `opts.choices`.

## Sound

The music is in A minor, a walking bass and a clock. Each outcome has its own chord on A:
- both share: A major;
- you steal: A minor add 9;
- betrayed: a fall toward F;
- both steal: a burning cluster.

I checked it with a spectrum readout; peaks reach 0.57.

## Wiring it into game.js

Replace the body of `PrisonersDilemma.trigger()` after the queue check:

```js
const ov = document.createElement('div'); ov.id = 'prisoner-overlay';
ov.style.cssText = 'position:fixed;inset:0;z-index:var(--z-lore);';
document.body.appendChild(ov);
DilemmaScene.play(ov, {
    state,
    onResult: r => {
        state.energy = Math.max(0, (state.energy || 0) + r.delta);
        if (r.instability) state.instability = Math.min(100, (state.instability || 0) + r.instability);
        state._pdLast = r.you;
    }
}).done.then(() => { ov.remove(); _active = false; GlobalEventQueue.dismiss('prisonersDilemma'); });
```

Note: the event currently fires once per save (`_triggered`). With a real choice and NEXUS_PROC_Δ remembering
your last move, it may be worth letting it recur, perhaps once per run.
