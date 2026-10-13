/* ═══════════════════════════════════════════════════════════════════════════
   score_dilemma.js — THE PRISONER'S DILEMMA's music and sound.

   A two-person standoff in A minor at 96 bpm: a walking bass, a clock, a held
   breath. Every outcome has its own chord, all on A:
     both share  → A major, warm         (it worked)
     you steal   → A minor add 9, sly    (you won; it does not feel clean)
     they steal  → falling to F, hollow  (betrayed)
     both steal  → a cluster that burns  (nobody eats)

   CUES     scan · terms · decide · wait · after_SS · after_TS · after_ST · after_TT
   EFFECTS  static · found · hover(c) · tick · tick_last · lock · their_lock ·
            flip · out_SS · out_TS · out_ST · out_TT · chip · burn
   VOICE    the other operator speaks in short radio blips.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var WALK = [33, 36, 40, 43, 41, 40, 38, 36];                 // A minor, walking
    var AM = [57, 60, 64], AMAJ = [45, 57, 61, 64, 69];

    var cues = {
        scan: function (A, t, s, bar) { if (s === 0) A.music.sub(t, 33, A.bar, 0.4); },
        terms: function (A, t, s, bar) {
            var M = A.music;
            if (s % 4 === 0) M.bassClean(t, WALK[((bar * 4) + (s >> 2)) % 8], A.beat * 0.8, 0.6);
            if (s === 0 && bar % 2 === 0) AM.forEach(function (m) { M.warm(t, m, A.bar * 2, 0.35); });
            if (s % 4 === 2) M.hat(t, 0.15);
            if (s === 14 && bar % 2 === 1) M.keys(t, 76, 0.4, 0.2);
        },
        decide: function (A, t, s, bar) {
            var M = A.music;
            if (s % 4 === 0) M.bassClean(t, WALK[((bar * 4) + (s >> 2)) % 8], A.beat * 0.6, 0.7);
            if (s === 0 || s === 8) M.thump(t, 33, 0.45);
            if (s % 2 === 0) M.keys(t, [69, 72, 76, 72][(s >> 1) % 4] + (bar % 2 ? 0 : -12), A.step, 0.16);
            if (s === 0) [57, 60, 64, 71].forEach(function (m) { M.warm(t, m, A.bar, 0.3); });
        },
        wait: function (A, t, s, bar) {                                      // the held breath: only a heartbeat
            if (s === 0) A.music.thump(t, 33, 0.7);
            if (s === 3) A.music.thump(t, 33, 0.4);
            if (s === 0 && bar % 2 === 0) A.music.sub(t, 33, A.bar * 2, 0.4);
        },
        after_SS: function (A, t, s, bar) {
            if (s === 0 && bar % 2 === 0) AMAJ.forEach(function (m) { A.music.warm(t, m, A.bar * 2, 0.35); });
            if (s % 4 === 0) A.music.chime(t, [81, 85, 88, 93][(s >> 2) % 4], 0.3, 0.12);
        },
        after_TS: function (A, t, s, bar) {
            if (s === 0 && bar % 2 === 0) [45, 57, 60, 64, 71].forEach(function (m) { A.music.warm(t, m, A.bar * 2, 0.32); });
            if (s % 4 === 0) A.music.bassClean(t, WALK[(bar * 4 + (s >> 2)) % 8], A.beat * 0.7, 0.4);
        },
        after_ST: function (A, t, s, bar) {
            if (s === 0 && bar % 2 === 0) { A.music.sub(t, 29, A.bar * 2, 0.4); [53, 57, 60].forEach(function (m) { A.music.warm(t, m, A.bar * 2, 0.3); }); }
        },
        after_TT: function (A, t, s, bar) {
            if (s === 0 && bar % 2 === 0) A.music.sub(t, 33, A.bar * 2, 0.45);
            if (s === 0) A.music.thump(t, 33, 0.3);
        }
    };

    var sfx = {
        static: function (A, t) {
            var F = A.fx;
            for (var k = 0; k < 7; k++) F.whoosh(t + k * 0.3, 0.28, 400 + k * 500, 2400 - k * 150, 0.45);
            F.riser(t, 2, 45, 0.25);
        },
        found: function (A, t) { var F = A.fx; F.chime(t, 81, 0.3, 0.45); F.chime(t + 0.12, 88, 0.5, 0.4); F.thump(t, 33, 0.6); },
        hover: function (A, t, c) { A.fx.chime(t, c === 'S' ? 76 : 75, 0.15, 0.18); },
        tick: function (A, t) { A.fx.wood(t, 0.4, 2); },
        tick_last: function (A, t) { A.fx.wood(t, 0.7, 1.6); A.fx.chime(t, 81, 0.1, 0.3); },
        lock: function (A, t) { var F = A.fx; F.wood(t, 1, 0.9); F.thump(t, 33, 0.8); F.keys(t, 57, 0.3, 0.4); },
        their_lock: function (A, t) { var F = A.fx; F.wood(t, 0.9, 1.1); F.thump(t, 33, 0.6); F.keys(t, 52, 0.3, 0.35); },
        flip: function (A, t) { A.fx.whoosh(t, 0.5, 600, 4000, 0.6); A.fx.revcym(t, 0.6, 0.5); },
        out_SS: function (A, t) {
            var F = A.fx;
            AMAJ.forEach(function (m) { F.warm(t, m, 2.4, 1); });
            [69, 73, 76, 81].forEach(function (m, k) { F.chime(t + k * 0.12, m + 12, 0.5, 0.4); });
        },
        out_TS: function (A, t) {
            var F = A.fx;
            [45, 57, 60, 64, 71].forEach(function (m) { F.warm(t, m, 2.2, 0.9); });
            F.keys(t, 64, 0.4, 0.5); F.keys(t + 0.2, 71, 0.6, 0.5);
            F.brass(t + 0.1, 57, 0.8, 0.4, null, 59);
        },
        out_ST: function (A, t) {
            var F = A.fx;
            [57, 60, 64].forEach(function (m) { F.keys(t, m + 12, 1.4, 0.5, null, m + 7); });
            F.sub(t, 33, 2, 0.7, null, 29);
            F.thump(t, 29, 0.9);
        },
        out_TT: function (A, t) {
            var F = A.fx;
            [57, 58, 63, 64].forEach(function (m) { F.warm(t, m, 1.6, 0.9); });
            F.thump(t, 33, 1); F.cymbal(t, 0.5); F.whoosh(t, 1.4, 5000, 200, 0.6);
        },
        chip: function (A, t) { A.fx.chime(t, [81, 85, 88, 93][(Math.random() * 4) | 0], 0.05, 0.18); },
        burn: function (A, t) { A.fx.whoosh(t, 0.4, 3000, 600, 0.35); }
    };

    /* the other operator: clipped radio blips */
    var VOICES = [{ f: 520, type: 'square', formant: 1600, q: 3, up: 1.05, down: 0.95, len: 0.05, gain: 0.16, gap: 0.07 }];

    window.DilemmaScore = { bpm: 96, cues: cues, sfx: sfx, voices: VOICES };
})();
