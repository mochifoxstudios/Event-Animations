/* ═══════════════════════════════════════════════════════════════════════════
   THE DUCK CAST — FIVE MEMBERS, HAND-AUTHORED, ONE SET SERVING BOTH PANELS.

   Owner, 2026-08-31: *"I don't want the art that is used for the duck rain to be
   used for the tribunal/council."* Brief: `ART_NEVER_MADE.md` §25.

   ⭐⭐ THIS REINSTATES AN INSTRUCTION THAT WAS ARGUED DOWN, AND THE ARGUMENT WAS
   SOUND AT THE TIME. `DUCK_TRIBUNAL.md` §9 asked for *"a very detailed and
   animated SVG"* of five judges. §10 measured the screen, found the owner's
   rasters ALREADY on the bench, and redirected the SVG to the courtroom on the
   grounds that a third depiction of the same five ducks would have been the bug
   the complaint was about, drawn better. That reasoning rested on one premise —
   **the rasters were the cast** — and the owner has now removed it. ▶ The plan was
   right; it was right for a reason that had not arrived yet.

   ⛔⛔ THE HARD PART IS NOT THE WIRING, IT IS THAT A DUCK HAS NO STRAIGHT LINES.
   This project has already shipped an unrecognisable one: `gen_ui_plates.js` has
   `box · fill · line · poly · ring · plate · scan · arc` and **no curve primitive
   at all**, so its duck came out as a hexagonal bag with a circle balanced on it —
   the owner called it a motorcycle helmet on sight — and every suite in the build
   passed while it was on screen. ▶ **A suite cannot see that a shape is
   unrecognisable.** The only check that works is `tools/probe_cast.js`: render it,
   screenshot it at the sizes it actually ships at, and LOOK.

   ⭐ WHY VECTOR AND NOT A NEW RASTER SET. Three reasons, and the third decided it:
     1. `currentColor` — the cast re-tints with the room under the per-chapter
        palette. A raster cast would sit fixed inside furniture that moves.
     2. ~1 KB against ~50 KB, five files against zero.
     3. ⭐ **The R1 opaque-box hazard stops existing.** Both panels put a
        `drop-shadow` on the member, which follows the ALPHA channel — with rasters
        that meant measuring corner alpha before every swap, because an opaque one
        grows a glowing square. A vector has no corners to measure.

   ⭐ ONE CAST, FIVE INDIVIDUALS — the silhouette is SHARED and only the marks
   differ. Five separately-drawn birds would read as five species; the same body
   five times with different wear reads as a panel of people, which is what both
   fictions need. ⚠ `SILHOUETTE` is therefore one literal shared constant below,
   not five near-copies.

   ⭐⭐ AND THE CHARACTERISATION SURVIVES THE WITHDRAWAL. The old casting joke was
   carried by the damage ladder — `duck_rain1` factory-new for THE ABSTAINER
   (*nothing has ever touched him*), `duck_rain5` for CHAIRMAN QUACK (*the most
   worn thing on the bench presides*), `duck_rain6`'s shards for RUBBER III
   (*"The Council is not sure what Rubber III is"*). That ladder is gone, so the
   wear is drawn EXPLICITLY here as `marks[]` — 3 · 1 · seams · 1 · **0**. ▶ The
   joke is not inherited from a filename any more; it is in the drawing.

   ⛔ NO COLOUR IS BAKED IN. Every shape strokes `currentColor` and fills through
   `.pf`, same contract as `ui_plates.js`, `duck_tribunal_art.js` and
   `duck_council_art.js`. A hex here would survive a theme change nothing else did.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── THE BOX ─────────────────────────────────────────────────────────────
       ⚠ SQUARE ON PURPOSE, and it is a wiring decision rather than a drawing one.
       Both panels size the member into a SQUARE slot inherited from the 256×256
       rasters — `.tribunal-duck-img` is `w = h = --tb-h × 0.4730`, `.duck-img` is
       `height:46%` at 1:1. A non-square viewBox would letterbox inside that slot
       and shrink the cast without a single rule changing. The duck is drawn to
       fill 112×112 with its feet ON the bottom edge, because both panels
       bottom-anchor the slot to the bench line. */
    var VW = 112, VH = 112;

    /* ══ THE SHARED SILHOUETTE — ONE CLOSED PATH ═════════════════════════════
       ⛔⛔ ONE PATH, NOT FIVE PARTS, AND THAT IS THE WHOLE LESSON OF THE FIRST
       DRAFT. Rendered 2026-09-01, the first version drew body · head · beak ·
       wing · tail as five separate closed shapes, each filled and each stroked.
       It read as **a circle balanced on a bag with a nozzle stuck to it** — which
       is, precisely, the motorcycle-helmet failure again, only with better curves.
       Three faults, all of them structural rather than a matter of taste:
         1. two stroked outlines meeting at the neck draw a SEAM across it, so the
            head reads as a separate object resting on the body;
         2. the bill, entered as its own closed shape, has a vertical left edge
            where it overlaps the head — a hard line no bird has;
         3. two translucent fills overlapping doubled to a darker patch exactly
            where the neck should be continuous.
       ▶ A silhouette is ONE outline. Everything else is interior detail drawn ON
       it. Fill once, stroke once, and the animal is a single creature.

       ⚠ THE BILL IS PART OF THE OUTLINE (segments 8–10). It cannot be an add-on:
       at the 44–68px these ship at, the wedge is the single feature that says
       "duck" rather than "bird", so it has to be continuous with the head or it
       reads as a beak-shaped sticker.

       Three-quarter view: body to the viewer, head turned so the bill is in
       profile. ⭐ That choice is the legibility argument. Head-on, a duck is a blob
       with a triangle on it; in pure profile it reads perfectly but cannot look at
       you — and BOTH panels' animations are about being looked at (the tribunal's
       DELIBERATE turns the bench, the Council's VOTE names each member in turn).
       Three-quarter is the only view that does both.

       ⛔ THE BILL TIP IS DELIBERATELY BLUNT. Draft three met it at a sharp angle
       and it read as a bird of prey; it now carries a two-unit CAP segment between
       the lower and upper edges, and that cap is the whole difference between a
       duck and a hawk at 44px. ⚠ Not decoration — a point is the one thing an
       organic silhouette cannot have, and points are exactly what made the
       generated version read as a polygon.

       ⛔⛔ AND THE TAIL TAUGHT THE SAME LESSON THE HARD WAY. Draft three's tail
       came to a spike, so draft four blunted the spike — and made it WORSE, a
       broad flipper. Rendering both showed the tip was never the fault: the tail
       sat at SHOULDER HEIGHT, level with the neck, so whatever shape it was given
       it read as a second appendage growing out of the shoulder. ▶ **It was a
       position error being fixed as a shape error.** The back now slopes down from
       the nape and the tail is a small stub at the LOW rear, which is where a duck
       keeps one. ⚠ Worth remembering the next time a shape is wrong: check where
       it IS before redrawing what it is.
       ⚠ It took two further passes after that to settle, and both were the same
       correction again — smaller, and lower. A tail that projects 11 units at 66%
       of the height reads as a tail; the same shape at 55% and 18 units long read
       as a flipper. **Size and position, not silhouette.**

       ⛔⛔ THE MARGIN IS NOT WHITESPACE, IT IS CHAIRMAN QUACK'S. He is drawn at
       `scale: 1.06` about his own feet, so every unit of the drawing moves 6% further
       from (56,111) — and at the first attempt the crown sat at y≈4 and the bill cap
       at x=109, which put both OUTSIDE the box once he was grown. `qa_duck_cast`
       caught it as `outOfBox 1`.
       ⚠ The tempting fix is `overflow: visible` on the slot, and game.css bans it in
       as many words twenty lines from where this cast is painted: art that escapes its
       viewBox *"overlaps its neighbours instead of being clipped, which trades a sliced
       edge for a collision."* Both panels tile their furniture EDGE TO EDGE — that is
       what makes five stalls read as one bench — so an overhanging member lands in the
       next member's stall. ▶ The drawing gives the room back instead: crown at y≥9,
       bill cap at x≤107, which leaves 1.06 inside the box with the stroke on.

       Clockwise from the tail tip. */
    var SILHOUETTE =
          'M12,74'                         /* tail tip — LOW and blunt, see above */
        + ' C15,79 19,83 23,86'            /* the tail's underside into the flank */
        + ' C16,92 13,101 20,107'          /* left flank, out and down */
        + ' C27,111 41,111 58,111'         /* the waterline, left half */
        + ' C76,111 90,110 95,102'         /* the waterline, right half */
        + ' C101,93 99,78 90,70'           /* right flank rising */
        + ' C84,65 76,62 70,58'            /* the shoulder, sloping in */
        + ' C66,55 67,49 71,45'            /* ▶ THE CHIN NOTCH — concave */
        + ' C74,42 76,41 79,41'            /* the root of the bill */
        + ' C88,43 99,42 104,38'           /* ▶ lower bill, out to the tip */
        + ' C107,36 107,31 104,29'         /* ▶ THE BLUNT CAP — see the note above */
        + ' C97,24 89,21 79,22'            /* ▶ upper bill, back to the root */
        + ' C85,17 80,12 70,10'            /* the brow above the bill */
        + ' C56,9 41,15 37,25'             /* over the crown */
        + ' C33,32 35,42 40,47'            /* the back of the head */
        + ' C43,50 42,54 38,57'            /* ▶ THE NAPE NOTCH — concave */
        + ' C33,62 27,68 23,74'            /* ▶ THE BACK, SLOPING DOWN to the tail */
        + ' C19,73 15,73 12,74 Z';         /* the tail's upper edge, closing */

    /* ── INTERIOR DETAIL ─────────────────────────────────────────────────────
       Drawn ON the silhouette, never through it. ⚠ All of it is OPEN strokes: a
       closed interior shape is what made the first draft's wing read as a fish
       lying on the belly. */

    /* Where the bill leaves the head. One short curve does what the old vertical
       seam did, without asserting an edge that is not there. */
    var BILL_ROOT = 'M79,22 C75,28 75,35 78,41';
    /* The mouth. ⭐ THE ABSTAINER DOES NOT GET THIS ONE — see `mute`. */
    var BILL_LINE = 'M84,32 C92,33 100,32 105,31';
    /* ⛔ THE WING TOOK THREE DRAFTS AND EACH FAILED DIFFERENTLY — worth recording,
       because all three were one mistake seen from different angles:
         1. a closed lens in the middle of the belly — read as a FISH lying on it;
         2. two horizontal crescents — read as a FROWN;
         3. two swept arcs — read as SPEED LINES: scratches, not a limb.
       ▶ A folded wing has THICKNESS and a ROOT. One crescent tucked under the
       shoulder and angled down-back has both; a stroke of any shape, anywhere on
       the flank, has neither. ⚠ It is also the only interior shape that is closed
       and filled, which is what separates it from the marks.
       ⚠ Both ends are ROUNDED rather than cusped, for the same reason the bill
       tip is: draft four's two-cusp version read as a leaf lying on the body. */
    var WING = 'M75,69 C63,70 48,79 39,92 C44,95 51,93 57,89'
             + ' C66,83 73,76 77,71 C78,69 77,68 75,69 Z';

    /* ── THE FIVE ────────────────────────────────────────────────────────────
       ⚠ INDEX ORDER IS LOAD-BEARING AND IT IS SHARED BY BOTH PANELS. The Council's
       `DUCKS` table is CHAIRMAN QUACK · DR. MALLARD · RUBBER III · SENATOR DUCK ·
       THE ABSTAINER, and the tribunal's `JUDGES[4]` is the stall that never moves
       in any beat. ⭐ Those already agree: index 4 is THE ABSTAINER, who has never
       voted, so the silent stall and the abstention are one joke told twice.
       `qa_duck_cast` asserts the two agree rather than trusting this comment.

       ⛔ The tribunal REDACTS its nameplates and this cast is named. Not a
       contradiction — the point: the same five bodies sit on both benches, and the
       anonymity is theatre. Names live in game.js; only the index is here.

       ⚠⚠ EVERY DISTINGUISHING FEATURE IS SILHOUETTE-ADJACENT, AND THAT IS A
       MEASURED CONSTRAINT RATHER THAN A STYLE. `ART_NEVER_MADE` §7–12, learned on
       the raster ladder these replace: *silhouette changes read; surface changes do
       not.* `duck_rain2` was skipped from the Council for exactly this reason — a
       hairline crack is invisible at 44px. So the five are told apart by things
       that break an OUTLINE: the Chairman is bigger and carries a medal that
       overhangs his chest, the Doctor's spectacles cut the head's edge, the
       Senator wears a FILLED band, Rubber III has no wing at all, and the
       Abstainer is the only one with nothing on him. ⛔ A tint or a shade here
       would be invisible in the only panel that matters. */
    var MEMBERS = [
        {
            key: 'chair', name: 'CHAIRMAN QUACK',
            /* Presides, and wears it. Drawn 6% larger FROM THE FEET, which is the
               cheapest way to say "presiding" without a second silhouette. */
            scale: 1.06, regalia: 'chain',
            /* The most worn thing on the bench presides. Three marks. */
            marks: ['crown', 'flank', 'bill'],
            eye: 'open'
        },
        {
            key: 'mallard', name: 'DR. MALLARD',
            scale: 1.0, regalia: 'specs',
            marks: ['flank'],
            eye: 'open'
        },
        {
            key: 'rubber', name: 'RUBBER III',
            /* ⛔⛔ THE ONE THAT MUST NOT READ AS A DUCK, and the game's own verdict
               text says why: *"The Council is not sure what Rubber III is."* ⚠ He
               keeps the SHARED silhouette — he is on the bench, and a different
               outline would make him a different species rather than an uncertain
               member. Every other detail says manufactured object instead: a mould
               parting seam from crown to base, a squeaker valve underneath, a
               crack, an eye socket with nothing in it — and ⭐ **no wing**, because
               a moulded bath toy does not have one. That last is the only one of
               his tells that survives 44px, which is why he has it. */
            scale: 0.97, regalia: 'none',
            marks: ['seam', 'valve', 'crack'],
            eye: 'blank', nowing: true
        },
        {
            key: 'senator', name: 'SENATOR DUCK',
            scale: 1.0, regalia: 'sash',
            marks: ['flank'],
            eye: 'open'
        },
        {
            key: 'abstainer', name: 'THE ABSTAINER',
            /* ⭐⭐ PRISTINE, AND THE BLANK IS THE CHARACTERISATION. He has never
               voted; nothing has ever touched him. No regalia, no marks, and — the
               detail that costs nothing and says the most — **no bill line**,
               because it has never opened. ⚠ `marks: []` is deliberate and
               `qa_duck_cast` asserts it stays empty. The one thing he gets that
               nobody else does is a factory shine on the crown, so he reads as NEW
               rather than unfinished: a member with no detail at all looks like a
               bug, and this is one stroke of the difference. */
            scale: 1.0, regalia: 'none',
            marks: [],
            eye: 'open', shine: true, mute: true
        }
    ];

    /* ── WEAR ────────────────────────────────────────────────────────────────
       Open strokes that sit across an edge, never a wash. */
    var MARKS = {
        /* ⚠ THESE FOLLOW THE CROWN, AND THE CROWN MOVED. When the silhouette was
           lowered 5 units to make room for CHAIRMAN QUACK's 1.06, this notch and THE
           ABSTAINER's shine stayed where they were and rendered as a V and an arc
           FLOATING ABOVE two bald heads. ▶ A mark that sits on an edge has to move
           with the edge; nothing links them but this note and probe_cast. */
        crown: '<path d="M48,18 L53,11 L59,18" class="dk-mark"/>',
        flank: '<path d="M26,92 C32,88 38,89 42,93" class="dk-mark"/>',
        bill:  '<path d="M95,29 L99,33" class="dk-mark"/>',
        seam:  '<path d="M57,7 C51,32 50,56 55,80 C58,94 57,104 58,110" class="dk-seam"/>',
        crack: '<path d="M32,86 L40,81 L44,90 L53,84" class="dk-mark"/>',
        valve: '<circle cx="57" cy="100" r="5.4" class="dk-valve"/>'
             + '<path d="M51.6,100 L62.4,100" class="dk-valve"/>'
    };

    /* ── REGALIA ─────────────────────────────────────────────────────────────
       ⭐ What each one wears is the only place the two panels' fictions differ, and
       it is drawn to survive BOTH readings: the tribunal charges you and the
       Council grades you, so a chain of office reads as authority either way.
       ⚠ It all sits on the CHEST, above `WING` — an earlier draft put the medal
       through the wing and the cluster read as a fishing hook. */
    var REGALIA = {
        chain: '<path d="M42,62 C53,74 67,72 76,60" class="dk-chain"/>'
             + '<circle cx="58" cy="73" r="5" class="dk-medal"/>'
             + '<circle cx="58" cy="73" r="2.1" class="dk-medal pf"/>',
        specs: '<circle cx="68" cy="24" r="8" class="dk-specs"/>'
             + '<circle cx="50" cy="28" r="6.4" class="dk-specs"/>'
             + '<path d="M59,26 C61,24 62,24 60,27" class="dk-specs"/>',
        /* ⭐ FILLED, not two lines. Two thin diagonals read as a scribble at 44px;
           a solid band still reads as a sash. ⚠ Over ONE shoulder and down to the
           opposite flank — a horizontal band across the belly reads as a bandage,
           and so did a WIDE diagonal one, which is why this one is narrow and
           carries a pin at the shoulder. */
        sash:  '<path d="M68,60 C64,75 54,87 37,94 L33,88 C48,81 56,70 59,58 Z" class="dk-sash pf"/>'
             + '<path d="M68,60 C64,75 54,87 37,94 L33,88 C48,81 56,70 59,58 Z" class="dk-sash-line"/>'
             + '<circle cx="64" cy="63" r="3.4" class="dk-medal"/>',
        none:  ''
    };

    function open(cls, extra) {
        return '<svg class="ui-plate duck-cast ' + cls + '" viewBox="0 0 ' + VW + ' ' + VH + '"'
             + ' xmlns="http://www.w3.org/2000/svg" fill="none" stroke-width="2.6"'
             + ' stroke-linecap="round" stroke-linejoin="round" preserveAspectRatio="xMidYMax meet"'
             + ' ' + extra + ' aria-hidden="true" focusable="false">';
    }

    /* ── ONE MEMBER ──────────────────────────────────────────────────────────
       ⚠ THE CALLER PASSES ITS OWN SLOT CLASS, and that is a boundary rather than a
       convenience. `tribunal-duck-img` and `duck-img` name a POSITION in each panel
       — both names predate the art being a vector, and game.css, `qa_tribunal_art`,
       `probe_tribunal` and `probe_council` all key off them. ▶ This module knows how
       to draw a duck and nothing about where either panel puts one.
       ⚠ THE SCALE GOES ON AN INNER <g>, NOT ON THE ROOT. Both panels animate the
       member element's own `transform` — the tribunal's LEAN and RULE, the
       Council's MUTTER — and a transform on the root would be overwritten by the
       first beat that fires, silently un-sizing the Chairman mid-scene. Anchored
       at the feet (`56,111`) so growing him does not lift him off the bench. */
    function duck(i, slot) {
        var m = MEMBERS[i] || MEMBERS[1];
        var s = open('dcast-' + m.key + (slot ? ' ' + slot : ''), 'data-cast="' + i + '"');

        s += m.scale !== 1
            ? '<g transform="translate(56,111) scale(' + m.scale + ') translate(-56,-111)">'
            : '<g>';

        /* ⭐ THE ANIMAL: one fill, one stroke, one outline. */
        s += '<path d="' + SILHOUETTE + '" class="dk-body pf"/>';
        s += '<path d="' + SILHOUETTE + '" class="dk-body-line"/>';

        /* Interior detail, back to front. */
        s += '<path d="' + BILL_ROOT + '" class="dk-billroot"/>';
        if (!m.mute) s += '<path d="' + BILL_LINE + '" class="dk-billline"/>';
        if (!m.nowing) {
            s += '<path d="' + WING + '" class="dk-wing pf"/>';
            s += '<path d="' + WING + '" class="dk-wing-line"/>';
        }

        /* The eye. ⛔ RUBBER III's is an empty socket — a ring with nothing in it,
           which is the cheapest way to draw "there is no one home" at 44px. */
        s += m.eye === 'blank'
            ? '<circle cx="68" cy="24" r="5" class="dk-socket"/>'
            : '<circle cx="68" cy="24" r="4.6" class="dk-eye pf"/>';

        /* Factory shine — THE ABSTAINER only. New, not unfinished. */
        if (m.shine) s += '<path d="M41,25 C46,16 56,12 66,13" class="dk-shine"/>';

        s += REGALIA[m.regalia] || '';
        for (var k = 0; k < m.marks.length; k++) s += MARKS[m.marks[k]] || '';

        return s + '</g></svg>';
    }

    window.DuckCast = {
        duck: duck, MEMBERS: MEMBERS, VW: VW, VH: VH, COUNT: MEMBERS.length,
        SILHOUETTE: SILHOUETTE,
        /* The index that never moves and never votes. Exported so the tribunal's
           SILENT stall and the Council's abstention can be asserted to agree
           instead of drifting apart in two files. */
        ABSTAINER: 4
    };
})();
