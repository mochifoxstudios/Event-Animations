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
            type: function (el, text, msPerChar) {
                text = String(text || '');
                return step(function (done) {
                    if (fast || !text) { el.textContent = text; setTimeout(done, 0); return null; }
                    var i = 0;
                    el.textContent = '';
                    var iv = setInterval(function () {
                        i += 1;
                        el.textContent = text.slice(0, i);
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
       The game's soundtrack owns every sound (music.js). A scene only names the
       moment; `opts.sound` decides what plays. Default: the gavel, which the
       soundtrack already has. */
    D.soundFn = function (opts) {
        if (opts && typeof opts.sound === 'function') return opts.sound;
        return function (name) {
            try { if (name === 'gavel' && window.GameSound) GameSound.play('sfx:gavel'); } catch (e) {}
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
            var cast = window.DuckCast ? DuckCast.duck(i, 'dks-cast') : '<span class="dks-fallback">◒</span>';
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
        return dir.type(s.text, text, kind === 'action' ? 12 : (opts.cps || 18)).then(function () {
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

    /* ── THE SCENE SHELL ─────────────────────────────────────────────────── */
    D.shell = function (host, cls, dir) {
        var root = D.h('div', 'dks ' + cls + ' dks-pre');
        if (D.reduced()) root.classList.add('dks-reduced');
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        var log = D.h('div', 'dks-sr');
        log.setAttribute('aria-live', 'polite');
        var skipBtn = D.h('button', 'dks-skip', 'SKIP ▸▸');
        skipBtn.type = 'button';
        skipBtn.title = 'Skip to the verdict';
        var hint = D.h('div', 'dks-hint', 'click to hurry them along');
        root.appendChild(skipBtn);
        root.appendChild(log);
        root.appendChild(hint);

        skipBtn.addEventListener('click', function (e) { e.stopPropagation(); dir.fastForward(); });
        root.addEventListener('click', function (e) { if (!e.target.closest('button')) dir.skip(); });
        function onKey(e) {
            if (!root.isConnected) { document.removeEventListener('keydown', onKey, true); return; }
            if (e.target && /^(BUTTON|INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
            if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); dir.skip(); }
        }
        document.addEventListener('keydown', onKey, true);

        host.innerHTML = '';
        host.appendChild(root);
        return {
            root: root,
            log: function (line) { var d = D.h('div'); d.textContent = line; log.appendChild(d); },
            done: function () { skipBtn.hidden = true; hint.style.display = 'none'; },
            close: function () { dir.kill(); document.removeEventListener('keydown', onKey, true); if (root.parentNode) root.parentNode.removeChild(root); }
        };
    };

    window.DuckScene = D;
})();
