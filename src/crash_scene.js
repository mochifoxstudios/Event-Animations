/* ═══════════════════════════════════════════════════════════════════════════
   crash_scene.js — THE FAKE CRASH and THE THERMAL CRASH. One crash screen,
   two events, two scores.

   Both open the same way, because the point is a split second of real dread:
     1 THE FREEZE   the game tears (fake) or overheats (thermal), the music dies
                    on one dead click, and the screen goes blue. For the first
                    second it does not say whose screen it is.
     2 THE CRASH    ":(", the stop code, a percentage that climbs, stalls at the
                    worst moments and ticks like a disk. A mains hum.
                    Clicking during a crash is noticed. In the fake crash, enough
                    clicks end it early ("Fine. You win."), which is the joke:
                    the stop code is TOO_MANY_CLICKS.

   FAKE    3 THE JOKE   ":(" turns into ":)". JUST KIDDING. +50% energy, "the
                        simulation apologizes", a brass ta-da.
   THERMAL 3 CONTAINED  "Thermal event contained. Nothing crashed." RECOVERED.
           4 THE CRACK  the crash screen splits open. Behind it, the core: CLAIM
                        CRASH DIVIDEND ×25 EPS for 30 minutes, "only accessible
                        through system failure". The gap cools shut in 20 s.

   ⭐ All of it is data: opts.lines (every string), opts.info (stop-code lines),
      opts.bonus, opts.window, opts.pokes, opts.choices. See docs/CRASH_SCREENS.md.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;

    function hex(n) { return n.toString(16).toUpperCase(); }
    function rnd(a, b) { return a + Math.random() * (b - a); }

    var VARIANTS = {
        fake: {
            score: 'FakeCrashScore',
            code: 'TOO_MANY_CLICKS',
            info: function (o) {
                return ['STOP CODE: TOO_MANY_CLICKS (0x' + hex(o.clicks || 13333) + ')', 'What failed: CLICK_HANDLER.exe',
                        'Error in module: reality_v' + ((Math.random() * 9 + 1) | 0) + '.' + ((Math.random() * 9) | 0) + '.dll',
                        'Faulty click address: 0x' + Math.random().toString(16).slice(2, 10).toUpperCase()];
            },
            lines: {
                title: 'Your system ran into a problem and needs to restart.<br>We\'re just collecting some error info, and then we\'ll restart for you.',
                pct: '{p}% complete',
                poke: 'Additional click received during crash ({n})',
                pokeAt: { 5: 'Please stop clicking.', 9: 'We can feel that.', 14: 'Fine. You win.' },
                revealTitle: 'False alarm. Nothing crashed.<br>The simulation is fine. Everything is working as intended.',
                revealPct: 'JUST KIDDING',
                bonus: 'CRASH BONUS: +{amt} ENERGY · the simulation apologizes',
                after: 'The simulation experienced a moment of self-doubt.\nYou received compensation. The button is fine.\nProbably.',
                clicked: 'You clicked {n} times during a crash. Respect.'
            },
            pokes: 14                                        // this many clicks ends it early; 0 to never
        },
        thermal: {
            score: 'ThermalCrashScore',
            code: 'THERMAL_OVERLOAD',
            info: function () {
                return ['STOP CODE: THERMAL_OVERLOAD (0x' + hex(0xC0000 + ((Math.random() * 0xFFFF) | 0)) + ')', 'What failed: CPU_CORE_' + ((Math.random() * 16) | 0),
                        'Temperature at failure: {temp}°C', 'Load at failure: 100%'];
            },
            lines: {
                title: 'Your system ran into a problem and needs to restart.<br>We\'re just collecting some error info, and then we\'ll restart for you.',
                pct: '{p}% complete',
                warn: 'CPU 100%',
                poke: 'Touching the CPU is not recommended ({n})',
                pokeAt: { 6: 'It is very hot.' },
                revealTitle: 'Thermal event contained. Nothing crashed.<br>The simulation kept one thing from the wreckage.',
                revealPct: 'RECOVERED',
                behind: 'BEHIND THE CRASH SCREEN',
                claim: '◈ CLAIM CRASH DIVIDEND · ×25 EPS (30 min)',
                only: 'ONLY ACCESSIBLE THROUGH SYSTEM FAILURE',
                cooling: 'THE GAP IS COOLING',
                dismiss: 'DISMISS CRASH SCREEN',
                claimed: 'CRASH DIVIDEND CLAIMED',
                claimedSub: '×25 EPS for 30 minutes · absurd.',
                closedT: 'The gap closed.',
                closedSub: 'It will open again the next time something melts.'
            },
            pokes: 0,
            window: 20                                       // seconds the crack stays open
        }
    };

    /* a QR-looking block: three finder squares and noise (it encodes nothing) */
    function qr() {
        var n = 25, s = '', seed = 7;
        function r() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
        function finder(x, y) { return '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="none" stroke="currentColor"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>'; }
        for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
            var inF = (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
            if (!inF && r() < 0.48) s += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
        }
        return '<svg viewBox="-1 -1 27 27" aria-hidden="true" fill="currentColor" shape-rendering="crispEdges">' + finder(0.5, 0.5) + finder(17.5, 0.5) + finder(0.5, 17.5) + s + '</svg>';
    }

    /* play(host, opts) → { done: Promise<{ variant, clicks, bonus, claimed }>, close() }
       opts.variant  'fake' | 'thermal'
       opts.state    { energy }             opts.clicks  the milestone that tripped it (fake)
       opts.bonus    share of energy paid by the fake crash (0.5)
       opts.window   seconds the thermal crack stays open (20)
       opts.lines / opts.info / opts.pokes  overrides
       opts.onBonus(amount) (fake) · opts.onClaim() (thermal) — apply them here
       opts.see      false to start on black instead of over the game (for a host with nothing under it)
       opts.audio    false for silence */
    function play(host, opts) {
        opts = opts || {};
        var V = VARIANTS[opts.variant] || VARIANTS.fake;
        var thermal = V === VARIANTS.thermal;
        var st = opts.state || window.state || {};
        var L = Object.assign({}, V.lines, opts.lines);
        var info = opts.info || V.info(opts);
        var pokesToEnd = opts.pokes != null ? opts.pokes : V.pokes;
        var reduced = D.reduced();
        var au = D.audio(opts, window[V.score]);
        var dir = D.director();
        var shell = D.shell(host, 'cr ' + (thermal ? 'cr-thermal' : 'cr-fake'), dir, au);
        var root = shell.root, log = shell.log;
        root.setAttribute('aria-label', thermal ? 'Thermal crash' : 'Simulation crash');
        root.setAttribute('role', 'alertdialog');
        shell.done();                                        // a crash has no skip button
        if (opts.see !== false && root.parentNode) root.parentNode.classList.add('dks-see');
        var timers = [];
        function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
        function sleep(ms) { return new Promise(function (r) { later(r, reduced ? Math.min(ms, 400) : ms); }); }
        var temp = 98 + ((Math.random() * 9) | 0);

        var tears = '';
        for (var i = 0; i < 9; i++) tears += '<i style="top:' + rnd(0, 1040).toFixed(0) + 'px;height:' + rnd(10, 90).toFixed(0) + 'px;--dx:' + rnd(-160, 160).toFixed(0) + 'px;animation-delay:' + (i * 60) + 'ms"></i>';

        root.insertAdjacentHTML('beforeend', ''
          + '<div class="cr-pre">' + (thermal ? '<div class="cr-haze"><i></i><i></i><i></i></div><div class="cr-warn">' + D.esc(L.warn) + '</div>' : '<div class="cr-tears">' + tears + '</div>') + '</div>'
          + '<div class="cr-screen">'
          +   '<div class="cr-scan"></div><div class="cr-heat"></div>'
          +   '<div class="cr-in">'
          +     '<div class="cr-eyebrow">// SIMULATION FAULT &nbsp;|&nbsp; UNSCHEDULED</div>'
          +     '<div class="cr-face"><span>:</span><span class="cr-paren">(</span></div>'
          +     '<div class="cr-title">' + L.title + '</div>'
          +     '<div class="cr-pct">' + D.esc(L.pct.replace('{p}', 0)) + '</div>'
          +     '<div class="cr-low"><div class="cr-qr">' + qr() + '</div><div class="cr-text">'
          +       '<div class="cr-info"></div><div class="cr-pokes"></div>'
          +       '<div class="cr-link">For more information about this issue and possible fixes, visit<br>https://simulation.local/error/' + V.code + '</div></div></div>'
          +     '<div class="cr-bonus"></div>'
          +   '</div>'
          + '</div>'
          + (thermal ? '<div class="cr-core">'
          +   '<div class="cr-behind">' + D.esc(L.behind) + '</div>'
          +   '<div class="cr-orb"><i></i><i></i><b>×25</b></div>'
          +   '<button type="button" class="cr-claim">' + D.esc(L.claim) + '</button>'
          +   '<div class="cr-only">' + D.esc(L.only) + '</div>'
          +   '<div class="cr-cool"><span>' + D.esc(L.cooling) + '</span><i><s></s></i></div>'
          +   '<button type="button" class="cr-dismiss">' + D.esc(L.dismiss) + '</button>'
          + '</div><div class="cr-shut cr-shut-a"></div><div class="cr-shut cr-shut-b"></div><div class="cr-crackline"></div>'
          + '<div class="cr-after"><b></b><span></span></div>' : '')
          + '<div class="cr-flash"></div>');

        var $ = function (s) { return root.querySelector(s); };
        var pctEl = $('.cr-pct'), infoEl = $('.cr-info'), pokesEl = $('.cr-pokes');
        function renderInfo() { infoEl.textContent = info.join('\n').replace('{temp}', temp); }
        renderInfo();

        /* clicks during the crash */
        var pokes = 0, crashed = false, revealed = false, endEarly;
        var early = new Promise(function (r) { endEarly = r; });
        root.addEventListener('pointerdown', function (e) {
            if (!crashed || revealed || e.target.closest('button')) return;
            pokes++;
            au.sfx('poke');
            var extra = L.pokeAt && L.pokeAt[pokes];
            var line = D.h('div', extra ? 'cr-poke-x' : '', D.esc(extra || L.poke.replace('{n}', pokes)));
            pokesEl.appendChild(line);
            while (pokesEl.children.length > 3) pokesEl.removeChild(pokesEl.firstChild);
            D.replay($('.cr-in'), 'cr-jolt');
            if (pokesToEnd && pokes >= pokesToEnd) endEarly();
        });

        /* the percentage: irregular, with a stall where it hurts */
        function count() {
            return new Promise(function (resolve) {
                var p = 0, stalls = { 37: 1200, 99: 1400 };
                (function step() {
                    if (revealed) return resolve();
                    var add = Math.floor(rnd(3, 11));
                    var next = Math.min(100, p + add);
                    Object.keys(stalls).forEach(function (k) { if (p < +k && next >= +k) { next = +k; } });
                    p = next;
                    pctEl.textContent = L.pct.replace('{p}', p);
                    au.sfx('tick');
                    if (thermal && p % 2 === 0 && temp < 109 && Math.random() < 0.4) { temp++; renderInfo(); }
                    if (p >= 100) return later(resolve, 700);
                    later(step, stalls[p] && !reduced ? stalls[p] : (reduced ? 40 : 130));
                })();
            });
        }

        var result = { variant: thermal ? 'thermal' : 'fake', clicks: 0, bonus: 0, claimed: false };
        var done = (async function () {
            /* 1 · THE FREEZE */
            root.classList.add('cr-s-pre');
            if (thermal) { au.cue('heat'); au.sfx('overheat', 1.4); await sleep(1500); }
            else await sleep(650);
            au.cue('dread');
            au.sfx('freeze');
            root.classList.add('cr-s-crash');
            root.parentNode && root.parentNode.classList.remove('dks-see');
            crashed = true;
            log('Your system ran into a problem and needs to restart.');
            await sleep(1100);
            root.classList.add('cr-s-owned');                // now it says whose screen it is

            /* 2 · THE CRASH */
            await Promise.race([count(), early]);
            revealed = true;
            result.clicks = pokes;

            /* 3 · THE REVEAL */
            root.classList.add('cr-s-reveal');
            D.replay($('.cr-flash'), 'on');
            $('.cr-title').innerHTML = L.revealTitle;
            pctEl.textContent = L.revealPct;
            log(L.revealPct + '. ' + L.revealTitle.replace(/<br>/g, ' '));
            if (!thermal) {
                au.sfx('reveal');
                au.cue('joke');
                var gain = (st.energy || 1) * (opts.bonus != null ? opts.bonus : 0.5);
                result.bonus = gain;
                if (typeof opts.onBonus === 'function') { try { opts.onBonus(gain); } catch (e) {} }
                infoEl.textContent = L.after + (pokes ? '\n' + L.clicked.replace('{n}', pokes) : '');
                pokesEl.textContent = '';
                await sleep(700);
                var b = $('.cr-bonus');
                b.textContent = L.bonus.replace('{amt}', D.fmt(gain));
                root.classList.add('cr-s-bonus');
                au.sfx('bonus');
                log(b.textContent);
                await sleep(900);
            } else {
                au.sfx('contained');
                au.cue('closed');
                infoEl.textContent = info.join('\n').replace('{temp}', temp) + '\nStatus: CONTAINED';
                pokesEl.textContent = '';
                await sleep(2600);

                /* 4 · THE CRACK */
                root.classList.add('cr-s-crack');
                au.sfx('crack');
                await sleep(500);
                au.cue('core');
                root.classList.add('cr-s-core');
                log(L.behind + ': ' + L.claim + '. ' + L.only + '.');
                var win = opts.window || V.window;
                var cool = $('.cr-cool s');
                cool.style.transition = 'transform ' + win + 's linear';
                requestAnimationFrame(function () { requestAnimationFrame(function () { cool.style.transform = 'scaleX(0)'; }); });
                var coolTxt = $('.cr-cool span'), left = win;
                coolTxt.textContent = L.cooling + ' · ' + left + 's';
                var coolT = setInterval(function () { left = Math.max(0, left - 1); coolTxt.textContent = L.cooling + ' · ' + left + 's'; }, 1000);
                timers.push(coolT);
                try { $('.cr-claim').focus({ preventScroll: true }); } catch (e) {}
                var pick = await new Promise(function (resolve) {
                    $('.cr-claim').addEventListener('click', function () { resolve('claim'); });
                    $('.cr-dismiss').addEventListener('click', function () { resolve('dismiss'); });
                    later(function () { resolve('cooled'); }, win * 1000);
                    if (win > 6) later(function () { root.classList.add('cr-hurry'); au.sfx('cool'); }, (win - 5) * 1000);
                });
                root.classList.remove('cr-hurry');
                clearInterval(coolT);
                cool.style.transition = 'none';
                var after = $('.cr-after');
                if (pick === 'claim') {
                    result.claimed = true;
                    if (typeof opts.onClaim === 'function') { try { opts.onClaim(); } catch (e) {} }
                    au.sfx('claim');
                    au.cue('claimed');
                    D.replay($('.cr-flash'), 'on');
                    root.classList.add('cr-s-claimed');
                    after.querySelector('b').textContent = L.claimed;
                    after.querySelector('span').textContent = L.claimedSub;
                    log(L.claimed + '. ' + L.claimedSub);
                    await sleep(1800);
                } else {
                    au.sfx(pick === 'cooled' ? 'lost' : 'cool');
                    root.classList.add('cr-s-shut');
                    if (pick === 'cooled') {
                        after.querySelector('b').textContent = L.closedT;
                        after.querySelector('span').textContent = L.closedSub;
                        log(L.closedT);
                        await sleep(1400);
                    } else { await sleep(700); finish(); return result; }
                }
            }
            var auto = opts.autoClose ? sleep(opts.autoClose).then(function () { return 'auto'; }) : null;
            var row = D.choices(root, opts.choices || [{ id: 'continue', label: 'CONTINUE' }]);
            result.action = await (auto ? Promise.race([row.show(), auto]) : row.show());
            finish();
            return result;
        })();

        function finish() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); shell.close(); }
        return { done: done, close: finish };
    }

    window.CrashScene = { play: play, VARIANTS: VARIANTS };
})();
