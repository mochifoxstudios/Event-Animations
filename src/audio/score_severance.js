/* ═══════════════════════════════════════════════════════════════════════════
   score_severance.js — THE SEVERANCE PACKAGE's music and sound.

   Corporate hold music: a polite bossa in F major at 108 bpm, electric piano,
   a soft walking bass, a rim click and a vibraphone tune that never resolves
   anything. The kindest-sounding thing in the game, and the most sinister.
     office   the full muzak: the meeting
     hold     the same tune heard down a phone line: thin, high, a beep every
              two bars ("your call is important to us")
     signed   the muzak, slowed into one long F major 9 and gone
     declined the muzak is dropped; D minor, cold, sparse

   CUES     office · hold · signed · declined
   EFFECTS  ding · join · paper · fine · raised · final · pen · stamp ·
            shred · power_down · leave
   VOICE    the HR representative: pleasant, mid, slightly too even.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ii–V around F: Fmaj7 · Dm7 · Gm7 · C9 */
    var CHORDS = [[53, 57, 60, 64], [50, 53, 57, 60], [55, 58, 62, 65], [52, 55, 58, 62]];
    var ROOTS = [41, 38, 43, 36];
    var FIFTHS = [48, 45, 50, 43];
    var TUNE = [[76, 72, 69], [74, 72, 69], [74, 70, 67], [72, 70, 67]];   // chord tones only

    function bossa(A, t, s, bar, v) {
        var M = A.music, k = bar % 4, ch = CHORDS[k];
        if (s === 0) M.bassClean(t, ROOTS[k], A.beat * 1.4, 0.55 * v);
        if (s === 6) M.bassClean(t, FIFTHS[k], A.beat * 0.5, 0.4 * v);
        if (s === 8) M.bassClean(t, FIFTHS[k], A.beat * 1.2, 0.45 * v);
        if (s === 14) M.bassClean(t, ROOTS[k], A.beat * 0.4, 0.35 * v);
        if (s === 0 || s === 6 || s === 10) ch.forEach(function (m) { M.keys(t, m, A.step * (s === 10 ? 4 : 3), 0.13 * v); });
        if ([0, 6, 12].indexOf(s) >= 0 || (bar % 2 && s === 10)) M.wood(t, 0.22 * v, 2.2);     // clave-ish rim
        if (s % 2 === 0) M.hat(t, (s % 4 ? 0.05 : 0.08) * v);
    }

    var cues = {
        office: function (A, t, s, bar) {
            bossa(A, t, s, bar, 1);
            var tune = TUNE[bar % 4];
            if (bar >= 2 && (s === 2 || s === 8 || s === 12)) A.music.chime(t, tune[[2, 8, 12].indexOf(s)], A.step * 3, 0.13);
        },
        hold: function (A, t, s, bar) {                                       // down the phone line
            var M = A.music, k = bar % 4;
            if (s === 0 || s === 6 || s === 10) CHORDS[k].forEach(function (m) { M.keys(t, m + 12, A.step * 2, 0.12); });
            if (s === 0) M.keys(t, ROOTS[k] + 24, A.beat, 0.2);
            if (s === 2 || s === 8 || s === 12) M.chime(t, TUNE[k][[2, 8, 12].indexOf(s)] + 12, A.step * 2, 0.14);
            if (s === 0 && bar % 2 === 1) M.tick(t + A.beat * 2, 1400, 0.2);
        },
        signed: function (A, t, s, bar) {
            if (s === 0 && bar % 2 === 0) [41, 53, 57, 64, 67, 72].forEach(function (m) { A.music.warm(t, m, A.bar * 2, 0.26); });
            if (s === 8 && bar % 2 === 1) A.music.chime(t, 79, 0.6, 0.08);
        },
        declined: function (A, t, s, bar) {
            if (s === 0 && bar % 2 === 0) { A.music.sub(t, 38, A.bar * 2, 0.35); [50, 53, 57].forEach(function (m) { A.music.warm(t, m, A.bar * 2, 0.24); }); }
            if (s === 0) A.music.thump(t, 38, 0.25);
            if (s === 12 && bar % 2 === 1) A.music.keys(t, 69, A.beat, 0.12);
        }
    };

    var sfx = {
        ding: function (A, t) { A.fx.chime(t, 84, 0.4, 0.4); A.fx.chime(t + 0.14, 79, 0.7, 0.4); },
        join: function (A, t) { var F = A.fx; F.keys(t, 65, 0.15, 0.35, null, 72); F.chime(t + 0.12, 77, 0.3, 0.25); },
        paper: function (A, t) { A.fx.whoosh(t, 0.35, 2600, 900, 0.35); },
        type: function (A, t) { A.fx.tick(t, 2400 + Math.random() * 600, 0.08); },
        fine: function (A, t) { A.fx.whoosh(t, 0.25, 1800, 3200, 0.2); A.fx.tick(t, 1800, 0.15); },
        raised: function (A, t) { var F = A.fx; [65, 69, 72, 77].forEach(function (m, k) { F.chime(t + k * 0.09, m + 12, 0.5, 0.32); }); F.keys(t, 53, 0.6, 0.3); },
        final: function (A, t) { var F = A.fx; F.keys(t, 60, 0.4, 0.4); F.keys(t + 0.3, 53, 0.9, 0.4); F.thump(t + 0.3, 29, 0.6); },
        pen: function (A, t) {
            var F = A.fx;
            for (var k = 0; k < 9; k++) F.whoosh(t + k * 0.09 + Math.random() * 0.03, 0.07, 3200 + Math.random() * 1600, 2200, 0.22);
        },
        stamp: function (A, t) { var F = A.fx; F.thump(t, 33, 1); F.wood(t, 1, 0.7); },
        shred: function (A, t) {
            var F = A.fx;
            for (var k = 0; k < 10; k++) F.whoosh(t + k * 0.12, 0.16, 900 + (k % 3) * 300, 300, 0.4);
            F.sub(t, 31, 1.3, 0.35);
        },
        power_down: function (A, t) { var F = A.fx; F.sub(t, 41, 1.6, 0.6, null, 24); F.whoosh(t, 1.2, 4000, 120, 0.4); F.chime(t, 77, 1.2, 0.18); },
        leave: function (A, t) { A.fx.keys(t, 72, 0.15, 0.3, null, 65); }
    };

    /* the HR representative */
    var VOICES = [{ f: 230, type: 'triangle', formant: 1100, q: 4, up: 1.06, down: 0.95, len: 0.07, gain: 0.22, gap: 0.06 }];

    window.SeveranceScore = { bpm: 108, cues: cues, sfx: sfx, voices: VOICES };
})();
