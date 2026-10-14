/* ═══════════════════════════════════════════════════════════════════════════
   null_scene.js — THE NULL INTERROGATION, staged.

   After the first prestige, NULL — "the space between the numbers", an Operator
   once — takes the console and asks one question.

     1 INTRUSION   static tears across the screen; a hum rises; the console is
                   no longer the player's.
     2 THE ECLIPSE a black disc opens in the centre with a burning ring. The
                   game's numbers begin to spiral into it.
     3 MONOLOGUE   one of four monologues, chosen by how the player plays
                   (architect · burnout · efficient · mirror), typed in NULL's
                   own voice; the ring pulses with every syllable. A line about
                   clicking brings NULL's cursor across the screen to click the
                   void itself.
     4 THE QUESTION "WHY DO YOU CONTINUE TO CLICK?" — the player types. The ring
                   flickers with each keystroke: it is listening.
     5 JUDGEMENT   the answer is pulled into the eclipse letter by letter, a
                   silence, then the verdict — the game's own rules:
                     emotional → WE UNDERSTAND.            (instability −50, ×1.5 passive)
                     generic   → DISAPPOINTING.            (+20% instability)
                     other     → UNEXPECTED RESPONSE. CATALOGUING.  (+5 fragments)
                     Escape    → SILENCE. DISAPPOINTING.   (+20% instability)
     6 COLLAPSE    the eclipse shrinks to a point and is gone.

   ALL WORDS ARE DATA: opts.dialogues (per variant), opts.variant,
   opts.question, opts.verdicts, opts.classify.
   Laid out on the shared 1920×1080 canvas.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var D = window.DuckScene;

    /* The game's monologues, verbatim (systems4.js NULL_DIALOGUES). */
    var DIALOGUES = {
        mirror: [
            'You clicked again.',
            'Why?',
            'Is it the number? Or is it the fear of what happens when the number stops?',
            'I was an Operator once. I had a billion. I had a trillion. Now, I am only the space between the numbers.',
            'Move aside. It\'s my turn to click.'
        ],
        architect: [
            'This city is quite beautiful. I especially like the way the Data Blight rots the corners.',
            'You think you\'re in control because you have the mouse.',
            'But who provided the mouse? Who provided the Energy?',
            'I am just reclaiming my materials. Don\'t mind the screaming; it\'s just the code settling.'
        ],
        efficient: [
            'Such restraint. You barely touch the button.',
            'And yet the meter rises. The generators feed you. The walkers think you are kind.',
            'But the Energy was never yours to be efficient with. It was always being spent — just not by you.',
            'Tell me. When you sleep, do the generators sleep too?'
        ],
        burnout: [
            'I have counted your clicks. Each one. There is no privacy in this terminal.',
            'Your finger has a memory now. A vocabulary of pressure.',
            'You think the button responds to you. The button has been responding for a long time. To someone.',
            'Do you know what happens to Operators who refuse to stop?',
            'Neither did the last one.'
        ]
    };

    /* The game's keyword lists, verbatim. Emotional is checked first, as in the game. */
    var GENERIC = ['win', 'winning', 'points', 'energy', 'score', 'numbers', 'high score', 'grind', 'resources', 'upgrade', 'beat', 'complete'];
    var EMOTIONAL = ['trapped', 'bored', 'habit', 'nothing', 'don\'t know', 'dont know', 'help', 'empty', 'alone', 'compulsion', 'addicted',
                     'can\'t stop', 'cant stop', 'lost', 'sad', 'hollow', 'scared', 'void', 'dark', 'why', 'idk', 'dunno', 'because', 'exist'];

    var VERDICTS = {
        understood: { text: 'WE UNDERSTAND.', effect: 'Instability −50% · passive generation ×1.5 for this run', color: '#7fe8b0' },
        generic:    { text: 'DISAPPOINTING.', effect: '+20% instability', color: '#ff4a3a' },
        catalogued: { text: 'UNEXPECTED RESPONSE. CATALOGUING.', effect: '+5 Fragments', color: '#ffc24a' },
        silence:    { text: 'SILENCE. DISAPPOINTING.', effect: '+20% instability', color: '#ff4a3a' }
    };

    function classify(answer) {
        var t = String(answer || '').toLowerCase().trim();
        if (!t) return 'silence';
        if (EMOTIONAL.some(function (k) { return t.indexOf(k) >= 0; })) return 'understood';
        if (GENERIC.some(function (k) { return t.indexOf(k) >= 0; })) return 'generic';
        return 'catalogued';
    }

    /* The game's own variant picker (systems4.js _pickDialogueVariant). */
    function pickVariant(state) {
        var s = state || {};
        if (s.city && s.city.slots && s.city.slots.some(function (x) { return x; })) return 'architect';
        var clicks = s.totalClicks || 0;
        if (clicks >= 50000) return 'burnout';
        if ((s._adjEPS || 0) >= 1e9 && clicks < 20000) return 'efficient';
        return 'mirror';
    }

    var CURSOR_SVG = '<svg viewBox="0 0 24 34" aria-hidden="true"><path d="M2,2 L2,28 L9,21 L14,32 L18,30 L13,19 L22,19 Z" fill="#000" stroke="#d8e4ff" stroke-width="1.6" stroke-linejoin="round"/></svg>';

    /* the numbers being drawn into the void */
    function Spiral(cv, reduced) {
        var g = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / 2, cy = 380;
        var parts = [], raf = 0, pull = 0, tint = '160,190,255';
        for (var i = 0; i < 120; i++) parts.push(spawn({}));
        function spawn(p) {
            var ang = Math.random() * Math.PI * 2, r = 500 + Math.random() * 700;
            p.a = ang; p.r = r; p.ch = String((Math.random() * 10) | 0); p.size = 14 + Math.random() * 26; p.al = 0;
            p.sp = 0.6 + Math.random() * 1.4; return p;
        }
        function step() {
            g.clearRect(0, 0, W, H);
            g.textAlign = 'center'; g.textBaseline = 'middle';
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i];
                p.r -= p.sp * (0.4 + pull); p.a += 0.002 * (1 + pull * 2) + 120 / (p.r * p.r + 4000);
                var target = Math.min(0.26, (p.r - 150) / 900) * pull;
                p.al += (target - p.al) * 0.05;
                if (p.r < 150) spawn(p);
                var x = cx + Math.cos(p.a) * p.r, y = cy + Math.sin(p.a) * p.r * 0.62;
                if (y > 540) p.al *= 0.9;                       // keep the text band clear
                if (p.al < 0.005) continue;
                g.fillStyle = 'rgba(' + tint + ',' + p.al.toFixed(3) + ')';
                g.font = (p.size * Math.min(1, p.r / 500) + 6 | 0) + 'px "Courier New", monospace';
                g.fillText(p.ch, x, y);
            }
            raf = requestAnimationFrame(step);
        }
        if (!reduced) raf = requestAnimationFrame(step);
        return {
            set: function (pl, col) { pull = pl; if (col) tint = col; if (reduced) { parts.forEach(function (p) { p.al = Math.min(0.3, pull * 0.3); }); cancelAnimationFrame(raf); step(); cancelAnimationFrame(raf); } },
            stop: function () { cancelAnimationFrame(raf); }
        };
    }

    /* play(host, opts) → { done: Promise<{ verdict, answer }>, close() }
       opts.state     game state (picks the variant)          opts.variant   force one
       opts.dialogues replace any variant's lines             opts.question  replace the question
       opts.verdicts  override any verdict's text/effect      opts.classify  (answer) => 'understood'|'generic'|'catalogued'|'silence'
       opts.onVerdict (key, answer) => void — apply the outcome here
       opts.audio     false for silence */
    function play(host, opts) {
        opts = opts || {};
        var variant = opts.variant || pickVariant(opts.state || window.state);
        var lines = (opts.dialogues && opts.dialogues[variant]) || DIALOGUES[variant] || DIALOGUES.mirror;
        var question = opts.question || 'WHY DO YOU CONTINUE TO CLICK?';
        var judge = typeof opts.classify === 'function' ? opts.classify : classify;
        var reduced = D.reduced();
        var au = D.audio(opts, window.NullScore);
        var dir = D.director();
        var shell = D.shell(host, 'nx', dir, au);
        var root = shell.root;
        root.setAttribute('aria-label', 'Null Entity direct query');
        root.dataset.variant = variant;
        var timers = [];
        function later(fn, ms) { var t = setTimeout(fn, reduced ? Math.min(ms, 200) : ms); timers.push(t); return t; }
        function sleep(ms) { return new Promise(function (r) { later(r, ms); }); }

        var cv = document.createElement('canvas'); cv.width = D.W; cv.height = D.H; cv.className = 'nx-spiral';
        var statik = D.h('div', 'nx-static', '<i></i><i></i><i></i><i></i><i></i>');
        var eyebrow = D.h('div', 'nx-eyebrow', '// NULL ENTITY — DIRECT QUERY //');
        var eclipse = D.h('div', 'nx-eclipse', '<div class="nx-corona"></div><div class="nx-ring"></div><div class="nx-disc"></div>');
        var speech = D.h('div', 'nx-speech');
        var q = D.h('div', 'nx-question');
        var form = D.h('div', 'nx-form',
            '<input class="nx-input" type="text" maxlength="120" autocomplete="off" spellcheck="false" placeholder="type your answer..." aria-label="Your answer to the NULL Entity">'
          + '<div class="nx-hint">[ENTER] to answer · [ESC] to say nothing · The Entity is listening</div>');
        var verdictEl = D.h('div', 'nx-verdict');
        var cursor = D.h('div', 'nx-cursor', CURSOR_SVG);
        var flash = D.h('div', 'nx-flash');
        [cv, statik, eyebrow, eclipse, speech, q, form, verdictEl, cursor, flash].forEach(function (el) { root.appendChild(el); });
        var input = form.querySelector('.nx-input');
        var spiral = Spiral(cv, reduced);
        var log = shell.log;

        function pulse() { D.replay(eclipse, 'nx-pulse'); }

        /* NULL speaks one line: the previous ones rise and dim */
        async function speak(text) {
            speech.querySelectorAll('.nx-line').forEach(function (l) { l.classList.add('old'); });
            var olds = speech.querySelectorAll('.nx-line.old');
            if (olds.length > 2) olds[0].remove();
            var line = D.h('div', 'nx-line');
            speech.appendChild(line);
            au.sfx('line');
            log('NULL: ' + text);
            var n = 0;
            await dir.type(line, text, 34, function () { if (n++ % 2 === 0) { au.voice(0); pulse(); } });
            if (/click/i.test(text)) await ghostCursor();
            await dir.wait(Math.min(2600, 900 + text.length * 22));
        }

        function ghostCursor() {
            cursor.classList.remove('go'); void cursor.offsetWidth; cursor.classList.add('go');
            later(function () { au.sfx('ghost_click'); pulse(); D.replay(eclipse, 'nx-clicked'); }, reduced ? 0 : 1500);
            return sleep(1900);
        }

        var done = (async function () {
            /* 1 · INTRUSION */
            au.cue('intrusion');
            au.sfx('static');
            root.classList.add('nx-s-static');
            await dir.wait(1300);
            root.classList.add('nx-s-eyebrow');
            await dir.wait(600);

            /* 2 · THE ECLIPSE */
            au.sfx('emerge');
            root.classList.add('nx-s-eclipse');
            spiral.set(0.4);
            await dir.wait(2200);
            au.cue('presence');

            /* 3 · MONOLOGUE */
            for (var i = 0; i < lines.length; i++) await speak(lines[i]);
            spiral.set(0.9);

            /* 4 · THE QUESTION */
            root.classList.add('nx-s-question');
            au.cue('question');
            au.sfx('question');
            await dir.wait(900);
            await dir.type(q, question, 60, function () { au.sfx('qkey'); });
            log(question);
            shell.done();
            await dir.wait(500);
            root.classList.add('nx-s-input');
            try { input.focus({ preventScroll: true }); } catch (e) {}
            var escOff = function () {};
            var nudge = later(function () { if (!input.value) { au.sfx('well'); flashWord('...well?'); } }, 16000);

            var answer = await new Promise(function (resolve) {
                input.addEventListener('input', function () { au.sfx('type'); D.replay(eclipse, 'nx-listen'); });
                input.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' && input.value.trim()) { e.preventDefault(); resolve(input.value.trim()); }
                    if (e.key === 'Escape') { e.preventDefault(); resolve(''); }
                });
                function onEsc(e) { if (e.key === 'Escape') { document.removeEventListener('keydown', onEsc, true); resolve(''); } }
                document.addEventListener('keydown', onEsc, true);
                escOff = function () { document.removeEventListener('keydown', onEsc, true); };
            });
            escOff();
            clearTimeout(nudge);
            input.disabled = true;
            var key = answer ? judge(answer) : 'silence';
            var v = Object.assign({}, VERDICTS[key], (opts.verdicts || {})[key]);
            log(answer ? 'You answered: ' + answer : 'You said nothing.');

            /* 5 · JUDGEMENT — the answer is taken */
            root.classList.add('nx-s-consume');
            if (answer) { consume(answer); au.sfx('consume'); }
            else au.sfx('silence');
            au.cue(null);
            await sleep(answer ? 1900 : 1200);
            root.classList.add('nx-s-verdict', 'nx-v-' + key);
            root.style.setProperty('--v', v.color);
            spiral.set(0.6, hexRgb(v.color));
            D.replay(flash, 'on');
            au.sfx('verdict_' + key);
            if (typeof opts.onVerdict === 'function') { try { opts.onVerdict(key, answer); } catch (e) {} }
            verdictEl.innerHTML = '<div class="nx-v-text"></div><div class="nx-v-effect">' + D.esc(v.effect) + '</div>';
            if (key === 'catalogued') verdictEl.appendChild(catalogue(answer));
            await typeSlow(verdictEl.querySelector('.nx-v-text'), v.text, 55);
            log(v.text + ' ' + v.effect);
            au.cue('after_' + key);
            await sleep(2600);

            /* 6 · COLLAPSE */
            root.classList.add('nx-s-collapse');
            spiral.set(0);
            au.sfx('collapse');
            await sleep(1400);
            var picked = await D.choices(root, opts.choices || [{ id: 'return', label: 'RETURN TO THE CONSOLE' }]).show();
            finish();
            return { verdict: key, answer: answer, action: picked };
        })();

        function hexRgb(h) { var n = parseInt(h.slice(1), 16); return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
        function finish() { timers.forEach(clearTimeout); spiral.stop(); shell.close(); }

        function flashWord(txt) {
            var w = D.h('div', 'nx-whisper', D.esc(txt));
            root.appendChild(w);
            later(function () { w.remove(); }, 3200);
        }
        function typeSlow(el, text, ms) {
            return new Promise(function (r) {
                if (reduced) { el.textContent = text; return r(); }
                var k = 0;
                var iv = setInterval(function () { k++; el.textContent = text.slice(0, k); if (k % 2) au.sfx('vkey'); if (k >= text.length) { clearInterval(iv); r(); } }, ms);
            });
        }
        /* each letter of the answer is pulled up into the eclipse */
        function consume(text) {
            var row = D.h('div', 'nx-consume');
            root.appendChild(row);
            var chars = text.split('');
            chars.forEach(function (ch, k) { row.appendChild(D.h('span', '', ch === ' ' ? '&nbsp;' : D.esc(ch))); });
            var spans = row.querySelectorAll('span');
            spans.forEach(function (s, k) {
                var x = s.offsetLeft + s.offsetWidth / 2 + row.offsetLeft;
                s.style.setProperty('--dx', (960 - x) + 'px');
                s.style.animationDelay = (k * Math.min(40, 1200 / chars.length)) + 'ms';
            });
        }
        /* CATALOGUING: the answer is filed among the others */
        function catalogue(answer) {
            var box = D.h('div', 'nx-catalog');
            var entries = ['#000' + ((Math.random() * 900 + 100) | 0) + '  OPERATOR 14  "it is warm in here"', '#000' + ((Math.random() * 900 + 100) | 0) + '  OPERATOR 09  "my hand moved"',
                           '#00' + ((Math.random() * 9000 + 1000) | 0) + '  OPERATOR 15  "' + answer.slice(0, 48) + '"'];
            entries.forEach(function (e, k) { var d = D.h('div', k === 2 ? 'new' : '', D.esc(e)); d.style.animationDelay = (600 + k * 350) + 'ms'; box.appendChild(d); });
            return box;
        }

        return { done: done, close: finish };
    }

    window.NullScene = { play: play, classify: classify, pickVariant: pickVariant, DIALOGUES: DIALOGUES, VERDICTS: VERDICTS, GENERIC: GENERIC, EMOTIONAL: EMOTIONAL };
})();
