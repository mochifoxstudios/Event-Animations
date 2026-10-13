/* ═══════════════════════════════════════════════════════════════════════════
   breach_scene.js — THE REALITY BREACH, a boss fight.

   The game's own numbers (AnomalyBoss): 36–44 hits in 45 seconds; three
   phases at ⅔ and ⅓ health; it eats 10% → 20% → 30% of income while alive;
   each hit pays a little; kill it and it gives back everything it ate plus a
   bounty and 18–29 fragments; let it escape and it keeps it, +15% instability.

     1 WARNING   hazard bands sweep in, a klaxon, the screen pulses red.
     2 THE TEAR  a crack rips down the middle of reality and opens; the breach
                 comes through it. Title card.
     3 THE FIGHT ⭐ IT MOVES (the review's note was that it didn't):
                   PHASE I    drifts in a slow figure-eight
                   PHASE II   "IT MOVES" — glides to new ground, and dodges away
                              from where it was struck
                   PHASE III  "ENRAGED" — darts, shakes, turns orange
                 Its eye follows the cursor the whole time. A visible stream of
                 energy flows out of the player's counter into it — the feeding
                 is something you SEE, not a number in a caption.
     4 THE END   SEALED: it shatters, the stream reverses and pours everything
                 back, the bounty counts up. ESCAPED: it sinks back into the
                 rift, which seals with the player's energy inside.

   ⭐ Numbers and words are data: opts.hp, opts.life, opts.feed, opts.hitPay,
   opts.bounty, opts.fragments, opts.text. Laid out on the 1920×1080 canvas.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;

    var TEXT = {
        warning: '⚠ REALITY BREACH ⚠',
        name: 'REALITY BREACH',
        sub: 'It eats what you make. It keeps what it eats.',
        phase: ['PHASE I', 'PHASE II · IT MOVES', 'PHASE III · ENRAGED'],
        won: 'BREACH SEALED', lost: 'THE BREACH CLOSED',
        gaveBack: 'It gave back what it ate', bounty: 'Bounty', frags: 'Fragments', kept: 'It kept', instab: 'Instability'
    };

    var ART =
        '<svg class="bx-art" viewBox="-110 -110 220 220" aria-hidden="true">'
      + '<circle class="bx-glow" r="104"/>'
      + '<g class="bx-spin-a"><circle class="bx-ringd" r="94" stroke-dasharray="130 26 64 18 96 30 58 20"/></g>'
      + '<g class="bx-spin-b"><polygon class="bx-hex" points="0,-68 59,-34 59,34 0,68 -59,34 -59,-34"/>'
      +   '<polygon class="bx-hex bx-hex-in" points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25"/></g>'
      + '<g class="bx-orbit">' + [0, 60, 120, 180, 240, 300].map(function (a) {
            return '<polygon class="bx-shard" transform="rotate(' + a + ') translate(0,-82)" points="0,-11 6,3 0,11 -6,3"/>'; }).join('') + '</g>'
      + '<circle class="bx-iris" r="34"/><g class="bx-look"><ellipse class="bx-pupil" rx="6" ry="24"/></g>'
      + '<path class="bx-crack bx-c1" d="M-8,-30 L-2,-12 L-14,4 L-6,22"/>'
      + '<path class="bx-crack bx-c2" d="M22,-18 L10,-2 L26,10 L16,30"/>'
      + '<path class="bx-crack bx-c3" d="M-30,8 L-12,14 L-20,30 M4,-34 L12,-20 L2,-8"/>'
      + '</svg>';

    var RIFT =
        '<svg viewBox="0 0 200 1080" preserveAspectRatio="none" aria-hidden="true">'
      + '<polygon class="bx-rift-glow" points="100,0 140,180 92,330 150,520 84,700 132,880 100,1080 60,880 108,700 44,520 104,330 58,180"/>'
      + '<polygon class="bx-rift-core" points="100,0 116,180 96,330 120,520 92,700 112,880 100,1080 86,880 104,700 78,520 102,330 84,180"/>'
      + '</svg>';

    function rnd(a, b) { return a + Math.random() * (b - a); }

    /* the energy stream: from the player's counter to the breach (or back) */
    function Stream(cv, reduced) {
        var g = cv.getContext('2d'), parts = [], raf = 0, from = { x: 960, y: 1010 }, to = { x: 960, y: 450 }, rate = 0, colour = '255,45,106', reverse = false;
        function spawn() {
            var p = reverse ? { x: to.x, y: to.y } : { x: from.x + rnd(-120, 120), y: from.y };
            p.t = 0; p.sp = rnd(0.7, 1.3); p.wob = rnd(-1, 1) * 70; p.sx = p.x; p.sy = p.y;
            parts.push(p);
        }
        function step(dt) {
            g.clearRect(0, 0, cv.width, cv.height);
            var n = rate * dt * 60;
            while (n > 0) { if (Math.random() < n) spawn(); n -= 1; }
            for (var i = parts.length - 1; i >= 0; i--) {
                var p = parts[i];
                p.t += dt * p.sp * (reverse ? 1.4 : 0.9);
                if (p.t >= 1) { parts.splice(i, 1); continue; }
                var tx = reverse ? from.x : to.x, ty = reverse ? from.y : to.y;
                var e = p.t * p.t * (3 - 2 * p.t);
                var x = p.sx + (tx - p.sx) * e + Math.sin(p.t * Math.PI) * p.wob;
                var y = p.sy + (ty - p.sy) * e;
                g.fillStyle = 'rgba(' + colour + ',' + (0.55 * Math.sin(p.t * Math.PI)).toFixed(3) + ')';
                g.beginPath(); g.arc(x, y, 1.5 + 2 * Math.sin(p.t * Math.PI), 0, 6.283); g.fill();
            }
        }
        return {
            step: step,
            target: function (x, y) { to.x = x; to.y = y; },
            set: function (r, col, rev) { rate = reduced ? 0 : r; if (col) colour = col; reverse = !!rev; },
            clear: function () { parts.length = 0; g.clearRect(0, 0, cv.width, cv.height); }
        };
    }

    /* play(host, opts) → { done: Promise<{ won, back, bounty, frags, kept }>, close() }
       opts.state     { energy, eps }                       opts.hp / opts.life (s) / opts.feed [3 shares]
       opts.hitPay()  energy per hit · opts.bounty() · opts.fragments()
       opts.onResult(result) — apply the outcome here        opts.text overrides any TEXT key */
    function play(host, opts) {
        opts = opts || {};
        var T = Object.assign({}, TEXT, opts.text);
        var st = opts.state || window.state || {};
        var energy = st.energy || 3.2e14;
        var eps = st._realEPS || st.eps || 5e9;
        var maxHp = opts.hp || (36 + Math.floor(Math.random() * 9));
        var life = opts.life || 45;
        var FEED = opts.feed || [0.10, 0.20, 0.30];
        var hitPay = opts.hitPay || function () { return Math.max(500, eps * 2); };
        var bountyFn = opts.bounty || function () { return Math.max(50000, eps * 900); };
        var fragFn = opts.fragments || function () { return 18 + Math.floor(Math.random() * 12); };
        var reduced = D.reduced();
        var au = D.audio(opts, window.BreachScore);
        var dir = D.director();
        var shell = D.shell(host, 'bx', dir, au);
        var root = shell.root;
        root.setAttribute('aria-label', 'Reality Breach');
        var timers = [];
        function later(fn, ms) { var t = setTimeout(fn, reduced ? Math.min(ms, 150) : ms); timers.push(t); return t; }
        function sleep(ms) { return new Promise(function (r) { later(r, ms); }); }

        /* layers */
        var grid = D.h('div', 'bx-grid');
        var cv = document.createElement('canvas'); cv.width = D.W; cv.height = D.H; cv.className = 'bx-stream';
        var rift = D.h('div', 'bx-rift', RIFT);
        var bands = D.h('div', 'bx-bands', '<div class="bx-band top"><span>' + (D.esc(T.warning) + '&nbsp;&nbsp;&nbsp;').repeat(14) + '</span></div>'
                                          + '<div class="bx-band bot"><span>' + (D.esc(T.warning) + '&nbsp;&nbsp;&nbsp;').repeat(14) + '</span></div>');
        var red = D.h('div', 'bx-red');
        var title = D.h('div', 'bx-title', '<b>' + D.esc(T.name) + '</b><span>' + D.esc(T.sub) + '</span>');
        var hud = D.h('div', 'bx-hud',
            '<div class="bx-hud-row"><span class="bx-name">' + D.esc(T.name) + '</span><span class="bx-phase"></span><span class="bx-timer"></span></div>'
          + '<div class="bx-bar"><i class="bx-fill"></i><i class="bx-mark" style="left:66.67%"></i><i class="bx-mark" style="left:33.33%"></i></div>');
        var boss = D.h('div', 'bx-boss', ART + '<div class="bx-cap"></div>');
        boss.setAttribute('role', 'button'); boss.tabIndex = 0; boss.setAttribute('aria-label', 'Reality Breach. Press to strike.');
        var bank = D.h('div', 'bx-bank', '<span>YOUR ENERGY</span><b></b><em></em>');
        var pops = D.h('div', 'bx-pops');
        var result = D.h('div', 'bx-result');
        var flash = D.h('div', 'bx-flash');
        [grid, cv, rift, red, bands, hud, boss, bank, pops, title, result, flash].forEach(function (el) { root.appendChild(el); });
        var stream = Stream(cv, reduced);
        var fill = hud.querySelector('.bx-fill'), phaseEl = hud.querySelector('.bx-phase'), timerEl = hud.querySelector('.bx-timer');
        var cap = boss.querySelector('.bx-cap'), look = boss.querySelector('.bx-look');
        var bankVal = bank.querySelector('b'), bankSub = bank.querySelector('em');
        var log = shell.log;

        var hp = maxHp, phase = 0, left = life, hoard = 0, active = false, finished = null;
        var pos = { x: 960, y: 450 }, tgt = { x: 960, y: 450 }, vel = { x: 0, y: 0 }, moveAt = 0, clock = 0, raf = 0, last = 0, hudAt = 0;
        var AREA = { x0: 230, x1: 1690, y0: 300, y1: 780 };

        function place() { boss.style.transform = 'translate(' + (pos.x - 140) + 'px,' + (pos.y - 140) + 'px)'; stream.target(pos.x, pos.y); }
        function newTarget(away) {
            if (away) {
                var dx = pos.x - away.x, dy = pos.y - away.y, d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                tgt.x = pos.x + dx / d * rnd(220, 380); tgt.y = pos.y + dy / d * rnd(160, 280);
            } else { tgt.x = rnd(AREA.x0, AREA.x1); tgt.y = rnd(AREA.y0, AREA.y1); }
            tgt.x = Math.max(AREA.x0, Math.min(AREA.x1, tgt.x)); tgt.y = Math.max(AREA.y0, Math.min(AREA.y1, tgt.y));
        }
        function hudUpdate() {
            fill.style.transform = 'scaleX(' + (hp / maxHp) + ')';
            var s = Math.max(0, Math.ceil(left));
            timerEl.textContent = 'ESCAPES IN ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
            cap.textContent = 'EATING ' + Math.round(FEED[phase] * 100) + '% OF YOUR INCOME · HOLDING ' + D.fmt(hoard) + ' E';
            bankVal.textContent = D.fmt(energy);
            bankSub.textContent = 'income ' + D.fmt(eps) + '/s' + (active ? ' · ' + Math.round(FEED[phase] * 100) + '% being eaten' : '');
            var f = 1 - hp / maxHp; boss.dataset.cracks = f >= 0.75 ? 3 : f >= 0.5 ? 2 : f >= 0.25 ? 1 : 0;
            root.classList.toggle('bx-urgent', active && left <= 10);
        }

        function loop(ts) {
            if (!last) last = ts;
            var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
            stream.step(dt);
            if (active) {
                clock += dt;
                left -= dt;
                var take = Math.min(energy, eps * FEED[phase] * dt);
                energy -= take; hoard += take;
                /* movement */
                if (!reduced) {
                    if (phase === 0) { tgt.x = 960 + Math.sin(clock * 0.7) * 300; tgt.y = 470 + Math.sin(clock * 1.4) * 110; }
                    else if (clock >= moveAt) { newTarget(); moveAt = clock + (phase === 1 ? 2.2 : 1.3); }
                    var k = phase === 0 ? 2.2 : phase === 1 ? 3.2 : 6;
                    vel.x += ((tgt.x - pos.x) * k - vel.x * 2.4) * dt * 3; vel.y += ((tgt.y - pos.y) * k - vel.y * 2.4) * dt * 3;
                    pos.x += vel.x * dt; pos.y += vel.y * dt;
                    if (phase === 2) { pos.x += rnd(-2, 2); pos.y += rnd(-2, 2); }
                    place();
                }
                if (ts - hudAt > 90) { hudAt = ts; hudUpdate(); }
                if (left <= 0) end(false);
            }
            raf = requestAnimationFrame(loop);
        }

        /* the eye follows the cursor */
        root.addEventListener('pointermove', function (e) {
            var r = boss.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            var dx = e.clientX - cx, dy = e.clientY - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, m = Math.min(13, d / 20);
            look.setAttribute('transform', 'translate(' + (dx / d * m).toFixed(1) + ',' + (dy / d * m).toFixed(1) + ')');
        });

        function strike(cx, cy) {
            if (!active || hp <= 0) return;
            hp -= 1;
            var pay = hitPay(); energy += pay;
            var p = D.h('div', 'bx-pop', '+' + D.esc(D.fmt(pay)));
            var rr = root.getBoundingClientRect(), sc = rr.width / D.W;
            p.style.left = ((cx - rr.left) / sc + rnd(-70, 70)) + 'px'; p.style.top = ((cy - rr.top) / sc + rnd(-50, 10)) + 'px';
            pops.appendChild(p); later(function () { p.remove(); }, 900);
            D.replay(boss, 'hit');
            if (!reduced) D.replay(grid, 'bx-jolt');   // never the root: its transform is the 16:9 fit
            au.sfx('hit', 1 - hp / maxHp);
            var f = hp / maxHp;
            if (f <= 1 / 3 && phase < 2) setPhase(2); else if (f <= 2 / 3 && phase < 1) setPhase(1);
            if (phase >= 1 && !reduced) { newTarget({ x: (cx - rr.left) / sc, y: (cy - rr.top) / sc }); moveAt = clock + (phase === 1 ? 1.4 : 0.8); }
            var cr = 1 - f; if ([0.25, 0.5, 0.75].some(function (t) { return cr >= t && cr - 1 / maxHp < t; })) au.sfx('crack');
            hudUpdate();
            if (hp <= 0) end(true);
        }
        function setPhase(p) {
            phase = p;
            root.classList.toggle('bx-p2', p === 1); root.classList.toggle('bx-p3', p === 2);
            phaseEl.textContent = T.phase[p];
            D.replay(phaseEl, 'bx-flashin');
            au.sfx('phase', p); au.cue('fight' + (p + 1));
            stream.set([2, 3.5, 5][p], p === 2 ? '255,90,30' : '255,45,106');
            log(T.phase[p]);
        }
        boss.addEventListener('pointerdown', function (e) { e.stopPropagation(); strike(e.clientX, e.clientY); });
        boss.addEventListener('click', function (e) { e.stopPropagation(); });
        boss.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); var r = boss.getBoundingClientRect(); strike(r.left + r.width / 2, r.top + r.height / 3); }
        });
        root.addEventListener('pointerdown', function (e) {
            if (!active || e.target.closest('.bx-boss') || e.target.closest('button')) return;
            var rr = root.getBoundingClientRect(), sc = rr.width / D.W;
            var m = D.h('div', 'bx-miss'); m.style.left = ((e.clientX - rr.left) / sc) + 'px'; m.style.top = ((e.clientY - rr.top) / sc) + 'px';
            pops.appendChild(m); later(function () { m.remove(); }, 500);
            au.sfx('miss');
        });

        function end(won) { if (!active) return; active = false; finished(won); }

        var done = (async function () {
            raf = requestAnimationFrame(loop);
            hudUpdate();
            /* 1 · WARNING */
            au.cue('warning');
            root.classList.add('bx-s-warn');
            log(T.warning);
            await dir.wait(2600);
            /* 2 · THE TEAR */
            root.classList.add('bx-s-tear');
            au.cue(null);
            au.sfx('tear');
            await dir.wait(1300);
            root.classList.add('bx-s-arrive');
            au.sfx('arrive');
            await dir.wait(700);
            root.classList.add('bx-s-title');
            await dir.wait(1700);
            root.classList.remove('bx-s-title', 'bx-s-warn');
            /* 3 · THE FIGHT */
            shell.done();
            root.classList.add('bx-s-fight');
            phaseEl.textContent = T.phase[0];
            au.cue('fight1');
            stream.set(2, '255,45,106');
            try { boss.focus({ preventScroll: true }); } catch (e) {}
            active = true; clock = 0;
            var won = await new Promise(function (r) { finished = r; });
            /* 4 · THE END */
            au.cue(null);
            var res = { won: won };
            if (won) {
                var back = hoard, bounty = bountyFn(), frags = fragFn();
                res.back = back; res.bounty = bounty; res.frags = frags;
                root.classList.add('bx-s-won');
                D.replay(flash, 'on');
                au.sfx('shatter');
                stream.set(9, '68,255,170', true);
                later(function () { stream.set(0); }, 1600);
                energy += back + bounty;
                log(T.won);
                if (typeof opts.onResult === 'function') { try { opts.onResult(res); } catch (e) {} }
                await sleep(1200);
                au.sfx('win');
                await card(T.won, '#44ffaa', [[T.gaveBack, back, ' E'], [T.bounty, bounty, ' E', D.fmt(bounty / Math.max(1, eps) / 60) + ' min of income'], [T.frags, frags, ' ◈']]);
                au.cue('after_won');
            } else {
                res.kept = hoard;
                root.classList.add('bx-s-lost');
                boss.style.transform = 'translate(' + (960 - 140) + 'px,' + (420 - 140) + 'px)';   // back to the rift
                stream.set(0);
                au.sfx('escape');
                log(T.lost);
                if (typeof opts.onResult === 'function') { try { opts.onResult(res); } catch (e) {} }
                await sleep(1800);
                await card(T.lost, '#ff2d6a', [[T.kept, hoard, ' E'], [T.instab, 15, '%', null, '+']]);
                au.cue('after_lost');
            }
            hudUpdate();
            var picked = await D.choices(result, opts.choices || [{ id: 'continue', label: 'CONTINUE' }]).show();
            finish();
            res.action = picked;
            return res;
        })();

        /* the result card counts its numbers up */
        function card(head, col, rows) {
            result.style.setProperty('--res', col);
            result.innerHTML = '<div class="bx-res-h">' + D.esc(head) + '</div>';
            result.classList.add('on');
            var p = Promise.resolve();
            rows.forEach(function (r) {
                var row = D.h('div', 'bx-res-row', '<span>' + D.esc(r[0]) + '</span><b>' + (r[4] || '+') + '0' + r[2] + '</b>' + (r[3] ? '<em>' + D.esc(r[3]) + '</em>' : ''));
                result.appendChild(row);
                p = p.then(function () { return countUp(row.querySelector('b'), r[1], r[2], r[4] || '+'); });
            });
            return p.then(function () { return sleep(400); });
        }
        function countUp(el, to, unit, sign) {
            return new Promise(function (resolve) {
                var k = 0, n = reduced ? 1 : 22;
                var iv = setInterval(function () {
                    k++;
                    var v = to * (k / n);
                    el.textContent = sign + (unit === '%' || unit === ' ◈' ? Math.round(v) : D.fmt(v)) + unit;
                    if (k % 3 === 0) au.sfx('tick', k / n);
                    if (k >= n) { clearInterval(iv); resolve(); }
                }, 35);
            });
        }
        function finish() { timers.forEach(clearTimeout); cancelAnimationFrame(raf); shell.close(); }

        place();
        return { done: done, close: finish, _strike: function () { var r = boss.getBoundingClientRect(); strike(r.left + r.width / 2, r.top + r.height / 2); } };
    }

    window.BreachScene = { play: play, TEXT: TEXT };
})();
