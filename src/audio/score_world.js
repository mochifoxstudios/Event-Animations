/* ═══════════════════════════════════════════════════════════════════════════
   score_world.js — the seven WORLD EVENTS' music and sound. Seven short scores,
   one file: each event is a different key, tempo and texture so a player can
   tell them apart with their eyes shut.

     surge     A major, 128   four-on-the-floor, rising arpeggios
     storm     C minor, 116   glitch ticks; each orb caught is the next note up
     strike    D minor, 104   a protest march: snare cadence, low brass, chants
     cascade   B♭ major, 150  your clicks play the melody
     corrupt   E♭ minor, 110  dark pulse; the quarantine clanks shut
     freeze    F♯ major, 72   a music box; every click is a crystal
     purge     C♯ minor, 124  minimal and clinical; the deletion sweeps down

   Every score has CUES main · after and EFFECTS start · end, plus its own.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    function chord(F, t, notes, dur, v, inst) { notes.forEach(function (m) { F[inst || 'warm'](t, m, dur, v); }); }
    function bannerIn(F, t, root) { F.whoosh(t, 0.45, 500, 4000, 0.4); F.thump(t + 0.3, root, 0.6); }
    function bannerOut(F, t) { F.whoosh(t, 0.5, 3000, 400, 0.3); }

    var S = {};

    /* ↯ QUANTUM SURGE — A major */
    S.surge = { bpm: 128, voices: [],
        cues: {
            main: function (A, t, s, bar) {
                var M = A.music, k = (bar >> 1) % 2;
                if (s % 4 === 0) M.kick(t, 0.5);
                if (s % 4 === 2) M.hat(t, 0.12);
                if (s % 2 === 0) M.bassClean(t, (k ? 40 : 45) + (s % 8 === 6 ? 7 : 0), A.step * 1.5, 0.45);
                M.pluck(t, [69, 73, 76, 81][s % 4] + (s >= 8 ? 12 : 0) + (k ? -5 : 0), A.step, 0.1);
                if (s === 0) chord(M, t, k ? [52, 59, 64, 68] : [57, 61, 64, 69], A.bar, 0.18);
            },
            after: function (A, t, s, bar) { if (s === 0 && bar === 0) chord(A.music, t, [57, 64, 69, 71], A.bar * 2, 0.2); }
        },
        sfx: {
            start: function (A, t) { var F = A.fx; F.riser(t, 0.7, 57, 0.5); chord(F, t + 0.7, [57, 61, 64, 69], 0.9, 0.5, 'brass'); F.cymbal(t + 0.7, 0.4); F.kick(t + 0.7, 0.9); bannerIn(F, t, 33); },
            end: function (A, t) { bannerOut(A.fx, t); A.fx.keys(t, 69, 0.6, 0.3, null, 57); }
        }
    };

    /* ◎ DATA STORM — C minor; catching climbs the pentatonic */
    var CATCH = [60, 63, 65, 67, 70, 72, 75, 77, 79, 82, 84];
    S.storm = { bpm: 116, voices: [],
        cues: {
            main: function (A, t, s, bar) {
                var M = A.music;
                if (s === 0) { M.bassClean(t, bar % 2 ? 44 : 48, A.beat * 3, 0.4); chord(M, t, bar % 2 ? [56, 60, 63] : [55, 60, 63], A.bar, 0.16); }
                if (s % 2 === 1) M.tick(t, A.mf(84 + [0, 3, 5, 7, 10][(s * 3) % 5]), 0.06);                 // ticks are pitched: keep them in C minor
                if (s === 4 || s === 12) M.thump(t, 36, 0.3);
                if (s === 10 && bar % 2) M.keys(t, 75, A.step, 0.1);
            },
            after: function (A, t, s, bar) { if (s === 0 && bar === 0) chord(A.music, t, [48, 60, 63, 67], A.bar * 2, 0.18); }
        },
        sfx: {
            start: function (A, t) { var F = A.fx; for (var k = 0; k < 8; k++) F.tick(t + k * 0.05, A.mf(84 + [0, 3, 5, 7, 10, 12, 15, 17][k]), 0.12); F.whoosh(t, 0.6, 6000, 800, 0.4); bannerIn(F, t, 36); },
            spawn: function (A, t) { A.fx.chime(t, 84, 0.1, 0.06); },
            catch: function (A, t, n) { var F = A.fx, m = CATCH[Math.min(CATCH.length - 1, n || 0)]; F.keys(t, m, 0.2, 0.45); F.chime(t + 0.04, m + 12, 0.3, 0.2); },
            miss: function (A, t) { A.fx.whoosh(t, 0.2, 2000, 600, 0.15); },
            all: function (A, t) { chord(A.fx, t, [60, 63, 67, 72], 1.2, 0.6, 'keys'); A.fx.chime(t + 0.1, 84, 0.6, 0.3); },
            end: function (A, t) { bannerOut(A.fx, t); }
        }
    };

    /* ⊘ WALKER STRIKE — D minor march, then D major when it is settled */
    var CHANT = [{ f: 180, type: 'sawtooth', formant: 900, q: 3, up: 1.1, down: 0.9, len: 0.16, gain: 0.2 },
                 { f: 240, type: 'sawtooth', formant: 1100, q: 3, up: 1.1, down: 0.9, len: 0.16, gain: 0.18 }];
    S.strike = { bpm: 104, voices: CHANT,
        cues: {
            main: function (A, t, s, bar) {
                var M = A.music;
                if ([0, 3, 6, 8, 10, 12, 13, 14].indexOf(s) >= 0) M.snare(t, s % 4 === 0 ? 0.35 : 0.18);
                if (s === 0 || s === 8) M.kick(t, 0.5);
                if (s === 0) M.brass(t, bar % 2 ? 45 : 38, A.beat * 1.5, 0.35);
                if (s === 8) M.brass(t, bar % 2 ? 41 : 45, A.beat * 1.5, 0.3);
                if ((s === 4 || s === 6) && bar % 2 === 0) { M.syllable(t, CHANT[0], 0.9); M.syllable(t, CHANT[1], 0.7); }
            },
            after: function (A, t, s, bar) { if (s === 0 && bar === 0) chord(A.music, t, [38, 50, 54, 57, 62], A.bar * 2, 0.22); }
        },
        sfx: {
            start: function (A, t) { var F = A.fx; F.snare(t, 0.6); F.snare(t + 0.12, 0.4); F.kick(t + 0.24, 0.8); F.brass(t + 0.24, 38, 0.8, 0.5); F.brass(t + 0.24, 45, 0.8, 0.4); bannerIn(F, t, 38); },
            settle: function (A, t, n) { var F = A.fx; F.chime(t, 86, 0.15, 0.25); F.chime(t + 0.06, 93, 0.2, 0.15); F.brass(t + 0.1, [50, 53, 57, 62, 65, 69][Math.min(5, n || 0)], 0.3, 0.3); },
            agreement: function (A, t) { var F = A.fx; chord(F, t, [50, 54, 57, 62], 1.4, 0.32, 'brass'); F.cymbal(t, 0.25); F.timp(t, 38, 0.6); },
            end: function (A, t) { bannerOut(A.fx, t); }
        }
    };

    /* ≋ MOMENTUM CASCADE — B♭ major; the clicks are the tune */
    var RUN = [70, 72, 74, 77, 79, 82, 84, 86, 89, 91];
    S.cascade = { bpm: 150, voices: [],
        cues: {
            main: function (A, t, s, bar) {
                var M = A.music;
                if (s % 4 === 0) M.kick(t, 0.45);
                if (s % 2 === 1) M.hat(t, 0.1);
                if (s % 4 === 2) M.bassClean(t, bar % 2 ? 41 : 46, A.step * 1.8, 0.45);
                if (s === 0) chord(M, t, bar % 2 ? [53, 57, 60, 65] : [58, 62, 65, 70], A.bar, 0.15);
            },
            after: function (A, t, s, bar) { if (s === 0 && bar === 0) chord(A.music, t, [46, 58, 62, 65, 70], A.bar * 2, 0.2); }
        },
        sfx: {
            start: function (A, t) { var F = A.fx; [0, 1, 2, 3].forEach(function (k) { F.whoosh(t + k * 0.08, 0.25, 1500 + k * 600, 400, 0.3); }); chord(F, t + 0.35, [58, 62, 65, 70], 0.8, 0.45, 'brass'); bannerIn(F, t, 34); },
            click: function (A, t, n) { A.fx.pluck(t, RUN[(n || 0) % RUN.length], 0.12, 0.35); },
            end: function (A, t) { bannerOut(A.fx, t); A.fx.cymbal(t, 0.3); }
        }
    };

    /* ☠ CORRUPT PACKET — E♭ minor */
    S.corrupt = { bpm: 110, voices: [],
        cues: {
            main: function (A, t, s, bar) {
                var M = A.music;
                if (s === 0) { M.sub(t, 27, A.bar, 0.4); chord(M, t, [51, 54, 58], A.bar, 0.15); }
                if (s % 4 === 0) M.thump(t, 39, 0.35);
                if (s % 3 === 0) M.tick(t, A.mf(87 + [0, 3, 7, 10, 12][s % 5]), 0.07);
                if (s === 14) M.keys(t, bar % 2 ? 66 : 63, A.step, 0.1);
            },
            after: function (A, t, s, bar) { if (s === 0 && bar === 0) chord(A.music, t, [39, 51, 54, 58], A.bar * 2, 0.18); }
        },
        sfx: {
            start: function (A, t) { var F = A.fx; F.thump(t, 27, 1); F.whoosh(t, 0.3, 8000, 1000, 0.6); for (var k = 0; k < 10; k++) F.tick(t + 0.05 + k * 0.035, A.mf(75 + [0, 3, 7, 10, 12, 15][(k * 4) % 6]), 0.15); bannerIn(F, t + 0.2, 27); },
            burst: function (A, t) { var F = A.fx; chord(F, t, [51, 58, 63, 66], 0.7, 0.4, 'keys'); [75, 78, 82, 87].forEach(function (m, k) { F.chime(t + k * 0.05, m, 0.3, 0.2); }); },
            corrupt: function (A, t) { var F = A.fx; F.keys(t, 63, 0.4, 0.5, null, 51); F.sub(t, 39, 0.8, 0.5, null, 27); for (var k = 0; k < 6; k++) F.tick(t + k * 0.06, A.mf(75 - [0, 3, 5, 7, 10, 12][k]), 0.12); },
            quarantine: function (A, t) { var F = A.fx; F.wood(t, 0.5, 0.7); F.thump(t, 39, 0.6); F.keys(t + 0.1, 70, 0.4, 0.35); F.keys(t + 0.1, 75, 0.4, 0.3); },
            end: function (A, t) { bannerOut(A.fx, t); }
        }
    };

    /* ❄ TIME FREEZE — F♯ major music box */
    var ICE = [78, 80, 82, 85, 87, 90, 92, 94, 97];
    S.freeze = { bpm: 72, voices: [],
        cues: {
            main: function (A, t, s, bar) {
                var M = A.music;
                if (s === 0 && bar % 2 === 0) chord(M, t, [54, 61, 66, 70], A.bar * 2, 0.16);
                if (s % 4 === 0) M.chime(t, [90, 85, 82, 87, 85, 78, 82, 80][(bar * 4 + (s >> 2)) % 8], 0.6, 0.06);
            },
            after: function (A, t, s, bar) { if (s === 0 && bar === 0) chord(A.music, t, [54, 66, 70, 73], A.bar, 0.16); }
        },
        sfx: {
            start: function (A, t) { var F = A.fx; F.riser(t, 0.9, 78, 0.35); for (var k = 0; k < 12; k++) F.tick(t + k * 0.06, A.mf(90 + [0, 2, 4, 7, 9][k % 5] + (k > 5 ? 12 : 0)), 0.07); F.chime(t + 0.9, 90, 1.2, 0.3); F.chime(t + 0.9, 97, 1.2, 0.2); bannerIn(F, t + 0.4, 30); },
            click: function (A, t, n) { var m = ICE[(n * 5) % ICE.length]; A.fx.chime(t, m, 0.3, 0.22); A.fx.tick(t, 5000, 0.05); },
            thaw: function (A, t) { var F = A.fx; F.whoosh(t, 0.9, 5000, 400, 0.4); for (var k = 0; k < 6; k++) F.chime(t + 0.2 + k * 0.11, ICE[8 - k], 0.2, 0.1); },
            end: function (A, t) { bannerOut(A.fx, t); }
        }
    };

    /* ⌫ MEMORY PURGE — C♯ minor */
    S.purge = { bpm: 124, voices: [],
        cues: {
            main: function (A, t, s, bar) {
                var M = A.music;
                if (s % 4 === 0) M.kick(t, 0.4);
                if (s % 4 === 2) M.hat(t, 0.1);
                if (s === 0 || s === 10) M.bassClean(t, bar % 4 === 3 ? 45 : 37, A.beat * 0.9, 0.45);
                if (s === 6 || s === 14) chord(M, t, bar % 4 === 3 ? [57, 61, 64] : [56, 61, 64], A.step * 1.5, 0.1, 'keys');
            },
            after: function (A, t, s, bar) { if (s === 0 && bar === 0) chord(A.music, t, [37, 49, 56, 61, 64], A.bar * 2, 0.18); }
        },
        sfx: {
            start: function (A, t) { var F = A.fx; F.whoosh(t, 1.2, 6000, 150, 0.55); F.sub(t, 49, 1.2, 0.5, null, 37); for (var k = 0; k < 10; k++) F.tick(t + k * 0.1, A.mf(97 - [0, 3, 5, 7, 8, 12, 15, 17, 19, 20][k]), 0.12); bannerIn(F, t + 0.8, 37); },
            double: function (A, t) { var F = A.fx; chord(F, t, [49, 56, 61, 64], 0.6, 0.4, 'brass'); F.chime(t + 0.1, 85, 0.4, 0.2); },
            fragment: function (A, t, n) { A.fx.keys(t, [73, 76, 80, 85, 88, 92][(n || 0) % 6], 0.1, 0.3); A.fx.tick(t, A.mf(97), 0.06); },
            end: function (A, t) { bannerOut(A.fx, t); }
        }
    };

    window.WorldScores = S;
})();
