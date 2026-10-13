/* ═══════════════════════════════════════════════════════════════════════════
   score_breach.js — THE REALITY BREACH's music and sound.

   A boss fight in E minor at 140 bpm. The riff gets heavier with each phase,
   and in PHASE III it shifts up a semitone (to F) — the oldest trick for "it is
   out of control now", and it works. Winning resolves to E MAJOR; losing
   drops the floor out.

   CUES      warning (a two-tone klaxon over a pulse) · fight1 · fight2 · fight3
             · after_won · after_lost
   EFFECTS   tear · arrive · hit(progress) · crack · miss · phase(p) · shatter ·
             win · escape · tick(progress)
   The hit sound climbs the E minor scale as the breach's health falls, so the
   player HEARS the fight going their way.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var _ = null;

    var SCALE = [64, 66, 67, 69, 71, 72, 74, 76, 78, 79, 81, 83, 84, 86, 88];   // E minor, two octaves
    /* the riff, one bar of 16ths, in semitones above the root */
    var RIFF = [0, _, 0, 12, _, 0, 10, _, 0, _, 7, _, 0, 3, 5, 7];

    function fight(A, t, s, bar, level, root) {
        var M = A.music, r = root;
        /* drums */
        if (s % 4 === 0) M.kick(t, 0.85);
        if (level >= 2 && s % 4 === 2) M.kick(t, 0.5);
        if (s === 4 || s === 12) M.snare(t, 0.6 + level * 0.1);
        if (level >= 2 ? true : s % 2 === 0) M.hat(t, s % 2 ? 0.25 : 0.4);
        /* the riff */
        var n = RIFF[s];
        if (n != null) M.bassClean(t, r + n, A.step * 0.9, 0.9);
        /* the chord */
        if (s === 0) { M.warm(t, r + 12, A.bar, 0.6); M.warm(t, r + 19, A.bar, 0.5); M.warm(t, r + 15, A.bar, 0.45); }
        /* phase II: brass stabs; phase III: more of them */
        if (level >= 1 && (s === 0 || s === 6 || (level >= 2 && (s === 10 || s === 14)))) {
            M.brass(t, r + 24, A.step * 1.4, 0.45); M.brass(t, r + 31, A.step * 1.4, 0.4);
        }
        /* an arpeggio over the top that climbs with the fight */
        if (s % 2 === 1) M.pluck(t, r + 36 + [0, 3, 7, 10, 12, 10, 7, 3][(s >> 1) % 8] + (level >= 2 ? 0 : 0), A.step, 0.12 + level * 0.06);
        if (s === 0 && bar % 4 === 0) M.cymbal(t, 0.35);
    }

    var cues = {
        warning: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0 || s === 8) { M.brass(t, 76, A.step * 3.5, 0.5); M.brass(t, 64, A.step * 3.5, 0.3); }
            if (s === 4 || s === 12) { M.brass(t, 72, A.step * 3.5, 0.5); M.brass(t, 60, A.step * 3.5, 0.3); }
            if (s % 4 === 0) M.thump(t, 28, 0.7);
        },
        fight1: function (A, t, s, bar) { fight(A, t, s, bar, 0, 28); },
        fight2: function (A, t, s, bar) { fight(A, t, s, bar, 1, 28); },
        fight3: function (A, t, s, bar) { fight(A, t, s, bar, 2, 29); },       // a semitone up: enraged
        after_won: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0 && bar % 2 === 0) [40, 52, 56, 59, 64].forEach(function (m) { M.warm(t, m, A.bar * 2, 0.45); });
            if (s % 4 === 0) M.chime(t, [76, 80, 83, 88][(s >> 2) % 4], 0.3, 0.16);
        },
        after_lost: function (A, t, s, bar) {
            if (s === 0 && bar % 2 === 0) { A.music.sub(t, 28, A.bar * 2, 0.55); A.music.warm(t, 40, A.bar * 2, 0.3); }
            if (s === 0) A.music.thump(t, 28, 0.3);
        }
    };

    var sfx = {
        tear: function (A, t) {
            var F = A.fx;
            F.riser(t, 1.2, 40, 0.7);
            F.whoosh(t + 0.2, 1.1, 300, 7000, 0.7);
            F.revcym(t, 1.25, 0.7);
            F.swell(t, 28, 1.25, 1.4);
        },
        arrive: function (A, t) {
            var F = A.fx;
            F.thump(t, 28, 1); F.timp(t, 40, 1); F.cymbal(t, 0.6);
            [40, 47, 52, 55].forEach(function (m) { F.brass(t, m, 1.2, 0.7); });
            F.sub(t, 28, 1.6, 0.8);
        },
        hit: function (A, t, prog) {
            var F = A.fx, i = Math.min(SCALE.length - 1, Math.floor((prog || 0) * SCALE.length));
            F.wood(t, 0.55, 1.1);
            F.chime(t, SCALE[i], 0.08, 0.45);
            F.thump(t, 40, 0.25);
        },
        crack: function (A, t) { var F = A.fx; [88, 83, 79].forEach(function (m, k) { F.chime(t + k * 0.03, m, 0.3, 0.35); }); F.whoosh(t, 0.25, 6000, 2000, 0.5); },
        miss: function (A, t) { A.fx.whoosh(t, 0.15, 1500, 700, 0.2); },
        phase: function (A, t, p) {
            var F = A.fx, r = p === 2 ? 29 : 28;
            F.thump(t, r, 1); F.timp(t, r + 12, 0.9); F.cymbal(t, 0.5);
            [r + 12, r + 19, r + 24].forEach(function (m) { F.brass(t, m, 0.9, 0.75); });
            F.riser(t - 0.01, 0.4, r + 24, 0.4);
        },
        shatter: function (A, t) {
            var F = A.fx;
            [88, 86, 83, 81, 79, 76, 74, 71].forEach(function (m, k) { F.chime(t + k * 0.05, m, 0.4, 0.4); });
            F.cymbal(t, 1); F.thump(t, 28, 1); F.whoosh(t, 0.8, 7000, 900, 0.8);
        },
        win: function (A, t) {                                               // E major: the breach is sealed
            var F = A.fx;
            [52, 56, 59].forEach(function (m, k) { F.brass(t + k * 0.12, m + 12, 0.25, 0.75); });
            [40, 52, 56, 59, 64].forEach(function (m) { F.brass(t + 0.4, m, 1.6, 0.7); F.warm(t + 0.4, m, 2, 0.6); });
            F.timp(t + 0.4, 40, 1); F.cymbal(t + 0.4, 0.7);
        },
        escape: function (A, t) {
            var F = A.fx;
            [52, 55, 59].forEach(function (m) { F.keys(t, m, 1.6, 0.6, null, m - 12); });
            F.sub(t, 40, 1.8, 0.8, null, 28);
            F.whoosh(t, 1.6, 3000, 120, 0.6);
            F.thump(t + 1.7, 28, 1);
        },
        tick: function (A, t, p) { A.fx.chime(t, SCALE[Math.min(SCALE.length - 1, Math.floor((p || 0) * 8) + 4)], 0.04, 0.2); }
    };

    window.BreachScore = { bpm: 140, cues: cues, sfx: sfx, voices: [] };
})();
