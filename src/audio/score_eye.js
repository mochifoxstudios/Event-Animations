/* ═══════════════════════════════════════════════════════════════════════════
   score_eye.js — THE EYE OF THE STORM's music and sound.

   The storm is noise: rain, wind, thunder, a low rumble on G. The eye is
   G major and almost nothing: a G drone, a few high chimes, and the breath.
   The breath is played by the scene, not the clock, so it is exactly in time
   with the orb: an inhale swells up a G 6/9, an exhale settles down onto
   C major 7 over G. In the last ten seconds the wind comes back under it.

   CUES     storm · calm · closing
   EFFECTS  thunder · rain(dur) · open · drain · inhale · exhale · synced ·
            mini · back · return
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    function wind(A, t, dur, v, bus) {
        var F = bus || A.music;
        F.whoosh(t, dur, 300 + Math.random() * 300, 900 + Math.random() * 900, v);
    }

    var cues = {
        storm: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0) M.sub(t, 31, A.bar, 0.45);
            if (s % 4 === 0) wind(A, t, A.beat * 1.6, 0.5);
            if (s % 2 === 1) M.whoosh(t, 0.08, 5000 + Math.random() * 3000, 3000, 0.25);   // rain
            if (s === 6 && bar % 2) M.thump(t, 31, 0.5);
        },
        calm: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0 && bar % 2 === 0) { M.sub(t, 31, A.bar * 2, 0.3); M.warm(t, 43, A.bar * 2, 0.22); }
            if (s === 8 && bar % 4 === 1) M.chime(t, [86, 83, 81, 79][(bar >> 2) % 4], 1.2, 0.07);
        },
        closing: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0) M.sub(t, 31, A.bar, 0.35);
            if (s % 8 === 0) wind(A, t, A.beat * 2.5, 0.18 + Math.min(0.2, bar * 0.06));
            if (s % 4 === 2) M.tick(t, 1800, 0.06);
        }
    };

    var sfx = {
        thunder: function (A, t) {
            var F = A.fx;
            F.thump(t, 26, 1); F.sub(t, 26, 1.2, 0.6, null, 21);
            F.whoosh(t, 1.6, 900, 120, 0.8); F.whoosh(t + 0.05, 0.3, 4000, 1500, 0.5);
        },
        rain: function (A, t, dur) {
            var F = A.fx; dur = dur || 2;
            for (var k = 0; k < dur * 10; k++) F.whoosh(t + k * 0.1 + Math.random() * 0.05, 0.07, 4000 + Math.random() * 4000, 2500, 0.18);
        },
        open: function (A, t) {                                   // the eye opens: the storm falls away into G
            var F = A.fx;
            F.whoosh(t, 2.2, 1200, 150, 0.6);
            [43, 55, 59, 62, 69].forEach(function (m, k) { F.warm(t + 0.3 + k * 0.12, m, 3.5, 0.75); });
            [74, 79, 83, 86].forEach(function (m, k) { F.chime(t + 0.8 + k * 0.22, m, 1.2, 0.22); });
        },
        drain: function (A, t) { A.fx.chime(t, 91, 0.1, 0.05); },
        inhale: function (A, t, dur) {                            // G 6/9 (no F#: it must sit under the C chord's tail), swelling up
            var F = A.fx; dur = dur || 4;
            [55, 59, 62, 64, 69].forEach(function (m) { F.warm(t, m, dur * 0.85, 0.3); });
            [74, 79, 81].forEach(function (m, k) { F.chime(t + dur * (0.25 + k * 0.22), m, 1, 0.07); });
            F.breath(t, dur * 0.9, 0.3, 'a');
        },
        exhale: function (A, t, dur) {                            // C major 7 over G, settling
            var F = A.fx; dur = dur || 4;
            [55, 60, 64, 67, 71].forEach(function (m) { F.warm(t, m, dur * 0.85, 0.26); });
            [83, 79, 76].forEach(function (m, k) { F.chime(t + dur * (0.15 + k * 0.22), m, 1, 0.06); });
            F.breath(t, dur * 0.9, 0.22, 'o');
        },
        synced: function (A, t) { A.fx.chime(t, 86, 0.6, 0.18); A.fx.chime(t + 0.1, 91, 0.8, 0.12); },
        mini: function (A, t) { A.fx.keys(t, 67, 0.3, 0.25, null, 62); },
        back: function (A, t) { A.fx.keys(t, 62, 0.3, 0.25, null, 67); },
        return: function (A, t) {
            var F = A.fx;
            F.thump(t, 26, 1); F.sub(t, 31, 2, 0.6, null, 26);
            F.whoosh(t, 2.4, 200, 1400, 0.7); F.cymbal(t, 0.3);
            [55, 58, 62].forEach(function (m) { F.warm(t, m, 1.6, 0.6); });
        }
    };

    window.EyeScore = { bpm: 60, cues: cues, sfx: sfx, voices: [] };
})();
