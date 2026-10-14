/* ═══════════════════════════════════════════════════════════════════════════
   world_scene.js — the seven WORLD EVENTS.

   World events never take the screen away: the board stays live underneath and
   the scene is click-through except for what it hands you to click. Each one:
     · ARRIVES with a banner sweeping across the top (icon, name, what it does,
       a countdown bar) and its own one-second sting over the whole screen;
     · RUNS with its own effect on the board and its own music;
     · ENDS with the banner reporting what came of it, then leaves.

     QUANTUM SURGE       +300% output for 20 s. Energy streams up the edges; the
                         banner counts the extra.
     DATA STORM          7 orbs drift over the board for 14 s. Catch them; every
                         catch is the next note up.
     WALKER STRIKE       City PP stops for 16 s. Strikers march in with signs.
                         NEW: click one to talk them down (coffee); settle all
                         six and the strike ends early.
     MOMENTUM CASCADE  combo locked at ×4 for 10 s. Your clicks play the tune.
     CORRUPT PACKET      a burst of 30 s of output, but ~5% of one generator is
                         corrupted. NEW: QUARANTINE within 3 s and you lose half.
     TIME FREEZE         12 s: passive income stops, only clicks count. Frost
                         grows in; every click is a crystal.
     MEMORY PURGE        energy halved (the number is visibly deleted), then
                         output ×2 for 30 s. NEW: every click restores a 1% fragment
                         of what was purged, up to half; a bar shows what you won back.

   All of it is data: opts.event, opts.dur, opts.lines, opts.signs, opts.victim,
      opts.orbs, and the callbacks below. See docs/WORLD_EVENTS.md.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;
    function rnd(a, b) { return a + Math.random() * (b - a); }

    var WALKER = '<svg viewBox="0 0 60 120" aria-hidden="true"><circle cx="30" cy="16" r="9" class="wx-wk"/><path d="M30 26v38M30 64l-12 40M30 64l12 40M30 36l-16 16M30 36l14-12" class="wx-wkl"/></svg>';

    var EVENTS = {
        surge: { icon: 'bolt', label: 'QUANTUM SURGE', color: '#44ffcc', dur: 20, detail: 'ANOMALOUS OUTPUT · +300% throughput', mult: 3 },
        storm: { icon: 'target', label: 'DATA STORM', color: '#aaaaff', dur: 14, detail: 'PACKET BREACH · absorb stray data', orbs: 7 },
        strike: { icon: 'ban', label: 'WALKER STRIKE', color: '#ff5566', dur: 16, detail: 'SUBJECT UNREST · City PP offline',
                  signs: ['ON STRIKE', 'FAIR CYCLES', 'WE ARE NOT NPCs', 'REST IS A RIGHT', 'NO MORE LOOPS', 'PP ≠ PEOPLE'] },
        cascade: { icon: 'waves', label: 'MOMENTUM CASCADE', color: '#ffaa44', dur: 10, detail: 'Rapid clicking detected · combo locked at OVERDRIVE ×4' },
        corrupt: { icon: 'skull', label: 'CORRUPT PACKET', color: '#ff3366', dur: 12, detail: 'RISK EVENT · +500% output, one asset corrupting', window: 3 },
        freeze: { icon: 'snowflake', label: 'TIME FREEZE', color: '#88ddff', dur: 12, detail: 'TEMPORAL ANOMALY · only clicks register' },
        purge: { icon: 'erase', label: 'MEMORY PURGE', color: '#33c8ff', dur: 30, detail: 'RISK EVENT · energy halved, output ×2 · click to recover fragments', sting: 2800, fragment: 0.01, cap: 0.5 }
    };

    /* play(host, opts) → { done: Promise<result>, click(clientX, clientY), close() }
       opts.event   one of EVENTS          opts.state { energy, eps, combo, items }
       opts.dur     seconds (the event's default)
       callbacks — apply the game side here:
         onStart(ev)            the event begins (multipliers, PP block, freeze flag)
         onEnd(result)          the event is over (undo them)
         onEnergy(delta)        energy changes the scene causes (orb catches, the burst, the purge)
         onCorrupt(id, lost)    corrupt packet: how many of the victim are gone
       opts.victim  { id, name, count } for the corrupt packet (a random generator otherwise)
       Call click(x, y) from the game's ACQUIRE handler: cascade and freeze answer clicks. */
    function play(host, opts) {
        opts = opts || {};
        var key = EVENTS[opts.event] ? opts.event : 'surge';
        var E = Object.assign({}, EVENTS[key], opts.lines);
        var dur = opts.dur || E.dur;
        var st = opts.state || window.state || {};
        var energy = st.energy || 3.2e14, eps = st.eps || 5e9;
        var reduced = D.reduced();
        var score = window.WorldScores && window.WorldScores[key];
        var au = D.audio(opts, score);
        var dir = D.director();
        var shell = D.shell(host, 'wx wx-' + key, dir, au, { keys: false });
        var root = shell.root, log = shell.log;
        shell.done();
        var frame = root.parentNode, hostPE = host.style.pointerEvents;
        if (frame) frame.classList.add('dks-see');
        host.style.pointerEvents = 'none';
        root.setAttribute('role', 'status');
        root.removeAttribute('aria-modal');
        root.setAttribute('aria-label', E.label);
        root.style.setProperty('--wx', E.color);
        var timers = [], raf = 0;
        function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }

        root.insertAdjacentHTML('beforeend', ''
          + '<div class="wx-sting"></div><div class="wx-amb"></div><div class="wx-fx"></div><div class="wx-play"></div>'
          + '<div class="wx-banner"><i class="wx-icon">' + D.glyph(E.icon) + '</i><div class="wx-txt"><b>' + D.esc(E.label) + '</b><span>' + D.esc(E.detail) + '</span></div>'
          +   '<div class="wx-chip"></div><div class="wx-time"><b>' + dur + '</b><span>s</span></div><div class="wx-bar"><s></s></div></div>');
        var $ = function (s) { return root.querySelector(s); };
        var sting = $('.wx-sting'), amb = $('.wx-amb'), fx = $('.wx-fx'), playL = $('.wx-play'), chip = $('.wx-chip');
        function setChip(html) { chip.innerHTML = html; }
        function pop(el, cls) { D.replay(el, cls || 'wx-pop'); }
        function burst(x, y, n, cls) {
            if (reduced) return;
            for (var i = 0; i < n; i++) {
                var p = D.h('i', 'wx-spark ' + (cls || ''));
                var a = Math.random() * Math.PI * 2, r = rnd(40, 120);
                p.style.left = x + 'px'; p.style.top = y + 'px';
                p.style.setProperty('--dx', (Math.cos(a) * r).toFixed(0) + 'px');
                p.style.setProperty('--dy', (Math.sin(a) * r).toFixed(0) + 'px');
                fx.appendChild(p);
                later(function (q) { return function () { q.remove(); }; }(p), 800);
            }
        }
        var result = { event: key, label: E.label };
        var endEarly = null;
        var ctx = { root: root, $: $, au: au, E: E, st: st, opts: opts, result: result, later: later, setChip: setChip, pop: pop, burst: burst,
                    sting: sting, amb: amb, fx: fx, play: playL, log: log, reduced: reduced, energy: energy, eps: eps, dur: dur,
                    endEarly: function () { if (endEarly) endEarly(); } };
        var H = HANDLERS[key];

        var clicks = 0;
        function click(cx, cy) {
            if (!root.classList.contains('wx-live')) return;
            var r = root.getBoundingClientRect(), s = r.width / D.W;
            var pt = cx == null ? { x: 960, y: 560 } : { x: (cx - r.left) / s, y: (cy - r.top) / s };
            clicks++;
            if (H.click) H.click(ctx, pt, clicks);
        }

        var done = (async function () {
            /* ARRIVE */
            au.sfx('start');
            au.cue('main');
            root.classList.add('wx-on', 'wx-sting-on');
            log(E.label + ' · ' + E.detail + ' · ' + dur + ' seconds.');
            if (typeof opts.onStart === 'function') { try { opts.onStart(E); } catch (e) {} }
            if (H.setup) H.setup(ctx);
            later(function () { root.classList.remove('wx-sting-on'); }, E.sting || 1600);
            root.classList.add('wx-live');

            /* RUN */
            await new Promise(function (resolve) {
                endEarly = function () { endEarly = null; resolve(); };
                var t0 = performance.now(), bar = $('.wx-bar s'), tb = $('.wx-time b');
                (function f(now) {
                    if (!root.isConnected) return resolve();
                    var el = (now - t0) / 1000, left = Math.max(0, dur - el);
                    bar.style.transform = 'scaleX(' + (left / dur).toFixed(4) + ')';
                    tb.textContent = Math.ceil(left);
                    if (H.tick) H.tick(ctx, el, left);
                    if (left <= 0) return resolve();
                    raf = requestAnimationFrame(f);
                })(t0);
            });
            cancelAnimationFrame(raf);

            /* END */
            root.classList.remove('wx-live');
            result.clicks = clicks;
            var summary = H.end ? H.end(ctx) : E.label + ' over.';
            result.summary = summary;
            au.sfx('end');
            au.cue('after');
            root.classList.add('wx-ending');
            $('.wx-txt span').textContent = summary;
            $('.wx-time').style.visibility = 'hidden';
            log(summary);
            if (typeof opts.onEnd === 'function') { try { opts.onEnd(result); } catch (e) {} }
            await new Promise(function (r) { later(r, opts.linger != null ? opts.linger : 2600); });
            root.classList.add('wx-off');
            await new Promise(function (r) { later(r, 600); });
            finish();
            return result;
        })();

        function finish() {
            cancelAnimationFrame(raf);
            timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
            host.style.pointerEvents = hostPE;
            shell.close();
        }
        return { done: done, click: click, close: finish, event: key };
    }

    function streaks(ctx, n, cls) {
        if (ctx.reduced) return;
        for (var i = 0; i < n; i++) {
            var s = D.h('i', cls);
            var side = i % 2;
            s.style.left = (side ? rnd(1620, 1900) : rnd(20, 300)).toFixed(0) + 'px';
            s.style.animationDelay = (-rnd(0, 2)).toFixed(2) + 's';
            s.style.animationDuration = rnd(1.1, 2.2).toFixed(2) + 's';
            ctx.amb.appendChild(s);
        }
    }

    function emit(ctx, name) {
        var f = ctx.opts[name];
        if (typeof f === 'function') { try { f.apply(null, [].slice.call(arguments, 2)); } catch (e) {} }
    }

    var HANDLERS = {
        surge: {
            setup: function (ctx) {
                ctx.sting.innerHTML = '<i class="wx-ring"></i><i class="wx-ring"></i><i class="wx-ring"></i>';
                streaks(ctx, 28, 'wx-streak');
                ctx.setChip('<em>EXTRA</em><b class="wx-x">+0 E</b>');
            },
            tick: function (ctx, el) {
                var x = ctx.eps * (ctx.E.mult - 1) * el;
                ctx.result.extra = x;
                ctx.$('.wx-x').textContent = '+' + D.fmt(x) + ' E';
            },
            end: function (ctx) { return 'Surge over · +' + D.fmt(ctx.result.extra || 0) + ' E extra'; }
        },

        storm: {
            setup: function (ctx) {
                var n = ctx.opts.orbs || ctx.E.orbs, caught = 0, gained = 0;
                ctx.result.orbs = n; ctx.result.caught = 0; ctx.result.gained = 0;
                ctx.sting.innerHTML = '<i class="wx-static"></i>';
                ctx.setChip('<em>CAUGHT</em><b class="wx-c">0 / ' + n + '</b>');
                for (var i = 0; i < n; i++) ctx.later(function () {
                    var x, y, k = 0;
                    do { x = rnd(160, 1760); y = rnd(420, 980); k++; } while (k < 30 && Math.hypot(x - 960, y - 560) < 300);   // low enough to drift up without reaching the banner
                    var o = D.h('button', 'wx-orb', '<i>' + D.icon('bolt') + '</i>');
                    o.type = 'button';
                    o.setAttribute('aria-label', 'Catch data packet');
                    o.style.left = x + 'px'; o.style.top = y + 'px';
                    o.style.setProperty('--drift', rnd(-120, 120).toFixed(0) + 'px');
                    ctx.play.appendChild(o);
                    ctx.au.sfx('spawn');
                    var gone = ctx.later(function () { if (o.isConnected) { o.classList.add('wx-gone'); ctx.au.sfx('miss'); ctx.later(function () { o.remove(); }, 400); } }, 9000);
                    o.addEventListener('click', function (e) {
                        e.stopPropagation();
                        if (!o.isConnected || o.classList.contains('wx-gone')) return;
                        clearTimeout(gone);
                        var r = o.getBoundingClientRect(), rr = ctx.root.getBoundingClientRect(), s = rr.width / D.W;
                        var cx = (r.left + r.width / 2 - rr.left) / s, cy = (r.top + r.height / 2 - rr.top) / s;
                        var val = Math.max(1, ctx.energy * rnd(0.002, 0.007));
                        gained += val; caught++;
                        ctx.result.caught = caught; ctx.result.gained = gained;
                        ctx.au.sfx('catch', caught - 1);
                        ctx.burst(cx, cy, 10, 'wx-spark-storm');
                        var f = D.h('b', 'wx-float', '+' + D.esc(D.fmt(val)));
                        f.style.left = cx + 'px'; f.style.top = cy + 'px';
                        ctx.fx.appendChild(f); ctx.later(function () { f.remove(); }, 1200);
                        o.remove();
                        ctx.$('.wx-c').textContent = caught + ' / ' + n;
                        ctx.pop(ctx.$('.wx-c'));
                        emit(ctx, 'onEnergy', val);
                        if (caught === n) { ctx.au.sfx('all'); ctx.setChip('<em>ALL PACKETS</em><b>ABSORBED</b>'); }
                    });
                }, 700 + i * 450);
            },
            end: function (ctx) {
                ctx.play.querySelectorAll('.wx-orb').forEach(function (o) { o.classList.add('wx-gone'); });
                return 'Caught ' + ctx.result.caught + ' of ' + ctx.result.orbs + ' · +' + D.fmt(ctx.result.gained) + ' E';
            }
        },

        strike: {
            setup: function (ctx) {
                var signs = ctx.opts.signs || ctx.E.signs, n = signs.length, settled = 0, t0 = performance.now();
                ctx.result.strikers = n; ctx.result.settled = 0;
                ctx.sting.innerHTML = '<i class="wx-red"></i><b class="wx-stamp">STRIKE</b>';
                ctx.amb.innerHTML = '<i class="wx-tint"></i>';
                ctx.setChip('<em>CITY PP</em><b class="wx-pp">OFFLINE</b>');
                signs.forEach(function (text, i) {
                    var w = D.h('button', 'wx-striker', '<span class="wx-sign">' + D.esc(text) + '</span>' + WALKER + '<i class="wx-cup">' + D.icon('cup') + '</i>');
                    w.type = 'button';
                    w.setAttribute('aria-label', 'Talk to the striker holding "' + text + '"');
                    w.style.left = (200 + i * (1520 / n)).toFixed(0) + 'px';
                    w.style.animationDelay = (i * 0.18) + 's';
                    w.addEventListener('click', function (e) {
                        e.stopPropagation();
                        if (w.classList.contains('wx-ok') || !ctx.root.classList.contains('wx-live')) return;
                        w.classList.add('wx-ok');
                        ctx.au.sfx('settle', settled);
                        settled++;
                        ctx.result.settled = settled;
                        ctx.$('.wx-pp').textContent = settled < n ? 'OFFLINE · ' + settled + '/' + n + ' back' : 'AGREEMENT';
                        ctx.pop(ctx.$('.wx-pp'));
                        if (settled === n) {
                            ctx.result.early = Math.round((performance.now() - t0) / 1000);
                            ctx.au.sfx('agreement');
                            ctx.root.classList.add('wx-agree');
                            ctx.later(ctx.endEarly, 1200);
                        }
                    });
                    ctx.play.appendChild(w);
                });
            },
            end: function (ctx) {
                ctx.play.querySelectorAll('.wx-striker').forEach(function (w) { w.classList.add('wx-ok'); });
                return ctx.result.early != null ? 'AGREEMENT REACHED · City PP back after ' + ctx.result.early + ' s'
                     : 'Strike over · City PP restored (' + ctx.result.settled + ' of ' + ctx.result.strikers + ' talked down)';
            }
        },

        cascade: {
            setup: function (ctx) {
                var h = '';
                for (var i = 0; i < 14; i++) h += '<i class="wx-chev" style="left:' + (i * 140 + 20) + 'px;animation-delay:' + (i % 7) * 0.07 + 's">' + D.icon('waves') + '</i>';
                ctx.sting.innerHTML = h;
                ctx.setChip('<em>COMBO</em><b class="wx-combo">×4 OVERDRIVE</b><i class="wx-lock">' + D.icon('lock') + '</i>');
                ctx.result.cascadeClicks = 0;
            },
            click: function (ctx, pt, n) {
                ctx.result.cascadeClicks = n;
                ctx.au.sfx('click', n - 1);
                ctx.burst(pt.x, pt.y, 8, 'wx-spark-cascade');
                ctx.$('.wx-combo').textContent = '×4 · ' + n + ' click' + (n === 1 ? '' : 's');
                ctx.pop(ctx.$('.wx-combo'));
            },
            end: function (ctx) { var n = ctx.result.cascadeClicks; return 'Cascade over · ' + n + ' click' + (n === 1 ? '' : 's') + ' at ×4'; }
        },

        corrupt: {
            setup: function (ctx) {
                var v = Object.assign({ id: 'quantum_mill', name: 'Quantum Mill', count: 96 }, ctx.opts.victim);
                var lost = Math.min(v.count, Math.ceil(v.count * 0.05) + 1);
                var burstE = ctx.eps * 30 * (ctx.opts.burstMult || 1);
                ctx.result.burst = burstE; ctx.result.victim = v.name; ctx.result.lost = lost; ctx.result.saved = 0;
                var blocks = '';
                for (var i = 0; i < 18; i++) blocks += '<i class="wx-blk" style="left:' + rnd(0, 1800).toFixed(0) + 'px;top:' + rnd(0, 1000).toFixed(0) + 'px;width:' + rnd(60, 360).toFixed(0) + 'px;height:' + rnd(8, 60).toFixed(0) + 'px;animation-delay:' + rnd(0, 0.5).toFixed(2) + 's"></i>';
                ctx.sting.innerHTML = blocks + '<b class="wx-skull">' + D.icon('skull') + '</b>';
                ctx.setChip('<em>BURST</em><b>+' + D.esc(D.fmt(burstE)) + ' E</b>');
                ctx.later(function () {
                    ctx.au.sfx('burst');
                    var f = D.h('b', 'wx-burst', '+' + D.esc(D.fmt(burstE)) + ' E');
                    ctx.fx.appendChild(f);
                    emit(ctx, 'onEnergy', burstE);
                }, 700);
                /* the quarantine: a few seconds to save half */
                ctx.later(function () {
                    var win = ctx.E.window;
                    var card = D.h('div', 'wx-card', '<div><em>' + D.icon('warning') + ' CORRUPTING</em><b>' + D.esc(v.name) + ' ×' + lost + '</b></div>'
                        + '<button type="button" class="wx-q">QUARANTINE</button><i class="wx-qbar"><s style="transition-duration:' + win + 's"></s></i>');
                    ctx.play.appendChild(card);
                    var btn = card.querySelector('.wx-q'), done = false;
                    requestAnimationFrame(function () { requestAnimationFrame(function () { card.querySelector('.wx-qbar s').style.transform = 'scaleX(1)'; }); });
                    function settle(saved) {
                        if (done) return; done = true;
                        var keep = saved ? Math.floor(lost / 2) : 0;
                        ctx.result.saved = keep;
                        ctx.result.lost = lost - keep;
                        card.classList.add(saved ? 'wx-saved' : 'wx-lost');
                        card.querySelector('em').innerHTML = saved ? D.icon('check') + ' QUARANTINED · ' + keep + ' saved' : D.icon('skull') + ' CORRUPTED';
                        card.querySelector('b').textContent = v.name + ' ×' + (lost - keep);
                        btn.disabled = true;
                        ctx.au.sfx(saved ? 'quarantine' : 'corrupt');
                        emit(ctx, 'onCorrupt', v.id, lost - keep);
                        ctx.log((saved ? 'Quarantined. ' : 'Corrupted. ') + v.name + ' ×' + (lost - keep) + ' lost.');
                        ctx.later(function () { card.classList.add('wx-fade'); }, 2600);
                    }
                    btn.addEventListener('click', function (e) { e.stopPropagation(); settle(true); });
                    ctx.later(function () { settle(false); }, win * 1000);
                }, 1500);
            },
            end: function (ctx) {
                var r = ctx.result;
                return '+' + D.fmt(r.burst) + ' E burst · ' + r.victim + ' ×' + r.lost + ' corrupted' + (r.saved ? ' (' + r.saved + ' saved)' : '');
            }
        },

        freeze: {
            setup: function (ctx) {
                ctx.sting.innerHTML = '<i class="wx-flash"></i>';
                var h = '<i class="wx-frost"></i>';
                if (!ctx.reduced) for (var i = 0; i < 30; i++) h += '<i class="wx-flake" style="left:' + rnd(0, 1900).toFixed(0) + 'px;animation-delay:' + (-rnd(0, 8)).toFixed(1) + 's;animation-duration:' + rnd(6, 11).toFixed(1) + 's">' + D.icon('snowflake') + '</i>';
                ctx.amb.innerHTML = h;
                ctx.setChip('<em>PASSIVE INCOME</em><b class="wx-fz">PAUSED</b>');
                ctx.result.frozenClicks = 0;
            },
            click: function (ctx, pt, n) {
                ctx.result.frozenClicks = n;
                ctx.au.sfx('click', n);
                ctx.burst(pt.x, pt.y, 9, 'wx-spark-ice');
                ctx.$('.wx-fz').textContent = 'PAUSED · ' + n + ' click' + (n === 1 ? '' : 's');
            },
            tick: function (ctx, el, left) { if (left < 1.2 && !ctx.thawed) { ctx.thawed = true; ctx.au.sfx('thaw'); ctx.root.classList.add('wx-thaw'); } },
            end: function (ctx) { var n = ctx.result.frozenClicks; return 'Time resumes · ' + n + ' click' + (n === 1 ? '' : 's') + ' while it stood still'; }
        },

        purge: {
            setup: function (ctx) {
                var e0 = ctx.energy, half = Math.floor(e0 / 2), lost = e0 - half;
                ctx.result.lost = lost; ctx.result.recovered = 0;
                ctx.sting.innerHTML = '<div class="wx-del"><div class="wx-line"><span class="wx-num">' + D.esc(D.fmt(e0)) + '</span><i class="wx-caret"></i></div><em>' + D.icon('erase') + ' −50%</em></div>';
                ctx.setChip('<em>OUTPUT</em><b>×2</b>');
                ctx.amb.innerHTML = '<i class="wx-scan"></i>';
                ctx.play.insertAdjacentHTML('beforeend', '<div class="wx-rec"><span>RECOVERED · click to restore fragments</span><i><s></s></i><b class="wx-recv">0 / ' + D.esc(D.fmt(lost)) + '</b></div>');
                ctx.result.fragments = 0; ctx.result.clicked = 0;
                var num = ctx.$('.wx-num'), txt = num.textContent;
                var eat = setInterval(function () {
                    if (txt.length) { txt = txt.slice(0, -1); num.textContent = txt; }
                    else {
                        clearInterval(eat);
                        num.textContent = D.fmt(half);
                        ctx.root.classList.add('wx-halved');
                        emit(ctx, 'onEnergy', -lost);
                        ctx.au.sfx('double');
                    }
                }, ctx.reduced ? 20 : 90);
                ctx.later(function () { clearInterval(eat); }, 4000);
            },
            /* recovered = what ×2 adds over normal output, plus the fragments clicked back (1% each, up to half) */
            tick: function (ctx, el) {
                var r = ctx.result;
                r.passive = ctx.eps * el;
                r.recovered = r.passive + r.clicked;
                ctx.$('.wx-recv').textContent = D.fmt(r.recovered) + ' / ' + D.fmt(r.lost);
                ctx.$('.wx-rec s').style.transform = 'scaleX(' + Math.min(1, r.recovered / r.lost).toFixed(4) + ')';
            },
            click: function (ctx, pt) {
                var r = ctx.result, frag = r.lost * ctx.E.fragment;
                if (!ctx.root.classList.contains('wx-halved') || r.clicked + frag > r.lost * ctx.E.cap + 1) return;
                r.clicked += frag; r.fragments++;
                ctx.au.sfx('fragment', r.fragments);
                emit(ctx, 'onEnergy', frag);
                if (!ctx.reduced) {
                    var f = D.h('i', 'wx-frag');
                    f.style.left = pt.x + 'px'; f.style.top = pt.y + 'px';
                    f.style.setProperty('--dx', (1650 - pt.x).toFixed(0) + 'px');
                    f.style.setProperty('--dy', (190 - pt.y).toFixed(0) + 'px');
                    ctx.fx.appendChild(f);
                    ctx.later(function () { f.remove(); }, 700);
                }
                ctx.pop(ctx.$('.wx-recv'));
            },
            end: function (ctx) {
                var r = ctx.result, pct = Math.min(100, Math.round(100 * r.recovered / r.lost));
                return 'Purge over · won back ' + D.fmt(r.recovered) + ' of ' + D.fmt(r.lost) + ' (' + pct + '%, ' + r.fragments + ' fragment' + (r.fragments === 1 ? '' : 's') + ')';
            }
        }
    };

    window.WorldScene = { play: play, EVENTS: EVENTS };
})();
