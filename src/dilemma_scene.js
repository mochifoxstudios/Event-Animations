/* ═══════════════════════════════════════════════════════════════════════════
   dilemma_scene.js — THE PRISONER'S DILEMMA, with the choice put back.

   The game's version showed "MUTUAL COOPERATION" and resolved itself after a
   5-second countdown: a dilemma with no decision in it. This one is a real
   one-shot dilemma against an operator you can READ.

     1 THE SIGNAL  a scanner sweeps, static, then locks: "<name> HAS BEEN DETECTED
                   ON YOUR FREQUENCY". Split screen — you, the pool, them.
     2 THE TERMS   the payoff grid, in real energy. Their opening transmission,
                   in their voice.
     3 DECIDE      SHARE or STEAL, 15 seconds. Their dossier (trust, record) is on
                   screen, and their cursor hovers between their own two options —
                   it lingers on the one they mean. A tell, not a certainty.
                   Out of time: you share (the game's old behaviour).
     4 LOCK-IN     your card seals; theirs seals a beat later. Heartbeat.
     5 REVEAL      both cards flip at once. The pool splits, flows to one side,
                   or burns. Their last word.

   Payoffs (shares of the player's energy; the pool is 40%, as in the game):
       you share, they share   +20%   (what the game always gave)
       you steal, they share   +40%   (you take the pool)
       you share, they steal   −10%   (they take your stake)
       both steal              nothing, and +10% instability
   ⭐ All of it is data: opts.opponents, opts.opponent, opts.payoffs, opts.time.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;

    var PAYOFFS = {
        SS: { you: 0.20, label: 'MUTUAL COOPERATION', note: 'You split the pool.' },
        TS: { you: 0.40, label: 'YOU TOOK IT ALL', note: 'They shared. You did not.' },
        ST: { you: -0.10, label: 'BETRAYED', note: 'You shared. They did not.' },
        TT: { you: 0, instability: 10, label: 'NOBODY EATS', note: 'Both of you stole. The simulation confiscates the pool.' }
    };

    /* the game's five operator names, each given a way of deciding */
    var OPPONENTS = {
        op409: { name: 'Operator_409', trust: 82, record: [7, 9], decide: function () { return Math.random() < 0.8 ? 'S' : 'T'; },
            say: { intro: 'we both walk away richer. that is how this works.', SS: 'see? not everything has to be taken.',
                   TS: '...i will remember the number 15.', ST: 'nothing personal. you understand.', TT: 'then nobody eats.' } },
        nexus: { name: 'NEXUS_PROC_Δ', trust: 50, record: [4, 8], decide: function (st) { return st._pdLast === 'T' ? 'T' : 'S'; },
            say: { intro: 'PROTOCOL: RECIPROCAL. YOUR PRIOR CONDUCT HAS BEEN LOADED.', SS: 'RECIPROCITY CONFIRMED.',
                   TS: 'DEVIATION LOGGED. NEXT TIME.', ST: 'YOU TAUGHT ME THIS.', TT: 'EQUILIBRIUM. INEFFICIENT.' } },
        unknown: { name: 'usr_unknown', trust: null, record: [0, 0], decide: function () { return Math.random() < 0.5 ? 'S' : 'T'; },
            say: { intro: 'hi? is this thing on? what do the buttons do', SS: 'oh nice!! is that good?', TS: 'oh. ok. that was mean',
                   ST: 'oops. i pressed the other one', TT: 'wait we both lost?' } },
        void7: { name: 'void_entity_7', trust: 21, record: [2, 11], decide: function () { return Math.random() < 0.25 ? 'S' : 'T'; },
            say: { intro: 'trust is a resource. so is energy.', SS: 'hm. sentiment. it will not happen twice.',
                   TS: 'well played. i did not think you had it in you.', ST: 'thank you for the energy, fifteen.', TT: 'a mirror. how dull.' } },
        omega: { name: 'Ω_remnant', trust: 60, record: [5, 7],
            decide: function (st) { var p = st._existentialPath; return p === 'POWER' || p === 'VOID' ? 'T' : p ? 'S' : (Math.random() < 0.5 ? 'S' : 'T'); },
            say: { intro: 'i have seen what you answered at a million. i will answer the same way.', SS: 'as you chose. as i chose.',
                   TS: 'you were not who you said you were.', ST: 'you chose numbers once. so did i.', TT: 'we are the same, then.' } }
    };
    var ORDER = ['op409', 'nexus', 'unknown', 'void7', 'omega'];

    var AVATAR =
        '<svg viewBox="0 0 120 150" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3">'
      + '<rect x="22" y="14" width="76" height="58" rx="6"/><rect x="31" y="23" width="58" height="40" rx="3" class="pd-screen"/>'
      + '<line x1="60" y1="72" x2="60" y2="86"/><path d="M14,148 C14,108 34,88 60,88 C86,88 106,108 106,148"/>'
      + '<line x1="44" y1="2" x2="50" y2="14"/><line x1="76" y1="2" x2="70" y2="14"/></g>'
      + '<rect x="40" y="36" width="10" height="8" class="pd-eye"/><rect x="70" y="36" width="10" height="8" class="pd-eye"/></svg>';
    var CURSOR = '<svg viewBox="0 0 24 34" aria-hidden="true"><path d="M2,2 L2,28 L9,21 L14,32 L18,30 L13,19 L22,19 Z" fill="#000" stroke="#ffcc88" stroke-width="1.6" stroke-linejoin="round"/></svg>';

    function rnd(a, b) { return a + Math.random() * (b - a); }

    /* play(host, opts) → { done: Promise<{ you, them, outcome, delta, instability }>, close() }
       opts.state     { energy, _pdLast, _existentialPath }   opts.opponent  key of OPPONENTS (random if absent)
       opts.time      seconds to decide (15)                  opts.payoffs / opts.opponents  overrides
       opts.onResult  (result) => void — apply it here        opts.audio false for silence */
    function play(host, opts) {
        opts = opts || {};
        var st = opts.state || window.state || {};
        var energy = st.energy || 3.2e14;
        var pool = energy * 0.4;
        var P = Object.assign({}, PAYOFFS, opts.payoffs);
        var OPS = Object.assign({}, OPPONENTS, opts.opponents);
        var key = opts.opponent || ORDER[(Math.random() * ORDER.length) | 0];
        var op = OPS[key];
        var their = op.decide(st);
        var time = opts.time || 15;
        var reduced = D.reduced();
        var au = D.audio(opts, window.DilemmaScore);
        var dir = D.director();
        var shell = D.shell(host, 'pd', dir, au);
        var root = shell.root;
        root.setAttribute('aria-label', 'Prisoner\'s Dilemma');
        var timers = [];
        function later(fn, ms) { var t = setTimeout(fn, reduced ? Math.min(ms, 150) : ms); timers.push(t); return t; }
        function sleep(ms) { return new Promise(function (r) { later(r, ms); }); }
        function amt(f) { return (f >= 0 ? '+' : '−') + D.fmt(Math.abs(energy * f)) + ' E'; }

        var trustTxt = op.trust == null ? '??' : op.trust + '%';
        var recTxt = op.record[1] ? op.record[0] + ' of ' + op.record[1] + ' shared' : 'no record';

        root.insertAdjacentHTML('beforeend', ''
          + '<div class="pd-scan"><svg viewBox="0 0 1920 200" preserveAspectRatio="none"><path class="pd-wave"/></svg><div class="pd-scan-txt">SCANNING FREQUENCIES…</div></div>'
          + '<div class="pd-head"><b>PRISONER\'S DILEMMA</b><span>' + D.esc(op.name.toUpperCase()) + ' HAS BEEN DETECTED ON YOUR FREQUENCY</span></div>'
          + '<div class="pd-side pd-you"><div class="pd-tag">YOU</div><div class="pd-name">OPERATOR 15</div>'
          +   '<div class="pd-stat"><span>YOUR STAKE</span><b>' + D.esc(D.fmt(pool / 2)) + ' E</b></div>'
          +   '<div class="pd-stat"><span>LAST TIME</span><b>' + (st._pdLast ? (st._pdLast === 'S' ? 'shared' : 'stole') : 'first contact') + '</b></div>'
          +   '<div class="pd-card pd-card-you"><div class="pd-card-in"><div class="pd-back">◈</div><div class="pd-front"></div></div></div></div>'
          + '<div class="pd-side pd-them"><div class="pd-tag">THEM</div><div class="pd-name">' + D.esc(op.name) + '</div>'
          +   '<div class="pd-avatar">' + AVATAR + '</div>'
          +   '<div class="pd-stat"><span>TRUST RATING</span><b>' + trustTxt + '</b><i class="pd-trust"><s style="transform:scaleX(' + ((op.trust || 50) / 100) + ')"></s></i></div>'
          +   '<div class="pd-stat"><span>RECORD</span><b>' + D.esc(recTxt) + '</b></div>'
          +   '<div class="pd-chat"></div>'
          +   '<div class="pd-mini"><span class="ms">SHARE</span><span class="mt">STEAL</span><div class="pd-ghost">' + CURSOR + '</div></div>'
          +   '<div class="pd-card pd-card-them"><div class="pd-card-in"><div class="pd-back">◈</div><div class="pd-front"></div></div></div></div>'
          + '<div class="pd-pool"><div class="pd-orb"></div><div class="pd-pool-amt"><span>THE POOL</span><b>' + D.esc(D.fmt(pool)) + ' E</b></div></div>'
          + '<div class="pd-grid">'
          +   '<div class="pd-gh"></div><div class="pd-gh">THEY SHARE</div><div class="pd-gh">THEY STEAL</div>'
          +   '<div class="pd-gh">YOU SHARE</div><div class="pd-cell" data-o="SS"><b>' + amt(P.SS.you) + '</b><span>split it</span></div><div class="pd-cell" data-o="ST"><b>' + amt(P.ST.you) + '</b><span>they take your stake</span></div>'
          +   '<div class="pd-gh">YOU STEAL</div><div class="pd-cell" data-o="TS"><b>' + amt(P.TS.you) + '</b><span>you take it all</span></div><div class="pd-cell" data-o="TT"><b>' + (P.TT.you ? amt(P.TT.you) : '0 E') + '</b><span>+' + (P.TT.instability || 0) + '% instability</span></div>'
          + '</div>'
          + '<div class="pd-decide"><button type="button" class="pd-btn pd-share" data-c="S">SHARE</button>'
          +   '<div class="pd-clock"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="pd-clock-bg"/><circle cx="50" cy="50" r="44" class="pd-clock-fg"/></svg><b>' + time + '</b></div>'
          +   '<button type="button" class="pd-btn pd-steal" data-c="T">STEAL</button></div>'
          + '<div class="pd-hint">Out of time, and you share.</div>'
          + '<div class="pd-outcome"><b></b><span></span><em></em></div>'
          + '<div class="pd-chips"></div><div class="pd-flash"></div>');

        var $ = function (s) { return root.querySelector(s); };
        var chat = $('.pd-chat'), ghost = $('.pd-ghost'), clockB = $('.pd-clock b'), clockFg = $('.pd-clock-fg');
        var log = shell.log;
        var wave = $('.pd-wave');
        (function drawWave(k) {
            var d = 'M0,100'; for (var x = 0; x <= 1920; x += 24) d += ' L' + x + ',' + (100 + Math.sin(x / 40 + k) * 40 * Math.random() + (Math.random() - 0.5) * 30);
            wave.setAttribute('d', d);
            if (root.classList.contains('pd-s-scan')) later(function () { drawWave(k + 0.6); }, 70);
        })(0);

        function say(text) {
            chat.innerHTML = '<div class="pd-bubble"></div>';
            var b = chat.firstChild, n = 0;
            log(op.name + ': ' + text);
            return dir.type(b, text, 30, function () { if (n++ % 2 === 0) au.voice(0); });
        }

        /* their cursor drifts between their options, lingering on the real one */
        var ghostTimer = null, onReal = 0.68;
        function ghostLoop() {
            var real = their === 'S' ? 0 : 1;
            var go = Math.random() < onReal ? real : 1 - real;
            ghost.style.transform = 'translate(' + (go ? rnd(250, 330) : rnd(50, 130)) + 'px,' + rnd(4, 18) + 'px)';
            ghostTimer = later(ghostLoop, go === real ? rnd(900, 1500) : rnd(350, 650));
        }

        var picked = null, resolvePick;
        var pickP = new Promise(function (r) { resolvePick = r; });
        root.querySelectorAll('.pd-btn').forEach(function (b) {
            b.addEventListener('pointerenter', function () { if (!picked) au.sfx('hover', b.dataset.c); root.dataset.lean = b.dataset.c; });
            b.addEventListener('pointerleave', function () { root.dataset.lean = ''; });
            b.addEventListener('click', function (e) { e.stopPropagation(); if (!picked && root.classList.contains('pd-s-decide')) lock(b.dataset.c); });
        });
        function lock(c) {
            picked = c;
            root.classList.add('pd-locked-' + c);
            au.sfx('lock');
            log('You locked in: ' + (c === 'S' ? 'SHARE' : 'STEAL'));
            resolvePick(c);
        }

        var done = (async function () {
            /* 1 · THE SIGNAL */
            root.classList.add('pd-s-scan');
            au.cue('scan');
            au.sfx('static');
            await dir.wait(2200);
            root.classList.remove('pd-s-scan');
            root.classList.add('pd-s-lock');
            au.sfx('found');
            await dir.wait(900);
            root.classList.add('pd-s-split');
            await dir.wait(900);

            /* 2 · THE TERMS */
            au.cue('terms');
            root.classList.add('pd-s-terms');
            await dir.wait(700);
            await say(op.say.intro);
            await dir.wait(900);

            /* 3 · DECIDE */
            shell.done();
            root.classList.add('pd-s-decide');
            au.cue('decide');
            chat.innerHTML = '<div class="pd-bubble pd-typing"><i></i><i></i><i></i></div>';
            ghostLoop();
            var left = time, tick;
            clockFg.style.strokeDasharray = '276.5';
            clockFg.style.strokeDashoffset = '0';
            void clockFg.getBoundingClientRect();
            clockFg.style.transition = 'stroke-dashoffset ' + time + 's linear';
            requestAnimationFrame(function () { clockFg.style.strokeDashoffset = '276.5'; });
            var timeout = new Promise(function (r) {
                tick = setInterval(function () {
                    left -= 1;
                    clockB.textContent = Math.max(0, left);
                    au.sfx(left <= 3 ? 'tick_last' : 'tick');
                    if (left <= 3) root.classList.add('pd-hurry');
                    if (left <= 0) { clearInterval(tick); r('timeout'); }
                }, 1000);
                timers.push(tick);
            });
            var who = await Promise.race([pickP, timeout]);
            clearInterval(tick);
            if (who === 'timeout') { lock('S'); log('Out of time: you share.'); }
            root.classList.remove('pd-hurry');
            var cs = getComputedStyle(clockFg).strokeDashoffset;
            clockFg.style.transition = 'none'; clockFg.style.strokeDashoffset = cs;   // freeze where it stopped

            /* 4 · LOCK-IN */
            root.classList.add('pd-s-locked');
            au.cue('wait');
            await sleep(rnd(900, 1600));
            clearTimeout(ghostTimer);
            root.classList.add('pd-them-locked');
            chat.innerHTML = '';
            au.sfx('their_lock');
            await sleep(1100);

            /* 5 · REVEAL */
            var o = picked === 'S' ? (their === 'S' ? 'SS' : 'ST') : (their === 'S' ? 'TS' : 'TT');
            var res = P[o];
            $('.pd-card-you .pd-front').textContent = picked === 'S' ? 'SHARE' : 'STEAL';
            $('.pd-card-them .pd-front').textContent = their === 'S' ? 'SHARE' : 'STEAL';
            $('.pd-card-you').classList.add(picked === 'S' ? 'is-s' : 'is-t');
            $('.pd-card-them').classList.add(their === 'S' ? 'is-s' : 'is-t');
            au.cue(null);
            au.sfx('flip');
            root.classList.add('pd-s-reveal');
            await sleep(700);
            root.classList.add('pd-o-' + o);
            root.querySelector('.pd-cell[data-o="' + o + '"]').classList.add('hit');
            D.replay($('.pd-flash'), 'on');
            au.sfx('out_' + o);
            chips(o);
            var delta = energy * res.you;
            var result = { you: picked, them: their, outcome: o, delta: delta, instability: res.instability || 0, opponent: key };
            if (typeof opts.onResult === 'function') { try { opts.onResult(result); } catch (e) {} }
            var out = $('.pd-outcome');
            out.querySelector('b').textContent = res.label;
            out.querySelector('span').textContent = res.note;
            out.querySelector('em').textContent = (res.you ? amt(res.you) : '0 E') + (res.instability ? '  ·  +' + res.instability + '% instability' : '');
            log(res.label + '. ' + res.note);
            await sleep(1400);
            await say(op.say[o]);
            au.cue('after_' + o);
            await sleep(600);
            var action = await D.choices(root, opts.choices || [{ id: 'continue', label: 'CONTINUE' }]).show();
            finish();
            result.action = action;
            return result;
        })();

        /* the pool's energy as chips: split, flowing one way, or burning */
        function chips(o) {
            var layer = $('.pd-chips'), n = reduced ? 0 : 22;
            var dest = { SS: null, TS: [-640, 120], ST: [640, 120], TT: 'burn' }[o];
            for (var i = 0; i < n; i++) {
                var c = D.h('i', 'pd-chip' + (dest === 'burn' ? ' burn' : ''));
                var d = dest === null ? (i % 2 ? [640, 120] : [-640, 120]) : dest === 'burn' ? [rnd(-260, 260), rnd(-300, 60)] : dest;
                c.style.setProperty('--dx', (d[0] + rnd(-60, 60)) + 'px');
                c.style.setProperty('--dy', (d[1] + rnd(-60, 60)) + 'px');
                c.style.animationDelay = (i * 40) + 'ms';
                layer.appendChild(c);
                if (i % 4 === 0) later(function () { au.sfx(dest === 'burn' ? 'burn' : 'chip'); }, i * 40);
            }
        }
        function finish() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); shell.close(); }

        return { done: done, close: finish, opponent: key, their: their };
    }

    window.DilemmaScene = { play: play, OPPONENTS: OPPONENTS, ORDER: ORDER, PAYOFFS: PAYOFFS };
})();
