/* Builds one self-contained HTML page per event into artifacts/, inlining the
   art, the shared core and the scene. Run: node tools/build_artifacts.js */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const js = p => {
    const s = read(p);
    if (/<\/script/i.test(s)) throw new Error(p + ' contains </script>');
    return '<script>\n' + s + '\n</script>\n';
};

const ART = js('reference/duck_cast_art.js') + js('reference/duck_council_art.js') + js('reference/duck_tribunal_art.js')
          + js('src/audio/event_audio.js') + js('src/duck_scene_core.js');
const CSS = read('src/duck_scenes.css');
/* the page chrome uses the scenes' own hand-drawn icons (duck_scene_core.js), never emoji or symbol fonts */
const ICONS = (() => { const w = {}; new Function('window', 'document', read('src/duck_scene_core.js'))(w, {}); return w.DuckScene; })();
const ic = name => ICONS.icon(name);

const PAGE_CSS = `
/* A viewer for one in-game event. Single dark look on purpose: it is the game's screen. */
:root { --bg: #050407; --bar: #0d0b10; --line: #26222c; --fg: #c9c4d4; --muted: #8a8496; --ok: #8fd69a; color-scheme: dark; }
html, body { height: 100%; }
body { background: var(--bg); color: var(--fg); font-family: 'Courier New', monospace; }
.viewer { min-height: 100%; display: flex; flex-direction: column; }
.ctl { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; padding: 12px 18px; background: var(--bar); border-bottom: 1px solid var(--line); font-size: 16px; }
.ctl h1 { margin: 0; font-size: 17px; letter-spacing: 3px; font-weight: 900; color: var(--fg); }
.ctl .grp { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.ctl label { color: var(--muted); letter-spacing: 1px; }
.ctl select, .ctl button { font: inherit; font-size: 16px; color: var(--fg); background: var(--bg); border: 1px solid var(--line); border-radius: 4px; padding: 7px 12px; max-width: 100%; }
.ctl button { cursor: pointer; font-weight: 700; letter-spacing: 1px; }
.ctl button:hover, .ctl button:focus-visible { border-color: var(--fg); outline: none; }
.ctl .note { flex-basis: 100%; color: var(--muted); font-size: 15px; line-height: 1.5; }
.ctl .out { color: var(--ok); }
.stagehost { position: relative; flex: 1; display: flex; min-height: 620px; }
.stagehost > .dks { flex: 1; }
.gate { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 32px 16px; text-align: center; }
.gate h2 { margin: 0; font-size: clamp(26px, 5vw, 44px); letter-spacing: 6px; color: var(--accent); }
.gate p { margin: 0; max-width: 40rem; color: var(--fg); font-size: 18px; line-height: 1.6; }
.gate button { font: inherit; font-size: 20px; font-weight: 900; letter-spacing: 4px; padding: 16px 32px; color: var(--accent); background: transparent; border: 1px solid var(--accent); border-radius: 6px; cursor: pointer; }
.gate button:hover, .gate button:focus-visible { background: rgba(255,255,255,0.06); outline: none; }
`;

function page({ title, scene, score, accent, blurb, controls, script, note, extraCss, extraInline, gateLabel }) {
    return `<meta charset="utf-8">
<title>${title}</title>
<style>${PAGE_CSS}
${extraCss ? read(extraCss) : ''}
${extraInline || ''}
:root { --accent: ${accent}; }
${CSS}</style>
<div class="viewer">
  <div class="ctl">
    <h1>${title.toUpperCase()}</h1>
    ${controls}
    <div class="grp"><button id="snd" type="button" aria-pressed="true">${ic('note')} Sound on</button>
      <label><input type="checkbox" id="safe"> safe mode (no motion)</label></div>
    <span class="out" id="out" aria-live="polite"></span>
    <div class="note">${note}</div>
  </div>
  <div class="stagehost" id="host">
    <div class="gate"><h2>${title.toUpperCase()}</h2><p>${blurb}</p>
      <button id="go" type="button">${(gateLabel || 'PLAY WITH SOUND').replace(/^\u25b6 /, '').replace(/^/, ic('play') + ' ')}</button></div>
  </div>
</div>
${ART}${js(score)}${js(scene)}<script>
var host = document.getElementById('host'), out = document.getElementById('out'), scene = null;
var begun = false;
function begin() { begun = true; EventAudio.unlock(); start(); }
document.getElementById('go').onclick = begin;
document.getElementById('safe').onchange = function (e) { document.body.classList.toggle('safe-mode', e.target.checked); if (begun) start(); };
var snd = document.getElementById('snd');
snd.onclick = function () {
    var m = !EventAudio.isMuted();
    EventAudio.setMuted(m);
    snd.innerHTML = ${JSON.stringify(ic('note'))} + (m ? ' Sound off' : ' Sound on');
    snd.setAttribute('aria-pressed', String(!m));
};
var SAMPLE = { totalClicks: 84000, prestige: { count: 6 }, energy: 3.2e14, city: { slots: [1,1,1,1,1,0,1] }, instability: 22,
               stats: { totalPlaytimeMs: 40 * 60000, itemsBought: 64 }, eps: 5e9, voidBranch: { a: 1, b: 1 }, _sporeHappiness: 12 };
${script}
</script>
`;
}

const council = page({
    title: 'Ducky Council',
    scene: 'src/council_scene.js',
    score: 'src/audio/score_council.js',
    accent: '#e8c547',
    blurb: 'Five ducks read your record into the minutes, argue about it, vote with placards and award a grade. Its own chamber march, a voice for each member, a fanfare for each grade.',
    note: 'Click anywhere to hurry a line along, or SKIP to jump to the verdict. "Sample operator" is graded by the real scoring: 84,000 clicks, 6 prestiges, 3.2e14 energy, 6 buildings, 22% instability.',
    controls: `<div class="grp"><label for="grade">Grade</label><select id="grade"><option value="">Sample operator</option></select>
      <button id="replay" type="button">${ic('play')} Replay</button></div>`,
    script: `
var gradeSel = document.getElementById('grade');
CouncilScene.GRADES.slice().reverse().forEach(function (g) { gradeSel.add(new Option(g.charAt(0).toUpperCase() + g.slice(1), g)); });
function start() {
    if (scene) scene.close();
    out.textContent = '';
    scene = CouncilScene.play(host, { state: SAMPLE, grade: gradeSel.value || undefined,
        onRuling: function (g) { out.textContent = 'Reward applied: ' + CouncilScene.VERDICTS[g].rewardDesc; } });
    scene.done.then(function () { out.textContent = 'Judgement accepted. Press Replay to watch again.'; });
}
gradeSel.onchange = function () { if (begun) start(); };
document.getElementById('replay').onclick = begin;`
});

const tribunal = page({
    title: 'Duck Tribunal',
    scene: 'src/tribunal_scene.js',
    score: 'src/audio/score_tribunal.js',
    accent: '#8f9fd6',
    blurb: 'The bench charges you by how you play, holds a hearing and stamps a sentence that fits the charge. Organ, timpani and a different score for each register.',
    note: 'The sentence follows the charge. Register sets who speaks and the colour of the room. Click anywhere to hurry a line along, or SKIP to jump to the sentence.',
    controls: `<div class="grp"><label for="charge">Charge</label><select id="charge"></select>
      <label for="register">Register</label><select id="register"></select>
      <button id="replay" type="button">${ic('play')} Replay</button></div>`,
    script: `
var chargeSel = document.getElementById('charge'), regSel = document.getElementById('register');
TribunalScene.CHARGES.forEach(function (c) {
    var s = c.verdict >= 0 ? TribunalScene.SENTENCES[c.verdict].title.toLowerCase() : 'coin flip';
    chargeSel.add(new Option(c.label.toLowerCase().replace(/\\b\\w/g, function (m) { return m.toUpperCase(); }) + ' → ' + s, c.key));
});
TribunalScene.REGISTERS.forEach(function (r) { regSel.add(new Option(r.charAt(0).toUpperCase() + r.slice(1), r)); });
function start() {
    if (scene) scene.close();
    out.textContent = '';
    var j = TribunalScene.judge(SAMPLE, { charge: chargeSel.value, register: regSel.value });
    scene = TribunalScene.play(host, { judgement: j });
    scene.done.then(function (r) {
        out.textContent = r.action === 'banish' ? 'Banished to Omega. Anti-Energy taxed until dismissed.' : 'Sentence accepted: ' + TribunalScene.SENTENCES[r.verdict].fx + '.';
    });
}
chargeSel.onchange = regSel.onchange = function () { if (begun) start(); };
document.getElementById('replay').onclick = begin;`
});

fs.mkdirSync(path.join(ROOT, 'artifacts'), { recursive: true });
const BOARD_CSS = `
.dks-fit > .board { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; }
.board { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 46px; background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,204,85,0.06), transparent 70%), #07060a; transition: filter 0.8s, opacity 0.8s; }
.board.blur { filter: blur(10px); opacity: 0.5; }
.board .hud { display: flex; gap: 90px; justify-content: center; font-size: 28px; letter-spacing: 4px; color: var(--muted); }
.board .hud b { display: block; margin-top: 6px; font-size: 60px; letter-spacing: 3px; color: var(--fg); font-variant-numeric: tabular-nums; }
.board .acq { width: 380px; height: 380px; border-radius: 50%; border: 4px solid #ffcc55; background: radial-gradient(circle at 40% 35%, rgba(255,204,85,0.28), rgba(255,204,85,0.04) 70%); color: #ffcc55; font: inherit; font-weight: 900; font-size: 40px; letter-spacing: 8px; cursor: pointer; box-shadow: 0 0 90px -30px #ffcc55; transition: transform 0.08s; }
.board .acq:active { transform: scale(0.95); }
.board .acq:disabled { opacity: 0.15; cursor: default; }
.board .gens { display: grid; grid-template-columns: repeat(3, 380px); gap: 20px; font-size: 28px; letter-spacing: 1px; color: var(--fg); }
.board .gens div { border: 1px solid var(--line); border-radius: 8px; padding: 16px 22px; display: flex; justify-content: space-between; }
.board .tip { font-size: 32px; letter-spacing: 1px; line-height: 1.35; color: var(--fg); text-align: center; max-width: 1500px; }
.sceneLayer { position: absolute; inset: 0; }
.sceneLayer[hidden] { display: none; }
`;
const existential = page({
    title: 'Existential Crisis',
    scene: 'src/existential_scene.js',
    score: 'src/audio/score_existential.js',
    extraCss: 'src/existential_scene.css',
    extraInline: BOARD_CSS,
    accent: '#c9c3e6',
    gateLabel: 'OPEN THE BOARD',
    blurb: 'At one million clicks the game stops and asks why. Four answers, each with a permanent mark. Click ACQUIRE to reach one million yourself.',
    note: 'Hover an answer to preview its mark; press and hold to choose. After CONTINUE the board keeps the mark. VOID disables ACQUIRE for the rest of the run, as in the game.',
    controls: `<div class="grp"><button id="trigger" type="button">${ic('bolt')} Trigger now</button><button id="replay" type="button">${ic('replay')} Reset board</button></div>`,
    script: `
var clicks = 999990, crisis = false;
var BOARD = '<div class="board" id="board"><div class="hud"><span>ENERGY<b>4.21e15</b></span><span>EPS<b>3.10e13</b></span><span>TOTAL CLICKS<b id="tc">999,990</b></span></div>'
  + '<button class="acq" id="acq" type="button">ACQUIRE</button>'
  + '<div class="gens"><div><span>Cursor Farm</span><span>×412</span></div><div><span>Quantum Mill</span><span>×96</span></div><div><span>Void Siphon</span><span>×18</span></div></div>'
  + '<div class="tip" id="tip">Click ACQUIRE. Something happens at 1,000,000.</div></div><div class="sceneLayer" id="layer" hidden></div>';
var music = null;
function start() {
    if (scene) scene.close();
    if (music) music.stop();
    crisis = false; clicks = 999990; out.textContent = '';
    host.innerHTML = '';
    var tmp = document.createElement('div'); tmp.innerHTML = BOARD;
    DuckScene.fit(host, tmp.firstChild);
    host.appendChild(tmp.firstChild);
    music = EventAudio.session(ExistentialScore); music.cue('board');
    document.getElementById('acq').onclick = function () {
        if (crisis) return;
        clicks++; music.sfx('click');
        document.getElementById('tc').textContent = clicks.toLocaleString('en-US');
        if (clicks >= 999996) trigger();
    };
}
function trigger() {
    if (!begun) begin();
    if (crisis) return;
    crisis = true;
    if (music) { music.stop(); music = null; }
    var board = document.getElementById('board'), layer = document.getElementById('layer');
    board.classList.add('blur');
    layer.hidden = false;
    scene = ExistentialScene.play(layer, { state: { energy: 4.21e15 },
        onChoose: function (p) { out.textContent = 'Chose ' + p.label + ': ' + p.gift; } });
    scene.done.then(function (r) {
        layer.hidden = true;
        board.classList.remove('blur');
        ExistentialScene.applyMark(board, r.key);
        document.getElementById('tc').textContent = '1,000,000';
        if (r.key === 'VOID') document.getElementById('acq').disabled = true;
        document.getElementById('tip').textContent = r.path.markText + ' (Reset board to choose again.)';
        crisis = true;
    });
}
document.getElementById('trigger').onclick = function () { if (!begun) begin(); clicks = 999996; trigger(); };
document.getElementById('replay').onclick = begin;`
});
fs.writeFileSync(path.join(ROOT, 'artifacts/existential_crisis.html'), existential);
const nullPage = page({
    title: 'NULL Interrogation',
    scene: 'src/null_scene.js',
    score: 'src/audio/score_null.js',
    extraCss: 'src/null_scene.css',
    accent: '#c9d8ff',
    blurb: 'NULL takes the console, speaks, and asks why you continue to click. Type an answer. It will judge it.',
    note: 'Try an honest answer ("I don\'t know", "habit"), a greedy one ("more energy"), something strange, or press Escape to say nothing. The verdict uses the game\'s own rules.',
    controls: `<div class="grp"><label for="variant">Monologue</label><select id="variant">
        <option value="mirror">Mirror (default)</option><option value="architect">Architect (has a city)</option>
        <option value="burnout">Burnout (50,000+ clicks)</option><option value="efficient">Efficient (high income, few clicks)</option></select>
      <button id="replay" type="button">${ic('play')} Replay</button></div>`,
    script: `
var varSel = document.getElementById('variant');
function start() {
    if (scene) scene.close();
    out.textContent = '';
    scene = NullScene.play(host, { variant: varSel.value,
        onVerdict: function (k, a) { out.textContent = 'Verdict: ' + NullScene.VERDICTS[k].text + ' ' + NullScene.VERDICTS[k].effect; } });
    scene.done.then(function () { out.textContent += ' (Press Replay to be asked again.)'; });
}
varSel.onchange = function () { if (begun) start(); };
document.getElementById('replay').onclick = begin;`
});
fs.writeFileSync(path.join(ROOT, 'artifacts/null_interrogation.html'), nullPage);
const dilemmaPage = page({
    title: "Prisoner's Dilemma",
    scene: 'src/dilemma_scene.js',
    score: 'src/audio/score_dilemma.js',
    extraCss: 'src/dilemma_scene.css',
    accent: '#ff9a4a',
    blurb: 'Another operator appears on your frequency. A pool of energy sits between you. Share it, or steal it. They are deciding too.',
    note: 'Read their dossier and watch their cursor: it lingers on what they mean to do, most of the time. 15 seconds; out of time and you share. This sample operator answered POWER at the Existential Crisis, and Ω_remnant knows it.',
    controls: `<div class="grp"><label for="opp">Opponent</label><select id="opp"><option value="">Random</option>
        <option value="op409">Operator_409 (trusting)</option><option value="nexus">NEXUS_PROC_Δ (copies you)</option>
        <option value="unknown">usr_unknown (coin flip)</option><option value="void7">void_entity_7 (betrays)</option>
        <option value="omega">Ω_remnant (remembers your answer)</option></select>
      <button id="replay" type="button">${ic('play')} Replay</button></div>`,
    script: `
var oppSel = document.getElementById('opp');
var last = null;
function start() {
    if (scene) scene.close();
    out.textContent = '';
    scene = DilemmaScene.play(host, { opponent: oppSel.value || undefined,
        state: { energy: 3.2e14, _existentialPath: 'POWER', _pdLast: last },
        onResult: function (r) { last = r.you; out.textContent = (r.you === 'S' ? 'You shared' : 'You stole') + ', they ' + (r.them === 'S' ? 'shared' : 'stole') + ': ' + (r.delta ? (r.delta > 0 ? '+' : '−') + DuckScene.fmt(Math.abs(r.delta)) : '0') + ' E' + (r.instability ? ', +' + r.instability + '% instability' : '') + '. NEXUS_PROC_Δ will remember.'; } });
}
oppSel.onchange = function () { if (begun) start(); };
document.getElementById('replay').onclick = begin;`
});
fs.writeFileSync(path.join(ROOT, 'artifacts/prisoners_dilemma.html'), dilemmaPage);
const severancePage = page({
    title: 'Severance Package',
    scene: 'src/severance_scene.js',
    score: 'src/audio/score_severance.js',
    extraCss: 'src/severance_scene.css',
    accent: '#66aadd',
    gateLabel: 'JOIN THE MEETING',
    blurb: 'You are close to another reset. The Simulation Overseers would like a quick chat. They have hold music.',
    note: 'SIGN, DECLINE, or ASK FOR MORE once: you go on hold and they come back with a better offer or their final one. Read the fine print on the letter. In the game, signing closes the game and the package is paid on next launch.',
    controls: `<div class="grp"><label for="neg">Asking for more</label><select id="neg"><option value="">Random (65% raised)</option>
        <option value="raised">They raise it</option><option value="final">Final offer</option></select>
      <button id="replay" type="button">${ic('play')} Replay</button></div>`,
    script: `
var negSel = document.getElementById('neg');
function start() {
    if (scene) scene.close();
    out.textContent = '';
    scene = SeveranceScene.play(host, { state: SAMPLE, forceNegotiation: negSel.value || undefined,
        onAccept: function (o) { out.textContent = 'Signed: +' + o.lp + ' LP, +' + o.data + ' DATA on next launch. (The game would close here.)'; },
        onDecline: function () { out.textContent = 'Declined. The run carries on.'; } });
    scene.done.then(function (r) { if (r.negotiated) out.textContent += ' Negotiation: ' + r.negotiated + '.'; });
}
negSel.onchange = function () { if (begun) start(); };
document.getElementById('replay').onclick = begin;`
});
fs.writeFileSync(path.join(ROOT, 'artifacts/severance_package.html'), severancePage);
const CRASH_BOARD_CSS = `
.board .cpu { position: absolute; left: 40px; bottom: 40px; width: 340px; padding: 18px 22px; border: 1px solid rgba(30,120,30,0.6); border-radius: 8px; background: rgba(0,10,0,0.9); font-size: 30px; letter-spacing: 2px; color: #6fdc6f; text-align: left; }
.board .cpu b { float: right; font-variant-numeric: tabular-nums; }
.board .cpu i { display: block; margin-top: 10px; height: 10px; border-radius: 5px; background: rgba(255,255,255,0.08); overflow: hidden; }
.board .cpu s { display: block; height: 100%; background: linear-gradient(90deg, #6fdc6f, #ffcc55, #ff4a2a); transform-origin: left; transition: transform 0.2s; }
.board .cpu.hot { border-color: #ff4a2a; color: #ff6a3a; }
`;
function crashPage(o) {
    return page({
        title: o.title,
        scene: 'src/crash_scene.js',
        score: 'src/audio/score_crash.js',
        extraCss: 'src/crash_scene.css',
        extraInline: BOARD_CSS + CRASH_BOARD_CSS,
        accent: o.accent,
        gateLabel: o.gate,
        blurb: o.blurb,
        note: o.note,
        controls: o.controls,
        script: o.script
    });
}
const fakeCrash = crashPage({
    title: 'Fake Crash',
    accent: '#7dffb0',
    gate: 'OPEN THE BOARD',
    blurb: 'At 13,333, 66,666 and 123,456 clicks the simulation crashes. Or seems to. Click CLICK to get there.',
    note: 'The stop code is TOO_MANY_CLICKS, so clicking during the crash is noticed, and enough clicks end it early. The reveal pays +50% energy.',
    controls: `<div class="grp"><label for="ms">Milestone</label><select id="ms"><option>13333</option><option>66666</option><option>123456</option></select>
      <button id="trigger" type="button">${ic('bolt')} Crash now</button><button id="replay" type="button">${ic('replay')} Reset board</button></div>`,
    script: `
var msSel = document.getElementById('ms'), clicks = 0, crashed = false, music = null, energy = 3.2e14;
function board() {
    return '<div class="board" id="board"><div class="hud"><span>ENERGY<b id="en">' + DuckScene.fmt(energy) + '</b></span><span>TOTAL CLICKS<b id="tc"></b></span></div>'
      + '<button class="acq" id="acq" type="button">CLICK</button>'
      + '<div class="tip" id="tip">Click. Something happens at ' + (+msSel.value).toLocaleString('en-US') + '.</div></div><div class="sceneLayer" id="layer" hidden></div>';
}
function start() {
    if (scene) scene.close();
    if (music) music.stop();
    crashed = false; energy = 3.2e14; out.textContent = '';
    var goal = +msSel.value; clicks = goal - 6;
    host.innerHTML = '';
    var tmp = document.createElement('div'); tmp.innerHTML = board();
    DuckScene.fit(host, tmp.firstChild);
    host.appendChild(tmp.firstChild);
    document.getElementById('tc').textContent = clicks.toLocaleString('en-US');
    music = EventAudio.session(FakeCrashScore); music.cue('board');
    document.getElementById('acq').onclick = function () {
        if (crashed) return;
        clicks++; music.sfx('click');
        document.getElementById('tc').textContent = clicks.toLocaleString('en-US');
        if (clicks >= goal) trigger();
    };
}
function trigger() {
    if (crashed) return;
    crashed = true;
    if (music) { music.stop(); music = null; }
    var layer = document.getElementById('layer');
    layer.hidden = false;
    scene = CrashScene.play(layer, { variant: 'fake', clicks: +msSel.value, state: { energy: energy },
        onBonus: function (g) { energy += g; document.getElementById('en').textContent = DuckScene.fmt(energy); } });
    scene.done.then(function (r) {
        layer.hidden = true;
        out.textContent = 'Crash bonus +' + DuckScene.fmt(r.bonus) + ' energy' + (r.clicks ? '; you clicked ' + r.clicks + ' times during the crash' : '') + '.';
        document.getElementById('tip').textContent = 'Nothing crashed. (Reset board to crash again.)';
    });
}
document.getElementById('trigger').onclick = function () { if (!begun) begin(); trigger(); };
msSel.onchange = function () { if (begun) start(); };
document.getElementById('replay').onclick = begin;`
});
fs.writeFileSync(path.join(ROOT, 'artifacts/fake_crash.html'), fakeCrash);
const thermalCrash = crashPage({
    title: 'Thermal Crash',
    accent: '#ffb050',
    gate: 'OPEN THE BOARD',
    blurb: 'The System Diagnostics CPU meter is climbing. At 100% the simulation overheats and crashes, and something is left behind the crash screen.',
    note: 'Hold OVERCLOCK to push the CPU, or wait. After the crash, the screen cracks open: claim the ×25 EPS dividend before the gap cools shut (20 s).',
    controls: `<div class="grp"><button id="trigger" type="button">${ic('bolt')} Overheat now</button><button id="replay" type="button">${ic('replay')} Reset board</button></div>`,
    script: `
var cpu = 86, crashed = false, music = null, heatT = null, push = false;
var BOARD = '<div class="board" id="board"><div class="hud"><span>ENERGY<b>3.20e14</b></span><span>EPS<b id="eps">5.00e9</b></span></div>'
  + '<button class="acq" id="acq" type="button">OVERCLOCK</button>'
  + '<div class="tip" id="tip">Hold OVERCLOCK. The CPU does not like it.</div>'
  + '<div class="cpu" id="cpu">CPU <b id="cpuv">86%</b><i><s id="cpub"></s></i></div></div><div class="sceneLayer" id="layer" hidden></div>';
function start() {
    if (scene) scene.close();
    if (music) music.stop();
    clearInterval(heatT);
    crashed = false; cpu = 86; out.textContent = '';
    host.innerHTML = '';
    var tmp = document.createElement('div'); tmp.innerHTML = BOARD;
    DuckScene.fit(host, tmp.firstChild);
    host.appendChild(tmp.firstChild);
    music = EventAudio.session(ThermalCrashScore); music.cue('heat');
    var acq = document.getElementById('acq');
    acq.onpointerdown = function () { push = true; }; acq.onpointerup = acq.onpointerleave = function () { push = false; };
    acq.onclick = function () { cpu += 0.6; };
    heatT = setInterval(function () {
        if (crashed) return;
        cpu = Math.min(100, cpu + (push ? 0.5 : 0.08) + (Math.random() - 0.4) * 0.2);
        document.getElementById('cpuv').textContent = Math.floor(cpu) + '%';
        document.getElementById('cpub').style.transform = 'scaleX(' + cpu / 100 + ')';
        document.getElementById('cpu').classList.toggle('hot', cpu > 95);
        if (cpu >= 100) trigger();
    }, 100);
}
function trigger() {
    if (crashed) return;
    crashed = true;
    clearInterval(heatT);
    var cv = document.getElementById('cpuv'); if (cv) { cv.textContent = '100%'; document.getElementById('cpub').style.transform = 'scaleX(1)'; document.getElementById('cpu').classList.add('hot'); }
    if (music) { music.stop(); music = null; }
    var layer = document.getElementById('layer');
    layer.hidden = false;
    scene = CrashScene.play(layer, { variant: 'thermal', state: SAMPLE,
        onClaim: function () { out.textContent = 'Crash dividend claimed: ×25 EPS for 30 minutes.'; } });
    scene.done.then(function (r) {
        layer.hidden = true;
        if (!r.claimed) out.textContent = r.action ? 'The gap closed. No dividend this time.' : 'Crash screen dismissed. No dividend.';
        else document.getElementById('eps').textContent = '1.25e11';
        document.getElementById('tip').textContent = 'Contained. (Reset board to overheat again.)';
    });
}
document.getElementById('trigger').onclick = function () { if (!begun) begin(); trigger(); };
document.getElementById('replay').onclick = begin;`
});
fs.writeFileSync(path.join(ROOT, 'artifacts/thermal_crash.html'), thermalCrash);
const eyePage = page({
    title: 'Eye of the Storm',
    scene: 'src/eye_scene.js',
    score: 'src/audio/score_eye.js',
    extraCss: 'src/eye_scene.css',
    extraInline: BOARD_CSS,
    accent: '#9cd0ff',
    gateLabel: 'ENTER THE STORM',
    blurb: 'Deep in a chaotic session, the storm stops. Sixty seconds of clear sky: instability 0, energy output ×10. Breathe with it, or use it.',
    note: 'Hold (pointer or Space) while the orb grows and release while it shrinks: every breath in time weakens the storm that returns (40% down to 12% of what it was). Or USE THE CALM to play the board at ×10 with the eye waiting in the corner.',
    controls: `<div class="grp"><label for="dur">Calm</label><select id="dur"><option value="60">60 s (as in the game)</option><option value="20">20 s (preview)</option></select>
      <button id="replay" type="button">${ic('play')} Replay</button></div>`,
    script: `
var durSel = document.getElementById('dur'), energy = 2.4e12, eps = 5e9, mult = 1, tickT = null, instab = 74;
var BOARD = '<div class="board" id="board"><div class="hud"><span>ENERGY<b id="en"></b></span><span>EPS<b id="eps"></b></span><span>INSTABILITY<b id="inst"></b></span></div>'
  + '<button class="acq" id="acq" type="button">ACQUIRE</button>'
  + '<div class="tip" id="tip">The storm is loud tonight.</div></div><div class="sceneLayer" id="layer"></div>';
function hud() {
    document.getElementById('en').textContent = DuckScene.fmt(energy);
    document.getElementById('eps').textContent = DuckScene.fmt(eps * mult) + (mult > 1 ? ' ×' + mult : '');
    document.getElementById('inst').textContent = Math.round(instab) + '%';
}
function start() {
    if (scene) scene.close();
    clearInterval(tickT);
    energy = 2.4e12; mult = 1; instab = 74; out.textContent = '';
    host.innerHTML = '';
    var tmp = document.createElement('div'); tmp.innerHTML = BOARD;
    DuckScene.fit(host, tmp.firstChild);
    host.appendChild(tmp.firstChild);
    hud();
    tickT = setInterval(function () { energy += eps * mult / 10; hud(); }, 100);
    document.getElementById('acq').onclick = function () { energy += eps * mult * 2; hud(); };
    var layer = document.getElementById('layer');
    layer.hidden = false;
    scene = EyeScene.play(layer, { duration: +durSel.value, state: { instability: instab, eps: eps },
        onStart: function () { mult = 10; instab = 0; hud(); },
        onMini: function (on) { document.getElementById('tip').textContent = on ? 'The calm is yours: ×10. The eye waits in the corner.' : 'The storm is loud tonight.'; },
        onEnd: function (r) { mult = 1; instab = r.returnsAt; hud(); out.textContent = 'The storm returned at ' + r.returnsAt + '% (from ' + r.before + '%). Breaths in time: ' + r.breaths + '. Time spent using the calm: ' + r.minimized + ' s.'; } });
    scene.done.then(function () { layer.hidden = true; document.getElementById('tip').textContent = 'The storm is back. (Replay to find the eye again.)'; });
}
durSel.onchange = function () { if (begun) start(); };
document.getElementById('replay').onclick = begin;`
});
fs.writeFileSync(path.join(ROOT, 'artifacts/eye_of_the_storm.html'), eyePage);
const captchaPage = page({
    title: 'CAPTCHA (inverted)',
    scene: 'src/captcha_scene.js',
    score: 'src/audio/score_captcha.js',
    extraCss: 'src/captcha_scene.css',
    accent: '#9cbcf0',
    gateLabel: 'BEGIN THE AUDIT',
    blurb: 'Every 45 minutes after a prestige, the Overseers audit you. Prove you are a machine.',
    note: 'The rules are inverted: picking the tiles that really match FAILS. Pick only wrong tiles, none at all, or answer in under 0.2 s to pass (+5% energy, +50 Data). Watch HUMAN PROBABILITY on the right: it reacts to everything you do. The first failure is a warning; after that it costs −30% income for 90 s.',
    controls: `<div class="grp"><label for="grid">Grid</label><select id="grid"><option value="">Random</option><option value="lights">Traffic lights</option>
        <option value="hydrants">Fire hydrants</option><option value="crosswalks">People crossing</option><option value="gens">Your generators</option></select>
      <label><input type="checkbox" id="warned"> already warned once</label>
      <button id="replay" type="button">${ic('play')} Replay</button></div>`,
    script: `
var gridSel = document.getElementById('grid'), warned = document.getElementById('warned');
function gen(body, bg) { return '<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="8" fill="' + bg + '"/>' + body + '</svg>'; }
var GENS = [
  { name: 'Cursor Farm', svg: gen('<path d="M16 8v28l7-7 5 11 4-2-5-11h10z" fill="#fff" stroke="#23262b" stroke-width="2"/>', '#9cc4e8') },
  { name: 'Quantum Mill', svg: gen('<circle cx="24" cy="24" r="4" fill="#23262b"/><path d="M24 20V6l6 10zM28 24h14l-10 6zM24 28v14l-6-10zM20 24H6l10-6z" fill="#7a5cc4"/>', '#e6dcf7') },
  { name: 'Void Siphon', svg: gen('<circle cx="24" cy="24" r="14" fill="#1a1028"/><circle cx="24" cy="24" r="8" fill="none" stroke="#b07aff" stroke-width="3"/>', '#cbb8ea') },
  { name: 'Signal Post', svg: gen('<path d="M24 14v28M18 42h12" stroke="#23262b" stroke-width="3"/><path d="M14 12a14 14 0 0 1 20 0M18 16a8 8 0 0 1 12 0" fill="none" stroke="#3a7a9a" stroke-width="3"/>', '#cfe6ef') },
  { name: 'Reality Engine', svg: gen('<path d="M24 6l16 9v18l-16 9-16-9V15z" fill="#ffcc55" stroke="#8a6a10" stroke-width="2"/><circle cx="24" cy="24" r="6" fill="#fff"/>', '#3a2a10') },
  { name: 'Data Cache', svg: gen('<rect x="10" y="10" width="28" height="8" rx="2" fill="#886644"/><rect x="10" y="20" width="28" height="8" rx="2" fill="#886644"/><rect x="10" y="30" width="28" height="8" rx="2" fill="#886644"/><circle cx="33" cy="14" r="1.6" fill="#7dff9a"/><circle cx="33" cy="24" r="1.6" fill="#7dff9a"/>', '#efe4d6') },
  { name: 'Grid Tap', svg: gen('<path d="M26 6L12 28h10l-4 14 16-22H24z" fill="#c8a040"/>', '#f6ecd0') },
  { name: 'Idle Node', svg: gen('<circle cx="24" cy="24" r="12" fill="#3d9a45"/><path d="M18 24h12" stroke="#fff" stroke-width="3"/>', '#d6efd8') },
  { name: 'Process Hub', svg: gen('<circle cx="24" cy="24" r="9" fill="none" stroke="#667788" stroke-width="5" stroke-dasharray="5 3"/><circle cx="24" cy="24" r="3" fill="#667788"/>', '#e2e6ea') }
];
function start() {
    if (scene) scene.close();
    out.textContent = '';
    var g = gridSel.value;
    var grid = g === 'gens' ? { label: 'the REALITY ENGINE · your most advanced generator', correct: [4],
        cells: [GENS[0], GENS[1], GENS[2], GENS[3], GENS[4], GENS[5], GENS[6], GENS[7], GENS[8]] } : (g || undefined);
    scene = CaptchaScene.play(host, { grid: grid, state: SAMPLE, firstFail: warned.checked,
        onResult: function (r) {
            out.textContent = r.pass ? 'Passed: +' + DuckScene.fmt(r.energy) + ' E, +' + r.data + ' Data. ' + r.reason
                : r.outcome === 'warn' ? 'Warning (first failure, no penalty). ' + r.reason : 'Failed: −30% EPS for 90 s. ' + r.reason;
            if (!r.pass) warned.checked = true;
        } });
}
gridSel.onchange = function () { if (begun) start(); };
document.getElementById('replay').onclick = begin;`
});
fs.writeFileSync(path.join(ROOT, 'artifacts/captcha.html'), captchaPage);
const WORLD_BOARD_CSS = `
.board { padding-top: 170px; gap: 28px; }                 /* the world-event banner (up to ~200px) never covers the hud */
.board .hud { gap: 70px; }
.board .gens div.hit { border-color: #ff3366; color: #ff8aa0; }
.board .tag { display: block; margin-top: 6px; font-size: 26px; letter-spacing: 3px; color: #ff6a80; min-height: 22px; }
`;
function worldPage(key, title, accent, blurb, note) {
    return page({
        title: title,
        scene: 'src/world_scene.js',
        score: 'src/audio/score_world.js',
        extraCss: 'src/world_scene.css',
        extraInline: BOARD_CSS + WORLD_BOARD_CSS,
        accent: accent,
        gateLabel: 'OPEN THE BOARD',
        blurb: blurb,
        note: note + ' The board stays live underneath: keep clicking ACQUIRE.',
        controls: `<div class="grp"><button id="replay" type="button">${ic('bolt')} Trigger again</button></div>`,
        script: `
var KEY = '${key}', energy = 3.2e14, eps = 5e9, mult = 1, passive = true, combo = 1, pp = 'ONLINE', tickT = null, items = { cursor: 412, mill: 96, siphon: 18 };
var BOARD = '<div class="board" id="board"><div class="hud"><span>ENERGY<b id="en"></b></span><span>EPS<b id="eps"></b></span><span>COMBO<b id="cb"></b></span><span>CITY PP<b id="pp"></b></span></div>'
  + '<button class="acq" id="acq" type="button">ACQUIRE</button>'
  + '<div class="gens"><div id="g-cursor"><span>Cursor Farm</span><span id="n-cursor"></span></div><div id="g-mill"><span>Quantum Mill</span><span id="n-mill"></span></div><div id="g-siphon"><span>Void Siphon</span><span id="n-siphon"></span></div></div>'
  + '<div class="tip" id="tip"></div></div><div class="sceneLayer" id="layer"></div>';
function hud() {
    document.getElementById('en').textContent = DuckScene.fmt(energy);
    document.getElementById('eps').textContent = passive ? DuckScene.fmt(eps * mult) + (mult !== 1 ? ' ×' + mult : '') : 'PAUSED';
    document.getElementById('cb').textContent = '×' + combo;
    document.getElementById('pp').textContent = pp;
    ['cursor', 'mill', 'siphon'].forEach(function (k) { document.getElementById('n-' + k).textContent = '×' + items[k]; });
}
function start() {
    if (scene) scene.close();
    clearInterval(tickT);
    energy = 3.2e14; mult = 1; passive = true; combo = 1; pp = 'ONLINE'; items = { cursor: 412, mill: 96, siphon: 18 }; out.textContent = '';
    host.innerHTML = '';
    var tmp = document.createElement('div'); tmp.innerHTML = BOARD;
    DuckScene.fit(host, tmp.firstChild);
    host.appendChild(tmp.firstChild);
    document.getElementById('tip').textContent = 'A world event is coming…';
    hud();
    tickT = setInterval(function () { if (passive) energy += eps * mult / 10; hud(); }, 100);
    document.getElementById('acq').onclick = function (e) {
        energy += eps * 0.2 * combo; hud();
        if (scene && scene.click) scene.click(e.clientX, e.clientY);
    };
    setTimeout(trigger, 1200);
}
function trigger() {
    if (scene) scene.close();
    var layer = document.getElementById('layer');
    scene = WorldScene.play(layer, { event: KEY, state: { energy: energy, eps: eps },
        victim: { id: 'mill', name: 'Quantum Mill', count: items.mill },
        onStart: function (ev) {
            if (KEY === 'surge') mult = ev.mult;
            if (KEY === 'purge') mult = 2;
            if (KEY === 'corrupt') mult = 5;
            if (KEY === 'freeze') passive = false;
            if (KEY === 'cascade') combo = 4;
            if (KEY === 'strike') pp = 'OFFLINE';
            document.getElementById('tip').textContent = 'World event: ' + ev.label;
            hud();
        },
        onEnergy: function (d) { energy = Math.max(0, energy + d); hud(); },
        onCorrupt: function (id, lost) { items[id] = Math.max(0, items[id] - lost); var g = document.getElementById('g-' + id); if (g) g.classList.add('hit'); hud(); },
        onEnd: function (r) {
            mult = 1; passive = true; combo = 1; pp = 'ONLINE'; hud();
            out.textContent = r.summary;
            document.getElementById('tip').textContent = r.summary + ' (Trigger again to replay.)';
        } });
}
document.getElementById('replay').onclick = function () { if (!begun) begin(); else trigger(); };`
    });
}
const WORLD = [
    ['surge', 'Quantum Surge', '#44ffcc', 'A surge of anomalous output: +300% for 20 seconds.', 'Energy streams up the edges and the banner counts the extra.'],
    ['storm', 'Data Storm', '#aaaaff', 'A packet breach: seven data orbs drift over the board for 14 seconds.', 'Catch the orbs before they float away: each catch plays the next note up.'],
    ['strike', 'Walker Strike', '#ff5566', 'The walkers stop working: City PP is offline for 16 seconds.', 'Click a striker to talk them down with a coffee. Settle all six and the strike ends early.'],
    ['cascade', 'Momentum Cascade', '#ffaa44', 'Fast clicking tips into a cascade: combo locked at ×4 for 10 seconds.', 'Click ACQUIRE: your clicks play the tune.'],
    ['corrupt', 'Corrupt Packet', '#ff3366', 'A corrupt packet: a burst of 30 seconds of output, but one generator starts corrupting.', 'Hit QUARANTINE within 3 seconds to lose only half as many.'],
    ['freeze', 'Time Freeze', '#88ddff', 'Time stops for 12 seconds: passive income pauses and only clicks count.', 'Click ACQUIRE: every click is a crystal.'],
    ['purge', 'Memory Purge', '#33c8ff', 'A memory purge: energy is halved, then output doubles for 30 seconds.', 'Watch the number get deleted. Then click ACQUIRE: every click restores a 1% fragment of what was purged, up to half.']
];
WORLD.forEach(function (w) { fs.writeFileSync(path.join(ROOT, 'artifacts/world_' + w[0] + '.html'), worldPage(w[0], w[1], w[2], w[3], w[4])); });
fs.writeFileSync(path.join(ROOT, 'artifacts/ducky_council.html'), council);
fs.writeFileSync(path.join(ROOT, 'artifacts/duck_tribunal.html'), tribunal);
console.log('built', council.length, tribunal.length);
