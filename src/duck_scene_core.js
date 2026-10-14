/* ═══════════════════════════════════════════════════════════════════════════
   duck_scene_core.js — what the Council and the Tribunal share.

   · director()  paces a scene. Every wait and every typed line is a STEP, and a
                 click completes the current step; FAST-FORWARD shortens all the
                 rest. The Council comes back every 1–3 hours, so a player who has
                 seen it must be able to get to the verdict in two seconds.
   · bench()     five seats: furniture, member, prop slot and a speech bubble
                 anchored above each seat (anchored in CSS, never measured).
   · say()       a member speaks: bubble up, bill moving, the others turn to look.

   Depends on DuckCast (duck_cast_art.js) and optionally CouncilArt / TribunalArt.
   Every one of them degrades: a missing art module leaves an empty seat, not a
   broken scene.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var D = {};

    D.reduced = function () {
        try {
            if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
            var c = document.body.classList;
            return c.contains('safe-mode') || c.contains('accessibility-mode');
        } catch (e) { return false; }
    };

    D.h = function (tag, cls, html) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html != null) e.innerHTML = html;
        return e;
    };

    D.esc = function (s) {
        return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
    };

    D.fmt = function (n) {
        if (typeof window.format === 'function') { try { return window.format(n); } catch (e) {} }
        n = +n || 0;
        if (Math.abs(n) >= 1e6) return n.toExponential(2).replace('e+', 'e');
        return Math.round(n).toLocaleString('en-US');
    };

    /* ── ICONS ───────────────────────────────────────────────────────────────
       Every symbol in every event is one of these hand-drawn SVGs (24×24, drawn in
       currentColor, sized by font-size like text). No emoji and no symbol fonts: they
       render differently, or as colour emoji, from one system to the next. */
    D.ICONS = {
        bolt: '<path d="M13.5 2 4 14h7l-1.5 8L20 10h-7z" fill="currentColor"/>',
        replay: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4"/><path d="M3.5 3.5v5h5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4"/>',
        play: '<path d="M7 4v16l13-8z" fill="currentColor"/>',
        skip: '<path d="M3 5v14l8.5-7zM12 5v14l8.5-7z" fill="currentColor"/>',
        note: '<path d="M9 18V5.5l11-2.5v13" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><circle cx="6.5" cy="18" r="2.8" fill="currentColor"/><circle cx="17.5" cy="16" r="2.8" fill="currentColor"/>',
        waves: '<path d="M3 7q3-3 6 0t6 0 6 0M3 12q3-3 6 0t6 0 6 0M3 17q3-3 6 0t6 0 6 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"/>',
        ban: '<circle cx="12" cy="12" r="8.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6"/><path d="M5.8 18.2 18.2 5.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6"/>',
        erase: '<path d="M9 5h11.5v14H9l-6.5-7z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"/><path d="m12 9 5 6m0-6-5 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"/>',
        diamond: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"/>',
        gem: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M12 7.5 16.5 12 12 16.5 7.5 12z" fill="currentColor"/>',
        sparkle: '<path d="M12 1.5c.9 6.4 3.6 9.6 10.5 10.5-6.9.9-9.6 4.1-10.5 10.5-.9-6.4-3.6-9.6-10.5-10.5 6.9-.9 9.6-4.1 10.5-10.5z" fill="currentColor"/>',
        eye: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"/><circle cx="12" cy="12" r="4.6" fill="currentColor"/>',
        target: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"/><circle cx="12" cy="12" r="4.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>',
        dot: '<circle cx="12" cy="12" r="6" fill="currentColor"/>',
        halfLeft: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
        halfTop: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M3 12a9 9 0 0 1 18 0z" fill="currentColor"/>',
        halfBottom: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M3 12a9 9 0 0 0 18 0z" fill="currentColor"/>',
        cross: '<path d="M5.5 5.5l13 13M18.5 5.5l-13 13" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/>',
        check: '<path d="m4 12.5 5 5L20 6.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/>',
        warning: '<path d="M12 3 22 20H2z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"/><path d="M12 9.5v4.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4"/><circle cx="12" cy="17" r="1.3" fill="currentColor"/>',
        hex: '<path d="M12 2.5 20.2 7.25v9.5L12 21.5l-8.2-4.75v-9.5z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"/>',
        hexFill: '<path d="M12 2.5 20.2 7.25v9.5L12 21.5l-8.2-4.75v-9.5z" fill="currentColor"/>',
        snowflake: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5M3.7 10.4l3.4-.9-.9-3.4M20.3 13.6l-3.4.9.9 3.4M6.2 17.9l.9-3.4-3.4-.9M17.8 6.1l-.9 3.4 3.4.9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/>',
        skull: '<path fill-rule="evenodd" fill="currentColor" d="M12 2a8.5 8.5 0 0 0-8.5 8.5c0 3 1.4 5.2 3.5 6.5V21h2.2v-2h1.6v2h2.4v-2h1.6v2H17v-4c2.1-1.3 3.5-3.5 3.5-6.5A8.5 8.5 0 0 0 12 2zM8.6 8.6a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zm6.8 0a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM12 13.4l1.3 2.4h-2.6z"/>',
        cup: '<path d="M4 9h12v5.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" fill="currentColor"/><path d="M16 11h1.5a2.6 2.6 0 0 1 0 5.2H16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M8 2.5c-1 1.4 1 2.4 0 4.2M12 2.5c-1 1.4 1 2.4 0 4.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"/><path d="M3 21.5h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>',
        lock: '<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4"/>',
        infinity: '<path d="M12 12c-2.2-3-4.2-4.6-6.2-4.6a4.6 4.6 0 0 0 0 9.2c2 0 4-1.6 6.2-4.6s4.2-4.6 6.2-4.6a4.6 4.6 0 0 1 0 9.2c-2 0-4-1.6-6.2-4.6z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3"/>'
    };
    D.icon = function (name, cls) {
        var b = D.ICONS[name];
        return b ? '<svg class="dks-ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + b + '</svg>' : '';
    };
    /* an icon name, or (for data from the game) plain text */
    D.glyph = function (g) { return D.ICONS[g] ? D.icon(g) : D.esc(g || ''); };

    /* restart a class-driven animation: removing and re-adding a class that is already there does nothing */
    D.replay = function (el, cls) {
        el.classList.remove(cls);
        void el.offsetWidth;
        el.classList.add(cls);
    };

    /* ── THE DIRECTOR ────────────────────────────────────────────────────── */
    D.director = function () {
        var cur = null, fast = false, dead = false;

        function step(start) {
            return new Promise(function (resolve) {
                if (dead) return;                       // a closed scene simply stops
                var finished = false, complete = null;
                function done() {
                    if (finished) return;
                    finished = true;
                    if (cur === skipper) cur = null;
                    if (!dead) resolve();
                }
                function skipper() { if (complete) complete(); done(); }
                complete = start(done);
                if (!finished) cur = skipper;
            });
        }

        return {
            wait: function (ms) {
                return step(function (done) {
                    var t = setTimeout(done, fast ? Math.min(ms, 70) : ms);
                    return function () { clearTimeout(t); };
                });
            },
            type: function (el, text, msPerChar, onChar) {
                text = String(text || '');
                return step(function (done) {
                    if (fast || !text) { el.textContent = text; setTimeout(done, 0); return null; }
                    var i = 0;
                    el.textContent = '';
                    var iv = setInterval(function () {
                        i += 1;
                        el.textContent = text.slice(0, i);
                        if (onChar && /[A-Za-z0-9]/.test(text.charAt(i - 1))) onChar();
                        if (i >= text.length) { clearInterval(iv); done(); }
                    }, msPerChar || 18);
                    return function () { clearInterval(iv); el.textContent = text; };
                });
            },
            skip: function () { if (cur) cur(); },
            fastForward: function () { fast = true; if (cur) cur(); },
            isFast: function () { return fast; },
            kill: function () { dead = true; cur = null; }
        };
    };

    /* ── SOUND ───────────────────────────────────────────────────────────────
       Each event has its own score (src/audio/score_*.js) played through
       EventAudio. `opts.audio === false` silences a scene; `opts.sound(name)`,
       if given, is told about every effect as well (the game's own hook). */
    D.audio = function (opts, score) {
        opts = opts || {};
        var au = (opts.audio !== false && window.EventAudio && score) ? EventAudio.session(score) : null;
        var hook = typeof opts.sound === 'function' ? opts.sound : null;
        return {
            cue: function (name) { if (au) au.cue(name); },
            sfx: function (name) {
                if (au) au.sfx.apply(null, arguments);
                if (hook) { try { hook.apply(null, arguments); } catch (e) {} }
            },
            voice: function (seat) { if (au) au.voice(seat); },
            stop: function () { if (au) au.stop(); }
        };
    };

    /* ── THE BENCH ───────────────────────────────────────────────────────── */
    D.bench = function (kind) {
        var row = D.h('div', 'dks-row');
        var seats = [];
        for (var i = 0; i < 5; i++) {
            var furn = '';
            if (kind === 'tribunal' && window.TribunalArt) furn = TribunalArt.stall(i);
            if (kind === 'council' && window.CouncilArt) furn = CouncilArt.seat(i);
            var cast = window.DuckCast ? DuckCast.duck(i, 'dks-cast') : '<span class="dks-fallback">' + D.icon('halfBottom') + '</span>';
            var seat = D.h('div', 'dks-seat dks-seat-' + i,
                '<div class="dks-furn">' + furn + '</div>'
              + '<div class="dks-duck"><div class="dks-face"><div class="dks-bob">' + cast + '</div></div></div>'
              + '<div class="dks-prop"></div>'
              + '<div class="dks-anchor"><div class="dks-bubble"><div class="dks-who"></div><div class="dks-say"></div></div></div>');
            row.appendChild(seat);
            seats.push({
                i: i,
                el: seat,
                prop: seat.querySelector('.dks-prop'),
                bubble: seat.querySelector('.dks-bubble'),
                who: seat.querySelector('.dks-who'),
                text: seat.querySelector('.dks-say')
            });
        }
        return { row: row, seats: seats };
    };

    /* Turn the bench toward a seat (null = everyone faces front). `still` lists
       seats that never turn. */
    D.look = function (seats, target, still) {
        seats.forEach(function (s) {
            if (still && still.indexOf(s.i) >= 0) return;
            s.el.classList.toggle('dks-look-left', target != null && s.i > target);
        });
    };

    D.hush = function (seats) {
        seats.forEach(function (s) {
            s.bubble.classList.remove('dks-on', 'dks-action', 'dks-murmur');
            s.el.classList.remove('dks-talking');
        });
    };

    /* A member speaks. kind: 'speech' (typed, bill moving) · 'action' (a stage
       direction in that member's bubble: italic, no talking) · 'murmur' */
    D.say = function (dir, seats, idx, who, text, kind, opts) {
        opts = opts || {};
        var s = seats[idx];
        D.hush(seats);
        if (!opts.noLook) D.look(seats, idx, opts.still);
        if (kind === 'action') s.bubble.classList.add('dks-action');
        if (kind === 'murmur') s.bubble.classList.add('dks-murmur');
        s.who.textContent = who || '';
        s.text.textContent = '';
        D.replay(s.bubble, 'dks-on');
        if (kind === 'speech') s.el.classList.add('dks-talking');
        if (kind === 'action') D.replay(s.el, 'dks-gesture');
        if (opts.log) opts.log((who ? who + ': ' : '') + text);
        var onChar = (kind === 'speech' && opts.voice) ? function () { opts.voice(idx); } : null;
        return dir.type(s.text, text, kind === 'action' ? 12 : (opts.cps || 18), onChar).then(function () {
            s.el.classList.remove('dks-talking');
            var hold = opts.hold != null ? opts.hold : Math.min(2400, 650 + text.length * 13);
            return dir.wait(hold);
        });
    };

    /* ── PROPS ───────────────────────────────────────────────────────────── */
    D.GAVEL_SVG =
        '<svg viewBox="0 0 64 64" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<ellipse cx="34" cy="58" rx="20" ry="4" class="gv-ring"/>'
      + '<rect x="22" y="54" width="24" height="5" rx="1.5" class="pf" style="fill-opacity:.3"/>'
      + '<g class="gv-head">'
      +   '<line x1="52" y1="52" x2="30" y2="30"/>'
      +   '<g transform="rotate(-45 24 24)"><rect x="12" y="17" width="24" height="14" rx="3" class="pf" style="fill-opacity:.35"/>'
      +   '<line x1="17" y1="17" x2="17" y2="31"/><line x1="31" y1="17" x2="31" y2="31"/></g>'
      + '</g></svg>';

    D.gavel = function (seat) {
        var g = D.h('div', 'dks-gavel', D.GAVEL_SVG);
        seat.el.appendChild(g);
        return g;
    };

    /* ── CHOICES ─────────────────────────────────────────────────────────────
       A row of decision buttons from data: [{ id, label, title?, alt? }].
       show() reveals them and resolves with the id that was pressed. Any scene can
       offer any number of decisions without new code. */
    D.choices = function (parent, list) {
        var row = D.h('div', 'dks-actions');
        var btns = list.map(function (c) {
            var b = D.h('button', 'dks-btn' + (c.alt ? ' dks-alt' : ''), D.esc(c.label));
            b.type = 'button';
            if (c.title) b.title = c.title;
            b.hidden = true;
            row.appendChild(b);
            return b;
        });
        parent.appendChild(row);
        return {
            show: function () {
                btns.forEach(function (b) { b.hidden = false; });
                try { btns[0].focus({ preventScroll: true }); } catch (e) {}
                return new Promise(function (resolve) {
                    btns.forEach(function (b, i) { b.addEventListener('click', function () { resolve(list[i].id); }); });
                });
            }
        };
    };

    /* ── THE 16:9 CANVAS ─────────────────────────────────────────────────────
       Puts `inner` (laid out at 1920×1080) inside a frame that fills `host`, and
       scales it to fit, centred. The frame's own background is the dark edge a
       21:9 or a portrait screen sees. */
    D.W = 1920; D.H = 1080;
    D.fit = function (host, inner) {
        var frame = D.h('div', 'dks-fit');
        frame.appendChild(inner);
        host.appendChild(frame);
        function size() {
            var w = frame.clientWidth, h = frame.clientHeight;
            if (!w || !h) return;
            var s = Math.min(w / D.W, h / D.H);
            inner.style.transform = 'translate(' + ((w - D.W * s) / 2) + 'px,' + ((h - D.H * s) / 2) + 'px) scale(' + s + ')';
        }
        /* the canvas is larger than the frame in layout terms (it is scaled by a transform), so a focused
           button could scroll the frame and shift the whole scene; it never may */
        [frame, inner].forEach(function (el) {
            el.addEventListener('scroll', function () { el.scrollTop = 0; el.scrollLeft = 0; });
        });
        var ro = window.ResizeObserver ? new ResizeObserver(size) : null;
        if (ro) ro.observe(frame); else window.addEventListener('resize', size);
        size();
        return {
            frame: frame,
            remove: function () {
                if (ro) ro.disconnect(); else window.removeEventListener('resize', size);
                if (frame.parentNode) frame.parentNode.removeChild(frame);
            }
        };
    };

    /* ── THE SCENE SHELL ─────────────────────────────────────────────────── */
    /* o.keys false: no Space/Enter skip (a scene that plays over the live game must not take its keys) */
    D.shell = function (host, cls, dir, au, o) {
        var root = D.h('div', 'dks ' + cls + ' dks-pre');
        if (D.reduced()) root.classList.add('dks-reduced');
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        var log = D.h('div', 'dks-sr');
        log.setAttribute('aria-live', 'polite');
        var skipBtn = D.h('button', 'dks-skip', 'SKIP ' + D.icon('skip'));
        skipBtn.type = 'button';
        skipBtn.title = 'Skip to the verdict';
        var hint = D.h('div', 'dks-hint', 'click to hurry them along');
        root.appendChild(skipBtn);
        root.appendChild(log);
        root.appendChild(hint);

        skipBtn.addEventListener('click', function (e) { e.stopPropagation(); dir.fastForward(); });
        root.addEventListener('click', function (e) { if (!e.target.closest('button')) dir.skip(); });
        root.addEventListener('pointerdown', function () { if (window.EventAudio) EventAudio.unlock(); });
        function onKey(e) {
            if (!root.isConnected) { document.removeEventListener('keydown', onKey, true); return; }
            if (e.target && /^(BUTTON|INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
            if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); dir.skip(); }
        }
        if (!o || o.keys !== false) document.addEventListener('keydown', onKey, true);

        host.innerHTML = '';
        var fit = D.fit(host, root);
        return {
            root: root,
            log: function (line) { var d = D.h('div'); d.textContent = line; log.appendChild(d); },
            done: function () { skipBtn.hidden = true; hint.style.display = 'none'; },
            close: function () { dir.kill(); if (au) au.stop(); document.removeEventListener('keydown', onKey, true); fit.remove(); }
        };
    };

    window.DuckScene = D;
})();
