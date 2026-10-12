/* ═══════════════════════════════════════════════════════════════════════════
   score_existential.js — THE EXISTENTIAL CRISIS's music and sound.

   The joke is the silence. A bright little clicker loop plays as the counter
   rolls to 1,000,000 — and then stops dead, mid-bar. What follows is almost
   nothing: a held low note, a few far-apart bells, a key typing a question.

   CUES      board (the cheerful loop that gets cut) · question (C minor,
             barely there) · after_vignette · after_shift · after_figure ·
             after_drain (each answer leaves its own room tone behind)
   EFFECTS   click · stall · key · reveal · hover(i) · hold(i) · release ·
             choose_vignette · choose_shift · choose_figure · choose_drain ·
             count · shard
   Each answer has its own chord, heard on hover and again, louder, when held.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* the four answers' chords: POWER (stacked fifths, hard), NUMBERS (clean
       major 7th), FUN (bright major), VOID (an unresolved cluster) */
    var CHORDS = [[48, 55, 62, 67], [53, 57, 60, 64], [60, 64, 67, 72], [49, 50, 56, 61]];

    var cues = {
        board: function (A, t, s, bar) {
            var M = A.music;
            var prog = [[48, 60, 64, 67], [45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62]][bar % 4];
            if (s % 4 === 0) M.kick(t, 0.6);
            if (s % 4 === 2) M.hat(t, 0.4);
            if (s % 8 === 4) M.snare(t, 0.3);
            if (s % 4 === 0) M.bass(t, prog[0], A.step * 2, 0.6);
            if (s % 2 === 0) M.pluck(t, prog[1 + (s >> 1) % 3] + 12, A.step, 0.3);
        },
        question: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0 && bar % 2 === 0) M.pad(t, 36, A.bar * 2, 0.7);
            if (s === 0 && bar % 2 === 1) M.pad(t, 43, A.bar * 2, 0.5);
            if (s === 8 && bar % 3 === 0) M.bell(t, [75, 72, 79, 74][(bar / 3 | 0) % 4], 0.8, 0.22);
        },
        after_vignette: function (A, t, s, bar) {            // a low pulse that does not stop
            var M = A.music;
            if (s === 0 || s === 6) M.kick(t, s === 0 ? 0.5 : 0.3);
            if (s === 0 && bar % 2 === 0) M.pad(t, 36, A.bar * 2, 0.6);
            if (s === 0 && bar % 4 === 2) M.brass(t, 43, A.bar * 0.8, 0.3);
        },
        after_shift: function (A, t, s, bar) {               // counting, slightly out of time
            var M = A.music;
            if (s % 4 === 1) M.tick(t + 0.012, 2600, 0.4);
            if (s === 0 && bar % 2 === 0) M.pad(t, 41, A.bar * 2, 0.5);
            if (s % 8 === 0) M.pluck(t, [65, 69, 72, 76][bar % 4], A.step, 0.2);
        },
        after_figure: function (A, t, s, bar) {              // a music box, wound by someone small
            var M = A.music;
            var tune = [72, 76, 79, 76, 77, 74, 72, null, 72, 76, 79, 84, 83, 79, 77, null];
            var m = tune[(bar % 2) * 8 + (s >> 1)];
            if (s % 2 === 0 && m) M.bell(t, m, 0.3, 0.28);
            if (s === 0 && bar % 2 === 0) M.pad(t, 48, A.bar * 2, 0.35);
        },
        after_drain: function (A, t, s, bar) {               // only the drone is left
            if (s === 0 && bar % 2 === 0) A.music.pad(t, 25, A.bar * 2, 0.8);
        }
    };

    var sfx = {
        click: function (A, t) { A.fx.tick(t, 1400, 0.7); A.fx.wood(t, 0.25, 2.4); },
        stall: function (A, t) {
            var F = A.fx;
            F.tick(t, 1400, 0.7);
            F.brass(t + 0.05, 36, 2.6, 0.5);
            F.whoosh(t, 1.6, 3000, 200, 0.4);
        },
        key: function (A, t) { A.fx.wood(t, 0.18, 2.8); A.fx.hat(t, 0.25); },
        reveal: function (A, t) { CHORDS.forEach(function (c, i) { A.fx.bell(t + i * 0.18, c[3] + 12, 0.4, 0.22); }); },
        hover: function (A, t, i) { var c = CHORDS[i % 4]; A.fx.bell(t, c[3] + 12, 0.3, 0.2); },
        hold: function (A, t, i) { CHORDS[i % 4].forEach(function (m) { A.fx.pad(t, m, 0.9, 1.1); }); A.fx.whoosh(t, 0.9, 300, 2600, 0.4); },
        release: function (A, t) { A.fx.whoosh(t, 0.25, 1500, 400, 0.25); },
        choose_vignette: function (A, t) {                   // POWER
            var F = A.fx;
            [36, 43, 48, 55].forEach(function (m) { F.brass(t, m, 1.8, 1); });
            F.kick(t, 1); F.timp(t, 36, 1); F.cymbal(t, 0.7);
            F.brass(t + 0.95, 60, 0.9, 0.9, null, 67);
        },
        choose_shift: function (A, t) {                     // NUMBERS
            var F = A.fx;
            for (var k = 0; k < 16; k++) F.pluck(t + k * 0.055, 60 + k * 2, 0.08, 0.45);
            F.whoosh(t + 0.9, 0.2, 5000, 800, 0.8);
            F.wood(t + 1.0, 0.7, 0.8); F.wood(t + 1.06, 0.5, 0.9);
        },
        choose_figure: function (A, t) {                     // FUN
            var F = A.fx;
            [72, 76, 79, 84, 88].forEach(function (m, k) { F.bell(t + k * 0.08, m, 0.3, 0.4); });
            F.syllable(t + 0.9, { f: 880, type: 'sine', formant: 1900, q: 1, up: 0.85, down: 1.4, len: 0.12, gain: 0.25, dry: 0.7 }, 1);
        },
        choose_drain: function (A, t) {                      // VOID
            var F = A.fx;
            [48, 55, 60, 64].forEach(function (m) { F.brass(t, m, 2.2, 0.6, null, m - 7); });
            F.whoosh(t, 2.6, 2400, 120, 0.5);
            F.timp(t + 2.2, 24, 0.7);
        },
        choose_none: function (A, t) { A.fx.bell(t, 72, 0.6, 0.4); },
        count: function (A, t, k) { A.fx.tick(t, 900 + k * 40, 0.5); },
        shard: function (A, t) { A.fx.bell(t, 84 + Math.floor(Math.random() * 12), 0.1, 0.25); }
    };

    window.ExistentialScore = { bpm: 120, cues: cues, sfx: sfx, voices: [] };
})();
