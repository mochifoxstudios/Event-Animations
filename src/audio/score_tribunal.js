/* ═══════════════════════════════════════════════════════════════════════════
   score_tribunal.js — THE DUCK TRIBUNAL's music and sound.

   A courtroom in D minor at 66 bpm: organ, timpani, a drone under everything.
   The Council grades you; the Tribunal judges you, and it sounds like it.

   CUES
     allrise                organ chord swelling over a low drone
     hearing_sentencers     heavy: low brass hits a semitone apart, timpani on
                            the off-beat, a dissonant pad
     hearing_bureaucrats    clerical: a typewriter, a pizzicato ostinato, a
                            desk bell every two bars
     hearing_philosophers   the yellow glow: a choir and slow bells
     confer                 a heartbeat, and an ostinato that climbs
     after                  the drone, and one bell
   STINGERS  sentence(verdict) — the hit; GUILTY is crueller
   EFFECTS   knock · gavel · rise(seat) · docket · stamp(kind) · flash · murmur(seat)
   VOICES    the same five bodies as the Council. THE SILENT ONE (seat 4) has no
             voice: its line is a squeak, played as an effect.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* Dm · Bb · Gm · A */
    var PROG = [[38, 50, 53, 57], [34, 50, 53, 58], [31, 50, 55, 58], [33, 49, 52, 57]];

    function common(A, t, s, bar, organ) {
        var M = A.music, c = PROG[bar % 4];
        if (s === 0 && bar % 2 === 0) { M.pad(t, 38, A.bar * 2, 0.8); M.pad(t, 45, A.bar * 2, 0.5); }
        if (s === 0 && organ !== false) for (var k = 1; k < 4; k++) M.organ(t, c[k], A.bar * 0.95, 0.55);
        if (s === 0) M.bass(t, c[0], A.bar * 0.9, 0.5);
    }

    var cues = {
        allrise: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0) {
                M.pad(t, 26, A.bar, 0.9);
                [50, 53, 57, 62].forEach(function (m) { M.organ(t, m, A.bar * 0.98, 0.7); });
            }
        },
        hearing_sentencers: function (A, t, s, bar) {
            var M = A.music;
            common(A, t, s, bar);
            if (s === 0) M.timp(t, 38, 0.8);
            if (s === 10) M.timp(t, 38, 0.5);
            if (s === 0) M.brass(t, 38, A.beat * 1.4, 0.55);
            if (s === 6) M.brass(t, 39, A.beat, 0.45);                  // the semitone that should not be there
            if (s === 0 && bar % 2 === 1) M.pad(t, 51, A.bar, 0.6);
        },
        hearing_bureaucrats: function (A, t, s, bar) {
            var M = A.music;
            common(A, t, s, bar, false);
            if (Math.random() < 0.45) M.hat(t, 0.25 + Math.random() * 0.3);      // the typewriter
            if (s % 2 === 0) M.pluck(t, [62, 65, 69, 65][(s >> 1) % 4], A.step * 1.5, 0.3);
            if (s === 14 && bar % 2 === 1) M.bell(t, 84, 0.2, 0.45);              // ding
            if (s === 0) M.timp(t, 38, 0.35);
        },
        hearing_philosophers: function (A, t, s, bar) {
            var M = A.music;
            common(A, t, s, bar, false);
            if (s === 0) [50, 57, 62, 64].forEach(function (m) { M.choir(t, m, A.bar * 0.98, 0.7); });
            if (s === 0 || s === 8) M.bell(t, [74, 76, 81, 79][(bar * 2 + (s >> 3)) % 4], 0.6, 0.35);
        },
        confer: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0 || s === 8) M.kick(t, 0.8);                      // lub
            if (s === 2 || s === 10) M.kick(t, 0.5);                     // dub
            if (s % 2 === 0) M.pluck(t, (s % 4 === 0 ? 57 : 58) + bar, A.step, 0.25 + bar * 0.08);
            if (s === 0) M.pad(t, 50 + bar, A.bar, 0.5 + bar * 0.15);
        },
        after: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0 && bar % 2 === 0) M.pad(t, 38, A.bar * 2, 0.6);
            if (s === 0 && bar % 2 === 1) M.bell(t, 69, 1, 0.25);
        }
    };

    var sfx = {
        knock: function (A, t) { A.fx.wood(t, 1, 1.4); A.fx.timp(t, 26, 0.35); },
        gavel: function (A, t) { A.fx.wood(t, 1, 1); A.fx.wood(t + 0.02, 0.5, 1.7); },
        rise: function (A, t, seat) { A.fx.whoosh(t, 0.45, 300, 1200, 0.35); if (VOICES[seat]) A.fx.syllable(t + 0.35, VOICES[seat], 0.5); },
        docket: function (A, t) { A.fx.whoosh(t, 0.4, 4000, 1500, 0.6); A.fx.wood(t + 0.38, 0.2, 2.2); },
        stamp: function (A, t, kind) {
            var F = A.fx;
            F.kick(t, kind === 'sentence' ? 1 : 0.7);
            F.wood(t, 0.7, 1.3);
            F.whoosh(t, 0.12, 3000, 1200, 0.5);
        },
        flash: function (A, t) { A.fx.cymbal(t, 0.5); },
        squeak: function (A, t) {                                       // THE SILENT ONE's only line
            A.fx.syllable(t, { f: 1500, type: 'sine', formant: 2600, q: 1, up: 0.9, down: 1.25, len: 0.35, gain: 0.3, dry: 0.8 }, 1);
        },
        murmur: function (A, t, seat) {
            var v = VOICES[seat]; if (!v) return;
            var low = { f: v.f * 0.8, type: v.type, formant: v.formant * 0.8, q: v.q, up: 1.1, down: 0.9, len: 0.1, gain: v.gain * 0.5, dry: v.dry };
            for (var k = 0; k < 3; k++) A.fx.syllable(t + k * 0.13, low, 0.7);
        },
        sentence: function (A, t, verdict) {
            var F = A.fx;
            for (var k = 0; k < 8; k++) F.timp(t + k * 0.05, 38, 0.25 + k * 0.08);    // the roll
            var hit = t + 0.42;
            [26, 38, 50, 53, 57].forEach(function (m) { F.brass(hit, m, 1.4, 0.9); });
            if (verdict === 4) { F.brass(hit, 51, 1.4, 0.8); F.brass(hit, 56, 1.4, 0.7); } // GUILTY: the cluster
            F.kick(hit, 1); F.cymbal(hit, 0.8); F.timp(hit, 38, 1);
        }
    };

    var VOICES = [
        { f: 120, type: 'square',   formant: 700,  q: 2,   up: 1.25, down: 0.75, len: 0.09, gain: 0.3 },
        { f: 220, type: 'sawtooth', formant: 1500, q: 4,   up: 1.35, down: 0.85, len: 0.07, gain: 0.3 },
        { f: 880, type: 'sine',     formant: 1900, q: 1,   up: 0.85, down: 1.4,  len: 0.06, gain: 0.22, dry: 0.7 },
        { f: 170, type: 'triangle', formant: 1000, q: 2.5, up: 1.3,  down: 0.8,  len: 0.08, gain: 0.35 },
        null
    ];

    window.TribunalScore = { bpm: 66, cues: cues, sfx: sfx, voices: VOICES };
})();
