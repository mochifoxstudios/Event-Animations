/* ═══════════════════════════════════════════════════════════════════════════
   tribunal_scene.js — THE DUCK TRIBUNAL, staged.

   The Tribunal judges BEHAVIOUR. It used to charge you by play style and then
   roll an unrelated verdict, so the charge was decoration. ⭐ THE SENTENCE NOW
   FOLLOWS THE CHARGE, and each one is ironic in the court's own logic:

     FRANTIC CLICKER   → SENTENCED TO REST      passive ×5 for 60 s   (DUCK verdict)
     IDLE OBSERVER     → SENTENCED TO OVERTIME  income ×2 for 5 min   (POWER)
     OBSESSIVE BUYER   → GUILTY                 the buy-quantity selector is confiscated
     VOID RESEARCHER   → NOTES SEIZED           +8 fragments, +2 LP   (WISDOM)
     SPORE NEGLECTOR   → TAKEN INTO CARE        a city sector quarantined 90 s
     AVERAGE OPERATOR  → the court flips a coin: the old instability-weighted roll

   The verdict indices and effects are the game's own (DuckTribunal.VERDICTS:
   POWER 0 · QUARANTINE 1 · WISDOM 2 · DUCK 3 · GUILTY 4). This module only
   decides which one and stages it; the game applies it.

   Beats:
     1 ALL RISE   lights up on an empty bench — except the fifth stall. THE SILENT
                  ONE is already seated. It was always there.
     2 CONVENE    four judges rise into their stalls.
     3 CHARGE     the docket slides into view; the charge is stamped; Exhibit A
                  is the player's own number.
     4 HEARING    the register's dialogue (sentencers / bureaucrats /
                  philosophers) in speech bubbles; the bench turns to the
                  speaker. The silent one never turns.
     5 CONFER     the bench leans in to the centre. Five dots.
     6 SENTENCE   whoever spoke last rules. The rest dim; the gavel; the
                  sentence is stamped onto the same docket as the charge.
     7 ACCEPT or BANISH TO OMEGA — the player's one choice, as before.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;

    var SILENT = 4;
    var SEAT_ORDER = [2, 1, 3, 0];                 // speakers are seated centre-out

    var VERDICT_NAMES = ['POWER', 'QUARANTINE', 'WISDOM', 'DUCK', 'GUILTY'];

    /* What each verdict means, said as a sentence. `fx` is the game's effect. */
    var SENTENCES = [
        { stamp: 'OVERTIME',  title: 'SENTENCED TO OVERTIME', fx: 'Income ×2 for 5 minutes' },
        { stamp: 'IN CARE',   title: 'TAKEN INTO CARE',       fx: 'Your busiest city sector is sealed for 90 seconds' },
        { stamp: 'SEIZED',    title: 'NOTES SEIZED',          fx: '+8 Fragments · +2 LP' },
        { stamp: 'REST',      title: 'SENTENCED TO REST',     fx: 'Passive income ×5 for 60 seconds' },
        { stamp: 'GUILTY',    title: 'GUILTY',                fx: 'One instrument is confiscated' }
    ];

    /* The charges, in the game's check order (first match wins). */
    var CHARGES = [
        {
            key: 'frantic', label: 'FRANTIC CLICKER', verdict: 3,
            test: function (m) { return m.cpm > 200; },
            exhibit: function (m) { return 'Exhibit A: ' + Math.round(m.cpm) + ' clicks a minute, sustained.'; },
            ruling: 'You have clicked enough for several lifetimes. The court sentences you to rest. Your machines will work instead.'
        },
        {
            key: 'idle', label: 'IDLE OBSERVER', verdict: 0,
            test: function (m) { return m.cpm < 30; },
            exhibit: function (m) { return 'Exhibit A: ' + Math.round(m.cpm) + ' clicks a minute. The button was lonely.'; },
            ruling: 'You watched. The court sentences you to overtime. Your machines will run double while you keep watching.'
        },
        {
            key: 'buyer', label: 'OBSESSIVE BUYER', verdict: 4, confiscate: 'buy-qty-wrap',
            test: function (m) { return m.bought > 50; },
            exhibit: function (m) { return 'Exhibit A: ' + D.fmt(m.bought) + ' purchases. Several of them twice.'; },
            ruling: 'You bought everything. The court takes one thing back: your purchasing privileges.'
        },
        {
            key: 'void', label: 'VOID RESEARCHER', verdict: 2,
            test: function (m) { return m.voidBranches > 0; },
            exhibit: function (m) { return 'Exhibit A: ' + m.voidBranches + ' void branch' + (m.voidBranches === 1 ? '' : 'es') + ' opened without a permit.'; },
            ruling: 'Your research is seized, annotated, and returned. The court found it interesting. Do not tell anyone.'
        },
        {
            key: 'spore', label: 'SPORE NEGLECTOR', verdict: 1,
            test: function (m) { return m.sporeHappy != null && m.sporeHappy < 20; },
            exhibit: function (m) { return 'Exhibit A: a spore at ' + Math.round(m.sporeHappy) + '% happiness. It cried.'; },
            ruling: 'Neglect of a dependant. The court takes a sector of your city into care until you learn.'
        },
        {
            key: 'average', label: 'AVERAGE OPERATOR', verdict: -1,
            test: function () { return true; },
            exhibit: function () { return 'Exhibit A: nothing. That is the charge.'; },
            ruling: 'The court could find nothing remarkable about you, so it flipped a coin.'
        }
    ];

    /* The owner's three registers, verbatim (DuckTribunal.TRIBUNAL_DIALOGUES). */
    var DIALOGUES = {
        sentencers: [
            '[CONSENSUS REACHED]',
            'JUDGE BILL: "The oscillation is too high. This Operator is bleeding reality into the void."',
            'INQUISITOR QUACK: "Look at the numbers. Disgusting. Pure Energy without form. It\'s... unrefined."',
            'JUDGE BILL: "Operator, your existence has become a statistical error. We have come to delete the remainder."',
            'THE SILENT ONE: (A single, high-pitched squeak echoes through the terminal)',
            'JUDGE BILL: "Agreed. Begin the seizure of assets. Leave them nothing but the bill."'
        ],
        bureaucrats: [
            '[INCOMING TRANSMISSION: SECTOR 7 AUDIT]',
            'OFFICER WADDLE: "Subject ID: Operator. Current Energy Output: Excessive."',
            'CLERK FEATHER: "The paperwork for this timeline was never filed. Technically, this universe doesn\'t exist."',
            'OFFICER WADDLE: "Should we issue a warning?"',
            'CLERK FEATHER: "No. Just increase the tax. If they can\'t pay in Energy, we take it in Sanity."',
            'OFFICER WADDLE: "Noted. Initiating \'The Squeeze\'. Try to keep the splashing to a minimum."'
        ],
        philosophers: [
            '[A YELLOW GLOW PERMEATES THE SCREEN]',
            'THE ELDER DUCK: "Do you hear that, brothers? The sound of a finger hitting plastic."',
            'THE YOUNG DUCK: "It sounds like... a heartbeat. But faster. Panicked."',
            'THE ELDER DUCK: "They think they are building a city. They don\'t realise they are building a grave."',
            'THE YOUNG DUCK: "May we take a piece of it back to the Pond?"',
            'THE ELDER DUCK: "Take it all. The Pond is hungry. The Pond must be fed."'
        ]
    };

    /* ── JUDGEMENT — what the game used to compute inline, plus the sentence ── */
    function measure(state) {
        var s = state || {};
        var clicks = s.totalClicks || 0;
        var playMs = (s.stats && s.stats.totalPlaytimeMs) || 60000;
        var minutes = Math.max(1, playMs / 60000);
        var happy = null;
        try { if (window.BlissfulSpore && BlissfulSpore._getHappiness) happy = BlissfulSpore._getHappiness(); } catch (e) {}
        if (s._sporeHappiness != null) happy = s._sporeHappiness;      // demo / QA
        return {
            cpm: clicks / minutes,
            bought: (s.stats && s.stats.itemsBought) || 0,
            voidBranches: Object.keys(s.voidBranch || {}).length,
            sporeHappy: happy,
            instability: s.instability || 0,
            epsToCps: (s.eps || 0) / Math.max(1, clicks / Math.max(1, playMs / 1000))
        };
    }

    function rollByInstability(instab, rnd) {
        var w = instab > 70 ? [8, 32, 5, 10, 45] : instab > 40 ? [20, 25, 15, 20, 20] : [35, 8, 30, 27, 0];
        var total = w.reduce(function (a, b) { return a + b; }, 0);
        var r = (rnd || Math.random)() * total;
        for (var i = 0; i < w.length - 1; i++) { r -= w[i]; if (r <= 0) return i; }
        return w.length - 1;
    }

    /* judge(state) → { charge, exhibit, register, verdict (index), ruling, confiscate } */
    function judge(state, opts) {
        opts = opts || {};
        var m = measure(state);
        var charge = opts.charge
            ? CHARGES.filter(function (c) { return c.key === opts.charge; })[0]
            : CHARGES.filter(function (c) { return c.test(m); })[0];
        var register = opts.register
            || (m.instability > 70 ? 'sentencers' : m.epsToCps > 200 ? 'bureaucrats' : 'philosophers');
        var verdict = charge.verdict >= 0 ? charge.verdict : rollByInstability(m.instability, opts.random);
        return {
            charge: charge.label,
            chargeKey: charge.key,
            exhibit: charge.exhibit(m),
            register: register,
            verdict: verdict,
            verdictName: VERDICT_NAMES[verdict],
            ruling: charge.ruling,
            confiscate: charge.confiscate || null
        };
    }

    function parse(line) {
        var m = /^([A-Z][A-Z0-9 .'-]+):\s*(.*)$/.exec(line);
        if (!m) return { kind: 'caption', text: line };
        var body = m[2].trim();
        if (/^\(.*\)$/.test(body)) return { kind: 'action', who: m[1], text: body.slice(1, -1) };
        return { kind: 'speech', who: m[1], text: body.replace(/^"|"$/g, '') };
    }

    function seatFor(name, seats) {
        if (/SILENT/.test(name)) return SILENT;
        if (seats[name] === undefined) {
            var used = Object.keys(seats).map(function (k) { return seats[k]; });
            var free = SEAT_ORDER.filter(function (i) { return used.indexOf(i) < 0; });
            seats[name] = free.length ? free[0] : 2;
        }
        return seats[name];
    }

    /* ── THE SCENE ───────────────────────────────────────────────────────────
       play(host, opts) → { done: Promise<{ action: 'accept'|'banish', verdict }>, close() }
       opts.judgement   from judge(); computed from opts.state / window.state if absent
       opts.caseNo      shown on the docket (default: the run number, or 0015)
       opts.audio       false to silence the scene (music and effects come from TribunalScore)
       opts.sound       (name, ...) => void, told about every effect (optional game hook) */
    function play(host, opts) {
        opts = opts || {};
        var j = opts.judgement || judge(opts.state || window.state);
        var sentence = SENTENCES[j.verdict];
        var au = D.audio(opts, window.TribunalScore);
        var sound = au.sfx;
        var dir = D.director();
        var shell = D.shell(host, 'dks-tribunal', dir, au);
        var root = shell.root;
        root.setAttribute('aria-label', 'Duck Tribunal');
        root.dataset.register = j.register;
        var lines = DIALOGUES[j.register] || DIALOGUES.philosophers;

        root.appendChild(D.h('div', 'dks-eyebrow', '// TRIBUNAL CONVENED'));
        root.appendChild(D.h('div', 'dks-title', 'DUCK TRIBUNAL'));
        root.appendChild(D.h('div', 'dks-sub', 'THE BENCH WILL REVIEW YOUR CONDUCT'));

        var stage = D.h('div', 'dks-stage');
        var backdrop = D.h('div', 'dks-backdrop', window.TribunalArt ? TribunalArt.backdrop() : '');
        var bench = D.bench('tribunal');
        var caption = D.h('div', 'dks-caption');
        var flash = D.h('div', 'dks-flash');
        stage.appendChild(backdrop);
        stage.appendChild(bench.row);
        stage.appendChild(caption);
        root.appendChild(stage);
        root.appendChild(flash);
        var seats = bench.seats;
        seats[SILENT].el.classList.add('dks-silent');

        /* the dock (empty — the Operator is not required to attend) and the docket */
        var lower = D.h('div', 'dks-lower');
        var dock = D.h('div', 'dks-dock',
            (window.TribunalArt ? TribunalArt.dock() : '')
          + '<div class="dks-dock-label">// DOCK · THE OPERATOR IS NOT REQUIRED TO ATTEND</div>');
        var caseNo = opts.caseNo || ('0015-' + String((((window.state || {}).prestige || {}).count || 0) + 1).padStart(3, '0'));
        var docket = D.h('div', 'dks-docket',
            '<div class="dks-docket-h"><span>CASE № ' + D.esc(caseNo) + '</span><span>DEFENDANT: OPERATOR 15</span></div>'
          + '<div><span class="k">CHARGE</span></div>'
          + '<span class="dks-stampslot dks-charge-slot"></span>'
          + '<div class="ev"></div>'
          + '<div class="dks-sentence"><span class="k">SENTENCE</span>'
          +   '<span class="dks-stampslot dks-sentence-slot"></span>'
          +   '<div class="fx">' + D.esc(sentence.fx) + '</div></div>');
        lower.appendChild(dock);
        lower.appendChild(docket);
        root.appendChild(lower);

        var actions = D.h('div', 'dks-actions');
        var accept = D.h('button', 'dks-btn', 'ACCEPT SENTENCE');
        var banish = D.h('button', 'dks-btn dks-alt', 'BANISH TO OMEGA');
        accept.type = banish.type = 'button';
        banish.title = 'No energy cost · shifts the burden to your Omega grid';
        accept.hidden = banish.hidden = true;
        actions.appendChild(accept);
        actions.appendChild(banish);
        root.appendChild(actions);

        var log = shell.log;
        var still = [SILENT];

        var done = (async function () {
            /* 1 · ALL RISE — three knocks, and the silent one is already there */
            root.classList.add('dks-on-in');
            au.cue('allrise');
            await dir.type(caption, 'ALL RISE', 40);
            for (var k = 0; k < 3; k++) { sound('knock'); D.replay(stage, 'dks-shake'); await dir.wait(320); }
            await dir.wait(300);

            /* 2 · CONVENE */
            root.classList.remove('dks-pre');
            root.classList.add('dks-convene');
            [[2, 0], [1, 90], [3, 180], [0, 270]].forEach(function (a) {
                setTimeout(function () { if (!dir.isFast()) sound('rise', a[0]); }, a[1]);
            });
            caption.textContent = '';
            await dir.wait(1000);

            /* 3 · CHARGE */
            docket.classList.add('dks-on');
            sound('docket');
            await dir.wait(450);
            var chargeStamp = D.h('span', 'dks-stamp', D.esc(j.charge));
            docket.querySelector('.dks-charge-slot').appendChild(chargeStamp);
            sound('stamp', 'charge');
            log('Charge: ' + j.charge + '. ' + j.exhibit);
            await dir.wait(350);
            await dir.type(docket.querySelector('.ev'), j.exhibit, 16);
            await dir.wait(700);

            /* 4 · HEARING */
            au.cue('hearing_' + j.register);
            var seated = {};
            var lastSpeaker = 2, lastName = 'THE BENCH';
            for (var i = 0; i < lines.length; i++) {
                var p = parse(lines[i]);
                if (p.kind === 'caption') {
                    D.hush(seats);
                    log(p.text);
                    await dir.type(caption, p.text, 14);
                    await dir.wait(450);
                    continue;
                }
                var seat = seatFor(p.who, seated);
                if (seat !== SILENT) { lastSpeaker = seat; lastName = p.who; }
                if (seat === SILENT) sound('squeak');
                await D.say(dir, seats, seat, p.who, p.text, p.kind, { log: log, still: still, voice: au.voice });
            }
            D.hush(seats);
            D.look(seats, null);

            /* 5 · CONFER */
            caption.innerHTML = 'THE BENCH CONFERS<span class="dks-confer-dots"><i></i><i></i><i></i><i></i><i></i></span>';
            root.classList.add('dks-confer');
            au.cue('confer');
            seats[0].el.classList.remove('dks-look-left');
            seats[1].el.classList.remove('dks-look-left');
            seats[3].el.classList.add('dks-look-left');
            var dots = caption.querySelectorAll('.dks-confer-dots i');
            var murmurs = [[1, 'mm.'], [3, '…'], [0, 'hm'], [2, 'quite.'], [1, '…']];
            for (var d = 0; d < dots.length; d++) {
                dots[d].classList.add('dks-on');
                var mm = murmurs[d];
                D.hush(seats);
                seats[mm[0]].who.textContent = '';
                seats[mm[0]].text.textContent = mm[1];
                seats[mm[0]].bubble.classList.add('dks-murmur');
                D.replay(seats[mm[0]].bubble, 'dks-on');
                sound('murmur', mm[0]);
                await dir.wait(800);
            }
            D.hush(seats);
            root.classList.remove('dks-confer');
            D.look(seats, null);
            caption.textContent = '';

            /* 6 · SENTENCE — whoever spoke last rules; never the silent one */
            var ruler = lastSpeaker === SILENT ? 2 : lastSpeaker;
            root.classList.add('dks-rule');
            seats[ruler].el.classList.add('dks-ruling');
            var gavel = D.gavel(seats[ruler]);
            au.cue(null);
            await dir.wait(450);
            D.replay(gavel, 'dks-strike');
            await dir.wait(160);
            sound('gavel');
            sound('sentence', j.verdict);
            D.replay(stage, 'dks-shake');
            D.replay(flash, 'dks-on');
            setTimeout(function () { au.cue('after'); }, 2200);
            await D.say(dir, seats, ruler, lastSpeaker === ruler ? lastName : 'THE BENCH', j.ruling, 'speech', { log: log, still: [0, 1, 2, 3, 4], noLook: true, hold: 300, voice: au.voice });
            docket.querySelector('.dks-sentence').classList.add('dks-on');
            var sStamp = D.h('span', 'dks-stamp sentence', D.esc(sentence.title));
            docket.querySelector('.dks-sentence-slot').appendChild(sStamp);
            sound('stamp', 'sentence');
            log('Sentence: ' + sentence.title + ' — ' + sentence.fx);
            await dir.wait(700);

            /* 7 · THE PLAYER'S ONE CHOICE */
            shell.done();
            accept.hidden = banish.hidden = false;
            try { accept.focus({ preventScroll: true }); } catch (e) {}
            return new Promise(function (resolve) {
                accept.addEventListener('click', function () { shell.close(); resolve({ action: 'accept', verdict: j.verdict, judgement: j }); });
                banish.addEventListener('click', function () { shell.close(); resolve({ action: 'banish', verdict: j.verdict, judgement: j }); });
            });
        })();

        return { done: done, close: shell.close };
    }

    window.TribunalScene = {
        play: play,
        judge: judge,
        measure: measure,
        CHARGES: CHARGES.map(function (c) { return { key: c.key, label: c.label, verdict: c.verdict }; }),
        REGISTERS: Object.keys(DIALOGUES),
        SENTENCES: SENTENCES,
        DIALOGUES: DIALOGUES
    };
})();
