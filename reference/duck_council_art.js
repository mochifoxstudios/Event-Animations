/* ═══════════════════════════════════════════════════════════════════════════
   THE DUCKY COUNCIL — THE CHAMBER, HAND-AUTHORED.

   Owner, 2026-08-31: *"The duck tribunal, or the ducks, one of the most important
   parts of the game, feel like they were something added on last minute instead of
   truly thought out, in part due to the terrible layout and that there are no
   animations or proper graphics."*

   ⭐ MEASURED BEFORE ANYTHING WAS DRAWN — `tools/probe_council.js`, and the numbers
   say the complaint plainly. On a 1920×1080 screen:

     | | Tribunal | Council |
     | staging          | full-bleed, board blacked out | **520×527 — 27% of the width** |
     | the board behind | dimmed and blurred            | **fully lit**: HUD, nav, six live notifications |
     | the five         | seated at a bench             | **five bordered tiles**, reading as a shop grid |
     | animating at rest| three named beats             | ⛔ **zero elements, zero keyframes** |

   ⛔⛔ THE REAL FAULT IS THAT IT NEVER TAKES THE SCREEN. The tribunal stages a
   scene; the Council is a dialog box floating on a live dashboard. That — more
   than the art — is what "added on last minute" actually looks like.

   ⭐ DELIBERATELY NOT THE SAME ROOM. The tribunal is a straight bench: angular
   stalls, square nameplates, names redacted. The Council is a **curved dais** with
   rounded high-backed chairs and a rosette on each desk, because it is a different
   body doing a different thing — it *grades* you, where the tribunal *charges* you.
   `event_ducky_council` already draws a struck medal on a ribbon for exactly that
   reason, and this is the same argument in furniture.

   ⚠ IT ADDS, IT NEVER REPLACES. `#ducky-council-ducks` is INTERACTIVE — every
   `.duck-card` carries an onclick into `RubberIII`, and `qa_glyph_wiring` asserts
   the cards survive. The chamber is drawn BEHIND them; not one card is rebuilt.

   ⛔ NO COLOUR IS BAKED IN. Every shape strokes `currentColor` and fills via `.pf`,
   so `game.css`'s per-chapter palette reaches the chamber — same contract as
   `ui_plates.js` and `duck_tribunal_art.js`.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── SEAT GEOMETRY ───────────────────────────────────────────────────────
       ⚠ Shared with game.css exactly as the tribunal's are: the CSS box is
       derived from one custom property, width = height × SW/SH, and the duck sits
       at (SH - SEAT_TOP) / SH of the height. `qa_council_art` asserts the ratios
       rather than trusting this comment. */
    var SW = 112, SH = 150, SEAT_TOP = 108;

    /* Five members, and the rosette on each desk says what they are. ⚠ These are
       NOT redaction bars — the tribunal redacts because it is anonymous; the
       Council is proud of itself and puts its rank on the desk. */
    var SEATS = [
        { pips: 3, chair: 'tall'  },   // CHAIRMAN QUACK — presides
        { pips: 2, chair: 'mid'   },   // DR. MALLARD
        { pips: 0, chair: 'low'   },   // RUBBER III — nobody is sure what he is
        { pips: 2, chair: 'mid'   },   // SENATOR DUCK
        { pips: 1, chair: 'mid'   }    // THE ABSTAINER
    ];

    function open(cls, vb, extra) {
        return '<svg class="ui-plate ' + cls + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg"'
             + ' fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"'
             + ' ' + extra + ' aria-hidden="true" focusable="false">';
    }

    /* ── ONE SEAT ────────────────────────────────────────────────────────────
       A high-backed chair on a step, and the desk in front of it. The duck image
       is NOT in here — it is a sibling, so the members can lean without the
       furniture leaning with them. */
    function seat(i) {
        var s = SEATS[i] || SEATS[1];
        var top = s.chair === 'tall' ? 6 : s.chair === 'low' ? 30 : 18;
        var o = open('dc-seat', '0 0 ' + SW + ' ' + SH, 'preserveAspectRatio="xMidYMid meet"');

        /* The alcove behind the member. */
        o += '<rect x="10" y="' + (top + 4) + '" width="92" height="' + (100 - top) + '" class="dc-alcove pf"/>';

        /* ⭐ THE CHAIR — round, and that roundness is the point: `gen_ui_plates.js`
           has eight primitives and no curve, which is why the Council came out of it
           as "seven keyrings" in the first place. A high back drawn as one cubic. */
        o += '<path d="M22,106 L22,' + (top + 34) + ' C22,' + (top + 8) + ' 40,' + top
           + ' 56,' + top + ' C72,' + top + ' 90,' + (top + 8) + ' 90,' + (top + 34) + ' L90,106" class="dc-back"/>';
        o += '<path d="M31,106 L31,' + (top + 40) + ' C31,' + (top + 20) + ' 43,'
           + (top + 12) + ' 56,' + (top + 12) + ' C69,' + (top + 12) + ' 81,' + (top + 20)
           + ' 81,' + (top + 40) + ' L81,106" class="dc-back dc-back-in"/>';

        /* The bloom behind whoever is speaking. Opacity only. */
        o += '<ellipse cx="56" cy="64" rx="44" ry="50" class="dc-bloom pf"/>';

        /* The desk. Full-bleed so the five tile into one continuous dais. */
        o += '<rect x="0" y="' + SEAT_TOP + '" width="' + SW + '" height="7" class="dc-desktop pf"/>';
        o += '<path d="M0,115 Q56,123 ' + SW + ',115 L' + SW + ',142 L0,142 Z" class="dc-deskface pf"/>';
        o += '<path d="M0,121 Q56,129 ' + SW + ',121" class="dc-moulding"/>';

        /* ⭐ THE ROSETTE, not a redaction. Rank, worn openly. RUBBER III has none —
           the verdict text says the Council is not sure what he is. */
        if (s.pips > 0) {
            o += '<circle cx="56" cy="132" r="6.5" class="dc-rosette"/>';
            for (var k = 0; k < s.pips; k++) {
                o += '<circle cx="' + (56 + (k - (s.pips - 1) / 2) * 13) + '" cy="132" r="2.4" class="dc-pip pf"/>';
            }
        } else {
            o += '<line x1="46" y1="132" x2="66" y2="132" class="dc-moulding"/>';
        }
        return o + '</svg>';
    }

    /* ── THE CHAMBER BEHIND THEM ─────────────────────────────────────────────
       ⭐ Needs no alignment with anything, which is why the seal and the lamp live
       here rather than in the seats: a circle centred behind a row is centred
       whatever the row measures. */
    function chamber() {
        var s = open('dc-chamber', '0 0 640 300', 'preserveAspectRatio="xMidYMid slice"');
        s += '<polygon points="320,-40 500,250 140,250" class="dc-cone pf"/>';
        /* The dome: three arcs, the chamber seen from the floor. */
        s += '<path d="M60,250 A260,260 0 0 1 580,250" class="dc-dome"/>';
        s += '<path d="M120,250 A200,200 0 0 1 520,250" class="dc-dome dc-dome-in"/>';
        /* The seal — a struck medal, the same read as `event_ducky_council`. */
        s += '<circle cx="320" cy="96" r="46" class="dc-seal"/>';
        s += '<circle cx="320" cy="96" r="33" class="dc-seal"/>';
        s += '<polygon points="320,68 344,82 344,110 320,124 296,110 296,82" class="dc-seal-core"/>';
        s += '<polyline points="300,40 320,96 340,40" class="dc-ribbon"/>';
        return s + '</svg>';
    }

    window.CouncilArt = {
        seat: seat, chamber: chamber,
        SEATS: SEATS, SW: SW, SH: SH, SEAT_TOP: SEAT_TOP
    };
})();
