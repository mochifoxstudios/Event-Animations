/* ═══════════════════════════════════════════════════════════════════════════
   score_crash.js — the two crash screens' music and sound. Two scores, one file:
   they share a silence, and nothing else.

   FAKE CRASH (FakeCrashScore, C major, 120 bpm)
     The music dies with one dead click and a mains hum on C. The percentage
     ticks like a disk. Then the joke lands: a brass "ta-da" and a bouncy
     C major tune.
     CUES     board · dread · joke
     EFFECTS  click · freeze · tick · poke · reveal · bonus

   THERMAL CRASH (ThermalCrashScore, E minor, 100 bpm)
     Fans whine up to 100%, a dead click, a hum on E. "Contained", and then
     the screen cracks open on something that pulses: the crash dividend.
     CUES     heat · dread · core · claimed · closed
     EFFECTS  overheat · freeze · tick · poke · contained · crack · claim · lost · cool
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* the shared crash: everything stops on one dead click */
    function freeze(A, t, root) {
        var F = A.fx;
        F.thump(t, root, 0.9);
        F.tick(t, 900, 0.5);
        F.whoosh(t, 0.12, 6000, 2000, 0.5);
    }
    function dread(A, t, s, bar, root) {
        if (s === 0) A.music.sub(t, root, A.bar, 0.38);                  // the hum
        if (s === 0 && bar % 2 === 1) A.music.sub(t, root + 12, A.bar, 0.06);
    }
    function disk(A, t) { var F = A.fx; F.tick(t, 2600 + Math.random() * 900, 0.07); if (Math.random() < 0.3) F.tick(t + 0.03, 1800, 0.05); }

    /* ── FAKE CRASH ─────────────────────────────────────────────────────── */
    var C_BASS = [36, 43, 41, 43];              // C · G · F · G
    var C_CH = [[60, 64, 67], [59, 62, 67], [60, 65, 69], [59, 62, 67]];
    var C_TUNE = [72, 76, 79, 76, 74, 79, 77, 74];

    var fake = {
        bpm: 120,
        cues: {
            board: function (A, t, s, bar) {
                var M = A.music, k = bar % 4;
                if (s === 0) M.bassClean(t, C_BASS[k], A.beat * 1.5, 0.5);
                if (s === 4 || s === 12) C_CH[k].forEach(function (m) { M.keys(t, m, A.step * 2, 0.12); });
                if (s % 4 === 2) M.hat(t, 0.05);
            },
            dread: function (A, t, s, bar) { dread(A, t, s, bar, 24); },
            joke: function (A, t, s, bar) {
                var M = A.music, k = bar % 4;
                if (s === 0 || s === 8) M.bassClean(t, C_BASS[k] + (s === 8 ? 7 : 0), A.beat * 0.8, 0.5);
                if (s === 4 || s === 12) C_CH[k].forEach(function (m) { M.keys(t, m, A.step * 1.5, 0.13); });
                if (s % 4 === 2) M.hat(t, 0.08);
                if (s === 4 || s === 12) M.wood(t, 0.25, 1.4);
                if (s % 4 === 0) M.chime(t, C_TUNE[((bar % 2) * 4) + (s >> 2)], A.step * 2, 0.12);
            }
        },
        sfx: {
            click: function (A, t) { A.fx.wood(t, 0.4, 0.8); A.fx.chime(t, 84, 0.05, 0.06); },
            freeze: function (A, t) { freeze(A, t, 24); },
            tick: disk,
            poke: function (A, t) { A.fx.keys(t, 48, 0.08, 0.35); A.fx.tick(t, 700, 0.2); },
            reveal: function (A, t) {
                var F = A.fx;
                F.brass(t, 55, 0.12, 0.55); F.brass(t + 0.14, 60, 0.9, 0.6);
                [64, 67, 72].forEach(function (m) { F.brass(t + 0.14, m, 0.9, 0.4); });
                [72, 76, 79, 84].forEach(function (m, k) { F.chime(t + 0.14 + k * 0.08, m, 0.5, 0.35); });
                F.cymbal(t + 0.14, 0.4); F.timp(t + 0.14, 36, 0.8);
            },
            bonus: function (A, t) { var F = A.fx; [79, 84, 88].forEach(function (m, k) { F.chime(t + k * 0.07, m, 0.3, 0.3); }); }
        },
        voices: []
    };

    /* ── THERMAL CRASH ──────────────────────────────────────────────────── */
    var E_CH = [[52, 55, 59], [48, 52, 55], [50, 55, 59], [47, 50, 54]];    // Em · C · G/D · Bm
    var E_BASS = [28, 24, 26, 23];

    var thermal = {
        bpm: 100,
        cues: {
            heat: function (A, t, s, bar) {
                var M = A.music;
                if (s === 0 && bar % 2 === 0) M.sub(t, 28, A.bar * 2, 0.35);
                if (s % 4 === 0) M.thump(t, 28, 0.15 + Math.min(0.3, bar * 0.04));
                if (s % 2 === 1) M.tick(t, 4000 + bar * 200, 0.04);
            },
            dread: function (A, t, s, bar) { dread(A, t, s, bar, 28); },
            core: function (A, t, s, bar) {
                var M = A.music, k = bar % 4;
                if (s === 0) { M.sub(t, E_BASS[k], A.bar, 0.35); E_CH[k].forEach(function (m) { M.warm(t, m, A.bar, 0.26); }); }
                if (s % 4 === 0) M.thump(t, 28, 0.35);
                if (s % 2 === 0) M.chime(t, [83, 79, 76, 78][(s >> 1) % 4] + (bar % 2 ? 0 : -12), A.step, 0.06);
            },
            claimed: function (A, t, s, bar) {
                var M = A.music;
                if (s === 0 && bar % 2 === 0) [40, 52, 56, 59, 64].forEach(function (m) { M.warm(t, m, A.bar * 2, 0.3); });
                if (s % 4 === 0) M.chime(t, [76, 80, 83, 88][(s >> 2) % 4], 0.3, 0.1);
            },
            closed: function (A, t, s, bar) {
                if (s === 0 && bar % 2 === 0) { A.music.sub(t, 28, A.bar * 2, 0.3); [52, 55, 59].forEach(function (m) { A.music.warm(t, m, A.bar * 2, 0.2); }); }
            }
        },
        sfx: {
            overheat: function (A, t, dur) {
                var F = A.fx; dur = dur || 1.4;
                F.riser(t, dur, 52, 0.5);
                for (var k = 0; k < 6; k++) F.whoosh(t + k * dur / 6, dur / 5, 1200 + k * 500, 1600 + k * 600, 0.35);
            },
            freeze: function (A, t) { freeze(A, t, 28); },
            tick: disk,
            poke: function (A, t) { A.fx.whoosh(t, 0.18, 5000, 9000, 0.3); A.fx.tick(t, 600, 0.2); },     // a sizzle
            contained: function (A, t) { var F = A.fx; [52, 59, 64].forEach(function (m) { F.warm(t, m, 1.6, 0.8); }); F.chime(t, 76, 0.6, 0.3); },
            crack: function (A, t) { var F = A.fx; F.thump(t, 28, 1); F.whoosh(t, 0.9, 400, 5000, 0.6); F.revcym(t, 0.4, 0.4); F.riser(t, 0.6, 64, 0.3); },
            claim: function (A, t) {
                var F = A.fx;
                F.timp(t, 40, 1); F.cymbal(t, 0.6);
                [52, 56, 59, 64].forEach(function (m) { F.brass(t, m, 1.2, 0.45); });
                [76, 80, 83, 88, 92].forEach(function (m, k) { F.chime(t + k * 0.07, m, 0.6, 0.3); });
            },
            lost: function (A, t) { var F = A.fx; F.sub(t, 40, 1.6, 0.5, null, 28); F.keys(t, 59, 0.8, 0.3, null, 52); },
            cool: function (A, t) { A.fx.whoosh(t, 0.6, 3000, 500, 0.25); }
        },
        voices: []
    };

    window.FakeCrashScore = fake;
    window.ThermalCrashScore = thermal;
})();
