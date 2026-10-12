/* ═══════════════════════════════════════════════════════════════════════════
   score_council.js — THE DUCKY COUNCIL's music and sound.

   A self-important little chamber in F major, 100 bpm. The Council thinks it is
   an orchestra; it is a harpsichord, a tuba and one brass player who tries.

   CUES, one per beat of the scene
     convene   oom-pah march, the brass states the Council theme
     ledger    a ticking clock and a walking pizzicato bass under Mallard's reading
     debate    a bassoon-ish theme that wanders off key, soft under the talking
     vote      snare roll building over a dominant pedal: nobody breathes
     after_*   the room after the ruling: warm (good grades) or deflated (bad)
   STINGERS  ruling_platinum · gold · silver · bronze · tarnished · quacked
   EFFECTS   gavel · enter(seat) · tick(i) · vote(kind, seat) · score · medal ·
             sigil · feather · panel
   VOICES    one per member. The Chairman booms, Mallard is nasal, Rubber III
             squeaks (he is a toy), the Senator is mid, the Abstainer has none.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var _ = null;

    /* F · Bb · C · F — [bass, chord tones] */
    var MARCH_PROG = [[41, 57, 60, 65], [46, 58, 62, 65], [48, 55, 60, 64], [41, 57, 60, 65]];
    var THEME = [
        [65, _, _, _, 69, _, _, _, 72, _, _, _, 69, _, _, _],
        [70, _, _, _, 67, _, _, _, 64, _, _, _, 60, _, _, _],
        [67, _, _, 69, 70, _, _, _, 72, _, 70, _, 69, _, 67, _],
        [65, _, _, _, _, _, _, _, 60, _, _, _, 65, _, _, _]
    ];
    /* F · Dm · Bb · C, and a line that loses its nerve */
    var DEBATE_PROG = [[41, 57, 60], [38, 57, 62], [46, 58, 62], [48, 55, 64]];
    var DEBATE = [
        [60, _, 62, _, 64, _, 65, _, 64, _, 62, _, 60, _, _, _],
        [62, _, 65, _, 69, _, 67, _, 65, _, 64, _, 62, _, _, _],
        [58, _, 62, _, 65, _, 64, _, 62, _, 61, _, 62, _, _, _],
        [60, _, _, 59, 60, _, _, _, 55, _, 57, _, 59, _, 60, _]
    ];

    var cues = {
        convene: function (A, t, s, bar) {
            var M = A.music, c = MARCH_PROG[bar % 4];
            if (s === 0 || s === 8) M.bass(t, c[0], A.beat * 0.8, 0.9);
            if (s === 4 || s === 12) M.bass(t, c[0] + 7, A.beat * 0.8, 0.7);
            if (s % 4 === 2) for (var k = 1; k < 4; k++) M.pluck(t, c[k], A.step * 1.5, 0.45);
            var m = THEME[bar % 4][s];
            if (m) M.brass(t, m, A.beat * 0.85, 0.75);
            if (s === 0) M.timp(t, 41, 0.5);
            if (s === 12) M.snare(t, 0.4);
            if (bar % 4 === 3 && s >= 12) M.snare(t, 0.25 + (s - 12) * 0.12);
        },
        ledger: function (A, t, s, bar) {
            var M = A.music;
            if (s % 4 === 0) M.tick(t, s % 8 === 0 ? 1900 : 1500, 0.5);
            var walk = [53, 57, 60, 57, 55, 58, 62, 58][(bar % 2) * 4 + (s >> 2)];
            if (s % 4 === 0) M.pluck(t, walk - 12, A.step, 0.55);
            if (s === 0 && bar % 2 === 0) M.pad(t, 65, A.bar * 2, 0.5);
        },
        debate: function (A, t, s, bar) {
            var M = A.music, c = DEBATE_PROG[bar % 4];
            if (s % 4 === 0) M.bass(t, s % 8 === 0 ? c[0] : c[0] + 7, A.step * 1.6, 0.6);
            if (s % 2 === 1) M.pluck(t, c[1 + ((s >> 1) % 2)], A.step, 0.22);
            var m = DEBATE[bar % 4][s];
            if (m) M.brass(t, m - 12, A.step * 1.4, 0.38);
            if (s === 0) M.hat(t, 0.3);
        },
        vote: function (A, t, s, bar) {
            var M = A.music;
            if (s % 4 === 0) M.bass(t, 36, A.beat * 0.9, 0.7);
            M.snare(t, Math.min(1, 0.12 + (bar * 16 + s) / 60));
            if (s === 0) { M.pad(t, 58, A.bar, 0.7); M.pad(t, 64, A.bar, 0.6); M.timp(t, 36, 0.6); }
        },
        after_good: function (A, t, s, bar) {
            var M = A.music;
            var arp = [65, 69, 72, 77, 72, 69][s % 6];
            if (s % 2 === 0) M.pluck(t, arp, A.step * 2, 0.3);
            if (s === 0 && bar % 2 === 0) { M.pad(t, 53, A.bar * 2, 0.6); M.bass(t, 41, A.bar, 0.4); }
        },
        after_bad: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0) M.bass(t, bar % 2 ? 39 : 41, A.bar * 0.9, 0.45);
            if (s === 8 && bar % 2 === 0) M.pluck(t, 56, A.beat, 0.3);
            if (s === 12 && bar % 2 === 1) M.pluck(t, 53, A.beat * 2, 0.25);
            if (s === 0 && bar % 4 === 0) M.pad(t, 56, A.bar * 4, 0.5);
        }
    };

    var sfx = {
        gavel: function (A, t) { A.fx.wood(t, 1, 1); A.fx.wood(t + 0.02, 0.4, 1.6); },
        /* each member arrives in character */
        enter: function (A, t, seat) {
            var F = A.fx;
            if (seat === 2) {                                     // Rubber III: a squeak, sliding
                F.syllable(t, { f: 900, type: 'sine', formant: 1800, q: 1, up: 0.8, down: 1.5, len: 0.4, gain: 0.25, dry: 0.6 }, 1);
                F.whoosh(t, 0.5, 600, 2400, 0.4);
                return;
            }
            if (seat === 4) { F.bell(t, 93, 0.4, 0.25); F.bell(t + 0.12, 88, 0.4, 0.15); return; } // he is simply there
            for (var k = 0; k < 4; k++) F.wood(t + k * 0.16, 0.18, 2.4);  // little feet on marble
            F.syllable(t + 0.66, VOICES[seat], 0.9);
        },
        tick: function (A, t, i) { A.fx.bell(t, 79 + (i || 0) * 2, 0.1, 0.5); },
        tick_neg: function (A, t) { A.fx.syllable(t, { f: 110, type: 'square', formant: 500, q: 1, up: 1, down: 0.7, len: 0.14, gain: 0.25 }, 1); },
        panel: function (A, t) { A.fx.whoosh(t, 0.35, 900, 3000, 0.6); },
        vote: function (A, t, kind, seat) {
            var F = A.fx;
            F.whoosh(t, 0.18, 1200, 3500, 0.4);
            if (kind === 'APPROVE') { F.bell(t + 0.04, 84, 0.1, 0.5); F.bell(t + 0.1, 88, 0.1, 0.4); }
            else if (kind === 'REJECT') F.syllable(t + 0.04, { f: 98, type: 'square', formant: 600, q: 1, up: 1.05, down: 0.75, len: 0.22, gain: 0.3 }, 1);
            else F.wood(t + 0.04, 0.35, 1.8);
            if (seat === 2) F.syllable(t + 0.12, VOICES[2], 0.8);       // Rubber III squeaks his vote
        },
        abstainer_votes: function (A, t) { A.fx.whoosh(t, 0.9, 3000, 300, 0.5); A.fx.timp(t + 0.1, 36, 0.5); },
        score: function (A, t, i) { A.fx.tick(t, 1200 + i * 90, 0.6); },
        medal: function (A, t) { A.fx.bell(t, 96, 0.1, 0.5); A.fx.bell(t + 0.05, 91, 0.2, 0.4); },
        sigil: function (A, t) { for (var k = 0; k < 7; k++) A.fx.bell(t + k * 0.09, [89, 93, 96, 101, 96, 100, 105][k], 0.3, 0.32); },
        feather: function (A, t) { A.fx.whoosh(t, 2.2, 2200, 600, 0.35); A.fx.whoosh(t + 2.2, 2, 1800, 500, 0.25); },
        /* the rulings: a fanfare that knows exactly how proud to be */
        ruling_platinum: function (A, t) {
            var F = A.fx;
            [65, 69, 72, 77].forEach(function (m, k) { F.brass(t + k * 0.11, m, 0.18, 0.9); });
            [53, 65, 69, 72, 77].forEach(function (m) { F.brass(t + 0.48, m, 1.6, 0.85); });
            F.timp(t + 0.48, 41, 1); F.cymbal(t + 0.48, 1);
            for (var k = 0; k < 6; k++) F.bell(t + 0.6 + k * 0.08, [89, 93, 96, 101, 105, 108][k], 0.4, 0.4);
        },
        ruling_gold: function (A, t) {
            var F = A.fx;
            [65, 69, 72].forEach(function (m, k) { F.brass(t + k * 0.12, m, 0.18, 0.85); });
            [53, 65, 69, 72].forEach(function (m) { F.brass(t + 0.38, m, 1.2, 0.8); });
            F.timp(t + 0.38, 41, 0.9); F.cymbal(t + 0.38, 0.7);
        },
        ruling_silver: function (A, t) {
            var F = A.fx;
            F.brass(t, 65, 0.2, 0.7); F.brass(t + 0.24, 72, 0.9, 0.7);
            [57, 60, 65].forEach(function (m) { F.pluck(t + 0.24, m, 0.6, 0.6); });
        },
        ruling_bronze: function (A, t) {
            var F = A.fx;
            F.brass(t, 65, 0.3, 0.55); F.brass(t + 0.4, 64, 0.7, 0.45);   // "...hm."
            F.pluck(t + 0.4, 52, 0.5, 0.4);
        },
        ruling_tarnished: function (A, t) {
            var F = A.fx;
            F.brass(t, 62, 0.3, 0.55); F.brass(t + 0.35, 61, 0.3, 0.5); F.brass(t + 0.7, 58, 0.9, 0.5);
            F.bass(t + 0.7, 34, 1, 0.6);
        },
        ruling_quacked: function (A, t) {                            // the sad trombone, played by a duck
            var F = A.fx;
            F.brass(t, 58, 0.32, 0.7, null, 57.6);
            F.brass(t + 0.4, 57, 0.32, 0.65, null, 56.6);
            F.brass(t + 0.8, 56, 0.32, 0.6, null, 55.6);
            F.brass(t + 1.2, 55, 1.3, 0.6, null, 53.5);
            F.timp(t + 1.2, 31, 0.6);
        }
    };

    /* the five voices */
    var VOICES = [
        { f: 120, type: 'square',   formant: 700,  q: 2,   up: 1.25, down: 0.75, len: 0.09, gain: 0.3 },            // Chairman Quack
        { f: 220, type: 'sawtooth', formant: 1500, q: 4,   up: 1.35, down: 0.85, len: 0.07, gain: 0.3 },            // Dr. Mallard
        { f: 880, type: 'sine',     formant: 1900, q: 1,   up: 0.85, down: 1.4,  len: 0.06, gain: 0.22, dry: 0.7 }, // Rubber III
        { f: 170, type: 'triangle', formant: 1000, q: 2.5, up: 1.3,  down: 0.8,  len: 0.08, gain: 0.35 },           // Senator Duck
        null                                                                                                        // The Abstainer
    ];

    window.CouncilScore = { bpm: 100, cues: cues, sfx: sfx, voices: VOICES };
})();
