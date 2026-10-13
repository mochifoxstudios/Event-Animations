/* ═══════════════════════════════════════════════════════════════════════════
   event_audio.js — the sound engine every event scene plays through.

   Everything is synthesised with Web Audio: no files, nothing to load. An event
   brings a SCORE (see score_*.js):
     score.bpm          tempo of its music
     score.cues[name]   (A, t, step, bar) => schedule notes for one 16th-note step
     score.sfx[name]    (A, t, ...args)   => a one-shot sound effect
     score.voices[i]    a member's speaking voice (babble while their text types)

   A scene opens a session:  var au = EventAudio.session(score)
     au.cue('debate')     switch music; takes effect on the next beat
     au.sfx('gavel')      play an effect now
     au.voice(seat)       one syllable of that member's voice
     au.stop()            fade the music out and release the game's music

   In the game: while a session runs it holds GameMusic ('event-audio'), so the
   soundtrack director goes quiet instead of playing on top, and it follows
   Settings (sound on/off, Music and Effects sliders).
   Browsers only allow sound after a click — EventAudio.unlock() from any click.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var ctx = null, master, musicBus, sfxBus, verbIn, noiseBuf;
    var userMuted = false;
    var VOL = { music: 0.5, sfx: 0.85 };

    function mf(m) { return 440 * Math.pow(2, (m - 69) / 12); }

    function prefs() {
        var p = { on: true, music: 1, sfx: 1 };
        try {
            if (window.Settings && Settings._prefs) {
                if (Settings._prefs.sound === false) p.on = false;
                if (typeof Settings._prefs.musicVol === 'number') p.music = Settings._prefs.musicVol;
                if (typeof Settings._prefs.sfxVol === 'number') p.sfx = Settings._prefs.sfxVol;
            }
        } catch (e) {}
        return p;
    }

    function impulse(seconds) {
        var rate = ctx.sampleRate, len = Math.floor(rate * seconds);
        var buf = ctx.createBuffer(2, len, rate);
        for (var c = 0; c < 2; c++) {
            var d = buf.getChannelData(c);
            for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
        }
        return buf;
    }

    function ensure() {
        if (ctx) { if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} } return ctx; }
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { ctx = new AC(); } catch (e) { return null; }
        var comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16; comp.ratio.value = 3.5; comp.attack.value = 0.005; comp.release.value = 0.2;
        master = ctx.createGain();
        master.connect(comp); comp.connect(ctx.destination);
        musicBus = ctx.createGain(); musicBus.connect(master);
        sfxBus = ctx.createGain(); sfxBus.connect(master);
        var verb = ctx.createConvolver(); verb.buffer = impulse(2.8);
        verbIn = ctx.createGain(); verbIn.gain.value = 0.32;
        verbIn.connect(verb); verb.connect(master);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        var nd = noiseBuf.getChannelData(0);
        for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
        applyLevels();
        return ctx;
    }

    function applyLevels() {
        if (!ctx) return;
        var p = prefs();
        var on = p.on && !userMuted;
        master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.05);
        musicBus.gain.setTargetAtTime(VOL.music * p.music, ctx.currentTime, 0.05);
        sfxBus.gain.setTargetAtTime(VOL.sfx * p.sfx, ctx.currentTime, 0.05);
    }

    /* ── BUILDING BLOCKS ───────────────────────────────────────────────────── */
    function out(bus, wet) {
        var g = ctx.createGain();
        g.connect(bus);
        if (wet) { var s = ctx.createGain(); s.gain.value = wet; g.connect(s); s.connect(verbIn); }
        return g;
    }
    function osc(type, freq, t, stop, dest) {
        var o = ctx.createOscillator();
        o.type = type; o.frequency.setValueAtTime(freq, t);
        o.connect(dest); o.start(t); o.stop(stop);
        return o;
    }
    function noise(t, stop, dest) {
        var n = ctx.createBufferSource();
        n.buffer = noiseBuf; n.loop = true;
        n.connect(dest); n.start(t, Math.random() * 1.5); n.stop(stop);
        return n;
    }
    function filt(type, freq, q) {
        var f = ctx.createBiquadFilter();
        f.type = type; f.frequency.value = freq; if (q != null) f.Q.value = q;
        return f;
    }
    /* attack → peak, exponential decay to silence by `end` */
    function perc(g, t, peak, attack, end) {
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(peak, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, end);
    }
    /* attack → sustain → release */
    function sustain(g, t, peak, attack, dur, release) {
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(peak, t + attack);
        g.gain.setValueAtTime(peak, t + Math.max(attack, dur));
        g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(attack, dur) + release);
    }

    /* ── INSTRUMENTS — (t, midi, durSeconds, velocity 0..1, bus?) ──────────── */
    function makeInstruments(defaultBus) {
        var I = {};
        function B(bus) { return bus || defaultBus(); }

        I.pluck = function (t, m, dur, v, bus) {          // harpsichord-ish
            var f = filt('lowpass', 3200); f.frequency.setValueAtTime(3600, t); f.frequency.exponentialRampToValueAtTime(700, t + 0.25);
            var g = out(B(bus), 0.18); f.connect(g);
            perc(g, t, 0.16 * v, 0.003, t + dur + 0.35);
            osc('sawtooth', mf(m), t, t + dur + 0.4, f);
            osc('square', mf(m) * 1.003, t, t + dur + 0.4, f);
        };
        I.bass = function (t, m, dur, v, bus) {
            var f = filt('lowpass', 700);
            var g = out(B(bus), 0.05); f.connect(g);
            perc(g, t, 0.42 * v, 0.008, t + dur + 0.18);
            osc('triangle', mf(m), t, t + dur + 0.2, f);
            osc('sine', mf(m - 12), t, t + dur + 0.2, f);
        };
        I.brass = function (t, m, dur, v, bus, slideTo) {
            var f = filt('lowpass', 500, 2);
            f.frequency.setValueAtTime(400, t);
            f.frequency.linearRampToValueAtTime(600 + 2600 * v, t + 0.06);
            f.frequency.exponentialRampToValueAtTime(900 + 900 * v, t + 0.3);
            var g = out(B(bus), 0.25); f.connect(g);
            sustain(g, t, 0.17 * v, 0.04, dur, 0.14);
            [-6, 6].forEach(function (c) {
                var o = osc('sawtooth', mf(m) * Math.pow(2, c / 1200), t, t + dur + 0.2, f);
                if (slideTo != null) o.frequency.exponentialRampToValueAtTime(mf(slideTo) * Math.pow(2, c / 1200), t + dur);
            });
        };
        I.organ = function (t, m, dur, v, bus) {
            var g = out(B(bus), 0.4);
            sustain(g, t, 0.08 * v, 0.09, dur, 0.4);
            var lfo = ctx.createOscillator(), lg = ctx.createGain();
            lfo.frequency.value = 5.2; lg.gain.value = 2.2; lfo.connect(lg); lfo.start(t); lfo.stop(t + dur + 0.5);
            [[1, 1], [2, 0.5], [3, 0.3], [4, 0.22], [6, 0.1]].forEach(function (h) {
                var hg = ctx.createGain(); hg.gain.value = h[1]; hg.connect(g);
                var o = osc('sine', mf(m) * h[0], t, t + dur + 0.5, hg);
                lg.connect(o.frequency);
            });
        };
        I.pad = function (t, m, dur, v, bus) {
            var f = filt('lowpass', 1100);
            var g = out(B(bus), 0.6); f.connect(g);
            sustain(g, t, 0.05 * v, Math.min(0.9, dur / 2), dur, 1.4);
            [-9, 0, 9].forEach(function (c) { osc('sawtooth', mf(m) * Math.pow(2, c / 1200), t, t + dur + 1.5, f); });
        };
        I.choir = function (t, m, dur, v, bus) {
            var g = out(B(bus), 0.75);
            sustain(g, t, 0.07 * v, Math.min(1.1, dur / 2), dur, 1.6);
            [[700, 6], [1150, 8], [2600, 10]].forEach(function (fm, k) {
                var bp = filt('bandpass', fm[0], fm[1]);
                var fg = ctx.createGain(); fg.gain.value = [1, 0.6, 0.25][k];
                bp.connect(fg); fg.connect(g);
                [-7, 7].forEach(function (c) {
                    var o = osc('sawtooth', mf(m) * Math.pow(2, c / 1200), t, t + dur + 1.7, bp);
                    var l = ctx.createOscillator(), lg = ctx.createGain();
                    l.frequency.value = 4.6 + c / 20; lg.gain.value = 3; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 1.7);
                });
            });
        };
        I.bell = function (t, m, dur, v, bus) {
            var g = out(B(bus), 0.5);
            perc(g, t, 0.12 * v, 0.002, t + dur + 1.4);
            var car = osc('sine', mf(m), t, t + dur + 1.5, g);
            var mod = ctx.createOscillator(), mg = ctx.createGain();
            mod.frequency.value = mf(m) * 3.5;
            mg.gain.setValueAtTime(mf(m) * 2.2, t); mg.gain.exponentialRampToValueAtTime(1, t + 0.9);
            mod.connect(mg); mg.connect(car.frequency); mod.start(t); mod.stop(t + dur + 1.5);
        };
        I.timp = function (t, m, v, bus) {
            var g = out(B(bus), 0.35);
            perc(g, t, 0.55 * v, 0.004, t + 1.1);
            var o = osc('sine', mf(m) * 1.5, t, t + 1.2, g);
            o.frequency.exponentialRampToValueAtTime(mf(m), t + 0.06);
            var f = filt('lowpass', 900); var ng = out(B(bus), 0.2); f.connect(ng);
            perc(ng, t, 0.18 * v, 0.002, t + 0.12); noise(t, t + 0.15, f);
        };
        I.kick = function (t, v, bus) {
            var g = out(B(bus));
            perc(g, t, 0.7 * v, 0.003, t + 0.32);
            var o = osc('sine', 130, t, t + 0.35, g);
            o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
        };
        I.snare = function (t, v, bus) {
            var f = filt('bandpass', 1900, 0.8); var g = out(B(bus), 0.15); f.connect(g);
            perc(g, t, 0.26 * v, 0.002, t + 0.16); noise(t, t + 0.18, f);
            var tg = out(B(bus)); perc(tg, t, 0.12 * v, 0.002, t + 0.08); osc('triangle', 190, t, t + 0.1, tg);
        };
        I.hat = function (t, v, bus) {
            var f = filt('highpass', 7200); var g = out(B(bus)); f.connect(g);
            perc(g, t, 0.12 * v, 0.001, t + 0.045); noise(t, t + 0.05, f);
        };
        I.cymbal = function (t, v, bus) {
            var f = filt('highpass', 5200); var g = out(B(bus), 0.5); f.connect(g);
            perc(g, t, 0.16 * v, 0.004, t + 2.2); noise(t, t + 2.3, f);
        };
        I.tick = function (t, freq, v, bus) {
            var g = out(B(bus)); perc(g, t, 0.18 * v, 0.001, t + 0.05);
            osc('sine', freq || 2200, t, t + 0.06, g);
        };
        /* a struck block of wood — gavels and knocks */
        I.wood = function (t, v, size, bus) {
            size = size || 1;
            var g = out(B(bus), 0.35 * size);
            perc(g, t, 0.6 * v, 0.001, t + 0.18 * size);
            var o = osc('sine', 210 / size, t, t + 0.25 * size, g);
            o.frequency.exponentialRampToValueAtTime(120 / size, t + 0.08);
            var bp = filt('bandpass', 1300 / size, 3); var ng = out(B(bus), 0.25); bp.connect(ng);
            perc(ng, t, 0.5 * v, 0.001, t + 0.05 * size); noise(t, t + 0.08, bp);
        };
        I.whoosh = function (t, dur, from, to, v, bus) {
            var bp = filt('bandpass', from, 1.2);
            bp.frequency.setValueAtTime(from, t); bp.frequency.exponentialRampToValueAtTime(to, t + dur);
            var g = out(B(bus), 0.3); bp.connect(g);
            g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.2 * v, t + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            noise(t, t + dur + 0.05, bp);
        };
        /* a short vocal syllable: pitch swoop through a formant — the ducks talk in these */
        I.syllable = function (t, p, v, bus) {
            var dur = p.len || 0.075;
            var f0 = p.f * (0.88 + Math.random() * 0.26);
            var bp = filt('bandpass', p.formant || 1000, p.q || 2.5);
            var g = out(B(bus), 0.12); bp.connect(g);
            perc(g, t, (p.gain || 0.22) * v, 0.006, t + dur);
            var o = osc(p.type || 'sawtooth', f0 * (p.up || 1.3), t, t + dur + 0.02, bp);
            o.frequency.exponentialRampToValueAtTime(f0 * (p.down || 0.8), t + dur);
            if (p.dry) { var dg = out(B(bus)); perc(dg, t, (p.gain || 0.22) * v * p.dry, 0.004, t + dur); var o2 = osc('sine', f0 * (p.up || 1.3), t, t + dur + 0.02, dg); o2.frequency.exponentialRampToValueAtTime(f0 * (p.down || 0.8), t + dur); }
        };
        /* ── softer voices, for scores that need to be in tune and quiet ─────── */
        /* warm electric piano: sine + a little octave triangle, filter closing */
        I.keys = function (t, m, dur, v, bus, slideTo) {
            var f = filt('lowpass', 2400);
            f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(800, t + 0.7);
            var g = out(B(bus), 0.3); f.connect(g);
            perc(g, t, 0.22 * v, 0.004, t + dur + 0.9);
            var hg = ctx.createGain(); hg.gain.value = 0.22; hg.connect(f);
            var o1 = osc('sine', mf(m), t, t + dur + 1, f);
            var o2 = osc('sine', mf(m) * 2, t, t + dur + 1, hg);
            if (slideTo != null) { o1.frequency.exponentialRampToValueAtTime(mf(slideTo), t + dur); o2.frequency.exponentialRampToValueAtTime(mf(slideTo) * 2, t + dur); }
        };
        /* a clean bass: sine and its octave, no odd overtones — for minor keys, where a
           triangle's 5th harmonic (a major third) fights the chord */
        I.bassClean = function (t, m, dur, v, bus) {
            var f = filt('lowpass', 900);
            var g = out(B(bus), 0.04); f.connect(g);
            perc(g, t, 0.5 * v, 0.006, t + dur + 0.16);
            osc('sine', mf(m), t, t + dur + 0.2, f);
            var hg = ctx.createGain(); hg.gain.value = 0.45; hg.connect(f);
            osc('sine', mf(m + 12), t, t + dur + 0.2, hg);
            var cg = ctx.createGain(); cg.gain.value = 0.08; cg.connect(f);            // a little click for attack
            osc('square', mf(m + 24), t, t + 0.02, cg);
        };
        /* soft pad: two detuned sines and one quiet triangle, plus a sine an octave down.
           ⚠ Mostly SINE on purpose: a triangle's 5th overtone is a major third two octaves up,
           and under a minor or a hollow chord that third was measured clashing (C♯ against
           an F major 7's C; a C♯ turning VOID's open fifth into A major). */
        I.warm = function (t, m, dur, v, bus, slideTo) {
            var f = filt('lowpass', 760, 0.5);
            var g = out(B(bus), 0.55); f.connect(g);
            sustain(g, t, 0.11 * v, Math.min(1.2, dur / 2), dur, 1.8);
            [[-6, 'sine', 1], [6, 'sine', 1], [0, 'triangle', 0.2]].forEach(function (d) {
                var c = d[0], vg = ctx.createGain(); vg.gain.value = d[2]; vg.connect(f);
                var o = osc(d[1], mf(m) * Math.pow(2, c / 1200), t, t + dur + 2, vg);
                if (slideTo != null) o.frequency.exponentialRampToValueAtTime(mf(slideTo) * Math.pow(2, c / 1200), t + dur);
            });
            var sg = ctx.createGain(); sg.gain.value = 0.6; sg.connect(f);
            var so = osc('sine', mf(m - 12), t, t + dur + 2, sg);
            if (slideTo != null) so.frequency.exponentialRampToValueAtTime(mf(slideTo - 12), t + dur);
        };
        /* a pure low sine with a swell — drones and floors */
        I.sub = function (t, m, dur, v, bus, slideTo) {
            var g = out(B(bus));
            sustain(g, t, 0.32 * v, 0.05, dur, 0.6);
            var o = osc('sine', mf(m), t, t + dur + 0.7, g);
            if (slideTo != null) o.frequency.exponentialRampToValueAtTime(mf(slideTo), t + dur);
        };
        /* a tuned body thump: a heartbeat, a floor dropping */
        I.thump = function (t, m, v, bus) {
            var g = out(B(bus), 0.1);
            perc(g, t, 0.75 * v, 0.004, t + 0.45);
            var o = osc('sine', mf(m) * 2.2, t, t + 0.5, g);
            o.frequency.exponentialRampToValueAtTime(mf(m), t + 0.05);
        };
        /* a clean, harmonic chime (the FM bell is metallic; this one is in tune) */
        I.chime = function (t, m, dur, v, bus) {
            [[1, 1, 1], [2, 0.32, 0.6], [3, 0.12, 0.4], [4, 0.05, 0.3]].forEach(function (p) {
                var g = out(B(bus), 0.45);
                perc(g, t, 0.13 * v * p[1], 0.002, t + (dur + 1.2) * p[2]);
                osc('sine', mf(m) * p[0], t, t + dur + 1.3, g);
            });
        };
        /* tuned noise rising through a resonant band, under a quiet rising sine */
        I.riser = function (t, dur, m, v, bus) {
            var bp = filt('bandpass', mf(m), 9);
            bp.frequency.setValueAtTime(mf(m), t); bp.frequency.exponentialRampToValueAtTime(mf(m + 24), t + dur);
            var g = out(B(bus), 0.35); bp.connect(g);
            g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.35 * v, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
            noise(t, t + dur + 0.2, bp);
            var sg = out(B(bus), 0.2);
            sg.gain.setValueAtTime(0.0001, t); sg.gain.linearRampToValueAtTime(0.05 * v, t + dur); sg.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
            var o = osc('sine', mf(m), t, t + dur + 0.2, sg); o.frequency.exponentialRampToValueAtTime(mf(m + 12), t + dur);
        };
        /* a REVERSE SWELL: the note grows from nothing to full and is cut dead at t + dur.
           The classic build-into-silence; pair it with a cut to black. */
        I.swell = function (t, m, dur, v, bus) {
            var f = filt('lowpass', 500, 0.7);
            f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(3200, t + dur);
            var g = out(B(bus), 0.08); f.connect(g);          // nearly dry: the cut must be a real silence
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.16 * v, t + dur);
            g.gain.setValueAtTime(0.16 * v, t + dur);
            g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.02);
            [[-7, 'sine'], [7, 'sine'], [0, 'triangle']].forEach(function (d) {
                osc(d[1], mf(m) * Math.pow(2, d[0] / 1200), t, t + dur + 0.05, f);
            });
        };
        /* a reverse cymbal: bright noise rushing in, cut dead */
        I.revcym = function (t, dur, v, bus) {
            var f = filt('highpass', 4000);
            f.frequency.setValueAtTime(7000, t); f.frequency.exponentialRampToValueAtTime(2500, t + dur);
            var g = out(B(bus), 0.06); f.connect(g);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.2 * v, t + dur);
            g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.02);
            noise(t, t + dur + 0.05, f);
        };
        /* breath through a fixed vowel — whispers */
        I.breath = function (t, dur, v, vowel, bus) {
            var F = vowel === 'oo' ? [[350, 8], [800, 10]] : [[750, 7], [1150, 9]];
            F.forEach(function (fm, k) {
                var bp = filt('bandpass', fm[0], fm[1]);
                var g = out(B(bus), 0.6); bp.connect(g);
                g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime((k ? 0.35 : 0.5) * v, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
                noise(t, t + dur + 0.05, bp);
            });
        };
        return I;
    }

    /* ── A SESSION — one event on screen ─────────────────────────────────────── */
    function session(score) {
        var live = !!ensure();
        var api = { cue: noop, sfx: noop, voice: noop, stop: noop, live: live };
        if (!live) return api;
        try { if (window.GameMusic && GameMusic.hold) GameMusic.hold('event-audio'); } catch (e) {}
        applyLevels();

        /* music runs through its own gain so a session can fade without touching the bus */
        var mGain = ctx.createGain(); mGain.connect(musicBus);
        var sGain = ctx.createGain(); sGain.connect(sfxBus);
        var M = makeInstruments(function () { return mGain; });
        var S = makeInstruments(function () { return sGain; });
        var A = { music: M, fx: S, mf: mf, ctx: ctx };

        var bpm = score.bpm || 90, stepDur = 60 / bpm / 4;
        A.step = stepDur; A.beat = stepDur * 4; A.bar = stepDur * 16;
        var cur = null, pending, step = 0, bar = 0, nextTime = 0, timer = null, stopped = false;
        var lastVoice = 0;

        function tick() {
            if (stopped) return;
            if (!nextTime || nextTime < ctx.currentTime - 0.2) nextTime = ctx.currentTime + 0.05;
            while (nextTime < ctx.currentTime + 0.14) {
                if (pending !== undefined && step % 4 === 0) {
                    cur = pending; pending = undefined;
                    if (step % 16 !== 0) { step = 0; }       // a new cue starts on its own downbeat
                    bar = 0;
                }
                var fn = cur && score.cues[cur];
                if (fn) { try { fn(A, nextTime, step % 16, bar); } catch (e) {} }
                nextTime += stepDur;
                step += 1;
                if (step % 16 === 0) bar += 1;
            }
        }

        api.cue = function (name) {
            if (stopped) return;
            pending = name || null;
            if (!timer) { timer = setInterval(tick, 25); tick(); }
        };
        api.sfx = function (name) {
            if (stopped) return;
            var fn = score.sfx && score.sfx[name];
            if (!fn) return;
            var args = [A, ctx.currentTime + 0.01].concat([].slice.call(arguments, 1));
            try { fn.apply(null, args); } catch (e) {}
        };
        api.voice = function (seat) {
            if (stopped) return;
            var p = score.voices && score.voices[seat];
            if (!p) return;
            var now = ctx.currentTime;
            if (now - lastVoice < (p.gap || 0.085)) return;
            lastVoice = now;
            S.syllable(now + 0.005, p, 1);
        };
        api.stop = function () {
            if (stopped) return;
            stopped = true;
            clearInterval(timer);
            var t = ctx.currentTime;
            mGain.gain.setValueAtTime(mGain.gain.value, t);
            mGain.gain.linearRampToValueAtTime(0.0001, t + 0.8);
            setTimeout(function () { try { mGain.disconnect(); sGain.disconnect(); } catch (e) {} }, 3500);
            try { if (window.GameMusic && GameMusic.release) GameMusic.release('event-audio'); } catch (e) {}
        };
        return api;
    }
    function noop() {}

    window.EventAudio = {
        session: session,
        unlock: function () { ensure(); },
        setMuted: function (m) { userMuted = !!m; applyLevels(); },
        isMuted: function () { return userMuted; },
        refresh: applyLevels,                  // call after Settings' sound sliders change
        mf: mf
    };
})();
