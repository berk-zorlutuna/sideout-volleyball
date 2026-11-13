// Automated verification for Sideout Volleyball. See docs/verification-cases.md.
// Usage: node tests/verify.js            (needs `playwright`; set THREE_PATH to a local three.min.js r128 if the CDN is unreachable)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const THREE_PATH = process.env.THREE_PATH;
const results = [];
const rec = (id, pass, detail) => { results.push({ id, result: pass ? 'PASS' : 'FAIL', detail }); console.log(id, pass ? 'PASS' : 'FAIL', '-', detail); };

async function open(browser, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  if (THREE_PATH) await page.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(THREE_PATH), contentType: 'application/javascript' }));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(PAGE);
  await page.waitForFunction(() => window.__sideout, null, { timeout: 15000 });
  await page.waitForTimeout(500);
  return { ctx, page, errors };
}
const vis = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && e.getClientRects().length > 0; }, sel);
// Advance the simulation until the serve can be taken, stop the needle near `target` %, then serve.
async function serveAt(page, lo, hi) {
  await page.waitForFunction(() => !document.getElementById('meter').hidden, null, { timeout: 15000 });
  await page.waitForFunction(([a, b]) => { const l = parseFloat(document.getElementById('needle').style.left) || 0;
    if (l >= a && l <= b) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); return true; } return false; }, [lo, hi], { polling: 'raf', timeout: 20000 });
  return page.evaluate(() => ({ state: __sideout.state, out: __sideout.plan && __sideout.plan.out, land: __sideout.plan && __sideout.plan.land }));
}

(async () => {
  const browser = await chromium.launch();

  /* ---- desktop, attract mode ---- */
  let { ctx, page, errors } = await open(browser, { viewport: { width: 1280, height: 720 } });
  rec('VC-01', errors.length === 0 && await page.evaluate(() => typeof THREE === 'object'), 'page errors: ' + errors.length);
  const menu = await vis(page, '#menu'), bug = await vis(page, '#bug');
  const s0 = await page.evaluate(() => __sideout.state);
  rec('VC-02', menu && !bug && ['serve', 'rally', 'point'].includes(s0), `menu=${menu} scorebug=${bug} state=${s0}`);
  const counts = await page.evaluate(() => [__sideout.home.players.length, __sideout.away.players.length]);
  rec('VC-03', counts[0] === 6 && counts[1] === 6, 'players per side: ' + counts.join(' / '));

  // Soak: computer v computer, checking rule invariants every simulated frame.
  const soak = await page.evaluate(() => {
    const s = __sideout, N = 600000, r = { steps: N, points: 0, badPoints: 0, maxTouches: 0, doubleTouch: 0, touchesChecked: 0, sideViol: 0, netCross: 0, netViol: 0,
      sideouts: 0, holds: 0, rotBad: 0, sets: [], badSets: 0, matches: 0, badMatch: 0 };
    let sc = s.score.slice(), pt = s.ball.touches, ps = s.ball.side, pToucher = s.ball.lastToucher, pz = s.ball.z, pstate = s.state, server = null;
    let oh = s.home.players.slice(), oa = s.away.players.slice();
    const same = (a, b) => a.every((x, i) => x === b[i]);
    for (let i = 0; i < N; i++) {
      s.step(1);
      const st = s.state, b = s.ball, c = s.score;
      if (pstate === 'serve' && st !== 'serve') server = b.lastTeam;
      if (st === 'rally' || pstate === 'rally') {
        if (b.touches > r.maxTouches) r.maxTouches = b.touches;
        if (b.side === ps && b.touches === pt + 1 && pt >= 1 && pt < 3) { r.touchesChecked++; if (b.lastToucher === pToucher) r.doubleTouch++; }
        if (pstate === 'rally' && (pz >= 0) !== (b.z >= 0) && Math.abs(b.x) < 5.1) { r.netCross++; if (b.y < 2.43 - 0.3) r.netViol++; }
      }
      for (const p of s.home.players) if (p.z < 0.449) r.sideViol++;
      for (const p of s.away.players) if (p.z > -0.449) r.sideViol++;
      const dh = c[0] - sc[0], da = c[1] - sc[1];
      if (dh || da) {
        if ((dh === 1 && da === 0) || (dh === 0 && da === 1)) {
          r.points++;
          const w = dh ? s.home : s.away, wo = dh ? oh : oa, lo = dh ? oa : oh, l = dh ? s.away : s.home;
          if (w !== server) { r.sideouts++; if (!same(w.players, wo.slice(1).concat(wo[0])) || !same(l.players, lo)) r.rotBad++; }
          else { r.holds++; if (!same(w.players, wo) || !same(l.players, lo)) r.rotBad++; }
          if (c[2] + c[3] > sc[2] + sc[3]) { const hi = Math.max(c[0], c[1]), lw = Math.min(c[0], c[1]); r.sets.push(c[0] + '-' + c[1]); if (hi < 15 || hi - lw < 2) r.badSets++;
            if (Math.max(c[2], c[3]) > 2) r.badMatch++; }
        } else if (c[0] === 0 && c[1] === 0) { if (c[2] === 0 && c[3] === 0) { r.matches++; if (Math.max(sc[2], sc[3]) !== 2) r.badMatch++; } }
        else r.badPoints++;
        oh = s.home.players.slice(); oa = s.away.players.slice();
      }
      sc = c.slice(); pt = b.touches; ps = b.side; pToucher = b.lastToucher; pz = b.z; pstate = st;
    }
    return r;
  });
  console.log('soak', JSON.stringify(soak));
  rec('VC-04', soak.points > 100 && soak.badPoints === 0, `${soak.points} points, ${soak.badPoints} irregular score changes`);
  rec('VC-05', soak.sets.length > 0 && soak.badSets === 0, `${soak.sets.length} sets ended (${soak.sets.join(', ')}), ${soak.badSets} ended early`);
  rec('VC-06', soak.matches > 0 && soak.badMatch === 0, `${soak.matches} matches completed, ${soak.badMatch} not ended at 2 sets`);
  rec('VC-07', soak.maxTouches <= 3, 'max touch counter observed: ' + soak.maxTouches);
  rec('VC-08', soak.touchesChecked > 50 && soak.doubleTouch === 0, `${soak.touchesChecked} consecutive team touches, ${soak.doubleTouch} by the same player`);
  rec('VC-09', soak.sideouts > 5 && soak.holds > 5 && soak.rotBad === 0, `${soak.sideouts} side-outs, ${soak.holds} service holds, ${soak.rotBad} wrong line-ups`);
  rec('VC-10', soak.sideViol === 0, 'player-frames across the centre line: ' + soak.sideViol);
  rec('VC-11', soak.netCross > 50 && soak.netViol === 0, `${soak.netCross} net crossings, ${soak.netViol} below net height`);
  rec('VC-12', errors.length === 0, 'page errors after soak: ' + errors.length);

  /* ---- desktop, live match ---- */
  await page.check('#dPro', { force: true });
  await page.click('#btnStart');
  await page.waitForTimeout(300);
  const live = await page.evaluate(() => ({ sc: __sideout.score, lbl: document.getElementById('setLbl').textContent, srvH: document.getElementById('srvH').classList.contains('on'),
    srvA: document.getElementById('srvA').classList.contains('on'), ptsH: document.getElementById('ptsH').textContent, ptsA: document.getElementById('ptsA').textContent }));
  rec('VC-13', !(await vis(page, '#menu')) && await vis(page, '#bug') && live.sc.join() === '0,0,0,0' && live.lbl === 'SET 1' && live.srvH && !live.srvA && live.ptsH === '0' && live.ptsA === '0',
    JSON.stringify(live));
  await page.waitForFunction(() => !document.getElementById('meter').hidden, null, { timeout: 15000 });
  const hint = await page.evaluate(() => document.getElementById('hint').textContent);
  rec('VC-14', /^Your serve/.test(hint), 'hint: "' + hint + '"');
  // move the server along the baseline
  const x0 = await page.evaluate(() => __sideout.home.players[0].x);
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(600); await page.keyboard.up('ArrowLeft');
  const x1 = await page.evaluate(() => __sideout.home.players[0].x);
  rec('VC-15', x1 < x0 - 0.3, `server x ${x0.toFixed(2)} -> ${x1.toFixed(2)}`);
  // pause
  await page.keyboard.press('KeyP');
  const pOn = await vis(page, '#pause'); const n1 = await page.evaluate(() => document.getElementById('needle').style.left);
  await page.waitForTimeout(500); const n2 = await page.evaluate(() => document.getElementById('needle').style.left);
  await page.keyboard.press('KeyP'); const pOff = !(await vis(page, '#pause'));
  await page.waitForTimeout(300); const n3 = await page.evaluate(() => document.getElementById('needle').style.left);
  rec('VC-16', pOn && n1 === n2 && pOff && n3 !== n2, `overlay shown=${pOn}, needle frozen=${n1 === n2}, resumed=${pOff && n3 !== n2}`);
  // serve in the green
  const sv = await serveAt(page, 72, 88);
  rec('VC-17', sv.state === 'rally' && sv.out === false && sv.land.z < 0 && sv.land.z > -9.2 && Math.abs(sv.land.x) < 4.7, `state=${sv.state} predicted landing x=${sv.land.x.toFixed(2)} z=${sv.land.z.toFixed(2)} out=${sv.out}`);
  // jump during the rally: only the user can make a home player leave the floor
  await page.waitForTimeout(250);
  await page.keyboard.press('Space'); await page.waitForTimeout(150);
  const air = await page.evaluate(() => Math.max(...__sideout.home.players.map(p => p.y)));
  rec('VC-18', air > 0.3, 'highest home player y after Space: ' + air.toFixed(2) + ' m');
  // sound toggle label
  const b1 = await page.textContent('#btnSound'); await page.click('#btnSound'); const b2 = await page.textContent('#btnSound');
  rec('VC-19', b1 === 'Sound on' && b2 === 'Sound off', `"${b1}" -> "${b2}"`);
  // play the match out: the user only serves, never plays the ball
  const fin = await page.evaluate(() => { const s = __sideout; let n = 0;
    while (s.state !== 'over' && n < 400000) { s.step(20); n += 20; if (s.state === 'serve') window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); }
    return { state: s.state, sc: s.score, steps: n }; });
  await page.waitForTimeout(200);
  const ot = await page.textContent('#overTitle'), os = await page.textContent('#overSets');
  rec('VC-21', fin.state === 'over' && await vis(page, '#over') && Math.max(fin.sc[2], fin.sc[3]) === 2 && /(You win|CPU wins) 2–[01]/.test(ot), `title "${ot}", sets "${os.trim()}", sets won ${fin.sc[2]}-${fin.sc[3]}`);
  await page.click('#btnAgain'); await page.waitForTimeout(200);
  const again = await page.evaluate(() => ({ sc: __sideout.score, state: __sideout.state }));
  rec('VC-22', !(await vis(page, '#over')) && again.sc.join() === '0,0,0,0' && again.state === 'serve', JSON.stringify(again));
  // over-hit serve goes long (the home side serves first in the new match)
  const over = await serveAt(page, 96, 100);
  rec('VC-20', over.out === true && over.land.z < -9.13, `predicted landing z=${over.land.z.toFixed(2)} out=${over.out}`);
  await page.keyboard.press('KeyP'); await page.click('#btnQuit'); await page.waitForTimeout(200);
  rec('VC-23', await vis(page, '#menu') && !(await vis(page, '#bug')), 'menu shown after Quit to menu');
  rec('VC-24', errors.length === 0, 'page errors after live match: ' + errors.length + (errors[0] ? ' ' + errors[0] : ''));
  await ctx.close();

  /* ---- phone ---- */
  ({ ctx, page, errors } = await open(browser, { viewport: { width: 400, height: 800 }, hasTouch: true, isMobile: true }));
  const ph = await page.evaluate(() => { const r = document.getElementById('btnStart').getBoundingClientRect();
    return { sw: document.documentElement.scrollWidth, iw: innerWidth, btn: r.left >= 0 && r.right <= innerWidth && r.width > 0, coarse: matchMedia('(pointer:coarse)').matches }; });
  rec('VC-25', ph.sw <= ph.iw && ph.btn, `scrollWidth ${ph.sw} <= viewport ${ph.iw}, Start button inside viewport=${ph.btn}`);
  await page.tap('#btnStart'); await page.waitForTimeout(300);
  const tv = await vis(page, '#tHit') && await vis(page, '#tJump') && await vis(page, '#stick');
  await page.waitForFunction(() => !document.getElementById('meter').hidden, null, { timeout: 15000 });
  await page.tap('#tHit'); await page.waitForTimeout(100);
  const ts = await page.evaluate(() => __sideout.state);
  rec('VC-26', ph.coarse && tv && ts === 'rally', `coarse pointer=${ph.coarse}, touch controls visible=${tv}, state after tapping Hit=${ts}`);
  rec('VC-27', errors.length === 0, 'page errors on phone: ' + errors.length);
  await ctx.close();

  /* ---- iPad (desktop-class Safari user agent, touch, no coarse-pointer hint) ---- */
  const IPAD_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
  ({ ctx, page, errors } = await open(browser, { viewport: { width: 1194, height: 834 }, hasTouch: true, userAgent: IPAD_UA, deviceScaleFactor: 2 }));
  await page.tap('#btnStart'); await page.waitForTimeout(300);
  await page.waitForFunction(() => !document.getElementById('meter').hidden, null, { timeout: 15000 });
  const ip = await page.evaluate(() => { const r = id => document.getElementById(id).getBoundingClientRect(), hit = r('tHit'), jmp = r('tJump'), hint = r('hint'), W = innerWidth, H = innerHeight;
    const inside = q => q.left >= 0 && q.top >= 0 && q.right <= W && q.bottom <= H && q.width > 0, apart = (a, b) => a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top;
    return { touchClass: document.body.classList.contains('touch'), hint: document.getElementById('hint').textContent, inside: inside(hit) && inside(jmp) && inside(hint),
      apart: apart(hit, jmp) && apart(hit, hint) && apart(jmp, hint), size: Math.round(hit.width), sw: document.documentElement.scrollWidth, W }; });
  rec('VC-28', ip.touchClass && await vis(page, '#tHit') && await vis(page, '#stick') && /press Hit/.test(ip.hint), `touch mode=${ip.touchClass}, hint "${ip.hint}"`);
  rec('VC-29', ip.inside && ip.apart && ip.size >= 88 && ip.sw <= ip.W, `controls inside viewport=${ip.inside}, no overlap=${ip.apart}, Hit button ${ip.size}px, scrollWidth ${ip.sw}/${ip.W}`);
  await page.screenshot({ path: process.env.SHOT || '/dev/null' }).catch(() => {});
  // two fingers at once: drag the stick left with one pointer, tap Hit with another
  const mt = await page.evaluate(async () => { const s = __sideout, st = document.getElementById('stick'), r = st.getBoundingClientRect(), x0 = s.home.players[0].x;
    const ev = (el, t, id, x, y) => el.dispatchEvent(new PointerEvent(t, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true }));
    ev(st, 'pointerdown', 11, r.left + 120, r.top + 200); ev(st, 'pointermove', 11, r.left + 60, r.top + 200);
    s.step(40); const x1 = s.home.players[0].x;
    ev(document.getElementById('tHit'), 'pointerdown', 12, 0, 0); const state = s.state; s.step(5);
    ev(st, 'pointerup', 11, r.left + 60, r.top + 200); return { x0, x1, state }; });
  rec('VC-30', mt.x1 < mt.x0 - 0.5 && mt.state === 'rally', `server x ${mt.x0.toFixed(2)} -> ${mt.x1.toFixed(2)} while stick held, state after Hit=${mt.state}`);
  await page.setViewportSize({ width: 834, height: 1194 }); await page.waitForTimeout(300);
  const pr = await page.evaluate(() => { const c = document.getElementById('view'), r = id => document.getElementById(id).getBoundingClientRect(), h = r('tHit');
    return { cw: c.clientWidth, ch: c.clientHeight, W: innerWidth, H: innerHeight, sw: document.documentElement.scrollWidth, hitIn: h.right <= innerWidth && h.bottom <= innerHeight }; });
  rec('VC-31', pr.cw === pr.W && pr.ch === pr.H && pr.sw <= pr.W && pr.hitIn, `after rotating to portrait: canvas ${pr.cw}x${pr.ch} in ${pr.W}x${pr.H}, Hit inside=${pr.hitIn}`);
  const heads = await page.evaluate(() => ({ cap: !!document.querySelector('meta[name="apple-mobile-web-app-capable"][content="yes"]'), icon: !!document.querySelector('link[rel="apple-touch-icon"]'),
    man: !!document.querySelector('link[rel="manifest"]'), vp: document.querySelector('meta[name="viewport"]').content }));
  const files = ['manifest.webmanifest', 'icon-180.png', 'icon-512.png'].every(f => fs.existsSync(path.resolve(__dirname, '..', f)));
  rec('VC-32', heads.cap && heads.icon && heads.man && /user-scalable=no/.test(heads.vp) && /viewport-fit=cover/.test(heads.vp) && files, `home-screen meta=${heads.cap}, icon link=${heads.icon}, manifest link=${heads.man}, files present=${files}`);
  rec('VC-33', errors.length === 0, 'page errors on iPad profile: ' + errors.length + (errors[0] ? ' ' + errors[0] : ''));
  await ctx.close();

  await browser.close();

  /* ---- scoring balance: scripted players using the real key inputs (see tests/balance.js) ---- */
  const bal = await require('./balance.js').run(150, { careful: require('./balance.js').PROFILES.careful, casual: require('./balance.js').PROFILES.casual, beginner: require('./balance.js').PROFILES.beginner });
  const pct = (pr, lv) => { const r = bal.find(x => x.profile === pr && x.level === lv); return Math.round(100 * r.won / (r.won + r.lost)); };
  const row = pr => ['dRookie', 'dPro', 'dStar'].map(l => pct(pr, l) + '%').join(' / ');
  rec('VC-34', pct('careful', 'dRookie') >= 60, 'aiming player (holds a direction on every set and attack), Rookie / Pro / All-Star: ' + row('careful'));
  rec('VC-35', pct('casual', 'dRookie') >= 50 && pct('beginner', 'dRookie') >= 30, 'casual: ' + row('casual') + '; beginner: ' + row('beginner'));
  rec('VC-36', pct('careful', 'dRookie') > pct('careful', 'dPro') && pct('careful', 'dPro') > pct('careful', 'dStar') && pct('casual', 'dRookie') > pct('casual', 'dStar'), 'win rate falls from Rookie to All-Star');
  const out = { date: new Date().toISOString(), browser: 'Chromium ' + browser.version(), soak, balance: bal, results };
  if (process.env.RESULTS) fs.writeFileSync(process.env.RESULTS, JSON.stringify(out, null, 2));
  const failed = results.filter(r => r.result !== 'PASS').length;
  console.log(`${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
