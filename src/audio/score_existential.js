/* ═══════════════════════════════════════════════════════════════════════════
   score_existential.js — THE EXISTENTIAL CRISIS's music and sound.

   ONE KEY, TWO MOODS. Everything is built on D, so nothing in the scene is out
   of tune with anything else:
     · before the break, the game's cheerful loop is in D MAJOR (D · Bm · G · A);
     · at the break it TAPE-STOPS — the same chord slides down an octave and dies;
     · after it, the same tonic in D MINOR (Dm · B♭ · Gm · A), slow and quiet.
   Every effect is a pitched note in that key: the clicks climb the D major
   arpeggio, the falling digits are a descending D minor chime, the typed
   question walks a muted D minor figure, the fragments sparkle on a D major
   pentatonic. The only unpitched sounds are wood, breath and noise risers.

   The four answers each have a chord on D, heard on hover and swelling while
   held:  POWER  open octaves and a fifth, low (D1 D2 A2 D3)
          NUMBERS  F major 7 — cool, clean, counting
          FUN    D major add 9 — the major key coming back
          VOID   a hollow fifth with no third (D A E): nothing to resolve to

   Instruments: keys (soft electric piano), warm (filtered pad), sub, thump,
   chime (harmonic, not metallic), riser, breath — event_audio.js.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var _ = null;

    /* D major: D · Bm · G · A — [bass, chord tones] */
    var BOARD = [[38, 62, 66, 69], [35, 62, 66, 71], [43, 62, 67, 71], [45, 61, 64, 69]];
    var BOARD_TUNE = [
        [74, _, _, _, 78, _, 76, _, 74, _, _, _, 69, _, _, _],
        [71, _, _, _, 74, _, 73, _, 71, _, _, _, 66, _, _, _],
        [67, _, _, _, 71, _, 74, _, 79, _, _, _, 78, _, _, _],
        [76, _, _, _, 73, _, 69, _, 73, _, 76, _, _, _, _, _]
    ];
    /* D natural minor: Dm · B♭ · Gm · Am, voice-led around D4. ⚠ Am, not A major: the
       major V's C♯ was measured clashing with whichever answer the player hovered. */
    var MINOR = [[38, 57, 62, 65], [34, 58, 62, 65], [31, 58, 62, 67], [33, 57, 60, 64]];
    var CHORDS = [[26, 38, 45, 50], [53, 57, 60, 64], [62, 66, 69, 76], [38, 45, 52]];
    var ARP = [74, 78, 81, 86];                   // the clicks climb this
    var LETTERS = [62, 65, 69, 65, 62, 57];       // the question walks this
    var SPARKLE = [86, 88, 90, 93, 95, 98];       // D major pentatonic, up high

    var clickN = 0, letterN = 0;

    var cues = {
        /* the game as the player knows it — bright, a little proud of itself */
        board: function (A, t, s, bar) {
            var M = A.music, c = BOARD[bar % 4];
            if (s === 0 || s === 8) M.thump(t, 38, 0.45);
            if (s % 4 === 2) M.hat(t, 0.18);
            if (s % 4 === 0) M.bass(t, c[0], A.step * 2.5, 0.7);
            if (s % 2 === 0) M.keys(t, c[1 + (s >> 1) % 3], A.step * 1.5, 0.45);
            var m = BOARD_TUNE[bar % 4][s];
            if (m) M.chime(t, m, A.step * 2, 0.65);
        },
        /* the question: half-time, D minor, a heartbeat under it */
        question: function (A, t, s, bar) {
            var M = A.music, c = MINOR[(bar >> 1) % 4];
            if (s === 0 && bar % 2 === 0) {
                M.sub(t, c[0], A.bar * 2, 0.6);
                for (var k = 1; k < 4; k++) M.warm(t, c[k], A.bar * 2, 0.55);
            }
            if (s === 0) M.thump(t, 26, 0.32);
            if (s === 3) M.thump(t, 26, 0.18);
            if (s === 8 && bar % 2 === 1) M.keys(t, c[3] + 12, A.beat * 3, 0.22);
        },
        /* the answers wait: only the root and the heartbeat. Each answer's chord colours the
           silence on its own when hovered, with nothing underneath to clash against. */
        answers: function (A, t, s, bar) {
            var M = A.music;
            if (s === 0 && bar % 2 === 0) { M.sub(t, 26, A.bar * 2, 0.55); M.sub(t, 38, A.bar * 2, 0.2); }
            if (s === 0) M.thump(t, 26, 0.3);
            if (s === 3) M.thump(t, 26, 0.16);
        },
        /* what each answer leaves behind */
        after_vignette: function (A, t, s, bar) {                // POWER: a low pulse that does not stop
            var M = A.music;
            if (s === 0 || s === 8) M.thump(t, 26, s === 0 ? 0.5 : 0.3);
            if (s === 0 && bar % 2 === 0) { M.sub(t, 26, A.bar * 2, 0.5); M.sub(t, 45, A.bar * 2, 0.25); M.sub(t, 50, A.bar * 2, 0.2); }
            if (s === 12 && bar % 4 === 3) M.keys(t, 57, A.beat, 0.25, null, 62);
        },
        after_shift: function (A, t, s, bar) {                   // NUMBERS: F major 7, counting softly
            var M = A.music;
            if (s % 2 === 0) M.keys(t, [65, 69, 72, 76][(s >> 1) % 4], A.step, 0.16);
            if (s === 0 && bar % 2 === 0) { M.warm(t, 53, A.bar * 2, 0.4); M.sub(t, 41, A.bar * 2, 0.35); }
        },
        after_figure: function (A, t, s, bar) {                  // FUN: a music box in D major
            var M = A.music;
            var tune = [74, 78, 81, 78, 79, 76, 74, _, 74, 78, 81, 86, 85, 81, 79, _];
            var m = tune[(bar % 2) * 8 + (s >> 1)];
            if (s % 2 === 0 && m) M.chime(t, m, 0.3, 0.32);
            if (s === 0 && bar % 2 === 0) { M.warm(t, 62, A.bar * 2, 0.35); M.warm(t, 66, A.bar * 2, 0.3); }
        },
        after_drain: function (A, t, s, bar) {                   // VOID: only an open fifth is left, pure sines
            if (s === 0 && bar % 2 === 0) { A.music.sub(t, 26, A.bar * 2, 0.5); A.music.sub(t, 45, A.bar * 2, 0.22); }
        },
        after_none: function (A, t, s, bar) {
            if (s === 0 && bar % 2 === 0) A.music.warm(t, 50, A.bar * 2, 0.4);
        }
    };

    var sfx = {
        /* 1 · the break */
        click: function (A, t) {
            A.fx.chime(t, ARP[clickN++ % 4], 0.08, 0.45);
            A.fx.wood(t, 0.12, 2.6);
        },
        glitch: function (A, t) {                                       // the loop tape-stops and stutters
            var F = A.fx;
            [62, 66, 69, 74].forEach(function (m) { F.keys(t, m, 0.85, 0.5, null, m - 12); });
            F.sub(t, 38, 0.85, 0.6, null, 26);
            for (var k = 0; k < 7; k++) F.chime(t + k * (0.11 - k * 0.008), 86, 0.03, 0.5 - k * 0.06);
            F.riser(t, 0.8, 62, 0.25);
        },
        cut: function (A, t) { A.fx.thump(t, 26, 1); },                 // then nothing at all
        heartbeat: function (A, t) { A.fx.thump(t, 26, 0.9); A.fx.thump(t + 0.24, 26, 0.55); },
        shatter: function (A, t) {                                      // the digits fall: D minor, descending
            [86, 81, 77, 74, 69, 65, 62].forEach(function (m, k) { A.fx.chime(t + k * 0.16, m, 0.4, 0.38 - k * 0.03); });
        },

        /* 2 · the question */
        key: function (A, t) { A.fx.keys(t, LETTERS[letterN++ % LETTERS.length], 0.12, 0.3); A.fx.thump(t, 38, 0.12); },
        key_soft: function (A, t) { A.fx.keys(t, 74, 0.05, 0.1); },
        whisper: function (A, t) { A.fx.breath(t, 0.6 + Math.random() * 0.4, 0.3, Math.random() < 0.5 ? 'ah' : 'oo'); },

        /* 3 · the answers */
        reveal: function (A, t) { [62, 65, 69, 74].forEach(function (m, i) { A.fx.chime(t + i * 0.2, m + 12, 0.5, 0.32); }); },
        hover: function (A, t, i) {
            var c = CHORDS[i % 4], top = c[c.length - 1];
            A.fx.chime(t, top < 60 ? top + 24 : top + 12, 0.3, 0.26);
            A.fx.sub(t, c[0] < 30 ? c[0] + 12 : c[0], 0.4, 0.25);
        },
        hold: function (A, t, i) {
            var c = CHORDS[i % 4];
            if (i % 4 === 3) c.forEach(function (m) { A.fx.sub(t, m, 1.1, 0.6); });   // VOID stays hollow: pure sines
            else c.forEach(function (m) { A.fx.warm(t, m < 36 ? m + 12 : m, 1.1, 0.75); });
            A.fx.riser(t, 1.1, c[1] || c[0], 0.6);
        },
        release: function (A, t) { A.fx.breath(t, 0.3, 0.2, 'oo'); },

        /* 4 · the consequences */
        choose_vignette: function (A, t) {                              // POWER: the floor drops, octaves on D
            var F = A.fx;
            F.thump(t, 26, 1); F.sub(t, 26, 2.4, 1);
            [38, 45, 50].forEach(function (m) { F.warm(t, m, 2.2, 1.3); });
            [38, 45, 50, 57].forEach(function (m) { F.keys(t, m, 1.4, 0.75); });   // struck octaves and fifths, no brass: it adds a third
            F.timp(t, 38, 0.9); F.cymbal(t, 0.35);
            F.timp(t + 0.55, 33, 0.7);
            F.keys(t + 1.1, 57, 0.6, 0.5, null, 62);
        },
        choose_shift: function (A, t) {                                 // NUMBERS: F major 7 climbing two octaves
            [65, 69, 72, 76, 77, 81, 84, 88].forEach(function (m, k) { A.fx.chime(t + k * 0.065, m, 0.12, 0.4); });
            A.fx.sub(t, 41, 1.2, 0.5);
        },
        count: function (A, t, k) { A.fx.chime(t, [77, 81, 84, 88][k % 4], 0.04, 0.18); },
        fracture: function (A, t) {
            var F = A.fx;
            F.thump(t, 26, 1); F.wood(t, 0.8, 0.7);
            [38, 45, 50].forEach(function (m) { F.keys(t, m, 0.3, 0.7); });
            F.whoosh(t, 0.35, 4000, 600, 0.5);
        },
        choose_figure: function (A, t) {                                // FUN: the major key comes back
            [74, 78, 81, 86, 88].forEach(function (m, k) { A.fx.chime(t + k * 0.09, m, 0.35, 0.42); });
            [62, 66, 69].forEach(function (m) { A.fx.warm(t + 0.3, m, 1.4, 0.8); });
        },
        shard: function (A, t) { A.fx.chime(t, SPARKLE[(Math.random() * SPARKLE.length) | 0], 0.08, 0.22); },
        figure: function (A, t) {
            var F = A.fx;
            [62, 66, 69, 74].forEach(function (m) { F.warm(t, m, 2.4, 0.7); });
            F.chime(t + 1.7, 86, 0.2, 0.25); F.chime(t + 1.85, 81, 0.4, 0.2);    // a small, curious sound
        },
        choose_drain: function (A, t) {                                 // VOID: the minor chord tape-stops into nothing
            var F = A.fx;
            [50, 57, 62, 65].forEach(function (m) { F.warm(t, m, 2.4, 1.1, null, m - 12); F.keys(t, m, 2.2, 0.35, null, m - 12); });
            F.sub(t, 38, 2.6, 0.8, null, 26);
        },
        crack: function (A, t) { A.fx.wood(t, 0.9, 0.7); A.fx.wood(t + 0.05, 0.5, 0.5); A.fx.thump(t, 26, 0.8); A.fx.breath(t + 0.1, 1.6, 0.25, 'oo'); },
        choose_none: function (A, t) { A.fx.chime(t, 74, 0.6, 0.4); }
    };

    window.ExistentialScore = { bpm: 120, cues: cues, sfx: sfx, voices: [] };
})();
