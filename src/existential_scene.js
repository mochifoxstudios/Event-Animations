/* ═══════════════════════════════════════════════════════════════════════════
   existential_scene.js — THE EXISTENTIAL CRISIS, staged.

   Once, at 1,000,000 clicks, the game breaks and asks why.

     1 THE BREAK     the counter rolls onto 1,000,000, glitches, tears — and
                     cuts to black. Total silence.
     2 THE FALL      out of the dark, the seven digits come loose and fall away.
                     A heartbeat. Numbers begin to rise out of the abyss.
     3 THE QUESTION  "What is the purpose of clicking?" — one heavy letter at a
                     time, the camera pushing in, whispers surfacing at the
                     edges ("who is counting?", "you could stop.").
     4 THE ANSWERS   four answers. Hovering one changes the world: the numbers
                     turn red and race, or multiply, or glitter, or stop and
                     fall; the screen previews the scar it leaves. Choosing is
                     PRESS-AND-HOLD — the frame closes in while you hold.
     5 THE CONSEQUENCE  a full-screen moment per answer: POWER's shockwave and
                     ×1.5 · NUMBERS's flood and fracture · FUN's shards and the
                     figure rising into a spotlight · VOID's drain, the ACQUIRE
                     ring cracking, and silence.
     6 THE MARK      what the player keeps, stated once. CONTINUE.

   PATHS ARE DATA. opts.paths replaces or extends them; each names its gift,
   its mark text and which built-in mark it uses (vignette · shift · figure ·
   drain · none). opts.question and opts.whispers change the words.

   Laid out on the shared 1920×1080 canvas (DuckScene.fit). The number field is
   one <canvas>; everything else animates transform and opacity only.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;

    var PATHS = [
        { key: 'POWER',   glyph: 'bolt', label: 'POWER',   desc: 'Numbers. Growing. Forever.',
          gift: '×1.5', giftSub: 'INCOME · PERMANENT', mark: 'vignette', color: '#ff4a3a',
          markText: 'A faint crimson guilt lines your vision. It will not leave.' },
        { key: 'NUMBERS', glyph: 'infinity', label: 'NUMBERS', desc: 'The count is all that matters.',
          gift: '×2', giftSub: 'ENERGY DOUBLED', mark: 'shift', color: '#8f8fff',
          markText: 'The simulation has fractured. Alignment is permanently off by 2 pixels. You did this.' },
        { key: 'FUN',     glyph: 'gem', label: 'FUN',     desc: 'It was always about this.',
          gift: '+25', giftSub: 'FRAGMENTS · CORRECT ANSWER', mark: 'figure', color: '#7fdc8a',
          markText: 'A figure watches from below. It has always been there.' },
        { key: 'VOID',    glyph: 'cross', label: 'VOID',    desc: 'The flesh is a bottleneck.',
          gift: '×3', giftSub: 'PASSIVE FOREVER · ACQUIRE DISABLED', mark: 'drain', color: '#a4a4b4',
          markText: 'Colour drains from the simulation. The numbers remain. Colour was never the point.' }
    ];

    var WHISPERS = ['why?', 'for the number?', 'who is counting?', 'you could stop.', 'it would not notice.',
                    'one more.', 'it was never yours.', 'the button does not care.', 'again.', 'what were you before this?'];

    var HOLD_MS = 1100;

    var FIGURE_SVG =
        '<svg viewBox="0 0 40 52" aria-hidden="true">'
      + '<path d="M20,3 C9,3 5,13 5,24 C5,34 3,44 2,50 L38,50 C37,44 35,34 35,24 C35,13 31,3 20,3 Z" fill="currentColor" fill-opacity=".92"/>'
      + '<path d="M20,9 C13,9 10,16 10,23 C10,28 14,31 20,31 C26,31 30,28 30,23 C30,16 27,9 20,9 Z" fill="#000" fill-opacity=".9"/>'
      + '<circle cx="16" cy="22" r="1.6" fill="#fff"/><circle cx="24" cy="22" r="1.6" fill="#fff"/></svg>';

    var CRACK_SVG =
        '<svg viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true">'
      + '<polyline points="0,610 380,560 520,640 860,500 1010,560 1300,430 1460,520 1920,380" fill="none" stroke="#fff" stroke-width="3"/>'
      + '<polyline points="860,500 900,380 980,330" fill="none" stroke="#fff" stroke-width="1.6"/>'
      + '<polyline points="1300,430 1330,600 1420,700" fill="none" stroke="#fff" stroke-width="1.6"/></svg>';

    /* ── THE NUMBER FIELD ────────────────────────────────────────────────────
       One canvas, ~170 glyphs. The mode decides what they are and how they move. */
    function Field(cv, reduced) {
        var g = cv.getContext('2d');
        var W = cv.width, H = cv.height;
        var parts = [], mode = 'off', raf = 0, color = '200,195,230', chars = '0123456789';
        var cfg = { off: 0 };
        for (var i = 0; i < 170; i++) parts.push(spawn({}, true));

        function rnd(a, b) { return a + Math.random() * (b - a); }
        function spawn(p, anywhere) {
            p.x = rnd(0, W);
            p.y = anywhere ? rnd(0, H) : H + rnd(10, 200);
            p.vx = rnd(-0.15, 0.15);
            p.vy = rnd(-0.9, -0.25);
            p.size = rnd(14, 42);
            p.a = 0;
            p.ta = rnd(0.05, 0.22);
            p.rot = 0; p.vr = 0;
            p.ch = chars.charAt((Math.random() * chars.length) | 0);
            return p;
        }
        function set(m) {
            mode = m;
            parts.forEach(function (p) {
                if (m === 'drift' || m === 'question') { color = '200,195,230'; chars = '0123456789'; p.vy = rnd(-0.9, -0.25); p.vx = rnd(-0.15, 0.15); p.ta = rnd(0.05, 0.2); p.vr = 0; }
                if (m === 'power')   { color = '255,74,58'; p.vy = rnd(-9, -4); p.vx = rnd(-0.4, 0.4); p.ta = rnd(0.25, 0.6); }
                if (m === 'power-p') { color = '255,90,70'; p.vy = rnd(-3, -1.4); p.ta = rnd(0.12, 0.3); }
                if (m === 'numbers' || m === 'numbers-p') {
                    color = '143,143,255'; chars = '0123456789';
                    var ang = Math.atan2(p.y - H / 2, p.x - W / 2), sp = m === 'numbers' ? rnd(4, 12) : rnd(0.4, 1.2);
                    p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp; p.ta = m === 'numbers' ? rnd(0.3, 0.7) : rnd(0.12, 0.28);
                }
                if (m === 'fun' || m === 'fun-p') { color = '127,220,138'; chars = 'GDS'; p.ch = chars.charAt((Math.random() * 3) | 0); p.vy = rnd(0.4, 1.8); p.vx = rnd(-0.6, 0.6); p.vr = rnd(-0.04, 0.04); p.ta = m === 'fun' ? rnd(0.3, 0.7) : rnd(0.1, 0.3); }
                if (m === 'void' || m === 'void-p') { color = '160,160,175'; p.vx = 0; p.vy = m === 'void' ? 0.2 : 0; p.ta = m === 'void' ? 0 : rnd(0.04, 0.12); }
                if (m === 'off') p.ta = 0;
            });
            if (reduced) draw(true);
        }
        function shape(k, r) {
            g.beginPath();
            if (k === 'S') { g.moveTo(0, -r); g.quadraticCurveTo(r * 0.12, -r * 0.12, r, 0); g.quadraticCurveTo(r * 0.12, r * 0.12, 0, r); g.quadraticCurveTo(-r * 0.12, r * 0.12, -r, 0); g.quadraticCurveTo(-r * 0.12, -r * 0.12, 0, -r); g.fill(); return; }
            g.moveTo(0, -r); g.lineTo(r, 0); g.lineTo(0, r); g.lineTo(-r, 0); g.closePath();
            g.lineWidth = Math.max(1.5, r * 0.18); g.strokeStyle = g.fillStyle; g.stroke();
            if (k === 'G') { var q = r * 0.45; g.beginPath(); g.moveTo(0, -q); g.lineTo(q, 0); g.lineTo(0, q); g.lineTo(-q, 0); g.closePath(); g.fill(); }
        }
        function step() {
            g.clearRect(0, 0, W, H);
            g.textAlign = 'center'; g.textBaseline = 'middle';
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i];
                if (mode === 'void') p.vy += 0.12;                              // they fall
                p.x += p.vx; p.y += p.vy; p.rot += p.vr;
                p.a += (p.ta - p.a) * 0.05;
                var out = p.y < -60 || p.y > H + 220 || p.x < -60 || p.x > W + 60;
                if (out && mode !== 'void' && mode !== 'off') {
                    spawn(p, false);
                    if (mode === 'fun' || mode === 'fun-p') { p.y = -40; p.vy = rnd(0.4, 1.8); p.ch = chars.charAt((Math.random() * chars.length) | 0); }
                    if (mode === 'numbers' || mode === 'numbers-p') { p.x = W / 2 + rnd(-40, 40); p.y = H / 2 + rnd(-40, 40); var a2 = rnd(0, 6.28), s2 = mode === 'numbers' ? rnd(4, 12) : rnd(0.4, 1.2); p.vx = Math.cos(a2) * s2; p.vy = Math.sin(a2) * s2; }
                    if (mode === 'power' || mode === 'power-p') p.vy = mode === 'power' ? rnd(-9, -4) : rnd(-3, -1.4);
                    p.ta = mode === 'power' || mode === 'numbers' || mode === 'fun' ? rnd(0.25, 0.6) : rnd(0.05, 0.22);
                }
                if (p.a < 0.004) continue;
                g.save();
                g.translate(p.x, p.y);
                if (p.rot) g.rotate(p.rot);
                g.fillStyle = 'rgba(' + color + ',' + p.a.toFixed(3) + ')';
                if (mode === 'fun' || mode === 'fun-p') shape(p.ch, p.size * 0.42);     // drawn, not typed: gem · diamond · sparkle
                else { g.font = (p.size | 0) + 'px "Courier New", monospace'; g.fillText(p.ch, 0, 0); }
                g.restore();
            }
        }
        function draw(once) { if (once) { parts.forEach(function (p) { p.a = p.ta; }); step(); } }
        function loop() { step(); raf = requestAnimationFrame(loop); }
        if (!reduced) raf = requestAnimationFrame(loop);
        return { set: set, stop: function () { cancelAnimationFrame(raf); } };
    }

    /* play(host, opts) → { done: Promise<{ key, path }>, close() }
       opts.state      { energy } for the NUMBERS count (falls back to window.state)
       opts.paths      replace the four answers · opts.question · opts.whispers
       opts.onChoose   (path) => void, the moment the hold completes — apply the gift here
       opts.audio      false for silence */
    function play(host, opts) {
        opts = opts || {};
        var paths = opts.paths || PATHS;
        var question = opts.question || 'What is the purpose of clicking?';
        var whispers = opts.whispers || WHISPERS;
        var energy = ((opts.state || window.state || {}).energy) || 4.21e15;
        var reduced = D.reduced();
        var au = D.audio(opts, window.ExistentialScore);
        var dir = D.director();
        var shell = D.shell(host, 'exs', dir, au);
        var root = shell.root;
        root.setAttribute('aria-label', 'Operator query');
        var timers = [];
        function later(fn, ms) { var t = setTimeout(fn, reduced ? Math.min(ms, 200) : ms); timers.push(t); return t; }
        function sleep(ms) { return new Promise(function (r) { later(r, ms); }); }

        /* layers, back to front */
        var cv = document.createElement('canvas');
        cv.width = D.W; cv.height = D.H; cv.className = 'exs-field';
        var cam = D.h('div', 'exs-cam');
        var veil = D.h('div', 'exs-veil');
        var close = D.h('div', 'exs-close');
        var drain = D.h('div', 'exs-drain');
        var spot = D.h('div', 'exs-spot');
        var figure = D.h('div', 'exs-figure', FIGURE_SVG);
        var crack = D.h('div', 'exs-crack', CRACK_SVG);
        var tear = D.h('div', 'exs-tear', '<i></i><i></i><i></i><i></i><i></i><i></i>');
        var flash = D.h('div', 'exs-flash');
        var black = D.h('div', 'exs-black');
        [cv, cam, veil, close, spot, figure, crack, drain, tear, flash, black].forEach(function (el) { root.appendChild(el); });
        var field = Field(cv, reduced);

        var counter = D.h('div', 'exs-counter');
        var counterLbl = D.h('div', 'exs-counter-lbl', 'TOTAL CLICKS');
        var q = D.h('div', 'exs-question');
        var whisperLayer = D.h('div', 'exs-whispers');
        var grid = D.h('div', 'exs-choices');
        var hint = D.h('div', 'exs-hold-hint', 'PRESS AND HOLD TO ANSWER · THIS CANNOT BE UNDONE');
        var result = D.h('div', 'exs-result');
        cam.appendChild(whisperLayer);
        cam.appendChild(counter);
        cam.appendChild(counterLbl);
        cam.appendChild(q);
        cam.appendChild(grid);
        cam.appendChild(hint);
        cam.appendChild(result);

        function setCounter(n) {
            var txt = Math.round(n).toLocaleString('en-US');
            counter.innerHTML = txt.split('').map(function (c) { return '<span>' + c + '</span>'; }).join('');
            counter.setAttribute('data-text', txt);
        }

        var cards = paths.map(function (p, i) {
            var c = D.h('button', 'exs-card',
                '<span class="exs-fill"></span><span class="g">' + D.glyph(p.glyph || '·') + '</span>'
              + '<span class="l">' + D.esc(p.label) + '</span><span class="d">' + D.esc(p.desc) + '</span>');
            c.type = 'button';
            c.style.setProperty('--c', p.color || '#c9c3e6');
            c.style.setProperty('--i', i);
            c.setAttribute('aria-label', p.label + ': ' + p.desc + '. Press and hold to choose.');
            grid.appendChild(c);
            return c;
        });

        var log = shell.log;
        var chosen = null, resolveChoice;
        var picked = new Promise(function (r) { resolveChoice = r; });

        /* ── hover changes the world; holding closes the frame in ───────────── */
        cards.forEach(function (c, i) {
            var p = paths[i], timer = null, held = false;
            function preview(on) {
                if (chosen) return;
                root.dataset.preview = on ? (p.mark || 'none') : '';
                field.set(on ? ({ vignette: 'power-p', shift: 'numbers-p', figure: 'fun-p', drain: 'void-p' }[p.mark] || 'question') : 'question');
                if (on) au.sfx('hover', i);
            }
            function startHold(e) {
                if (chosen || !grid.classList.contains('dks-on')) return;
                if (e && e.type === 'pointerdown') { try { c.setPointerCapture(e.pointerId); } catch (x) {} }
                held = true;
                c.classList.add('exs-holding');
                root.classList.add('exs-holding-any');
                au.sfx('hold', i);
                timer = setTimeout(function () { if (held) choose(i); }, HOLD_MS);
            }
            function endHold() {
                if (!held || chosen) return;
                held = false;
                clearTimeout(timer);
                c.classList.remove('exs-holding');
                root.classList.remove('exs-holding-any');
                au.sfx('release');
            }
            c.addEventListener('pointerenter', function () { preview(true); });
            c.addEventListener('pointerleave', function () { preview(false); endHold(); });
            c.addEventListener('focus', function () { preview(true); });
            c.addEventListener('blur', function () { preview(false); });
            c.addEventListener('pointerdown', startHold);
            c.addEventListener('pointerup', endHold);
            c.addEventListener('pointercancel', endHold);
            c.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); startHold(); } });
            c.addEventListener('keyup', function (e) { if (e.key === 'Enter' || e.key === ' ') endHold(); });
            c.addEventListener('click', function (e) { e.stopPropagation(); });
        });

        function choose(i) {
            if (chosen) return;
            chosen = paths[i];
            root.dataset.preview = '';
            root.dataset.chosen = chosen.key;
            root.style.setProperty('--pick', chosen.color || '#fff');
            root.classList.remove('exs-holding-any');
            cards.forEach(function (c, k) { c.classList.add(k === i ? 'exs-picked' : 'exs-gone'); c.disabled = true; });
            hint.classList.remove('dks-on');
            log('You chose ' + chosen.label + '.');
            if (typeof opts.onChoose === 'function') { try { opts.onChoose(chosen); } catch (e) {} }
            resolveChoice(i);
        }

        var whisperTimer = null;
        function whisperLoop() {
            var w = D.h('div', 'exs-whisper', D.esc(whispers[(Math.random() * whispers.length) | 0]));
            /* whispers surface in the bands the question, cards and hint leave free: above, and below */
            var top = Math.random() < 0.5;
            w.style.fontSize = (26 + Math.random() * 10) + 'px';
            w.style.top = (top ? 96 + Math.random() * 40 : 915 + Math.random() * 50) + 'px';
            whisperLayer.appendChild(w);
            var ww = w.offsetWidth || 400, maxX = (top ? 1640 : 1840) - ww;   // top band keeps clear of SKIP
            w.style.left = Math.max(80, 80 + Math.random() * (maxX - 80)) + 'px';
            au.sfx('whisper');
            later(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 5200);
            whisperTimer = later(whisperLoop, 2200 + Math.random() * 2600);
        }

        var done = (async function () {
            /* 1 · THE BREAK */
            au.cue('board');
            setCounter(999996);
            root.classList.add('exs-s-count');
            for (var n = 999997; n <= 1000000; n++) {
                await dir.wait(n < 1000000 ? 360 : 520);
                setCounter(n);
                D.replay(counter, 'exs-tick');
                if (n === 1000000) au.cue(null);              // the loop stops the moment you arrive
                au.sfx(n === 1000000 ? 'arrive' : 'click');
            }
            await dir.wait(500);
            au.cue(null);
            au.sfx('glitch');
            root.classList.add('exs-s-glitch');
            await dir.wait(900);
            au.sfx('cut');
            root.classList.add('exs-s-black');
            log('1,000,000 clicks.');
            await dir.wait(1700);

            /* 2 · THE FALL */
            root.classList.remove('exs-s-glitch', 'exs-s-count');
            root.classList.add('exs-s-fall');
            root.classList.remove('exs-s-black');
            au.sfx('heartbeat');
            counter.querySelectorAll('span').forEach(function (s, k) {
                s.style.setProperty('--fx', ((k - 4) * 26 + (Math.random() * 40 - 20)) + 'px');
                s.style.setProperty('--fr', (Math.random() * 120 - 60) + 'deg');
                s.style.animationDelay = (400 + k * 140 + Math.random() * 120) + 'ms';
            });
            later(function () { au.sfx('shatter'); }, 500);
            await dir.wait(1300);
            field.set('drift');
            au.sfx('heartbeat');
            await dir.wait(1600);

            /* 3 · THE QUESTION */
            au.cue('question');
            root.classList.add('exs-s-question');
            field.set('question');
            q.innerHTML = '';
            var letters = question.split('').map(function (ch) {
                var s = D.h('span', ch === ' ' ? 'sp' : '', ch === ' ' ? '&nbsp;' : D.esc(ch));
                q.appendChild(s);
                return s;
            });
            for (var L = 0; L < letters.length; L++) {
                letters[L].classList.add('on');
                if (question.charAt(L) !== ' ') au.sfx('key');
                await dir.wait(question.charAt(L) === ' ' ? 60 : 105);
            }
            log(question);
            whisperTimer = later(whisperLoop, 900);
            await dir.wait(1600);

            /* 4 · THE ANSWERS — no timer; it waits */
            shell.done();
            root.classList.add('exs-s-answers');
            au.cue('answers');
            grid.classList.add('dks-on');
            hint.classList.add('dks-on');
            au.sfx('reveal');
            var i = await picked;
            var p = paths[i];
            clearTimeout(whisperTimer);
            whisperLayer.innerHTML = '';

            /* 5 · THE CONSEQUENCE */
            au.cue(null);
            root.classList.add('exs-s-consequence');
            D.replay(flash, 'on');
            au.sfx('choose_' + (p.mark || 'none'), i);
            var gift = D.h('div', 'exs-gift', '<b>' + D.esc(p.gift || '') + '</b><span>' + D.esc(p.giftSub || '') + '</span>');
            if (p.mark === 'vignette') {
                field.set('power');
                root.classList.add('exs-fx-power');
                await sleep(500);
                result.appendChild(gift);
                await sleep(1800);
                field.set('power-p');
            } else if (p.mark === 'shift') {
                field.set('numbers');
                var line = D.h('div', 'exs-energy');
                result.appendChild(gift);
                result.appendChild(line);
                await countEnergy(line);
                root.classList.add('exs-fx-fracture');
                au.sfx('fracture');
                await sleep(1200);
                field.set('numbers-p');
            } else if (p.mark === 'figure') {
                field.set('fun');
                burst(cam, 25);
                result.appendChild(gift);
                await sleep(1600);
                root.classList.add('exs-fx-spot');
                au.sfx('figure');
                await sleep(1600);
                field.set('fun-p');
            } else if (p.mark === 'drain') {
                field.set('void');
                root.classList.add('exs-fx-void');
                var ring = D.h('div', 'exs-acquire', '<span>ACQUIRE</span><i></i>');
                result.appendChild(ring);
                await sleep(1500);
                au.sfx('crack');
                ring.classList.add('cracked');
                await sleep(1300);
                result.appendChild(gift);
                await sleep(1200);
            } else {
                result.appendChild(gift);
                await sleep(1200);
            }
            root.classList.add('exs-mark-' + (p.mark || 'none'));

            /* 6 · THE MARK */
            var mark = D.h('div', 'exs-marktext');
            result.appendChild(mark);
            await typeSlow(mark, p.markText || '', 30);
            au.cue('after_' + (p.mark || 'none'));
            var cont = D.h('button', 'dks-btn exs-continue', 'CONTINUE');
            cont.type = 'button';
            result.appendChild(cont);
            try { cont.focus({ preventScroll: true }); } catch (e) {}
            return new Promise(function (resolve) {
                cont.addEventListener('click', function () { finish(); resolve({ key: p.key, path: p }); });
            });
        })();

        function finish() { timers.forEach(clearTimeout); field.stop(); shell.close(); }

        function typeSlow(el, text, ms) {
            return new Promise(function (r) {
                if (reduced) { el.textContent = text; return r(); }
                var k = 0;
                var iv = setInterval(function () { k++; el.textContent = text.slice(0, k); if (k % 3 === 0) au.sfx('key_soft'); if (k >= text.length) { clearInterval(iv); r(); } }, ms);
            });
        }
        function countEnergy(line) {
            return new Promise(function (r) {
                var from = energy, to = energy * 2, k = 0, steps = 36;
                var iv = setInterval(function () {
                    k++;
                    line.textContent = 'ENERGY ' + D.fmt(from + (to - from) * (k / steps));
                    if (k % 2 === 0) au.sfx('count', k);
                    if (k >= steps) { clearInterval(iv); r(); }
                }, reduced ? 5 : 45);
            });
        }
        function burst(into, count) {
            for (var k = 0; k < count; k++) {
                var s = D.h('span', 'exs-shard', D.icon('gem'));
                var ang = (k / count) * Math.PI * 2 + Math.random() * 0.4;
                var r = 260 + Math.random() * 520;
                s.style.setProperty('--dx', Math.cos(ang) * r + 'px');
                s.style.setProperty('--dy', (Math.sin(ang) * r * 0.55 - 120) + 'px');
                s.style.animationDelay = (k * 22) + 'ms';
                into.appendChild(s);
                if (k % 4 === 0) later(function () { au.sfx('shard'); }, k * 22);
            }
        }

        return { done: done, close: finish };
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

    window.ExistentialScene = { play: play, applyMark: applyMark, PATHS: PATHS, WHISPERS: WHISPERS, HOLD_MS: HOLD_MS };
})();
