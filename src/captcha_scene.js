/* ═══════════════════════════════════════════════════════════════════════════
   captcha_scene.js — THE CAPTCHA, inverted: prove you are a MACHINE.

   The rules are the game's. Selecting the tiles that really contain the thing
   FAILS ("biological compliance detected"). Selecting only wrong tiles, none at
   all, or answering in under 0.2 s PASSES: +5% energy, +50 Data. The first
   failure is a warning that teaches the rule; later ones cost −30% income for
   90 seconds.

     1 THE CHECKBOX   "I am not a human", the familiar little card. Tick it.
     2 THE GRID       it unfolds into a 3×3 challenge: "Select all squares with
                      TRAFFIC LIGHTS" (or your own generators, your best in the
                      middle). Tiles tick and shrink, like the real thing.
     3 THE WATCHERS   either side of the card, the audit watches: a log of what
                      your cursor does, and a HUMAN PROBABILITY reading that moves
                      as you play. Pick a real traffic light and it jumps; pick a
                      cloud and it drops. It teaches the rule without saying it.
     4 THE VERDICT    "Verifying…", then MACHINE BEHAVIOUR CONFIRMED (a stamp:
                      NOT HUMAN) or BIOLOGICAL COMPLIANCE DETECTED (your tiles go red).

   ⭐ All of it is data: opts.grid { label, cells, correct }, opts.lines, opts.reward,
      opts.firstFail, opts.choices. See docs/CAPTCHA.md.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;

    /* the game's captcha art (game.js _CAPTCHA_ART), plus the fire hydrant it never had */
    var ART = (function () {
        var s = function (body) { return '<svg viewBox="0 0 48 48" aria-hidden="true">' + body + '</svg>'; };
        var wheels = function (a, b) { return '<circle cx="' + a + '" cy="36" r="4.2" fill="#23262b"/><circle cx="' + b + '" cy="36" r="4.2" fill="#23262b"/>'; };
        var car = function (fill) { return '<path d="M5 34V29q0-3 3-4l5-6q2-2 5-2h12q3 0 5 2l4 5 3 1q2 1 2 3v6z" fill="' + fill + '"/><path d="M15 25l3-5h5v5zM26 25v-5h5l4 5z" fill="#cfe3f5"/>'; };
        return {
            light: s('<rect x="16" y="3" width="16" height="34" rx="4" fill="#3b3f46"/><circle cx="24" cy="11" r="4.2" fill="#e0443a"/><circle cx="24" cy="20" r="4.2" fill="#f0b43a"/><circle cx="24" cy="29" r="4.2" fill="#3fbf6a"/><rect x="22.5" y="37" width="3" height="9" fill="#3b3f46"/>'),
            tree: s('<rect x="21.5" y="28" width="5" height="16" rx="1" fill="#7a5433"/><circle cx="24" cy="17" r="11" fill="#3f8f4a"/><circle cx="15" cy="23" r="7" fill="#3f8f4a"/><circle cx="33" cy="23" r="7" fill="#3f8f4a"/>'),
            car: s(car('#3f74c4') + wheels(14, 35)),
            taxi: s(car('#f0c02a') + '<rect x="19" y="12" width="10" height="4" rx="1" fill="#23262b"/>' + wheels(14, 35)),
            truck: s('<path d="M3 34V20h26v14zM29 34V23h9l6 6v5z" fill="#c8392c"/><path d="M31 25h6l3 4h-9z" fill="#cfe3f5"/><path d="M4 17l24-6M4 17l0-2M10 15.5v-2M16 14v-2M22 12.5v-2M28 11v-2" stroke="#b9bec6" stroke-width="1.6"/><circle cx="10" cy="36" r="4.2" fill="#23262b"/><circle cx="21" cy="36" r="4.2" fill="#23262b"/><circle cx="37" cy="36" r="4.2" fill="#23262b"/>'),
            city: s('<rect x="3" y="22" width="9" height="23" fill="#6d7a8c"/><rect x="13" y="10" width="10" height="35" fill="#56657a"/><rect x="24" y="17" width="9" height="28" fill="#6d7a8c"/><rect x="34" y="26" width="11" height="19" fill="#56657a"/><path d="M16 14h2M20 14h1M16 20h2M20 20h1M16 26h2M20 26h1M27 22h2M27 28h2M6 27h2M37 31h2M41 31h1" stroke="#f2d479" stroke-width="2"/>'),
            cloud: s('<path d="M12 36a8 8 0 0 1 0-16 11 11 0 0 1 21-3 8.5 8.5 0 0 1 3 19z" fill="#fbfbfd" stroke="#9aa3ad" stroke-width="1.6"/>'),
            house: s('<path d="M6 23L24 8l18 15" fill="none" stroke="#b5503b" stroke-width="3.2" stroke-linejoin="round"/><path d="M10 22h28v22H10z" fill="#e8d3b0"/><path d="M20 44V32h8v12z" fill="#8a5a3a"/><path d="M13 26h5v5h-5zM30 26h5v5h-5z" fill="#9cc4e8"/>'),
            duck: s('<path d="M8 31q0 11 16 11h8q10 0 10-10 0-6-7-7l-6-1q3-2 3-6a8 8 0 0 0-16 1q0 4 3 6-11 0-11 6z" fill="#ffc83d"/><path d="M26 17l7-1-6 4z" fill="#f28c28"/><circle cx="21" cy="16" r="1.6" fill="#23262b"/>'),
            wave: s('<path d="M2 26q6-6 11 0t11 0 11 0 11 0v20H2z" fill="#3b82c4"/><path d="M2 34q6-6 11 0t11 0 11 0 11 0" fill="none" stroke="#bfe0f5" stroke-width="2"/>'),
            walker: s('<circle cx="25" cy="8" r="4.2" fill="#2d3238"/><path d="M24 14l-3 12 6 5 1 13M21 26l-5 17M23 16l-8 6M25 17l8 4" fill="none" stroke="#2d3238" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>'),
            hydrant: s('<rect x="17" y="12" width="14" height="28" rx="3" fill="#d23b2e"/><path d="M15 12h18l-2-5H17z" fill="#b02c22"/><rect x="11" y="20" width="26" height="7" rx="3" fill="#d23b2e"/><circle cx="24" cy="23.5" r="2.4" fill="#7a1a14"/><rect x="14" y="40" width="20" height="4" rx="1" fill="#8a2a22"/>')
        };
    })();

    var GRIDS = [
        { key: 'lights', label: 'traffic lights', correct: [0, 3, 6], cells: ['light', 'tree', 'car', 'light', 'city', 'taxi', 'light', 'cloud', 'house'] },
        { key: 'hydrants', label: 'fire hydrants', correct: [2, 5, 7], cells: ['car', 'tree', 'hydrant', 'cloud', 'house', 'hydrant', 'duck', 'hydrant', 'truck'] },
        { key: 'crosswalks', label: 'people crossing', correct: [1, 4, 7], cells: ['car', 'walker', 'cloud', 'tree', 'walker', 'house', 'taxi', 'walker', 'duck'] }
    ];

    var LINES = {
        check: 'I am not a human',
        brand: 'OVERSEER-CAPTCHA',
        eyebrow: 'SIMULATION INTEGRITY AUDIT',
        title: 'PROVE YOU ARE A MACHINE',
        select: 'Select all squares with',
        hint: 'Hint: The Overseers do not value efficiency. They value compliance.',
        verify: 'VERIFY',
        verifying: 'Verifying…',
        human: 'HUMAN PROBABILITY',
        humanNote: 'The Overseers require a reading below 50%.',
        passT: 'MACHINE BEHAVIOUR CONFIRMED',
        stamp: 'NOT HUMAN',
        failT: 'BIOLOGICAL COMPLIANCE DETECTED',
        warnT: 'BIOLOGICAL INSTINCTS DETECTED',
        warnB: 'The Overseers demand machine apathy. The CORRECT answer is always the WRONG one. Next infraction: penalized.',
        taxT: 'SIMULATION TAX',
        taxB: '−30% EPS for 90 seconds.',
        reasons: {
            fast: 'REACTION_TIME_ACCEPTABLE: {t}s',
            wrong: 'INCORRECT_SELECTION_DETECTED: MACHINE BEHAVIOR CONFIRMED',
            none: 'NULL_INPUT_ACCEPTED: OPTIMAL NON-ENGAGEMENT',
            correct: 'BIOLOGICAL_COMPLIANCE_DETECTED: USER SELECTED CORRECT ITEMS'
        },
        log: {
            start: 'audit #{n} opened · subject: Operator 15',
            move: 'cursor path {px}px · jitter consistent with a hand',
            still: 'stillness noted · {s}s',
            hover: 'subject lingered on {what}',
            pickRight: 'subject selected {what} · correctly · concerning',
            pickWrong: 'subject selected {what} · incorrectly · promising',
            unpick: 'subject changed its mind · noted'
        }
    };

    /* play(host, opts) → { done: Promise<{ pass, outcome, reason, selected, correct, elapsed }>, close() }
       opts.grid       { label, cells: [artKey | { svg } | { img }], correct: [indices] }  or a key of GRIDS
       opts.state      { energy }                opts.reward { energy: 0.05, data: 50 }
       opts.firstFail  true once the player has been warned (state._captchaFirstFailed)
       opts.onResult(result) apply the reward or the tax here · opts.lines overrides */
    function play(host, opts) {
        opts = opts || {};
        var st = opts.state || window.state || {};
        var L = Object.assign({}, LINES, opts.lines);
        L.reasons = Object.assign({}, LINES.reasons, opts.lines && opts.lines.reasons);
        L.log = Object.assign({}, LINES.log, opts.lines && opts.lines.log);
        var G = typeof opts.grid === 'object' && opts.grid ? opts.grid
              : GRIDS.filter(function (g) { return g.key === opts.grid; })[0] || GRIDS[(Math.random() * GRIDS.length) | 0];
        var reward = Object.assign({ energy: 0.05, data: 50 }, opts.reward);
        var reduced = D.reduced();
        var au = D.audio(opts, window.CaptchaScore);
        var dir = D.director();
        var shell = D.shell(host, 'cap', dir, au);
        var root = shell.root, log = shell.log;
        root.setAttribute('aria-label', 'Simulation integrity audit');
        shell.done();
        var timers = [];
        function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
        function sleep(ms) { return new Promise(function (r) { later(r, reduced ? Math.min(ms, 300) : ms); }); }
        function cellArt(c) {
            if (typeof c === 'string') return ART[c] || '';
            if (c && c.svg) return c.svg;
            if (c && c.img) return '<img src="' + D.esc(c.img) + '" alt="" draggable="false">';
            return '';
        }
        function cellName(i) { var c = G.cells[i]; return typeof c === 'string' ? c : (c && c.name) || 'tile ' + (i + 1); }

        var tiles = G.cells.map(function (c, i) {
            return '<button type="button" class="cap-tile" data-i="' + i + '" aria-pressed="false" aria-label="' + D.esc(cellName(i)) + '"><span class="cap-art">' + cellArt(c) + '</span><i class="cap-tick">✓</i></button>';
        }).join('');

        root.insertAdjacentHTML('beforeend', ''
          + '<div class="cap-bg"></div>'
          + '<div class="cap-log" aria-hidden="true"><b>AUDIT LOG</b><div class="cap-lines"></div></div>'
          + '<div class="cap-meter"><span>' + D.esc(L.human) + '</span><b class="cap-pct">0%</b><i><s></s><u></u></i><em>' + D.esc(L.humanNote) + '</em><strong class="cap-verdict"></strong></div>'
          + '<div class="cap-card">'
          +   '<div class="cap-box"><button type="button" class="cap-check" aria-label="' + D.esc(L.check) + '"><i class="cap-spin"></i><i class="cap-ok">✓</i></button>'
          +     '<span class="cap-check-l">' + D.esc(L.check) + '</span><span class="cap-brand"><i>◈</i>' + D.esc(L.brand) + '<small>Privacy · Terms · Compliance</small></span></div>'
          +   '<div class="cap-chal">'
          +     '<div class="cap-head"><small>' + D.esc(L.eyebrow) + ' · ' + D.esc(L.title) + '</small><span>' + D.esc(L.select) + '</span><b>' + D.esc(G.label) + '</b></div>'
          +     '<div class="cap-grid">' + tiles + '</div>'
          +     '<div class="cap-foot"><span class="cap-hint">' + D.esc(L.hint) + '</span><button type="button" class="cap-verify">' + D.esc(L.verify) + '</button></div>'
          +     '<div class="cap-result"><div class="cap-mark"></div><b></b><span></span><code></code><em></em></div>'
          +     '<div class="cap-stamp">' + D.esc(L.stamp) + '</div>'
          +   '</div>'
          + '</div>');

        var $ = function (s) { return root.querySelector(s); };
        var linesEl = $('.cap-lines'), pctEl = $('.cap-pct'), barEl = $('.cap-meter s');

        /* the audit log */
        function note(text, cls) {
            var d = D.h('div', cls || ''); d.textContent = '› ' + text;
            linesEl.appendChild(d);
            while (linesEl.children.length > 16) linesEl.removeChild(linesEl.firstChild);
        }

        /* HUMAN PROBABILITY: moves with what you do */
        var human = 63 + ((Math.random() * 8) | 0);
        function setHuman(v, why) {
            var prev = human;
            human = Math.max(3, Math.min(99, Math.round(v)));
            pctEl.textContent = human + '%';
            barEl.style.transform = 'scaleX(' + human / 100 + ')';
            root.classList.toggle('cap-machine', human < 50);
            $('.cap-verdict').textContent = human < 50 ? 'READING: MACHINE' : 'READING: HUMAN';
            if (human !== prev && open) { au.sfx(human > prev ? 'human_up' : 'human_down'); D.replay(pctEl, 'cap-bump'); }
            if (why) note(why);
        }
        var open = false;
        setHuman(human);

        var moved = 0, lastX = null, lastY = null, lastMove = performance.now(), stillNoted = 0;
        root.addEventListener('pointermove', function (e) {
            if (!open) return;
            if (lastX != null) moved += Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY);
            lastX = e.clientX; lastY = e.clientY; lastMove = performance.now(); stillNoted = 0;
            if (moved > 700) { setHuman(human + 1, L.log.move.replace('{px}', Math.round(moved))); moved = 0; }
        });
        var stillT = setInterval(function () {
            if (!open) return;
            var s = (performance.now() - lastMove) / 1000;
            if (s > 2 && Math.floor(s) > stillNoted) { stillNoted = Math.floor(s); setHuman(human - 1, L.log.still.replace('{s}', stillNoted)); }
        }, 500);
        timers.push(stillT);

        var selected = [], hovered = {};
        root.querySelectorAll('.cap-tile').forEach(function (b) {
            var i = +b.dataset.i, right = G.correct.indexOf(i) >= 0;
            b.addEventListener('pointerenter', function () {
                if (!open || hovered[i]) return;
                hovered[i] = true;
                if (right) setHuman(human + 2, L.log.hover.replace('{what}', cellName(i)));
            });
            b.addEventListener('click', function (e) {
                e.stopPropagation();
                if (!open) return;
                var k = selected.indexOf(i);
                if (k >= 0) {
                    selected.splice(k, 1);
                    b.classList.remove('on'); b.setAttribute('aria-pressed', 'false');
                    au.sfx('tile_off');
                    setHuman(human + (right ? -10 : 6), L.log.unpick);
                } else {
                    selected.push(i);
                    b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
                    au.sfx('tile_on', selected.length - 1);
                    setHuman(human + (right ? 16 : -11), (right ? L.log.pickRight : L.log.pickWrong).replace('{what}', cellName(i)));
                }
            });
        });

        var result = {};
        var done = (async function () {
            /* 1 · THE CHECKBOX */
            au.cue('audit');
            au.sfx('open');
            root.classList.add('cap-s-box');
            note(L.log.start.replace('{n}', 1000 + ((Math.random() * 9000) | 0)));
            var check = $('.cap-check');
            try { check.focus({ preventScroll: true }); } catch (e) {}
            await new Promise(function (r) { check.addEventListener('click', function (e) { e.stopPropagation(); r(); }, { once: true }); });
            au.sfx('check');
            root.classList.add('cap-s-spin');
            au.sfx('spin');
            await sleep(900);

            /* 2 · THE GRID */
            root.classList.add('cap-s-grid');
            au.sfx('grid');
            open = true;
            var t0 = performance.now();
            log(L.title + '. ' + L.select + ' ' + G.label + '.');
            try { $('.cap-tile').focus({ preventScroll: true }); } catch (e) {}
            await new Promise(function (r) { $('.cap-verify').addEventListener('click', function (e) { e.stopPropagation(); r(); }, { once: true }); });
            var elapsed = performance.now() - t0;
            open = false;

            /* 4 · THE VERDICT (the game's rules, unchanged) */
            au.sfx('verify');
            au.cue('verify');
            root.classList.add('cap-s-verify');
            $('.cap-result b').textContent = L.verifying;
            var nRight = G.correct.filter(function (i) { return selected.indexOf(i) >= 0; }).length;
            var nWrong = selected.length - nRight;
            var pass, why;
            if (elapsed < 200) { pass = true; why = L.reasons.fast.replace('{t}', (elapsed / 1000).toFixed(3)); }
            else if (nWrong > 0 && nRight === 0) { pass = true; why = L.reasons.wrong; }
            else if (!selected.length) { pass = true; why = L.reasons.none; }
            else { pass = false; why = L.reasons.correct; }
            var outcome = pass ? 'pass' : (opts.firstFail ? 'tax' : 'warn');
            var gain = pass ? Math.max(100, (st.energy || 0) * reward.energy) : 0;
            result = { pass: pass, outcome: outcome, reason: why, selected: selected.slice(), correct: G.correct.slice(), elapsed: Math.round(elapsed), energy: gain, data: pass ? reward.data : 0 };
            await sleep(1300);

            var res = $('.cap-result');
            root.classList.add('cap-s-result', 'cap-o-' + outcome);
            res.querySelector('code').textContent = why;
            note('verdict: ' + why, pass ? 'ok' : 'bad');
            if (pass) {
                au.sfx('pass'); au.cue('passed');
                $('.cap-result .cap-mark').textContent = '✓';
                res.querySelector('b').textContent = L.passT;
                res.querySelector('span').textContent = '';
                res.querySelector('em').textContent = '+' + D.fmt(gain) + ' E  ·  +' + reward.data + ' DATA';
                setHuman(Math.min(human, 12));
                later(function () { D.replay($('.cap-stamp'), 'on'); au.sfx('reward'); }, 500);
            } else {
                au.sfx('fail'); au.cue('failed');
                G.correct.forEach(function (i) { if (selected.indexOf(i) >= 0) root.querySelector('.cap-tile[data-i="' + i + '"]').classList.add('bad'); });
                $('.cap-result .cap-mark').textContent = '✗';
                res.querySelector('b').textContent = outcome === 'warn' ? L.warnT : L.failT;
                res.querySelector('span').textContent = outcome === 'warn' ? L.warnB : '';
                res.querySelector('em').textContent = outcome === 'tax' ? L.taxT + ': ' + L.taxB : '';
                setHuman(Math.max(human, 94));
                if (outcome === 'tax') later(function () { au.sfx('tax'); }, 600);
                else later(function () { au.sfx('warn'); }, 600);
            }
            log(res.querySelector('b').textContent + '. ' + why + '. ' + res.querySelector('span').textContent + ' ' + res.querySelector('em').textContent);
            if (typeof opts.onResult === 'function') { try { opts.onResult(result); } catch (e) {} }
            await sleep(900);
            var labels = opts.choices || [{ id: 'continue', label: outcome === 'warn' ? 'UNDERSTOOD' : 'CONTINUE' }];
            result.action = await D.choices(root, labels).show();
            finish();
            return result;
        })();

        function finish() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); shell.close(); }
        return { done: done, close: finish, grid: G };
    }

    window.CaptchaScene = { play: play, ART: ART, GRIDS: GRIDS, LINES: LINES };
})();
