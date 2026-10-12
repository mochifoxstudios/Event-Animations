/* ═══════════════════════════════════════════════════════════════════════════
   existential_scene.js — THE EXISTENTIAL CRISIS, staged.

   Once, at 1,000,000 clicks, the game stops and asks why.

     1 STALL     the click counter rolls onto 1,000,000 and will not go further;
                 the music the player has been hearing for hours stops.
     2 QUESTION  "What is the purpose of clicking?" types out, alone.
     3 CHOICE    four answers. Hovering one PREVIEWS the scar it leaves (a red
                 edge, a 2px slip, a figure peeking up, the colour draining) —
                 the stakes are felt before they are explained. Choosing is
                 PRESS-AND-HOLD: the choice is permanent, and VOID disables the
                 ACQUIRE button for the rest of the run.
     4 CONSEQUENCE  the other three fall away; the chosen answer plays out (×1.5
                 slams in red · the energy counter doubles and the frame slips ·
                 twenty-five fragments fly and a small figure rises · the colour
                 drains and ACQUIRE greys out).
     5 THE MARK  what the player keeps, stated once, and CONTINUE.

   ⭐ PATHS ARE DATA. opts.paths replaces or extends them: each one names its
   gift text, its mark text and which built-in mark it uses (vignette · shift ·
   figure · drain · none). opts.question changes the question. New answers need
   no code.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;

    var PATHS = [
        { key: 'POWER',   glyph: '↯', label: 'POWER',   desc: 'Numbers. Growing. Forever.',
          gift: '×1.5 INCOME — PERMANENT', mark: 'vignette',
          markText: 'A faint crimson guilt lines your vision. It will not leave.' },
        { key: 'NUMBERS', glyph: '∞', label: 'NUMBERS', desc: 'The count is all that matters.',
          gift: 'ENERGY DOUBLED', mark: 'shift',
          markText: 'The simulation has fractured. Alignment is permanently off by 2 pixels. You did this.' },
        { key: 'FUN',     glyph: '◈', label: 'FUN',     desc: 'It was always about this.',
          gift: '+25 FRAGMENTS — CORRECT ANSWER', mark: 'figure',
          markText: 'A small duck watches from below. It has always been there.' },
        { key: 'VOID',    glyph: '✕', label: 'VOID',    desc: 'The flesh is a bottleneck.',
          gift: 'ACQUIRE DISABLED · ×3 PASSIVE FOREVER', mark: 'drain',
          markText: 'Colour drains from the simulation. The numbers remain. Colour was never the point.' }
    ];

    var HOLD_MS = 900;

    var FIGURE_SVG =
        '<svg viewBox="0 0 40 52" aria-hidden="true">'
      + '<path d="M20,3 C9,3 5,13 5,24 C5,34 3,44 2,50 L38,50 C37,44 35,34 35,24 C35,13 31,3 20,3 Z" fill="currentColor" fill-opacity=".9"/>'
      + '<path d="M20,9 C13,9 10,16 10,23 C10,28 14,31 20,31 C26,31 30,28 30,23 C30,16 27,9 20,9 Z" fill="#000" fill-opacity=".85"/>'
      + '<circle cx="16" cy="22" r="1.6" fill="#fff"/><circle cx="24" cy="22" r="1.6" fill="#fff"/></svg>';

    function fmtInt(n) { return Math.round(n).toLocaleString('en-US'); }

    /* play(host, opts) → { done: Promise<{ key, path }>, close() }
       opts.state      { energy } for the NUMBERS count (falls back to window.state)
       opts.paths      replace the four answers (see PATHS)
       opts.question   replace the question
       opts.onChoose   (path) => void, called the moment the hold completes — apply the gift here
       opts.audio      false for silence */
    function play(host, opts) {
        opts = opts || {};
        var paths = opts.paths || PATHS;
        var question = opts.question || 'What is the purpose of clicking?';
        var energy = ((opts.state || window.state || {}).energy) || 4.21e15;
        var au = D.audio(opts, window.ExistentialScore);
        var dir = D.director();
        var shell = D.shell(host, 'exs', dir, au);
        var root = shell.root;
        root.setAttribute('aria-label', 'Operator query');

        var veil = D.h('div', 'exs-veil');
        var drain = D.h('div', 'exs-drain');
        var figure = D.h('div', 'exs-figure', FIGURE_SVG);
        var frame = D.h('div', 'exs-frame');
        root.appendChild(veil);
        root.appendChild(drain);
        root.appendChild(figure);
        root.appendChild(frame);

        frame.appendChild(D.h('div', 'exs-eyebrow', '// OPERATOR QUERY'));
        var counter = D.h('div', 'exs-counter', '999,996');
        var counterLbl = D.h('div', 'exs-counter-lbl', 'TOTAL CLICKS');
        var q = D.h('div', 'exs-question');
        var cursor = D.h('span', 'exs-cursor');
        var qText = D.h('span');
        q.appendChild(qText); q.appendChild(cursor);
        var grid = D.h('div', 'exs-choices');
        var hint = D.h('div', 'exs-hold-hint', 'PRESS AND HOLD TO ANSWER · THIS CANNOT BE UNDONE');
        var result = D.h('div', 'exs-result');
        frame.appendChild(counter);
        frame.appendChild(counterLbl);
        frame.appendChild(q);
        frame.appendChild(grid);
        frame.appendChild(hint);
        frame.appendChild(result);

        var cards = paths.map(function (p, i) {
            var c = D.h('button', 'exs-card exs-c' + i,
                '<span class="exs-fill"></span><span class="g">' + D.esc(p.glyph || '·') + '</span>'
              + '<span class="l">' + D.esc(p.label) + '</span><span class="d">' + D.esc(p.desc) + '</span>');
            c.type = 'button';
            c.setAttribute('aria-label', p.label + ': ' + p.desc + '. Press and hold to choose.');
            grid.appendChild(c);
            return c;
        });

        var log = shell.log;
        var chosen = null, resolveChoice;
        var picked = new Promise(function (r) { resolveChoice = r; });

        /* ── hover previews and the hold ──────────────────────────────────── */
        cards.forEach(function (c, i) {
            var p = paths[i], timer = null, held = false;
            function preview(on) {
                if (chosen) return;
                root.dataset.preview = on ? (p.mark || 'none') : '';
                if (on) au.sfx('hover', i);
            }
            function startHold(e) {
                if (chosen || !grid.classList.contains('dks-on')) return;
                if (e && e.type === 'pointerdown') { try { c.setPointerCapture(e.pointerId); } catch (x) {} }
                held = true;
                c.classList.add('exs-holding');
                au.sfx('hold', i);
                timer = setTimeout(function () { if (held) choose(i); }, HOLD_MS);
            }
            function endHold() {
                if (!held || chosen) return;
                held = false;
                clearTimeout(timer);
                c.classList.remove('exs-holding');
                au.sfx('release');
            }
            c.addEventListener('pointerenter', function () { preview(true); });
            c.addEventListener('pointerleave', function () { preview(false); endHold(); });
            c.addEventListener('focus', function () { preview(true); });
            c.addEventListener('blur', function () { preview(false); });
            c.addEventListener('pointerdown', startHold);
            c.addEventListener('pointerup', endHold);
            c.addEventListener('pointercancel', endHold);
            c.addEventListener('keydown', function (e) {
                if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); startHold(); }
            });
            c.addEventListener('keyup', function (e) { if (e.key === 'Enter' || e.key === ' ') endHold(); });
            c.addEventListener('click', function (e) { e.stopPropagation(); });
        });

        function choose(i) {
            if (chosen) return;
            chosen = paths[i];
            root.dataset.preview = '';
            root.dataset.chosen = chosen.key;
            cards.forEach(function (c, k) { c.classList.add(k === i ? 'exs-picked' : 'exs-gone'); c.disabled = true; });
            hint.classList.remove('dks-on');
            /* once the others have fallen away, the answer takes the centre */
            setTimeout(function () {
                cards.forEach(function (c, k) { if (k !== i) c.hidden = true; });
                grid.classList.add('exs-solo');
            }, 650);
            log('You chose ' + chosen.label + '.');
            if (typeof opts.onChoose === 'function') { try { opts.onChoose(chosen); } catch (e) {} }
            resolveChoice(i);
        }

        var done = (async function () {
            /* 1 · STALL */
            au.cue('board');
            root.classList.add('dks-on-in');
            for (var n = 999996; n <= 1000000; n++) {
                counter.textContent = fmtInt(n);
                au.sfx('click');
                await dir.wait(n < 999999 ? 220 : 420);
            }
            au.cue(null);
            au.sfx('stall');
            counter.classList.add('exs-frozen');
            log('1,000,000 clicks.');
            await dir.wait(1400);

            /* 2 · QUESTION */
            counter.classList.add('exs-dim');
            counterLbl.classList.add('exs-dim');
            au.cue('question');
            await dir.type(qText, question, 55, function () { au.sfx('key'); });
            log(question);
            await dir.wait(900);

            /* 3 · CHOICE — waits for the player as long as it takes */
            shell.done();
            grid.classList.add('dks-on');
            hint.classList.add('dks-on');
            au.sfx('reveal');
            var i = await picked;
            var p = paths[i];

            /* 4 · CONSEQUENCE */
            au.cue(null);
            au.sfx('choose_' + (p.mark || 'none'), i);
            await sleep(900);
            root.classList.add('exs-mark-' + (p.mark || 'none'));
            var gift = D.h('div', 'exs-gift', D.esc(p.gift || ''));
            result.appendChild(gift);
            if (p.mark === 'shift') countEnergy(result);
            if (p.mark === 'figure') burst(frame, 25);
            if (p.mark === 'drain') result.appendChild(D.h('div', 'exs-acquire', '<span>ACQUIRE</span>'));
            await sleep(1500);

            /* 5 · THE MARK */
            var mark = D.h('div', 'exs-marktext');
            result.appendChild(mark);
            await typeSlow(mark, p.markText || '', 28);
            au.cue('after_' + (p.mark || 'none'));
            var cont = D.h('button', 'dks-btn exs-continue', 'CONTINUE');
            cont.type = 'button';
            result.appendChild(cont);
            try { cont.focus({ preventScroll: true }); } catch (e) {}
            return new Promise(function (resolve) {
                cont.addEventListener('click', function () { shell.close(); resolve({ key: p.key, path: p }); });
            });
        })();

        function sleep(ms) { return new Promise(function (r) { setTimeout(r, D.reduced() ? Math.min(ms, 300) : ms); }); }
        function typeSlow(el, text, ms) {
            return new Promise(function (r) {
                var k = 0;
                var iv = setInterval(function () { k++; el.textContent = text.slice(0, k); if (k >= text.length) { clearInterval(iv); r(); } }, ms);
            });
        }
        function countEnergy(into) {
            var line = D.h('div', 'exs-energy');
            into.appendChild(line);
            var from = energy, to = energy * 2, k = 0, steps = 30;
            var iv = setInterval(function () {
                k++;
                line.textContent = 'ENERGY ' + D.fmt(from + (to - from) * (k / steps));
                if (k % 3 === 0) au.sfx('count', k);
                if (k >= steps) clearInterval(iv);
            }, 40);
        }
        function burst(into, count) {
            for (var k = 0; k < count; k++) {
                var s = D.h('span', 'exs-shard', '◈');
                var ang = (k / count) * Math.PI * 2 + Math.random() * 0.4;
                var r = 120 + Math.random() * 220;
                s.style.setProperty('--dx', Math.cos(ang) * r + 'px');
                s.style.setProperty('--dy', (Math.sin(ang) * r * 0.6 - 140) + 'px');
                s.style.animationDelay = (k * 18) + 'ms';
                into.appendChild(s);
                if (k % 5 === 0) setTimeout(function () { au.sfx('shard'); }, k * 18);
            }
        }

        return { done: done, close: shell.close };
    }

    /* The permanent mark, for a page that wants to show it on its own board
       (the game applies its own: ExistentialCrisis._applyScar). */
    function applyMark(el, key) {
        var p = PATHS.filter(function (x) { return x.key === key; })[0];
        if (!p || !el) return;
        el.classList.remove('exs-scar-vignette', 'exs-scar-shift', 'exs-scar-figure', 'exs-scar-drain');
        el.classList.add('exs-scar-' + p.mark);
        if (p.mark === 'figure' && !el.querySelector('.exs-scar-fig')) el.appendChild(D.h('div', 'exs-scar-fig', FIGURE_SVG));
    }

    window.ExistentialScene = { play: play, applyMark: applyMark, PATHS: PATHS, HOLD_MS: HOLD_MS };
})();
