/* ═══════════════════════════════════════════════════════════════════════════
   score_captcha.js — THE CAPTCHA's music and sound.

   A sterile machine audit in B minor at 120 bpm: a quiet sixteenth-note
   arpeggio, a clean pulse, a clock. The tiles are pitched notes of the chord
   (B · D · F♯ · A, higher as you select more). Passing lands on D major in
   bright bleeps; failing is a two-note "error" falling F♯ → B.

   CUES     audit · verify · passed · failed
   EFFECTS  open · check · spin · grid · tile_on(n) · tile_off · human_up ·
            human_down · verify · pass · fail · warn · tax · reward
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var ARP = [59, 62, 66, 69, 66, 62, 59, 62];              // B minor 7
    var ARP2 = [55, 59, 62, 66, 62, 59, 55, 59];             // G major 7, every other bar
    var TILE = [71, 74, 78, 81, 83, 86, 90, 93, 95];

    var cues = {
        audit: function (A, t, s, bar) {
            var M = A.music, arp = bar % 4 === 3 ? ARP2 : ARP;
            M.keys(t, arp[s % 8] + (s >= 8 ? 12 : 0), A.step * 0.8, 0.06);
            if (s % 4 === 0) M.thump(t, bar % 4 === 3 ? 31 : 35, 0.3);
            if (s % 4 === 2) M.tick(t, 3200, 0.05);
            if (s === 0) M.bassClean(t, bar % 4 === 3 ? 43 : 47, A.beat * 3, 0.3);
        },
        verify: function (A, t, s) { A.music.tick(t, 2000 + s * 120, 0.07); if (s % 4 === 0) A.music.thump(t, 35, 0.25); },
        passed: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0 && bar % 2 === 0) [50, 62, 66, 69, 74].forEach(function (m) { M.warm(t, m, A.bar * 2, 0.24); });
            if (s % 4 === 0) M.chime(t, [74, 78, 81, 86][(s >> 2) % 4], 0.3, 0.08);
        },
        failed: function (A, t, s, bar) {
            if (s === 0 && bar % 2 === 0) { A.music.sub(t, 35, A.bar * 2, 0.3); [59, 62, 66].forEach(function (m) { A.music.warm(t, m, A.bar * 2, 0.18); }); }
            if (s === 0) A.music.thump(t, 35, 0.25);
        }
    };

    var sfx = {
        open: function (A, t) { A.fx.whoosh(t, 0.3, 800, 3000, 0.3); A.fx.chime(t + 0.1, 83, 0.3, 0.25); },
        check: function (A, t) { A.fx.tick(t, 1800, 0.35); A.fx.wood(t, 0.3, 0.5); },
        spin: function (A, t) { for (var k = 0; k < 6; k++) A.fx.tick(t + k * 0.12, 2400 + k * 200, 0.08); },
        grid: function (A, t) { A.fx.whoosh(t, 0.35, 600, 2400, 0.35); A.fx.keys(t + 0.05, 71, 0.2, 0.25); },
        tile_on: function (A, t, n) { A.fx.keys(t, TILE[Math.min(8, n || 0)], 0.15, 0.35); A.fx.tick(t, 2600, 0.12); },
        tile_off: function (A, t) { A.fx.keys(t, 59, 0.12, 0.25); },
        human_up: function (A, t) { A.fx.keys(t, 66, 0.12, 0.2, null, 71); },
        human_down: function (A, t) { A.fx.keys(t, 71, 0.12, 0.2, null, 66); },
        verify: function (A, t) { A.fx.tick(t, 1500, 0.4); A.fx.whoosh(t, 0.25, 2000, 600, 0.25); },
        pass: function (A, t) {
            var F = A.fx;
            [74, 78, 81, 86].forEach(function (m, k) { F.keys(t + k * 0.07, m, 0.2, 0.45); });
            [50, 62, 66, 69].forEach(function (m) { F.warm(t + 0.28, m, 1.6, 0.8); });
            F.chime(t + 0.28, 90, 0.8, 0.25);
        },
        fail: function (A, t) {
            var F = A.fx;
            F.keys(t, 66, 0.16, 0.6); F.keys(t + 0.18, 59, 0.5, 0.6);
            F.thump(t + 0.18, 35, 0.8);
        },
        warn: function (A, t) { A.fx.keys(t, 71, 0.2, 0.4); A.fx.keys(t + 0.25, 71, 0.2, 0.4); A.fx.keys(t + 0.5, 66, 0.4, 0.4); },
        tax: function (A, t) { var F = A.fx; F.sub(t, 47, 1.4, 0.55, null, 35); F.thump(t, 35, 0.9); F.whoosh(t, 1, 2000, 300, 0.35); },
        reward: function (A, t) { var F = A.fx; [86, 90, 93].forEach(function (m, k) { F.chime(t + k * 0.08, m, 0.4, 0.3); }); }
    };

    window.CaptchaScore = { bpm: 120, cues: cues, sfx: sfx, voices: [] };
})();
