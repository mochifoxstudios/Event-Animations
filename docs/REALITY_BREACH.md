# Reality Breach

**Page:** https://claude.ai/artifact/BAeFyogAWuhriScZfKY3G5. Choose "12 seconds" to watch it escape.

Files: `src/breach_scene.js`, `src/breach_scene.css`, `src/audio/score_breach.js`.
The scene also needs `duck_scene_core.js`, `duck_scenes.css` and `event_audio.js`.

## Rules (the game's own, from `AnomalyBoss`)

- **The fight:** 36–44 hits in 45 seconds, with phases at ⅔ and ⅓ health.
- **Feeding:** it eats 10%, then 20%, then 30% of your income while alive.
- **Hits:** each one pays a little energy.
- **Sealed:** you get back everything it ate, plus a bounty and 18–29 fragments.
- **Escaped:** it keeps what it ate, and instability rises by 15%.

## The scene

1. **Warning:** hazard bands scroll in top and bottom, a two-tone klaxon sounds, and the screen pulses red.
2. **The tear:** a crack rips down the middle of the screen and opens, the breach comes through, and the title card reads *"It eats what you make. It keeps what it eats."*
3. **The fight:** the breach now moves. In the game it stood still in phase I and only teleported in phases II and III.
   - **Phase I:** it drifts in a slow figure-eight.
   - **Phase II ("IT MOVES"):** it glides to new ground every 2.2 s and **dodges away from where you hit it**.
   - **Phase III ("ENRAGED"):** it darts every 1.3 s, shudders and turns orange, and the music shifts up a semitone.
   - **Its eye follows your cursor** the whole fight.
   - **The feeding is visible:** a stream of energy flows out of YOUR ENERGY into the breach, getting thicker each phase.
   - **Feedback:** each hit sounds a note that climbs the scale as its health falls, so you can hear the fight turning. Cracks appear at 25%, 50% and 75% damage, with a glass sound.
   - **The last 10 seconds:** the timer blinks and the edges pulse red.
4. **Sealed:** it shatters, the stream reverses and pours your energy back, then an E major fanfare and the result card counting up.
   **Escaped:** it drifts back into the rift, which reopens, swallows it and seals.

It can be played with the keyboard (Tab to the breach, then Enter). Under reduced motion it stays still but can still be hit.
The numbers and words are data: `opts.hp`, `opts.life`, `opts.feed`, `opts.hitPay`, `opts.bounty`, `opts.fragments`, `opts.text` and `opts.choices`.

## Wiring it into game.js

Replace `AnomalyBoss.spawn()`'s `BossStage` sequence with:

```js
const host = document.getElementById('boss-stage') /* any full-screen layer */;
BreachScene.play(host, {
    state,
    hitPay: () => _birdPay(HIT[0], HIT[1], HIT[2]),
    bounty: () => _birdPay(BOUNTY[0], BOUNTY[1], BOUNTY[2]),
    fragments: () => { const f = 18 + Math.floor(Math.random() * 12); return FragUpgrades.hasBought('boss_loot') ? f * 3 : f; },
    onResult: r => r.won ? /* the body of _defeat() */ 0 : /* the body of _escape() */ 0
}).done.then(() => { /* unhold the queue, schedule the next */ });
```

The scene changes the energy it displays itself. In the game, keep doing the actual feeding in `_step()` as it
does now, or pass `state` through and let the scene's numbers be the display only.
