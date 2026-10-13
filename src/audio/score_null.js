/* ═══════════════════════════════════════════════════════════════════════════
   score_null.js — THE NULL INTERROGATION's music and sound.

   Everything is built on F. NULL's presence is F minor with the flattened
   second (G♭) leaning on it — the most uneasy chord a minor key has — over a
   pulse at the bottom of hearing. It does not resolve, until it understands
   you: WE UNDERSTAND turns the same F into F major. DISAPPOINTING puts the
   tritone (F against B) under it instead.

   CUES      intrusion · presence · question · after_understood ·
             after_generic · after_catalogued · after_silence
   EFFECTS   static · emerge · line · ghost_click · question · qkey · type ·
             well · consume · silence · verdict_* · vkey · collapse
   VOICE     NULL speaks in low, grainy syllables — a voice, so not tuned;
             everything else is in key.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var FM = [41, 48, 53, 56];          // F minor
    var GB = [42, 49, 54, 58];          // G♭ major — the flat second
    var FMAJ = [41, 53, 57, 60, 65];    // F major — understood
    var TRI = [29, 35, 41, 47];         // F and B — disappointed
    var PENTA = [77, 80, 82, 84, 87];   // F minor pentatonic, high

    var cues = {
        intrusion: function (A, t, s, bar) {
            if (s === 0) { A.music.sub(t, 29, A.bar, 0.55); A.music.warm(t, 41, A.bar, 0.35); }
        },
        presence: function (A, t, s, bar) {
            var M = A.music;
            var chord = (bar % 4 === 2) ? GB : FM;
            if (s === 0 && bar % 2 === 0) M.sub(t, 29, A.bar * 2, 0.6);
            if (s === 0) chord.forEach(function (m) { M.warm(t, m, A.bar * 0.98, 0.42); });
            if (s === 0 || s === 9) M.thump(t, 29, s === 0 ? 0.4 : 0.22);
            if (s === 12 && bar % 2 === 1) M.chime(t, [84, 80, 77, 82][(bar >> 1) % 4], 0.8, 0.16);
        },
        question: function (A, t, s, bar) {
            if (s === 0 && bar % 2 === 0) { A.music.sub(t, 29, A.bar * 2, 0.5); A.music.sub(t, 77, A.bar * 2, 0.05); }
            if (s === 0) A.music.thump(t, 29, 0.3);
        },
        after_understood: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0 && bar % 2 === 0) FMAJ.forEach(function (m) { M.warm(t, m, A.bar * 2, 0.4); });
            if (s % 4 === 0) M.chime(t, [77, 81, 84, 89][(s >> 2) % 4], 0.4, 0.14);
        },
        after_generic: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0 && bar % 2 === 0) { M.sub(t, 29, A.bar * 2, 0.6); M.warm(t, 35, A.bar * 2, 0.4); }
            if (s === 0 || s === 6) M.thump(t, 29, 0.35);
        },
        after_catalogued: function (A, t, s, bar) {
            var M = A.music;
            if (s % 2 === 0) M.keys(t, [65, 68, 72, 68][(s >> 1) % 4], 0.12, 0.18);
            if (s === 0 && bar % 2 === 0) M.sub(t, 41, A.bar * 2, 0.3);
        },
        after_silence: function (A, t, s, bar) {
            if (s === 0 && bar % 2 === 0) A.music.sub(t, 29, A.bar * 2, 0.55);
        }
    };

    var sfx = {
        static: function (A, t) {
            var F = A.fx;
            [0, 0.16, 0.4, 0.62, 0.9].forEach(function (d, k) { F.whoosh(t + d, 0.12 + k * 0.02, 6000, 2500, 0.9); F.hat(t + d, 1); });
            F.thump(t, 29, 0.6);
        },
        emerge: function (A, t) {
            var F = A.fx;
            FM.forEach(function (m) { F.warm(t, m, 2.2, 0.55); });
            F.riser(t, 2, 41, 0.3);
            F.sub(t, 29, 2.4, 0.5);
        },
        line: function (A, t) { A.fx.thump(t, 29, 0.35); },
        ghost_click: function (A, t) { A.fx.wood(t, 0.7, 2.4); A.fx.wood(t + 0.12, 0.5, 2.4); A.fx.chime(t + 0.12, 77, 0.3, 0.2); },
        question: function (A, t) { A.fx.thump(t, 29, 0.9); A.fx.chime(t + 0.1, 77, 1.2, 0.3); },
        qkey: function (A, t) { A.fx.keys(t, 53, 0.08, 0.28); },
        type: function (A, t) { A.fx.chime(t, PENTA[(Math.random() * PENTA.length) | 0], 0.03, 0.07); },
        well: function (A, t) { A.fx.breath(t, 1.1, 0.35, 'oo'); },
        consume: function (A, t) {
            var F = A.fx;
            F.whoosh(t, 1.3, 600, 4000, 0.5);
            [77, 75, 72, 68, 65, 60, 56, 53].forEach(function (m, k) { F.chime(t + k * 0.14, m, 0.2, 0.26 - k * 0.02); });
            F.sub(t + 0.4, 29, 1.6, 0.5);
        },
        silence: function (A, t) { A.fx.sub(t, 29, 1.2, 0.4); A.fx.breath(t, 1.2, 0.25, 'oo'); },
        verdict_understood: function (A, t) {
            var F = A.fx;
            FMAJ.forEach(function (m) { F.warm(t, m, 2.6, 1.1); });
            [77, 81, 84, 89].forEach(function (m, k) { F.chime(t + 0.2 + k * 0.16, m, 0.6, 0.4); });
            F.sub(t, 41, 2.6, 0.5);
        },
        verdict_generic: function (A, t) {
            var F = A.fx;
            F.thump(t, 29, 1); F.timp(t, 29, 0.9);
            TRI.forEach(function (m) { F.warm(t, m + 12, 2, 1); });
            F.brass(t, 29, 1.4, 0.45); F.brass(t, 35, 1.4, 0.4);
            F.cymbal(t, 0.3);
        },
        verdict_catalogued: function (A, t) {
            var F = A.fx;
            for (var k = 0; k < 6; k++) F.wood(t + k * 0.09, 0.35, 2.2);
            F.chime(t + 0.6, 84, 0.4, 0.4); F.chime(t + 0.75, 89, 0.6, 0.35);
            [41, 48, 53].forEach(function (m) { F.keys(t + 0.6, m, 0.8, 0.5); });
        },
        verdict_silence: function (A, t) {
            var F = A.fx;
            F.thump(t, 29, 0.9);
            [29, 35].forEach(function (m) { F.warm(t, m + 12, 2.4, 0.9); });
            F.breath(t + 0.3, 1.6, 0.3, 'oo');
        },
        vkey: function (A, t) { A.fx.keys(t, 41, 0.06, 0.25); },
        collapse: function (A, t) {
            var F = A.fx;
            [53, 56, 60].forEach(function (m) { F.keys(t, m, 1.1, 0.4, null, m - 12); });
            F.sub(t, 41, 1.2, 0.6, null, 29);
            F.thump(t + 1.2, 29, 0.9);
        }
    };

    /* NULL's voice: low, grainy, a second voice an octave under it */
    var VOICES = [{ f: 86, type: 'sawtooth', formant: 620, q: 3, up: 1.12, down: 0.86, len: 0.1, gain: 0.34, dry: 0.7, gap: 0.075 }];

    window.NullScore = { bpm: 100, cues: cues, sfx: sfx, voices: VOICES };
})();
