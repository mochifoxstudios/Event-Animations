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

const PAGE_CSS = `
/* A viewer for one in-game event. Single dark look on purpose: it is the game's screen. */
:root { --bg: #050407; --bar: #0d0b10; --line: #26222c; --fg: #c9c4d4; --muted: #8a8496; --ok: #8fd69a; color-scheme: dark; }
html, body { height: 100%; }
body { background: var(--bg); color: var(--fg); font-family: 'Courier New', monospace; }
.viewer { min-height: 100%; display: flex; flex-direction: column; }
.ctl { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; padding: 10px 16px; background: var(--bar); border-bottom: 1px solid var(--line); font-size: 12px; }
.ctl h1 { margin: 0; font-size: 12px; letter-spacing: 4px; font-weight: 900; color: var(--fg); }
.ctl .grp { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.ctl label { color: var(--muted); letter-spacing: 1px; }
.ctl select, .ctl button { font: inherit; font-size: 12px; color: var(--fg); background: var(--bg); border: 1px solid var(--line); border-radius: 4px; padding: 5px 8px; max-width: 100%; }
.ctl button { cursor: pointer; font-weight: 700; letter-spacing: 1px; }
.ctl button:hover, .ctl button:focus-visible { border-color: var(--fg); outline: none; }
.ctl .note { flex-basis: 100%; color: var(--muted); font-size: 11px; line-height: 1.5; }
.ctl .out { color: var(--ok); }
.stagehost { position: relative; flex: 1; display: flex; min-height: 620px; }
.stagehost > .dks { flex: 1; }
.gate { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 32px 16px; text-align: center; }
.gate h2 { margin: 0; font-size: clamp(20px, 4vw, 30px); letter-spacing: 8px; color: var(--accent); }
.gate p { margin: 0; max-width: 34rem; color: var(--muted); font-size: 13px; line-height: 1.6; }
.gate button { font: inherit; font-size: 14px; font-weight: 900; letter-spacing: 4px; padding: 14px 28px; color: var(--accent); background: transparent; border: 1px solid var(--accent); border-radius: 6px; cursor: pointer; }
.gate button:hover, .gate button:focus-visible { background: rgba(255,255,255,0.06); outline: none; }
`;

function page({ title, scene, score, accent, blurb, controls, script, note, extraCss, extraInline, gateLabel }) {
    return `<title>${title}</title>
<style>${PAGE_CSS}
${extraCss ? read(extraCss) : ''}
${extraInline || ''}
:root { --accent: ${accent}; }
${CSS}</style>
<div class="viewer">
  <div class="ctl">
    <h1>${title.toUpperCase()}</h1>
    ${controls}
    <div class="grp"><button id="snd" type="button" aria-pressed="true">♪ Sound on</button>
      <label><input type="checkbox" id="safe"> safe mode (no motion)</label></div>
    <span class="out" id="out" aria-live="polite"></span>
    <div class="note">${note}</div>
  </div>
  <div class="stagehost" id="host">
    <div class="gate"><h2>${title.toUpperCase()}</h2><p>${blurb}</p>
      <button id="go" type="button">${gateLabel || '▶ PLAY WITH SOUND'}</button></div>
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
    snd.textContent = m ? '♪ Sound off' : '♪ Sound on';
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
      <button id="replay" type="button">▶ Replay</button></div>`,
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
      <button id="replay" type="button">▶ Replay</button></div>`,
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
.board .hud { display: flex; gap: 90px; justify-content: center; font-size: 22px; letter-spacing: 6px; color: var(--muted); }
.board .hud b { display: block; margin-top: 6px; font-size: 56px; letter-spacing: 3px; color: var(--fg); font-variant-numeric: tabular-nums; }
.board .acq { width: 380px; height: 380px; border-radius: 50%; border: 4px solid #ffcc55; background: radial-gradient(circle at 40% 35%, rgba(255,204,85,0.28), rgba(255,204,85,0.04) 70%); color: #ffcc55; font: inherit; font-weight: 900; font-size: 34px; letter-spacing: 10px; cursor: pointer; box-shadow: 0 0 90px -30px #ffcc55; transition: transform 0.08s; }
.board .acq:active { transform: scale(0.95); }
.board .acq:disabled { opacity: 0.15; cursor: default; }
.board .gens { display: grid; grid-template-columns: repeat(3, 320px); gap: 20px; font-size: 22px; letter-spacing: 2px; color: var(--muted); }
.board .gens div { border: 1px solid var(--line); border-radius: 8px; padding: 16px 22px; display: flex; justify-content: space-between; }
.board .tip { font-size: 22px; letter-spacing: 3px; color: var(--muted); text-align: center; max-width: 1400px; }
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
    gateLabel: '▶ OPEN THE BOARD',
    blurb: 'At one million clicks the game stops and asks why. Four answers, each with a permanent mark. Click ACQUIRE to reach one million yourself.',
    note: 'Hover an answer to preview its mark; press and hold to choose. After CONTINUE the board keeps the mark. VOID disables ACQUIRE for the rest of the run, as in the game.',
    controls: `<div class="grp"><button id="trigger" type="button">⚡ Trigger now</button><button id="replay" type="button">↺ Reset board</button></div>`,
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
      <button id="replay" type="button">▶ Replay</button></div>`,
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
      <button id="replay" type="button">▶ Replay</button></div>`,
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
    gateLabel: '▶ JOIN THE MEETING',
    blurb: 'You are close to another reset. The Simulation Overseers would like a quick chat. They have hold music.',
    note: 'SIGN, DECLINE, or ASK FOR MORE once: you go on hold and they come back with a better offer or their final one. Read the fine print on the letter. In the game, signing closes the game and the package is paid on next launch.',
    controls: `<div class="grp"><label for="neg">Asking for more</label><select id="neg"><option value="">Random (65% raised)</option>
        <option value="raised">They raise it</option><option value="final">Final offer</option></select>
      <button id="replay" type="button">▶ Replay</button></div>`,
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
.board .cpu { position: absolute; left: 40px; bottom: 40px; width: 300px; padding: 16px 20px; border: 1px solid rgba(30,120,30,0.6); border-radius: 8px; background: rgba(0,10,0,0.9); font-size: 20px; letter-spacing: 2px; color: #6fdc6f; text-align: left; }
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
    gate: '▶ OPEN THE BOARD',
    blurb: 'At 13,333, 66,666 and 123,456 clicks the simulation crashes. Or seems to. Click CLICK to get there.',
    note: 'The stop code is TOO_MANY_CLICKS, so clicking during the crash is noticed, and enough clicks end it early. The reveal pays +50% energy.',
    controls: `<div class="grp"><label for="ms">Milestone</label><select id="ms"><option>13333</option><option>66666</option><option>123456</option></select>
      <button id="trigger" type="button">⚡ Crash now</button><button id="replay" type="button">↺ Reset board</button></div>`,
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
    gate: '▶ OPEN THE BOARD',
    blurb: 'The System Diagnostics CPU meter is climbing. At 100% the simulation overheats and crashes, and something is left behind the crash screen.',
    note: 'Hold OVERCLOCK to push the CPU, or wait. After the crash, the screen cracks open: claim the ×25 EPS dividend before the gap cools shut (20 s).',
    controls: `<div class="grp"><button id="trigger" type="button">⚡ Overheat now</button><button id="replay" type="button">↺ Reset board</button></div>`,
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
fs.writeFileSync(path.join(ROOT, 'artifacts/ducky_council.html'), council);
fs.writeFileSync(path.join(ROOT, 'artifacts/duck_tribunal.html'), tribunal);
console.log('built', council.length, tribunal.length);
