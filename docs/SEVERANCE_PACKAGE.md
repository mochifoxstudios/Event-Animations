# Severance Package

**Page:** https://claude.ai/artifact/D3PGRwhr6j8em64KKxqMWz

Files: `src/severance_scene.js`, `src/severance_scene.css`, `src/audio/score_severance.js`.
The scene also needs `duck_scene_core.js`, `duck_scenes.css` and `event_audio.js`.

## What changed

The game's version was a dialog box with ACCEPT and DECLINE. The idea is the same: once per save, after a
prestige, near the LP threshold, the Simulation Overseers offer 5–12 LP and 100–300 Data to step away. ACCEPT
closes the game and pays on the next launch; DECLINE carries on.

Now it is a meeting. HR is very kind about it.

1. **The invite:** "Quick chat · Simulation Overseers · Human Resources · Now · Required" lands in your
   calendar and accepts itself.
2. **The call:** a video call with Dana from Overseer Relations (speaking), Legal (muted) and you (camera off).
   There's a meeting timer and a REC light. Dana says it isn't a bad thing and mentions your next reset by number.
3. **The letter:** the offer slides in on letterhead and the LP and Data count up. "Your universe will continue
   in your absence." It has fine print you can open (five lines, e.g. "The ducks were consulted. Four of five
   were in favour.").
4. **The choice:** SIGN · ASK FOR MORE · DECLINE.
   - **Ask for more (new, once):** you go **on hold** ("your call is important to us") for about 4 seconds of
     hold music. They come back with a **revised** offer (65%: ×1.5, old numbers struck through, REVISED stamp)
     or "our **final** offer" (FINAL OFFER stamp, numbers unchanged). Then SIGN or DECLINE.
5. **Signed:** the pen signs, ACCEPTED is stamped, Dana thanks you, and the whole screen collapses like an old
   CRT: SESSION ENDED. A card previews the next launch: "◈ SEVERANCE PACKAGE RECEIVED +LP +DATA".
6. **Declined:** DECLINED is stamped and the letter is fed into a shredder. Dana leaves the meeting. Legal
   unmutes for one word ("noted."), then "THE SIMULATION NOTES YOUR DEFIANCE".

Everything is data: `opts.offer`, `opts.lines`, `opts.fine`, `opts.labels`, `opts.people`, `opts.negotiate`
(`{ chance, factor }`, or `false` to remove ASK FOR MORE) and `opts.choices`. The result is
`{ action: 'accept'|'decline', offer, negotiated: 'raised'|'final'|null }`.

## Sound

The music is corporate hold music: a polite bossa in F major at 108 bpm. It has electric piano on a
Fmaj7–Dm7–Gm7–C9 loop, a soft bass, a rim click and a vibraphone tune made only of chord tones.
- **On hold:** the same tune down a phone line: thin and high, with a beep every two bars.
- **Signed:** it settles into one long F major 9.
- **Declined:** it drops to a cold, sparse D minor.

Effects: calendar ding, call join, paper, fine print, revised arpeggio, final-offer fall, pen scratch, stamp,
shredder, power-down. Dana speaks in short, even syllables. Peaks reach 0.27.

## Wiring it into game.js

In `RansomProtocol._open()`, after the offer is rolled:

```js
const ov = document.createElement('div'); ov.id = 'ransom-overlay-scene';
ov.style.cssText = 'position:fixed;inset:0;z-index:var(--z-lore);';
document.body.appendChild(ov);
SeveranceScene.play(ov, {
    state, offer: { lp, data },
    onAccept: offer => { state._ransomOffer = offer; acceptAndClose(); },   // saves, stores the reward, closes the game
    onDecline: () => decline()
}).done.then(() => ov.remove());
```

`acceptAndClose()` waits 1.5 s before `window.close()`. Raise it to about 6 s so the goodbye and the
power-down play first. `claimReward()` on the next launch is unchanged.
