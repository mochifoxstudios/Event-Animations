/* ═══════════════════════════════════════════════════════════════════════════
   THE DUCK TRIBUNAL — THE COURTROOM, HAND-AUTHORED.

   Owner, 2026-08-29, with a screenshot of the bench: *"Why is this used for the
   duck tribunal, it was supposed to be a very detailed and animated SVG."*
   Plan: `DUCK_TRIBUNAL.md` §9. This is that plan built, with ONE deviation, and
   the deviation is the whole reason to read this header.

   ⛔⛔ §9 SAID "DRAW FIVE JUDGES". MEASURING THE SCREEN SAYS DO NOT.
   `tools/probe_tribunal.js` opened the real overlay and found TWO depictions of
   the same five ducks already stacked 203px apart: the generated `event_tribunal`
   plate (11 primitives, 5 circles, 82px — the thing the owner was pointing at),
   and `#tribunal-ducks`, which is five 65px RASTERS of the owner's own art. A
   third bench would have been the bug the complaint was about, drawn better.

   ⭐ SO THE SVG IS THE COURTROOM AND THE OWNER'S ART IS THE CAST. The screenshot
   showed five ducks floating in a void with no bench, no chairs and no dock under
   them. They now sit at one. That satisfies §9's actual ask — detailed, animated,
   hand-authored, curves the generator cannot draw — without drawing a duck at all.

   ⛔⛔ AND THAT LAST CLAUSE STOPPED BEING TRUE ON 2026-09-01. The owner withdrew
   `duck_rain*` from both duck panels, which removed the premise this whole header
   rests on: the rasters were the cast, and now there is no cast. `duck_cast_art.js`
   draws the five, and §9's original instruction — *"a very detailed and animated
   SVG"* of five judges — turned out to be right after all. ▶ **The reasoning below
   is not wrong; an input changed.** `DUCK_TRIBUNAL.md` §11.
   ▶ `event_tribunal` is unmapped from this overlay for the same reason. It stays
   in `ui_plates.js`, where `qa_glyph_wiring` still requires the key.

   ⭐ WHY THE BENCH IS A REPEATED SEGMENT AND NOT ONE WIDE PICTURE.
   The row is five inline-blocks sized in `rem`, so its width moves with the root
   font size. A single background image would have to be ALIGNED to five ducks
   whose positions are not knowable from here — the kind of measurement that is
   right once and silently wrong after any type change. Each duck instead carries
   its own stall, and the stalls abut into a continuous bench at any size.
   ⚠ `margin: 0` on `.tribunal-duck` is therefore load-bearing, not cosmetic: an
   8px gap puts a hole in the bench between every judge.

   ⭐ THE ANIMATION IS THE VERDICT, NOT AN IDLE. §9: *"A permanently-wiggling bench
   is chrome; a bench that turns to look at you is the mechanic."* Three beats,
   driven by classes `DuckTribunal` already knows when to set:
       CONVENE     the bench assembles, staggered 90ms
       DELIBERATE  slow turns, the only looping beat — 5.4s, deliberately dull
       RULE        the deciding judge leans in; everyone else goes still and dims
   ⛔ THE FIFTH STALL NEVER MOVES IN ANY BEAT. `THE SILENT ONE` is in the
   `sentencers` dialogue and has no line, and its nameplate has nothing left on it
   to redact. It is the only judge whose stillness is characterisation rather than
   a missing animation. ⭐ Stall 4 also seats `DuckCast.ABSTAINER` — the member who
   has never voted — so the silence and the abstention are one character. That
   agreement lives in three files and `qa_duck_cast` asserts it.

   ⚠ TRANSFORM AND OPACITY ONLY — see game.css. Not a style preference: anything
   else composites on the main thread, and this panel opens while the income loop
   is running.

   ⛔ NO COLOUR IS BAKED IN HERE. Every shape strokes `currentColor` and fills via
   `.pf`, exactly like `ui_plates.js`, so `game.css`'s per-chapter palette reaches
   the courtroom. A hex here would survive a theme change that nothing else did.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── STALL GEOMETRY ──────────────────────────────────────────────────────
       ⚠ THREE NUMBERS ARE SHARED WITH `game.css` AND NOTHING WILL TELL YOU WHEN
       THEY DISAGREE. The stall's CSS box is derived from a single custom property
       there — width = height × SW/SH, and the duck image is bottom-positioned at
       (SH - BENCH_TOP) / SH of the height so its feet land on the bench surface.
       `qa_tribunal_art` asserts the ratios rather than trusting this comment.

       ⛔ SH WAS 168 UNTIL THE VERDICT BEAT WAS PHOTOGRAPHED. With the verdict list
       rendered, the overlay measured **1074px of content in a 1080px viewport** —
       six pixels from the clip that `MASTER_PLAN` §6.8 A2 is an open item about,
       on a panel that had 372px of headroom before this courtroom was added. The
       bench took the room, so the bench gives it back: the dead band above the
       arch is gone and the under-shadow is halved. ▶ Anything added here from now
       on is added to a panel with a measured budget — re-run `probe_tribunal`. */
    var SW = 116, SH = 148, BENCH_TOP = 104;

    /* Five judges, five different nameplates. ⚠ The bars are DISTINCT on purpose:
       five identical plates read as a repeated tile rather than five names that
       were each removed separately. The last has one bar the full width — there
       is no name under it to break up. */
    var JUDGES = [
        { bars: [22, 14, 10], silent: false },
        { bars: [16, 26],     silent: false },
        { bars: [12, 18, 12], silent: false },
        { bars: [30, 8],      silent: false },
        { bars: [52],         silent: true  }
    ];

    function open(cls, vb, extra) {
        return '<svg class="ui-plate ' + cls + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg"'
             + ' fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"'
             + ' ' + extra + ' aria-hidden="true" focusable="false">';
    }

    /* ── ONE STALL ───────────────────────────────────────────────────────────
       Back recess, panelling, the chair, the bench slab, the nameplate. The duck
       image is NOT in here — it is a sibling, because the judges turn and the
       furniture does not. */
    function stall(i) {
        var j = JUDGES[i] || JUDGES[0];
        var s = open('tb-stall', '0 0 ' + SW + ' ' + SH, 'preserveAspectRatio="xMidYMid meet"');

        /* The recess behind the judge, and three panel seams in it. */
        s += '<rect x="8" y="6" width="100" height="96" class="tb-recess pf"/>';
        s += '<line x1="30" y1="14" x2="30" y2="102" class="p-scan"/>';
        s += '<line x1="58" y1="10" x2="58" y2="102" class="p-scan"/>';
        s += '<line x1="86" y1="14" x2="86" y2="102" class="p-scan"/>';

        /* ⭐ THE CHAIR — and the reason this file is hand-authored at all.
           `gen_ui_plates.js` has eight primitives and not one of them is a curve,
           which is how the Ducky Council came out as "seven keyrings" and the five
           judges as "a motorcycle helmet" (CLAUDE.md PART SIX). Two cubic segments
           that a generator cannot express: the outer shell and the inner padding. */
        s += '<path d="M18,102 L18,40 C18,20 34,10 58,10 C82,10 98,20 98,40 L98,102" class="tb-seat"/>';
        s += '<path d="M27,102 L27,45 C27,29 40,21 58,21 C76,21 89,29 89,45 L89,102" class="tb-seat tb-seat-in"/>';

        /* The bloom that comes up behind whichever judge rules. Opacity only. */
        s += '<ellipse cx="58" cy="60" rx="46" ry="52" class="tb-bloom pf"/>';

        /* Stall dividers. Drawn on both edges so the outermost two are closed;
           the shared edges simply draw the same line twice. */
        s += '<line x1="2" y1="16" x2="2" y2="104" class="tb-post"/>';
        s += '<line x1="114" y1="16" x2="114" y2="104" class="tb-post"/>';

        /* The bench. Full-bleed left to right — this is what tiles. */
        s += '<rect x="0" y="' + BENCH_TOP + '" width="' + SW + '" height="8" class="tb-benchtop pf"/>';
        s += '<rect x="0" y="112" width="' + SW + '" height="28" class="tb-benchface pf"/>';
        s += '<line x1="0" y1="118" x2="' + SW + '" y2="118" class="tb-moulding"/>';

        /* The nameplate, and what is left on it. */
        s += '<rect x="28" y="121" width="60" height="14" class="tb-nameplate"/>';
        var total = 0, k;
        for (k = 0; k < j.bars.length; k++) total += j.bars[k];
        total += (j.bars.length - 1) * 4;                  // the gaps between bars
        var x = 58 - total / 2;
        for (k = 0; k < j.bars.length; k++) {
            s += '<rect x="' + x.toFixed(1) + '" y="125" width="' + j.bars[k] + '" height="6" class="p-redact pf"/>';
            x += j.bars[k] + 4;
        }

        s += '<rect x="0" y="140" width="' + SW + '" height="8" class="tb-shadow pf"/>';
        return s + '</svg>';
    }

    /* ── THE BACKDROP ────────────────────────────────────────────────────────
       Seal and overhead light. ⭐ It needs NO alignment with anything, which is
       exactly why these two shapes live here rather than in the stalls: a circle
       centred behind a row is centred whatever the row measures. */
    function backdrop() {
        var s = open('tb-backdrop', '0 0 640 300', 'preserveAspectRatio="xMidYMid slice"');
        s += '<polygon points="320,-40 512,262 128,262" class="tb-cone pf"/>';
        s += '<circle cx="320" cy="104" r="74" class="tb-seal"/>';
        s += '<circle cx="320" cy="104" r="55" class="tb-seal"/>';
        s += '<polygon points="320,63 355,83 355,125 320,145 285,125 285,83" class="tb-seal-core"/>';
        s += '<line x1="320" y1="-40" x2="320" y2="30" class="tb-cord"/>';
        return s + '</svg>';
    }

    /* ── THE DOCK ────────────────────────────────────────────────────────────
       ⭐ CONDUCT_ROUTES §9.5 asks that the bench read as *"OTHER ducks, and yours
       conspicuously not among them."* An empty stand in front of it is the most
       direct way to say so, and it costs no art: the absence IS the drawing.
       ⚠ It is a block after the row in a text-align:center parent, so it centres
       itself. No measurement, nothing to keep in sync. */
    function dock() {
        var s = open('tb-dock', '0 0 200 104', 'preserveAspectRatio="xMidYMid meet"');
        s += '<ellipse cx="100" cy="88" rx="76" ry="11" class="tb-dock-floor pf"/>';
        s += '<path d="M46,84 L46,36 C46,23 64,17 100,17 C136,17 154,23 154,36 L154,84" class="tb-dock-rail"/>';
        s += '<line x1="46" y1="54" x2="154" y2="54" class="tb-dock-rail"/>';
        s += '<line x1="61" y1="84" x2="61" y2="19" class="tb-dock-post"/>';
        s += '<line x1="139" y1="84" x2="139" y2="19" class="tb-dock-post"/>';
        return s + '</svg>';
    }

    /* ── THE WHOLE BENCH ─────────────────────────────────────────────────────
       Built here rather than in game.js so the markup and the geometry that
       depends on it stay in one file. `imgFor` is passed in because WHICH cast sits
       here is the caller's business — game.js routes it to `duck_cast_art.js` and
       owns the fallback. ⭐ That boundary is why the 2026-09-01 cast swap did not
       touch this file's geometry at all: the room never knew what it seated. */
    function bench(imgFor) {
        var html = backdrop(), i;
        for (i = 0; i < JUDGES.length; i++) {
            html += '<span class="tribunal-duck' + (JUDGES[i].silent ? ' tb-silent' : '') + '">'
                  + stall(i) + imgFor(i) + '</span>';
        }
        html += '<div class="tb-dock-wrap">' + dock()
              + '<div class="tb-dock-label">// DOCK · THE OPERATOR IS NOT REQUIRED TO ATTEND</div></div>';
        return html;
    }

    window.TribunalArt = {
        bench: bench, stall: stall, backdrop: backdrop, dock: dock,
        JUDGES: JUDGES, SW: SW, SH: SH, BENCH_TOP: BENCH_TOP,
        /* The duck image's share of the stall, in the same units. game.css derives
           its width, height and offsets from these three ratios. */
        IMG_UNITS: 70,
        /* The index that never moves, exported so game.js never picks it to rule
           and the suite can assert the two agree. */
        SILENT: 4
    };
})();
