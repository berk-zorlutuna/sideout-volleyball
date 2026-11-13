// Plays live matches with a scripted "human" that uses only the real key inputs, and reports how points are won.
// Usage: node tests/balance.js [points per level]     (THREE_PATH as for verify.js)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');

// Runs inside the page. profile: {miss: chance to skip a touch, jitter: max extra frames before a press, attack: 'hit' | 'jump+hit' | 'none', aim: bool}
function playInPage({ level, points, profile }) {
  const s = __sideout, key = (t, c) => window.dispatchEvent(new KeyboardEvent(t, { code: c }));
  document.getElementById(level).checked = true;
  if (!document.getElementById('menu').hidden) document.getElementById('btnStart').click(); else document.getElementById('btnAgain').click();
  const r = { level, won: 0, lost: 0, how: {}, frames: 0 };
  let sc = s.score.slice(), lastPlan = null, skip = false, wait = 0, held = null, jumped = false, pressedAt = -9, title = '';
  const release = () => { if (held) { key('keyup', held); held = null; } };
  while (r.won + r.lost < points && r.frames < 3e6) {
    s.step(1); r.frames++;
    const c = s.score, d0 = c[0] - sc[0], d1 = c[1] - sc[1];
    if (d0 === 1 || d1 === 1) { title = document.querySelector('#banner strong').textContent; const k = (d0 ? 'won: ' : 'lost: ') + title; r.how[k] = (r.how[k] || 0) + 1; if (d0) r.won++; else r.lost++; release(); }
    sc = c.slice();
    if (s.state === 'over') { document.getElementById('btnAgain').click(); sc = s.score.slice(); continue; }
    if (s.state === 'serve') { if (s.servePow > 0.72 && s.servePow < 0.86) key('keydown', 'KeyJ'); continue; }
    const pl = s.plan; if (s.state !== 'rally' || !pl || pl.team !== s.home || !pl.player || !pl.I) { lastPlan = pl; continue; }
    if (pl !== lastPlan) { lastPlan = pl; skip = Math.random() < profile.miss; wait = Math.floor(Math.random() * (profile.jitter + 1)); jumped = false; release();
      if (profile.aim && pl.count >= 1) { held = Math.random() < 0.5 ? 'ArrowLeft' : 'ArrowRight'; } }
    if (skip || (pl.out && pl.count === 0)) continue;
    const p = pl.player, b = s.ball, tl = pl.I.t - s.now, dist = Math.hypot(b.x - p.x, b.z - p.z), dy = b.y - p.y;
    if (held && tl < 0.6) key('keydown', held);
    if (pl.count === 2 && pl.h >= 3) {
      if (profile.attack === 'jump+hit') { if (!jumped && tl <= 0.36) { key('keydown', 'Space'); jumped = true; } }
      else if (profile.attack === 'hit') { if (tl <= 0.4 && s.now - pressedAt > 0.6) { if (wait-- > 0) continue; key('keydown', 'KeyJ'); pressedAt = s.now; } continue; }
    }
    if (dist < 1.0 && dy > 0.2 && dy < 2.5 && s.now - pressedAt > 0.5) { if (wait-- > 0) continue; key('keydown', 'KeyJ'); pressedAt = s.now; }
  }
  release();
  return r;
}

async function run(points, profiles) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 450 } });
  if (process.env.THREE_PATH) await page.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(process.env.THREE_PATH), contentType: 'application/javascript' }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(PAGE); await page.waitForFunction(() => window.__sideout);
  const out = [];
  for (const [name, profile] of Object.entries(profiles)) for (const level of ['dRookie', 'dPro', 'dStar']) {
    const r = await page.evaluate(playInPage, { level, points, profile }); r.profile = name; out.push(r);
  }
  await browser.close();
  return out;
}
const PROFILES = {
  careful: { miss: 0, jitter: 2, attack: 'hit', aim: true },        // times every touch, one-button attack, holds a direction to aim
  manual: { miss: 0, jitter: 2, attack: 'jump+hit', aim: true },    // same, but jumps with Space before hitting
  casual: { miss: 0.08, jitter: 6, attack: 'hit', aim: false },     // misses 1 touch in 12, slower presses, never aims
  beginner: { miss: 0.2, jitter: 12, attack: 'hit', aim: false },   // misses 1 touch in 5, slow presses
};
module.exports = { run, PROFILES, playInPage };
if (require.main === module) run(+process.argv[2] || 150, PROFILES).then(o => { for (const r of o) console.log(r.profile.padEnd(8), r.level.padEnd(8), `${r.won}-${r.lost}`, (100 * r.won / (r.won + r.lost)).toFixed(0) + '%', JSON.stringify(r.how)); });
