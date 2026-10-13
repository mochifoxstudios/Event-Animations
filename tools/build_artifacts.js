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
fs.writeFileSync(path.join(ROOT, 'artifacts/ducky_council.html'), council);
fs.writeFileSync(path.join(ROOT, 'artifacts/duck_tribunal.html'), tribunal);
console.log('built', council.length, tribunal.length);
