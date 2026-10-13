/* ═══════════════════════════════════════════════════════════════════════════
   council_scene.js — THE DUCKY COUNCIL, staged.

   The Council GRADES you. The old panel argued in a text log, then printed a
   ruling, and the player never saw what was graded. The scene has six beats now,
   and the grading is on screen:

     1 CONVENE   lights up; the members come in, each in character — four waddle,
                 Rubber III glides (a toy has no legs), the Abstainer is simply
                 there, and the Chairman arrives last.
     2 LEDGER    Dr. Mallard reads the metrics into the record: five rows, points
                 lighting one by one. The TOTAL stays hidden until the ruling.
     3 DEBATE    the tier's deliberation lines, in speech bubbles over whoever
                 says them; the rest of the bench turns to look.
     4 VOTE      placards go up one at a time. Rubber III holds his upside down.
                 The Abstainer raises nothing — unless the tier says he votes,
                 and then the whole bench turns to watch him do it.
     5 RULING    the Chairman's gavel; the score runs up the grade track; the
                 medal drops. Platinum's sigil rotates over the chamber, as the
                 verdict text has always claimed; Quacked dims the room and
                 drops a feather.
     6 ACCEPT    the player closes it. Effects are applied at the gavel
                 (opts.onRuling), exactly when the old code applied them.

   Scoring is unchanged from DuckyCouncil._evaluate; it now also returns the
   breakdown the ledger shows. Dialogue is the owner's, untouched.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;

    var NAMES = ['CHAIRMAN QUACK', 'DR. MALLARD', 'RUBBER III', 'SENATOR DUCK', 'THE ABSTAINER'];
    var CHAIR = 0, MALLARD = 1, RUBBER = 2, ABSTAINER = 4;

    var ORDER = ['quacked', 'tarnished', 'bronze', 'silver', 'gold', 'platinum'];
    /* score bands, low → high. Scores run −3…11 (see evaluate) */
    var BANDS = [
        { grade: 'quacked',   from: -3, to: -1, tag: 'Q' },
        { grade: 'tarnished', from: 0,  to: 1,  tag: 'T' },
        { grade: 'bronze',    from: 2,  to: 3,  tag: 'B' },
        { grade: 'silver',    from: 4,  to: 5,  tag: 'S' },
        { grade: 'gold',      from: 6,  to: 7,  tag: 'G' },
        { grade: 'platinum',  from: 8,  to: 11, tag: 'P' }
    ];
    var MIN = -3, MAX = 11;

    var VOTES = {
        platinum:  ['APPROVE', 'APPROVE', 'APPROVE', 'APPROVE', 'APPROVE'],
        gold:      ['APPROVE', 'APPROVE', 'REJECT',  'APPROVE', 'ABSTAIN'],
        silver:    ['APPROVE', 'APPROVE', 'REJECT',  'ABSTAIN', 'ABSTAIN'],
        bronze:    ['ABSTAIN', 'APPROVE', 'APPROVE', 'ABSTAIN', 'ABSTAIN'],
        tarnished: ['REJECT',  'ABSTAIN', 'APPROVE', 'REJECT',  'ABSTAIN'],
        quacked:   ['REJECT',  'REJECT',  'APPROVE', 'REJECT',  'REJECT']
    };

    /* The owner's text, verbatim from DuckyCouncil.VERDICTS. */
    var VERDICTS = {
        platinum: {
            label: '⬡ PLATINUM CONSENSUS', glyph: '⬡', color: '#cceeff',
            rewardDesc: '+800% EPS for 5 minutes · +3 Fragments',
            deliberation: [
                '> [DELIBERATION CHAMBER — SEALED]',
                'Chairman Quack: "We have reviewed the operator\'s extraction metrics."',
                'Dr. Mallard: "Statistically impossible. The numbers form a perfect curve."',
                'Senator Duck: "I propose we name them an honorary duck."',
                'Rubber III: "I propose we name them lunch."',
                'The Abstainer: " ... " (a long, considered silence)',
                'Chairman Quack: "The Abstainer has spoken. The vote is unanimous."'
            ],
            textLines: [
                'The Council has reached a verdict previously reserved for myth.',
                'A platinum sigil materialises above the chamber and slowly rotates.',
                'Even Rubber III is silent. This is not how Rubber III usually behaves.',
                'Chairman Quack inclines his head in something resembling respect.',
                'You feel — briefly, distantly — as if you have been catalogued.'
            ]
        },
        gold: {
            label: '⬢ UNANIMOUS APPROVAL', glyph: '⬢', color: '#ffdd33',
            rewardDesc: '+500% EPS for 3 minutes',
            deliberation: [
                '> [DELIBERATION CHAMBER]',
                'Dr. Mallard: "The extraction is competent. Possibly even elegant."',
                'Senator Duck: "Elegant is a strong word. Let\'s say... functional."',
                'Chairman Quack: "I move to grant the Golden Beak of Productivity."',
                'Rubber III: "I dissent. As is tradition."',
                'The Abstainer: (slowly raises one feather, then lowers it)'
            ],
            textLines: [
                'The Council recognises your extraction as inspired work.',
                'Chairman Quack awards you the Golden Beak of Productivity.',
                'Dr. Mallard takes a single photograph for the archives.',
                '(Rubber III dissented, as is tradition. Nobody is surprised.)'
            ]
        },
        silver: {
            label: '◇ ACCEPTABLE PERFORMANCE', glyph: '◇', color: '#aaaacc',
            rewardDesc: '+200% EPS for 2 minutes',
            deliberation: [
                '> [DELIBERATION CHAMBER]',
                'Senator Duck: "It is... fine. I suppose."',
                'Dr. Mallard: "Fine is a generous adjective."',
                'Chairman Quack: "I have seen worse. I have certainly seen better."',
                'Rubber III: "I vote for lunch."',
                'Dr. Mallard: "We have already addressed the lunch motion."'
            ],
            textLines: [
                'Your metrics are within acceptable parameters. Barely.',
                'Senator Duck remains visibly unimpressed.',
                'Dr. Mallard is cautiously nodding.',
                'Rubber III voted for lunch instead. The motion was denied.',
                'The Council moves on. They were not really paying attention.'
            ]
        },
        bronze: {
            label: '◐ MILDLY DISAPPOINTING', glyph: '◐', color: '#cc9440',
            rewardDesc: 'No bonus — Disappointment formally noted',
            deliberation: [
                '> [DELIBERATION CHAMBER]',
                'Chairman Quack: "We were expecting more."',
                'Dr. Mallard: "We are always expecting more. That is the problem."',
                'Senator Duck: "Perhaps the operator is busy. With... operator things."',
                'The Abstainer: (abstains in a notably aggressive manner)',
                'Rubber III: "Two thumbs up." (Rubber III does not have thumbs.)'
            ],
            textLines: [
                'The Council expected more. The Council always expects more.',
                'The Abstainer abstained. Again. With prejudice this time.',
                'Rubber III gave you a thumbs up.',
                'The Council is not sure what Rubber III is, or what Rubber III is doing.'
            ]
        },
        tarnished: {
            label: '◓ TARNISHED REVIEW', glyph: '◓', color: '#a87250',
            rewardDesc: '-5% EPS for 60 seconds · gentle warning issued',
            deliberation: [
                '> [DELIBERATION CHAMBER]',
                'Dr. Mallard: "There is a pattern here, and it is not a good one."',
                'Chairman Quack: "Are we counting the inactivity?"',
                'Senator Duck: "We are counting everything. We always are."',
                'Rubber III: "I require a snack."',
                'The Abstainer: (radiates disapproval)'
            ],
            textLines: [
                'A formal warning has been entered into the record.',
                'Dr. Mallard prints out your metrics and shakes his head.',
                'Chairman Quack files them under "Concerning But Salvageable".',
                'The Council adjourns early. Some of them are visibly hungry.'
            ]
        },
        quacked: {
            label: '⨯ THE COUNCIL IS DISAPPOINTED', glyph: '⨯', color: '#ff5533',
            rewardDesc: '-15% EPS for 90 seconds · ASSET CONFISCATION POSSIBLE',
            deliberation: [
                '> [DELIBERATION CHAMBER — ESCALATED]',
                'Chairman Quack: "This. This is what we feared."',
                'Dr. Mallard: "The metrics are not metrics. They are an apology."',
                'Senator Duck: "I motion for sanctions."',
                'Rubber III: "I motion for sanctions and a sandwich."',
                'Chairman Quack: "The chair acknowledges Rubber III\'s sandwich."',
                'The Abstainer: (does not abstain — a first)'
            ],
            textLines: [
                'This is, frankly, embarrassing.',
                'Even Rubber III, who voted for a sandwich, outperformed you.',
                'The Council recommends clicking more. Possibly less. It is unclear.',
                'You are advised to leave the chamber before something is taken.'
            ]
        }
    };

    /* ── SCORING — DuckyCouncil._evaluate, with its working shown ──────────── */
    function evaluate(state) {
        var s = state || {};
        var clicks = s.totalClicks || 0;
        var p = (s.prestige && s.prestige.count) || 0;
        var e = s.energy || 0;
        var city = ((s.city && s.city.slots) || []).filter(Boolean).length;
        var ins = s.instability || 0;
        var rows = [
            { key: 'clicks',   label: 'CLICKS',      value: D.fmt(clicks),          pts: (clicks > 5000) + (clicks > 50000) + (clicks > 250000), max: 3, neg: 0 },
            { key: 'prestige', label: 'PRESTIGES',   value: String(p),              pts: (p >= 1) + (p >= 5) + (p >= 10),                        max: 3, neg: 0 },
            { key: 'energy',   label: 'ENERGY',      value: D.fmt(e),               pts: (e > 1e12) + (e > 1e24),                                max: 2, neg: 0 },
            { key: 'city',     label: 'CITY',        value: city + ' buildings',    pts: (city >= 4) + (city >= 16),                             max: 2, neg: 0 },
            { key: 'instab',   label: 'INSTABILITY', value: Math.round(ins) + '%',  pts: ins < 15 ? 1 : ins > 85 ? -3 : ins > 65 ? -1 : 0,       max: 1, neg: 3 }
        ];
        var score = rows.reduce(function (a, r) { return a + r.pts; }, 0);
        return { score: score, grade: gradeFor(score), rows: rows };
    }

    function gradeFor(score) {
        if (score >= 8) return 'platinum';
        if (score >= 6) return 'gold';
        if (score >= 4) return 'silver';
        if (score >= 2) return 'bronze';
        if (score >= 0) return 'tarnished';
        return 'quacked';
    }

    /* "Chairman Quack: "text"" → seat 0; "> [..]" → caption; "(..)" parts → action */
    function parse(line) {
        if (/^\s*[>\[]/.test(line)) return { kind: 'caption', text: line.replace(/^>\s*/, '') };
        var m = /^([A-Za-z][A-Za-z .'0-9]*?):\s*(.*)$/.exec(line);
        if (!m) return { kind: 'caption', text: line };
        var who = m[1].toUpperCase();
        var idx = NAMES.indexOf(who);
        var body = m[2].trim();
        var quoted = /^"(.*?)"\s*(\(.*\))?$/.exec(body);
        if (quoted) return { kind: 'speech', seat: idx, who: who, text: quoted[1].trim() || '…', aside: quoted[2] || '' };
        return { kind: 'action', seat: idx, who: who, text: body.replace(/^\(|\)$/g, '') };
    }

    /* ── ART ──────────────────────────────────────────────────────────────── */
    function medalSVG(glyph) {
        return '<svg viewBox="0 0 80 80" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
            + '<polyline points="26,4 40,34 54,4" class="pf" style="fill-opacity:.18"/>'
            + '<circle cx="40" cy="48" r="26" class="pf" style="fill-opacity:.14"/>'
            + '<circle cx="40" cy="48" r="20"/>'
            + '<text x="40" y="56" text-anchor="middle" font-size="22" fill="currentColor" stroke="none" font-family="Courier New, monospace" font-weight="900">' + glyph + '</text>'
            + '</svg>';
    }
    var SIGIL =
        '<svg viewBox="0 0 100 100" fill="none" stroke-width="1.6" aria-hidden="true">'
      + '<polygon points="50,4 90,27 90,73 50,96 10,73 10,27"/>'
      + '<polygon points="50,18 78,34 78,66 50,82 22,66 22,34" class="pf" style="fill-opacity:.12"/>'
      + '<polygon points="50,4 78,66 22,66"/><polygon points="50,96 22,34 78,34"/>'
      + '</svg>';
    var FEATHER =
        '<svg viewBox="0 0 20 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">'
      + '<path d="M10,38 C10,26 10,14 10,2"/><path d="M10,4 C2,10 2,22 10,30 C18,22 18,10 10,4 Z" class="pf" style="fill-opacity:.25"/>'
      + '<path d="M10,12 L5,9 M10,18 L4,15 M10,12 L15,9 M10,18 L16,15 M10,24 L6,22 M10,24 L14,22"/></svg>';

    /* ── THE SCENE ───────────────────────────────────────────────────────────
       play(host, opts) → { done: Promise<'accept'>, close() }
       opts.state       game state (used when evaluation is not given)
       opts.evaluation  { grade, score, rows } — from evaluate()
       opts.grade       force a grade (demo / QA); rows are kept, score is shown as-is
       opts.onRuling    (grade) => void, called at the gavel — apply the reward here
       opts.verdicts    per-grade overrides of any VERDICTS field (new lines, labels, rewards)
       opts.votes       per-grade vote lists, e.g. { gold: ['APPROVE', ...5] }
       opts.opening     the Chairman's first line
       opts.choices     decision buttons [{ id, label, title?, alt? }]; done resolves with the id
       opts.audio       false to silence the scene (music and effects come from CouncilScore)
       opts.sound       (name, ...) => void, told about every effect (optional game hook)
       opts.onMemberClick (i) => void — e.g. RubberIII.onDuckCardClick */
    function play(host, opts) {
        opts = opts || {};
        var ev = opts.evaluation || evaluate(opts.state || window.state);
        var grade = opts.grade || ev.grade;
        var score = opts.grade ? clampToBand(ev.score, grade) : ev.score;
        /* any text can be replaced per grade: opts.verdicts.gold = { deliberation: [...], textLines: [...] } */
        var v = Object.assign({}, VERDICTS[grade], (opts.verdicts || {})[grade]);
        var votes = (opts.votes || {})[grade] || VOTES[grade];
        var au = D.audio(opts, window.CouncilScore);
        var sound = au.sfx;
        var dir = D.director();
        var shell = D.shell(host, 'dks-council', dir, au);
        var root = shell.root;
        root.setAttribute('aria-label', 'The Ducky Council — emergency session');
        root.dataset.grade = grade;

        /* header */
        root.appendChild(D.h('div', 'dks-eyebrow', 'EMERGENCY SESSION — CLASSIFIED'));
        root.appendChild(D.h('div', 'dks-title', 'THE DUCKY COUNCIL'));
        root.appendChild(D.h('div', 'dks-sub', 'CONVENED TO EVALUATE YOUR PERFORMANCE'));

        /* stage */
        var stage = D.h('div', 'dks-stage');
        var backdrop = D.h('div', 'dks-backdrop', window.CouncilArt ? CouncilArt.chamber() : '');
        var sigil = D.h('div', 'dks-sigil', SIGIL);
        var feather = D.h('div', 'dks-feather', FEATHER);
        var bench = D.bench('council');
        var caption = D.h('div', 'dks-caption');
        stage.appendChild(backdrop);
        stage.appendChild(sigil);
        stage.appendChild(feather);
        stage.appendChild(bench.row);
        stage.appendChild(caption);
        root.appendChild(stage);
        var seats = bench.seats;

        /* ledger + verdict */
        var lower = D.h('div', 'dks-lower');
        var ledger = D.h('div', 'dks-panel dks-ledger');
        ledger.appendChild(D.h('div', 'dks-panel-h', 'THE RECORD — READ BY DR. MALLARD'));
        var rowEls = ev.rows.map(function (r) {
            var pips = '';
            for (var k = 0; k < r.max; k++) pips += '<i class="dks-pip"></i>';
            for (var n = 0; n < r.neg; n++) pips += '<i class="dks-pip neg"></i>';
            var el = D.h('div', 'dks-ledger-row',
                '<span>' + r.label + '</span><span class="lv">' + D.esc(r.value) + '</span><span class="dks-pips">' + pips + '</span>');
            ledger.appendChild(el);
            return el;
        });
        var track = D.h('div', 'dks-track');
        var bands = D.h('div', 'dks-bands');
        BANDS.forEach(function (b) {
            var w = (b.to - b.from + 1) / (MAX - MIN + 1) * 100;
            var band = D.h('div', 'dks-band', b.tag);
            band.style.width = w + '%';
            band.style.background = VERDICTS[b.grade].color;
            band.dataset.grade = b.grade;
            bands.appendChild(band);
        });
        var rail = D.h('div', 'dks-rail');
        track.appendChild(bands);
        track.appendChild(rail);
        var scoreEl = D.h('div', 'dks-score', 'SCORE —');
        track.appendChild(scoreEl);
        ledger.appendChild(track);

        var verdict = D.h('div', 'dks-panel dks-verdict');
        verdict.style.setProperty('--grade', v.color);
        verdict.innerHTML = '<div class="dks-medal">' + medalSVG(v.glyph) + '</div>'
            + '<div class="dks-grade-label">' + D.esc(v.label) + '</div>'
            + '<div class="dks-reward">' + D.esc(v.rewardDesc) + '</div>'
            + '<div class="dks-lines">' + v.textLines.map(function (l) { return '<div>' + D.esc(l) + '</div>'; }).join('') + '</div>';
        lower.appendChild(ledger);
        lower.appendChild(verdict);
        root.appendChild(lower);

        /* decisions — data, like everything else: opts.choices = [{ id, label, title?, alt? }] */
        var choices = D.choices(root, opts.choices || [{ id: 'accept', label: 'ACCEPT JUDGEMENT' }]);

        /* the old cards were clickable (RubberIII.onDuckCardClick) — keep that door open */
        if (typeof opts.onMemberClick === 'function') {
            seats.forEach(function (s) {
                s.el.style.cursor = 'pointer';
                s.el.addEventListener('click', function (e) { e.stopPropagation(); try { opts.onMemberClick(s.i); } catch (x) {} });
            });
        }

        var gavel = D.gavel(seats[CHAIR]);
        var log = shell.log;

        var done = (async function () {
            /* 1 · CONVENE */
            root.classList.add('dks-on-in');
            au.cue('convene');
            await dir.wait(500);
            root.classList.remove('dks-pre');
            root.classList.add('dks-convene');
            /* each arrival sounds when it lands — the same delays as the CSS */
            [[1, 120], [3, 220], [2, 300], [4, 500], [0, 680]].forEach(function (a) {
                setTimeout(function () { if (!dir.isFast()) sound('enter', a[0]); }, a[1] + 250);
            });
            await dir.wait(1500);
            strike();
            await D.say(dir, seats, CHAIR, NAMES[CHAIR], opts.opening || 'Order. The Council is in session.', 'speech', { log: log, hold: 500, voice: au.voice });

            /* 2 · LEDGER */
            ledger.classList.add('dks-on');
            au.cue('ledger');
            sound('panel');
            seats[MALLARD].el.classList.add('dks-talking');
            D.look(seats, MALLARD, [ABSTAINER]);
            for (var r = 0; r < ev.rows.length; r++) {
                rowEls[r].classList.add('dks-on');
                await dir.wait(170);
                var row = ev.rows[r];
                var pips = rowEls[r].querySelectorAll('.dks-pip');
                if (row.pts > 0) for (var k = 0; k < row.pts; k++) { pips[k].classList.add('lit'); sound('tick', r * 2 + k); au.voice(MALLARD); await dir.wait(120); }
                if (row.pts < 0) for (var n = 0; n < -row.pts; n++) { pips[row.max + n].classList.add('lit'); sound('tick_neg'); await dir.wait(120); }
                log(row.label + ': ' + row.value + ' (' + (row.pts >= 0 ? '+' : '') + row.pts + ')');
                await dir.wait(220);
            }
            seats[MALLARD].el.classList.remove('dks-talking');
            await dir.wait(400);

            /* 3 · DEBATE */
            au.cue('debate');
            for (var i = 0; i < v.deliberation.length; i++) {
                var p = parse(v.deliberation[i]);
                if (p.kind === 'caption' || p.seat < 0) {
                    D.hush(seats);
                    log(p.text);
                    await dir.type(caption, p.text, 14);
                    await dir.wait(500);
                    continue;
                }
                var still = p.seat === ABSTAINER ? [] : [ABSTAINER];
                await D.say(dir, seats, p.seat, p.who, p.text + (p.aside ? ' ' + p.aside : ''), p.kind, { log: log, still: still, cps: 16, voice: au.voice });
            }
            D.hush(seats);
            D.look(seats, null);

            /* 4 · VOTE */
            au.cue('vote');
            await dir.type(caption, 'THE COUNCIL WILL NOW VOTE', 14);
            await dir.wait(350);
            for (var j = 0; j < 5; j++) {
                var vote = votes[j];
                if (j === ABSTAINER && vote !== 'ABSTAIN') {
                    /* a first: the bench turns to watch him */
                    D.look(seats, ABSTAINER, [ABSTAINER]);
                    caption.textContent = 'THE ABSTAINER IS VOTING. THIS HAS NEVER HAPPENED.';
                    sound('abstainer_votes');
                    await dir.wait(900);
                }
                if (j === ABSTAINER && vote === 'ABSTAIN') {
                    /* he has never voted — the bench looks over out of habit, and he does not */
                    D.look(seats, ABSTAINER, [ABSTAINER]);
                    await dir.wait(600);
                    raise(j, vote);
                    caption.textContent = 'THE ABSTAINER ABSTAINS. HE ALWAYS HAS.';
                    log('The Abstainer abstains.');
                    await dir.wait(1300);
                    continue;
                }
                raise(j, vote);
                log(NAMES[j] + ' votes ' + vote);
                await dir.wait(480);
            }
            await dir.wait(500);
            D.look(seats, null);

            /* 5 · RULING */
            caption.textContent = '';
            au.cue(null);
            strike();
            if (typeof opts.onRuling === 'function') { try { opts.onRuling(grade); } catch (e) {} }
            track.classList.add('dks-on');
            rail.style.transform = 'translateX(' + railPct(score) + '%)';
            await countUp(scoreEl, score);
            bands.querySelectorAll('.dks-band').forEach(function (b) { b.classList.toggle('dks-hit', b.dataset.grade === grade); });
            verdict.classList.add('dks-on');
            root.classList.add('dks-grade-' + grade);
            sound('ruling_' + grade);
            sound('medal');
            if (grade === 'platinum') setTimeout(function () { sound('sigil'); }, 900);
            if (grade === 'quacked') setTimeout(function () { sound('feather'); }, 1600);
            setTimeout(function () { au.cue(ORDER.indexOf(grade) >= 3 ? 'after_good' : 'after_bad'); }, 2400);
            log('RULING: ' + v.label + ' — ' + v.rewardDesc);
            var lineEls = verdict.querySelectorAll('.dks-lines div');
            for (var l = 0; l < lineEls.length; l++) { lineEls[l].classList.add('dks-on'); await dir.wait(420); }

            /* 6 · ACCEPT */
            shell.done();
            var action = await choices.show();
            shell.close();
            return action;
        })();

        function strike() {
            D.replay(gavel, 'dks-strike');
            setTimeout(function () { sound('gavel'); D.replay(stage, 'dks-shake'); }, 160);
        }

        function raise(j, vote) {
            var cls = vote === 'APPROVE' ? 'approve' : vote === 'REJECT' ? 'reject' : 'abstain';
            seats[j].prop.innerHTML = '';
            if (j === ABSTAINER && vote === 'ABSTAIN') {
                /* the Abstainer abstains by raising nothing at all */
                seats[j].prop.appendChild(D.h('div', 'dks-placard never', 'ABSTAINS'));
                sound('abstains');
                return;
            }
            var card = D.h('div', 'dks-placard ' + cls + (j === RUBBER ? ' upside' : ''), vote);
            seats[j].prop.appendChild(card);
            sound('vote', vote, j);
        }

        function countUp(el, target) {
            if (dir.isFast()) { el.textContent = 'SCORE ' + target; return dir.wait(200); }
            var from = MIN, steps = Math.max(1, target - from), k = 0;
            return new Promise(function (resolve) {
                var iv = setInterval(function () {
                    k += 1;
                    var val = Math.round(from + (target - from) * (k / steps));
                    el.textContent = 'SCORE ' + val;
                    sound('score', k);
                    if (k >= steps || dir.isFast()) { clearInterval(iv); el.textContent = 'SCORE ' + target; resolve(); }
                }, 1100 / steps);
            }).then(function () { return dir.wait(250); });
        }

        return { done: done, close: shell.close };
    }

    function railPct(score) {
        var s = Math.max(MIN, Math.min(MAX, score));
        return (s - MIN + 0.5) / (MAX - MIN + 1) * 100;
    }
    function clampToBand(score, grade) {
        var b = BANDS.filter(function (x) { return x.grade === grade; })[0];
        return Math.max(b.from, Math.min(b.to, score));
    }

    /* ── GATHERING — the 30-second warning ──────────────────────────────────
       Five small silhouettes waddling toward the chamber. Mount it in the
       notification that already says "the ducks are gathering". */
    function gathering() {
        var el = D.h('div', 'dks-gather');
        var sil = window.DuckCast ? DuckCast.SILHOUETTE : '';
        var html = '';
        for (var i = 0; i < 5; i++) html += '<svg viewBox="0 0 112 112" fill="none" stroke-width="5" aria-hidden="true"><path d="' + sil + '" class="pf"/></svg>';
        el.innerHTML = html;
        return el;
    }

    window.CouncilScene = {
        play: play,
        evaluate: evaluate,
        gradeFor: gradeFor,
        gathering: gathering,
        VERDICTS: VERDICTS,
        VOTES: VOTES,
        GRADES: ORDER
    };
})();
