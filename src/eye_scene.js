/* ═══════════════════════════════════════════════════════════════════════════
   eye_scene.js — THE EYE OF THE STORM.

   The game's version was a calm panel and a 60-second number. The idea stays:
   at high instability, by chance, the chaos stops; instability goes to 0,
   energy output ×10 for 60 seconds, and afterwards the storm returns at 40%.

     1 THE STORM    rain, thunder, lightning, the instability reading shaking.
     2 THE EYE      a circle of clear sky opens in the middle of it and grows;
                    the instability reading drains to 0. The storm walls keep
                    turning around the edge for the whole minute.
     3 THE CALM     60 seconds, counted by a ring around the eye. In the middle,
                    an orb breathes: four seconds in, four out, each breath its
                    own chord. HOLD (pointer or Space) while it grows, RELEASE
                    while it shrinks. Every breath in time weakens the storm
                    that comes back: 40% → as low as 12%.
                    Or USE THE CALM: the eye shrinks to a corner widget and the
                    board is yours at ×10 until it ends. RETURN TO THE EYE any time.
                    The last 10 seconds, the walls close in and the wind returns.
     4 THE RETURN   the eye closes, thunder: "SYSTEM ALIGNMENT ENDED".

   All of it is data: opts.duration, opts.mult, opts.calm { base, perBreath, min },
      opts.breath (ms per half-breath), opts.lines, opts.choices. See docs/EYE_OF_THE_STORM.md.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;

    var LINES = {
        eyebrow: 'SYSTEM ALIGNMENT',
        title: 'MOMENT OF CLARITY',
        body: 'All systems have entered harmonic resonance. Instability neutralised. Anomalies suspended.',
        boost: '×{m} energy output for {s} seconds.',
        inhale: 'breathe in',
        exhale: 'breathe out',
        hint: 'Hold while it grows. Release while it shrinks.',
        inTime: 'IN TIME',
        returnsAt: 'THE STORM RETURNS AT',
        breaths: 'BREATHS IN TIME',
        earned: 'EARNED IN THE EYE',
        use: 'USE THE CALM',
        useNote: 'play the board at ×{m}',
        back: 'RETURN TO THE EYE',
        closing: 'Breathe. Reorganise. The chaos returns.',
        ended: 'SYSTEM ALIGNMENT ENDED',
        endedSub: 'The storm returns.'
    };
    var CALM = { base: 0.4, perBreath: 0.04, min: 0.12 };

    /* play(host, opts) → { done: Promise<{ before, returnsAt, breaths, minimized, earned }>, close() }
       opts.state     { instability, eps }      opts.duration seconds of calm (60)
       opts.mult      output multiplier (10)    opts.breath   ms per half-breath (4000)
       opts.calm      { base: 0.4, perBreath: 0.04, min: 0.12 } — the returning storm, as a share of `before`
       opts.onStart() apply ×mult and instability 0 here · opts.onEnd(result) restore here
       opts.onMini(bool) the scene went to / came back from the corner (the host is made click-through)
       opts.autoClose ms to close by itself after the storm returns (the game) instead of CONTINUE */
    function play(host, opts) {
        opts = opts || {};
        var st = opts.state || window.state || {};
        var L = Object.assign({}, LINES, opts.lines);
        var C = Object.assign({}, CALM, opts.calm);
        var dur = opts.duration || 60, mult = opts.mult || 10, half = opts.breath || 4000;
        var before = Math.round(st.instability != null ? st.instability : 74);
        var eps = st.eps || 5e9;
        var reduced = D.reduced();
        var au = D.audio(opts, window.EyeScore);
        var dir = D.director();
        var shell = D.shell(host, 'eos', dir, au);
        var root = shell.root, log = shell.log;
        var frame = root.parentNode;
        root.setAttribute('aria-label', 'Eye of the Storm');
        var timers = [], raf = 0, hostPE = host.style.pointerEvents;
        function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
        function sleep(ms) { return new Promise(function (r) { later(r, reduced ? Math.min(ms, 500) : ms); }); }
        function fill(s) { return s.replace('{m}', mult).replace('{s}', dur); }

        var R = 446, CIRC = 2 * Math.PI * R;
        root.insertAdjacentHTML('beforeend', ''
          + '<div class="eos-sky"></div><div class="eos-walls"></div><div class="eos-rain"></div>'
          + '<div class="eos-eye"><div class="eos-light"></div></div>'
          + '<svg class="eos-ring" viewBox="0 0 1000 1000" aria-hidden="true"><circle cx="500" cy="500" r="' + R + '" class="eos-ring-bg"/>'
          +   '<circle cx="500" cy="500" r="' + R + '" class="eos-ring-fg" style="stroke-dasharray:' + CIRC.toFixed(1) + '"/></svg>'
          + '<div class="eos-flash"></div>'
          + '<div class="eos-alarm"><span>INSTABILITY</span><b>' + before + '%</b></div>'
          + '<div class="eos-in">'
          +   '<div class="eos-head"><i>' + D.icon('eye') + '</i><span>' + D.esc(L.eyebrow) + '</span><b>' + D.esc(L.title) + '</b></div>'
          +   '<div class="eos-orb"><div class="eos-orb-in"></div><em class="eos-sync">' + D.esc(L.inTime) + '</em></div>'
          +   '<div class="eos-phase">' + D.esc(L.inhale) + '</div><div class="eos-hint">' + D.esc(L.hint) + '</div>'
          +   '<div class="eos-time"><b>' + dur + '</b><span>s</span></div>'
          + '</div>'
          + '<div class="eos-left">'
          +   '<div class="eos-stat"><span>INSTABILITY</span><b class="eos-instab">' + before + '%</b></div>'
          +   '<div class="eos-stat"><span>OUTPUT</span><b>×' + mult + '</b></div>'
          +   '<div class="eos-stat"><span>' + D.esc(L.earned) + '</span><b class="eos-earned">+0</b></div>'
          +   '<p>' + D.esc(L.body) + '<br><strong>' + D.esc(fill(L.boost)) + '</strong></p>'
          + '</div>'
          + '<div class="eos-right">'
          +   '<div class="eos-stat"><span>' + D.esc(L.breaths) + '</span><b class="eos-breaths">0</b></div>'
          +   '<div class="eos-stat"><span>' + D.esc(L.returnsAt) + '</span><b class="eos-ret"></b><s class="eos-ret-was"></s></div>'
          +   '<button type="button" class="eos-use">' + D.esc(L.use) + '<small>' + D.esc(fill(L.useNote)) + '</small></button>'
          + '</div>'
          + '<div class="eos-mini"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" class="eos-ring-bg"/><circle cx="50" cy="50" r="44" class="eos-mini-fg"/></svg>'
          +   '<div class="eos-mini-t"><b>' + dur + '</b><span>×' + mult + '</span></div>'
          +   '<button type="button" class="eos-back">' + D.esc(L.back) + '</button></div>'
          + '<div class="eos-end"><b>' + D.esc(L.ended) + '</b><span>' + D.esc(L.endedSub) + '</span><em></em></div>');

        var $ = function (s) { return root.querySelector(s); };
        var ringFg = $('.eos-ring-fg'), miniFg = $('.eos-mini-fg'), timeB = $('.eos-time b'), miniB = $('.eos-mini-t b');
        var phaseEl = $('.eos-phase');

        var breaths = 0, minimized = 0, mini = false, pressed = false;
        function returnsAt() { return Math.round(before * Math.max(C.min, C.base - breaths * C.perBreath)); }
        $('.eos-ret').textContent = returnsAt() + '%';

        /* lightning, now and then, while the storm is up */
        function strike() { D.replay($('.eos-flash'), 'on'); au.sfx('thunder'); }

        /* holding */
        function down(e) {
            if (!root.classList.contains('eos-s-calm') || mini) return;
            if (e && e.target && e.target.closest && e.target.closest('button')) return;
            pressed = true; root.classList.add('eos-held');
        }
        function up() { pressed = false; root.classList.remove('eos-held'); }
        root.addEventListener('pointerdown', down);
        window.addEventListener('pointerup', up);
        function key(e) {
            if (!root.isConnected) return;
            if (e.key !== ' ' || mini || !root.classList.contains('eos-s-calm')) return;
            e.preventDefault();                                   // Space breathes; it never presses a focused button here
            if (e.type === 'keydown') { if (!e.repeat) down(); } else up();
        }
        document.addEventListener('keydown', key, true);
        document.addEventListener('keyup', key, true);

        function setMini(on) {
            mini = on;
            up();
            root.classList.toggle('eos-is-mini', on);
            if (frame) frame.classList.toggle('dks-see', on);
            host.style.pointerEvents = on ? 'none' : hostPE;
            au.sfx(on ? 'mini' : 'back');
            log(on ? 'You use the calm. The eye waits in the corner.' : 'Back in the eye.');
            if (typeof opts.onMini === 'function') { try { opts.onMini(on); } catch (e) {} }
            try { (on ? $('.eos-back') : $('.eos-use')).focus({ preventScroll: true }); } catch (e) {}
        }
        $('.eos-use').addEventListener('click', function (e) { e.stopPropagation(); setMini(true); });
        $('.eos-back').addEventListener('click', function (e) { e.stopPropagation(); setMini(false); });

        /* the minute: one clock drives the ring, the breath and the sound */
        function calm() {
            return new Promise(function (resolve) {
                var t0 = performance.now(), last = t0, lastPhase = -1, match = 0, total = 0, closing = false;
                var orb = $('.eos-orb');
                orb.style.animationDuration = (half * 2) + 'ms';
                (function frameFn(now) {
                    if (!root.isConnected) return resolve();
                    var el = now - t0, dt = now - last; last = now;
                    var left = Math.max(0, dur - el / 1000);
                    ringFg.style.strokeDashoffset = (CIRC * (1 - left / dur)).toFixed(1);
                    miniFg.style.strokeDashoffset = (276.5 * (1 - left / dur)).toFixed(1);
                    timeB.textContent = miniB.textContent = Math.ceil(left);
                    $('.eos-earned').textContent = '+' + D.fmt(eps * mult * el / 1000);
                    if (mini) minimized += dt;

                    var phase = Math.floor(el / half) % 2;           // 0 in, 1 out
                    if (!mini) { total += dt; if (pressed === (phase === 0)) match += dt; }
                    if (phase !== lastPhase && left > 0.5) {
                        if (phase === 0 && lastPhase === 1) {          // a breath has ended: was it in time?
                            if (total > half * 1.5 && match / total >= 0.7) {
                                breaths++;
                                var r = returnsAt();
                                $('.eos-breaths').textContent = breaths;
                                $('.eos-ret').textContent = r + '%';
                                $('.eos-ret-was').textContent = Math.round(before * C.base) + '%';
                                D.replay($('.eos-sync'), 'on');
                                D.replay($('.eos-ret'), 'eos-bump');
                                au.sfx('synced');
                                log('In time. The storm will return at ' + r + '%.');
                            }
                            match = 0; total = 0;
                        }
                        lastPhase = phase;
                        phaseEl.textContent = phase === 0 ? L.inhale : L.exhale;
                        root.classList.toggle('eos-out', phase === 1);
                        au.sfx(phase === 0 ? 'inhale' : 'exhale', Math.min(half, left * 1000) / 1000);
                    }
                    if (!closing && left <= 10) {
                        closing = true;
                        root.classList.add('eos-closing');
                        $('.eos-hint').textContent = L.closing;
                        au.cue('closing');
                        log(L.closing);
                    }
                    if (left <= 0) return resolve();
                    raf = requestAnimationFrame(frameFn);
                })(t0);
            });
        }

        var result = { before: before };
        var done = (async function () {
            /* 1 · THE STORM */
            root.classList.add('eos-s-storm');
            au.cue('storm');
            au.sfx('rain', 2.6);
            later(strike, 400);
            later(strike, 1700);
            await dir.wait(2600);

            /* 2 · THE EYE */
            root.classList.add('eos-s-eye');
            au.sfx('open');
            log(L.eyebrow + '. ' + L.title + '. ' + L.body + ' ' + fill(L.boost));
            if (typeof opts.onStart === 'function') { try { opts.onStart(); } catch (e) {} }
            var ins = [$('.eos-alarm b'), $('.eos-instab')];
            for (var v = before; v >= 0; v -= Math.max(1, Math.ceil(before / 14))) {
                ins.forEach(function (e) { e.textContent = v + '%'; });
                au.sfx('drain');
                await sleep(90);
            }
            ins.forEach(function (e) { e.textContent = '0%'; });
            await dir.wait(1200);

            /* 3 · THE CALM */
            shell.done();
            root.classList.add('eos-s-calm');
            au.cue('calm');
            await calm();
            if (mini) setMini(false);

            /* 4 · THE RETURN */
            up();
            root.classList.add('eos-s-return');
            au.cue('storm');
            au.sfx('return');
            later(strike, 600);
            result.returnsAt = returnsAt();
            result.breaths = breaths;
            result.minimized = Math.round(minimized / 1000);
            result.earned = eps * mult * dur;
            $('.eos-end em').textContent = 'INSTABILITY ' + result.returnsAt + '%' + (breaths ? ' · ' + breaths + ' ' + L.breaths.toLowerCase() : '');
            ['.eos-alarm b', '.eos-instab'].forEach(function (s) { $(s).textContent = result.returnsAt + '%'; });
            log(L.ended + '. ' + L.endedSub + ' Instability ' + result.returnsAt + '%.');
            if (typeof opts.onEnd === 'function') { try { opts.onEnd(result); } catch (e) {} }
            await sleep(1600);
            if (opts.autoClose) { await sleep(opts.autoClose); result.action = 'auto'; }
            else result.action = await D.choices(root, opts.choices || [{ id: 'continue', label: 'CONTINUE' }]).show();
            finish();
            return result;
        })();

        function finish() {
            cancelAnimationFrame(raf);
            timers.forEach(function (t) { clearTimeout(t); });
            window.removeEventListener('pointerup', up);
            document.removeEventListener('keydown', key, true);
            document.removeEventListener('keyup', key, true);
            host.style.pointerEvents = hostPE;
            shell.close();
        }
        return { done: done, close: finish };
    }

    window.EyeScene = { play: play, LINES: LINES, CALM: CALM };
})();
