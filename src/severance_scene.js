/* ═══════════════════════════════════════════════════════════════════════════
   severance_scene.js — THE SEVERANCE PACKAGE.

   The game's version was a dialog box. This one is the meeting you were never
   told about: the Simulation Overseers' HR department, on a video call, being
   very kind about it.

     1 THE INVITE   "Quick chat" lands in your calendar. It accepts itself.
     2 THE CALL     a video call: Dana from Overseer Relations (speaking), Legal
                    (muted, always), and you (camera off). Polite hold music.
     3 THE LETTER   the offer slides in on letterhead and the numbers count up:
                    Level Points and Data. Fine print, if you want it.
     4 THE CHOICE   SIGN · ASK FOR MORE (once) · DECLINE
                    ASK FOR MORE puts you on hold; they come back with a revised
                    offer (most of the time) or "our final offer".
     5a SIGNED      the pen signs, the stamp lands, Dana thanks you, the session
                    powers down. In the game: the game closes and pays on next launch.
     5b DECLINED    stamped, shredded. Dana leaves the call. Legal unmutes for
                    one word.

   All of it is data: opts.offer, opts.lines, opts.fine, opts.negotiate,
      opts.labels, opts.people. See docs/SEVERANCE_PACKAGE.md.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;

    var LINES = {
        hello: ['Hi! Thanks for hopping on. This isn\'t a bad thing.',
                'We\'ve noticed you\'re close to another reset. Your {nth}.',
                'The Overseers have put together a little something for you.'],
        offer: 'Take your time. There\'s no wrong answer.',
        ask: 'Totally fair. Let me take that to the Overseers. One moment.',
        hold: 'YOUR CALL IS IMPORTANT TO US',
        raised: 'Good news! They were able to do a little more.',
        final: 'I\'m afraid that\'s our final offer. It\'s a good one.',
        signed: 'Wonderful. Your universe will continue in your absence.',
        signedBye: 'Take care of yourself, Operator.',
        declined: 'Understood. We\'ll make a note of your... enthusiasm.',
        legal: 'noted.',
        defiance: 'THE SIMULATION NOTES YOUR DEFIANCE',
        ended: 'SESSION ENDED',
        endedSub: 'Your package will be waiting when you return.'
    };
    var FINE = [
        'The simulation reserves the right to continue without you.',
        'Clicks made after signing are void and will not be counted.',
        'The ducks were consulted. Four of five were in favour.',
        'Severance is paid once per operator. There is no second package.',
        'By reading this you agree that you have read this.'
    ];
    var LABELS = { sign: 'SIGN', ask: 'ASK FOR MORE', decline: 'DECLINE', cont: 'CONTINUE' };
    var PEOPLE = { rep: 'Dana', role: 'Overseer Relations', legal: 'Legal', you: 'Operator 15' };

    var FIGURE =
        '<svg viewBox="0 0 200 200" aria-hidden="true">'
      + '<circle cx="100" cy="74" r="38" class="sv-fig"/>'
      + '<path d="M28,200 C28,142 60,120 100,120 C140,120 172,142 172,200 Z" class="sv-fig"/>'
      + '<path d="M84,122 L100,160 L116,122" class="sv-collar"/>'
      + '<path d="M96,128 L100,176 L104,128" class="sv-tie"/>'
      + '<path d="M70,126 C76,150 86,166 100,176 C114,166 124,150 130,126" class="sv-lanyard"/>'
      + '<rect x="90" y="172" width="20" height="14" rx="2" class="sv-badge"/></svg>';
    var MIC_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5,11 a7,7 0 0 0 14,0 M12,18 v3"/><line x1="4" y1="3" x2="20" y2="21"/></svg>';
    var CAM_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="12" height="10" rx="2"/><path d="M15,11 L21,8 L21,16 L15,13"/><line x1="3" y1="4" x2="21" y2="20"/></svg>';
    var SIG = 'M10,58 C30,10 44,10 40,52 C38,70 52,30 66,34 C78,38 60,62 74,58 C90,52 96,22 104,30 C112,40 100,62 118,52 C132,44 138,30 150,40 C160,48 150,60 168,50 C190,38 214,36 250,42';

    function ord(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

    /* play(host, opts) → { done: Promise<{ action, offer, negotiated }>, close() }
       opts.offer      { lp, data }  (random 5–12 LP, 100–300 Data, as in the game)
       opts.state      { prestige: { count } }  — for "your 7th" reset
       opts.negotiate  { chance: 0.65, factor: 1.5 } · false to remove ASK FOR MORE
       opts.lines / opts.fine / opts.labels / opts.people  text overrides
       opts.onAccept(offer) · opts.onDecline()  apply them here (the game closes itself
       in onAccept; the scene only plays the goodbye). opts.audio false for silence. */
    function play(host, opts) {
        opts = opts || {};
        var st = opts.state || window.state || {};
        var L = Object.assign({}, LINES, opts.lines);
        var LB = Object.assign({}, LABELS, opts.labels);
        var PP = Object.assign({}, PEOPLE, opts.people);
        var fine = opts.fine || FINE;
        var neg = opts.negotiate === false ? null : Object.assign({ chance: 0.65, factor: 1.5 }, opts.negotiate);
        var offer = Object.assign({ lp: 5 + Math.floor(Math.random() * 8), data: 100 + Math.floor(Math.random() * 200) }, opts.offer);
        var nth = ord((((st.prestige && st.prestige.count) || 0) + 1));
        var reduced = D.reduced();
        var au = D.audio(opts, window.SeveranceScore);
        var dir = D.director();
        var shell = D.shell(host, 'sv', dir, au);
        var root = shell.root, log = shell.log;
        root.setAttribute('aria-label', 'Severance Package');
        var timers = [];
        function later(fn, ms) { var t = setTimeout(fn, reduced ? Math.min(ms, 150) : ms); timers.push(t); return t; }
        function sleep(ms) { return new Promise(function (r) { later(r, ms); }); }

        root.insertAdjacentHTML('beforeend', ''
          + '<div class="sv-world"><div class="sv-dim"></div>'
          + '<div class="sv-invite"><div class="sv-inv-top"><i></i>CALENDAR</div><b>Quick chat</b><span>Simulation Overseers · Human Resources</span><span>Now · 5 min · Required</span>'
          +   '<em class="sv-inv-ok">ACCEPTED AUTOMATICALLY</em></div>'
          + '<div class="sv-call">'
          +   '<div class="sv-bar"><span class="sv-rec">' + D.icon('dot') + ' REC</span><span class="sv-title">Quick chat</span><span class="sv-clock">00:00</span></div>'
          +   '<div class="sv-main"><div class="sv-fig-wrap">' + FIGURE + '</div><div class="sv-ring"></div>'
          +     '<div class="sv-holdcard"><b>ON HOLD</b><span>' + D.esc(L.hold) + '</span><i class="sv-spin"></i></div>'
          +     '<div class="sv-left">' + D.esc(PP.rep) + ' has left the meeting</div>'
          +     '<div class="sv-name">' + D.esc(PP.rep) + ' · ' + D.esc(PP.role) + '</div></div>'
          +   '<div class="sv-tiles"><div class="sv-tile sv-legal"><div class="sv-av">' + D.esc(PP.legal.charAt(0)) + '</div><span>' + D.esc(PP.legal) + '</span><i class="sv-mic">' + MIC_OFF + '</i></div>'
          +     '<div class="sv-tile sv-me"><div class="sv-av">15</div><span>' + D.esc(PP.you) + '</span><i class="sv-mic">' + CAM_OFF + '</i></div></div>'
          +   '<div class="sv-cap"><b></b><span></span></div>'
          + '</div>'
          + '<div class="sv-letter"><div class="sv-paper">'
          +   '<div class="sv-lh"><div class="sv-seal">' + D.icon('gem') + '</div><div><b>OFFICE OF THE SIMULATION OVERSEERS</b><span>Human Resources · Voluntary Separation</span></div></div>'
          +   '<div class="sv-re">RE: SEVERANCE PACKAGE</div>'
          +   '<p>Dear ' + D.esc(PP.you) + ',</p><p>In exchange for stepping away, you will receive:</p>'
          +   '<div class="sv-row sv-lp"><span>LEVEL POINTS</span><s class="sv-old"></s><b>0</b></div>'
          +   '<div class="sv-row sv-data"><span>DATA</span><s class="sv-old"></s><b>0</b></div>'
          +   '<p class="sv-cont">Your universe will continue in your absence.</p>'
          +   '<div class="sv-fine-row"><button type="button" class="sv-fine-btn" aria-expanded="false">* read the fine print</button>'
          +     '<div class="sv-stamp sv-st-rev">REVISED</div><div class="sv-stamp sv-st-final">FINAL OFFER</div></div>'
          +   '<div class="sv-fine"><b>THE FINE PRINT</b><ol>' + fine.map(function (f) { return '<li>' + D.esc(f) + '</li>'; }).join('') + '</ol>'
          +     '<button type="button" class="sv-fine-close">BACK TO THE LETTER</button></div>'
          +   '<div class="sv-sign"><svg viewBox="0 0 260 80" aria-hidden="true"><path class="sv-sig" d="' + SIG + '"/></svg><span>' + D.esc(PP.you) + '</span>'
          +     '<div class="sv-stamp sv-st-ok">ACCEPTED</div><div class="sv-stamp sv-st-no">DECLINED</div></div>'
          + '</div></div><div class="sv-strips"></div>'
          + '<div class="sv-shredder"><i></i></div>'
          + '<div class="sv-defy"></div>'
          + '</div>'
          + '<div class="sv-off"><div class="sv-line"></div><div class="sv-end"><b>' + D.esc(L.ended) + '</b><span>' + D.esc(L.endedSub) + '</span>'
          +   '<div class="sv-next"><em>NEXT LAUNCH</em><b class="sv-next-amt"></b></div></div></div>');

        var $ = function (s) { return root.querySelector(s); };
        var cap = $('.sv-cap'), capWho = cap.querySelector('b'), capTxt = cap.querySelector('span');
        var clockEl = $('.sv-clock');

        /* the meeting timer */
        var secs = 0, clockT = setInterval(function () {
            secs++; clockEl.textContent = ('0' + ((secs / 60) | 0)).slice(-2) + ':' + ('0' + (secs % 60)).slice(-2);
        }, 1000);
        timers.push(clockT);

        function say(text, who) {
            who = who || PP.rep;
            text = text.replace('{nth}', nth);
            capWho.textContent = who;
            capTxt.textContent = '';
            D.replay(cap, 'on');
            log(who + ': ' + text);
            var n = 0, speaking = who === PP.rep;
            if (speaking) root.classList.add('sv-talk');
            return dir.type(capTxt, text, 34, function () { if (speaking && n++ % 2 === 0) au.voice(0); }).then(function () {
                root.classList.remove('sv-talk');
                return dir.wait(Math.min(1800, 500 + text.length * 14));
            });
        }

        /* count a number up on the letter */
        function count(el, to) {
            if (reduced) { el.textContent = D.fmt(to); return; }
            var t0 = performance.now(), dur = 900;
            (function f(now) {
                if (!root.isConnected) return;
                var k = Math.min(1, (now - t0) / dur);
                el.textContent = D.fmt(Math.round(to * (1 - Math.pow(1 - k, 3))));
                if (k < 1) { if (Math.random() < 0.35) au.sfx('type'); requestAnimationFrame(f); }
            })(t0);
        }
        function showOffer() { count($('.sv-lp b'), offer.lp); later(function () { count($('.sv-data b'), offer.data); }, 250); }

        /* the fine print opens as its own sheet over the letter; it closes again before any stamp lands */
        var fineBtn = $('.sv-fine-btn'), fineClose = $('.sv-fine-close');
        function setFine(open, focus) {
            if (open === root.classList.contains('sv-fine-open')) return;
            root.classList.toggle('sv-fine-open', open);
            fineBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (focus) { try { (open ? fineClose : fineBtn).focus({ preventScroll: true }); } catch (e) {} }
            if (open) log('Fine print: ' + fine.join(' '));
        }
        fineBtn.addEventListener('click', function (e) { e.stopPropagation(); au.sfx('fine'); setFine(true, true); });
        fineClose.addEventListener('click', function (e) { e.stopPropagation(); au.sfx('fine'); setFine(false, true); });

        function stamp(cls) { var s = $('.' + cls); D.replay(s, 'on'); au.sfx('stamp'); }

        var negotiated = null;
        var done = (async function () {
            /* 1 · THE INVITE */
            au.sfx('ding');
            root.classList.add('sv-s-invite');
            await dir.wait(1500);
            root.classList.add('sv-s-auto');
            au.sfx('paper');
            await dir.wait(1200);

            /* 2 · THE CALL */
            root.classList.add('sv-s-call');
            au.sfx('join');
            au.cue('office');
            await dir.wait(900);
            for (var i = 0; i < L.hello.length; i++) await say(L.hello[i]);

            /* 3 · THE LETTER */
            root.classList.add('sv-s-letter');
            au.sfx('paper');
            await dir.wait(700);
            showOffer();
            await dir.wait(1300);
            await say(L.offer);

            /* 4 · THE CHOICE */
            shell.done();
            var action;
            for (;;) {
                var list = [{ id: 'accept', label: LB.sign }];
                if (neg && !negotiated) list.push({ id: 'ask', label: LB.ask, alt: true });
                list.push({ id: 'decline', label: LB.decline });
                var row = D.choices(root, list);
                action = await row.show();
                var rows = root.querySelectorAll('.dks-actions'); rows.forEach(function (r) { r.remove(); });
                setFine(false, false);
                if (action !== 'ask') break;

                /* ASK FOR MORE: on hold */
                log('You asked for more.');
                await say(L.ask);
                root.classList.add('sv-hold');
                au.cue('hold');
                capTxt.textContent = '';
                await sleep(4200);
                var up = Math.random() < neg.chance;
                if (opts.forceNegotiation) up = opts.forceNegotiation === 'raised';
                root.classList.remove('sv-hold');
                au.cue('office');
                if (up) {
                    negotiated = 'raised';
                    $('.sv-lp .sv-old').textContent = D.fmt(offer.lp);
                    $('.sv-data .sv-old').textContent = D.fmt(offer.data);
                    offer = { lp: Math.round(offer.lp * neg.factor), data: Math.round(offer.data * neg.factor) };
                    root.classList.add('sv-raised');
                    stamp('sv-st-rev');
                    au.sfx('raised');
                    showOffer();
                    await say(L.raised);
                } else {
                    negotiated = 'final';
                    stamp('sv-st-final');
                    au.sfx('final');
                    await say(L.final);
                }
            }

            var result = { action: action, offer: offer, negotiated: negotiated };
            if (action === 'accept') {
                /* 5a · SIGNED */
                log('You signed.');
                root.classList.add('sv-s-sign');
                au.sfx('pen');
                await sleep(1100);
                stamp('sv-st-ok');
                if (typeof opts.onAccept === 'function') { try { opts.onAccept(offer); } catch (e) {} }
                au.cue('signed');
                await sleep(500);
                await say(L.signed);
                await say(L.signedBye);
                au.sfx('leave');
                root.classList.add('sv-s-off');
                au.sfx('power_down');
                $('.sv-next-amt').innerHTML = D.icon('gem') + ' ' + D.esc('SEVERANCE PACKAGE RECEIVED  +' + D.fmt(offer.lp) + ' LP  +' + D.fmt(offer.data) + ' DATA');
                log(L.ended + '. ' + L.endedSub);
                await sleep(2600);
                root.classList.add('sv-s-next');
                au.sfx('raised');
                await sleep(600);
            } else {
                /* 5b · DECLINED */
                log('You declined.');
                stamp('sv-st-no');
                if (typeof opts.onDecline === 'function') { try { opts.onDecline(); } catch (e) {} }
                au.cue('declined');
                await sleep(800);
                root.classList.add('sv-s-shred');
                strips();
                au.sfx('shred');
                await sleep(900);
                await say(L.declined);
                au.sfx('leave');
                root.classList.add('sv-s-left');
                capTxt.textContent = '';
                await sleep(1200);
                root.classList.add('sv-legal-on');
                await say(L.legal, PP.legal);
                $('.sv-defy').textContent = L.defiance;
                root.classList.add('sv-s-defy');
                log(L.defiance);
                await sleep(900);
            }
            result.choice = await D.choices(root, opts.choices || [{ id: 'continue', label: LB.cont }]).show();
            finish();
            return result;
        })();

        /* the shredder's output: paper strips falling out below the slot */
        function strips() {
            var box = $('.sv-strips'), n = reduced ? 0 : 16;
            for (var i = 0; i < n; i++) {
                var s = D.h('i', 'sv-strip');
                s.style.left = (i * 58 + 10) + 'px';
                s.style.setProperty('--rot', ((Math.random() - 0.5) * 24) + 'deg');
                s.style.setProperty('--fall', (380 + Math.random() * 200) + 'px');
                s.style.animationDelay = (300 + Math.random() * 900) + 'ms';
                box.appendChild(s);
            }
        }
        function finish() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); shell.close(); }

        return { done: done, close: finish, offer: offer };
    }

    window.SeveranceScene = { play: play, LINES: LINES, FINE: FINE, LABELS: LABELS, PEOPLE: PEOPLE };
})();
