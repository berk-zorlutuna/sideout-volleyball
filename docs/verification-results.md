# Software Verification Results

Result: **27 of 27 cases passed.** Ten requirements have no case and remain unverified; see the end of this page.

## Run record

| Item | Value |
|---|---|
| Date | 2026-11-11 15:18 UTC |
| Item under test | `index.html` as committed in `1dc844f` |
| Procedure | `node tests/verify.js`, cases defined in [verification-cases.md](verification-cases.md) |
| Browser | Chromium 153.0.8010.12, headless, software rendering |
| Driver | Playwright 1.63.0, Node.js 22 |
| Host | Linux 6.18 cloud container |

Departures from the real operating environment:

- three.js r128 was served from a local copy of the npm package `three@0.128.0`, because the test host cannot reach cdnjs. Loading from the CDN itself was not tested.
- Google Fonts was blocked, so the page ran on fallback fonts.
- No real GPU, keyboard, touchscreen or audio device was involved; input was injected and touch was emulated.

## Results

| Case | Result | Observed |
|---|---|---|
| VC-01 | Pass | three.js loaded, 0 page errors |
| VC-02 | Pass | Menu visible, scoreboard hidden, state serve |
| VC-03 | Pass | 6 and 6 players |
| VC-04 | Pass | 216 points, 0 irregular score changes |
| VC-05 | Pass | 8 sets: 12–15, 15–13, 15–7, 15–9, 15–7, 15–8, 15–12, 15–8; none ended early |
| VC-06 | Pass | 3 matches completed, all ended with a team on 2 sets |
| VC-07 | Pass | Highest touch count seen: 3 |
| VC-08 | Pass | 4,781 second or third touches, 0 by the previous toucher |
| VC-09 | Pass | 113 side-outs and 103 holds, 0 wrong line-ups |
| VC-10 | Pass | 0 player-frames across or too near the centre line |
| VC-11 | Pass | 2,788 net crossings, 0 below net height |
| VC-12 | Pass | 0 page errors after 600,000 frames |
| VC-13 | Pass | 0–0, "SET 1", server marker on the user's side |
| VC-14 | Pass | Hint: "Your serve. Slide with ◀ ▶, then press J with the needle in the green." |
| VC-15 | Pass | Server x moved from 3.00 to 1.60 |
| VC-16 | Pass | Pause screen shown, needle frozen, resumed |
| VC-17 | Pass | Rally started; predicted landing x = 0.90, z = −8.62, in |
| VC-18 | Pass | Player 0.60 m off the floor after Space |
| VC-19 | Pass | "Sound on" changed to "Sound off" |
| VC-20 | Pass | Predicted landing z = −9.59, flagged out |
| VC-21 | Pass | "CPU wins 2–0", sets 0–15 and 0–15 |
| VC-22 | Pass | 0–0, state serve after Play again |
| VC-23 | Pass | Menu shown after Quit to menu |
| VC-24 | Pass | 0 page errors after the live match |
| VC-25 | Pass | Document width 400 in a 400 px viewport; Start button inside |
| VC-26 | Pass | Coarse pointer detected, touch controls visible, Hit tap started the rally |
| VC-27 | Pass | 0 page errors on phone |

The soak in section B is random, so its counts differ from run to run.

## Earlier runs

Two runs before this one reported failures. Both were faults in the test script, and `index.html` was not changed between runs.

- Run 1 used a 120,000-frame soak, which was too short to finish a match (VC-06) or reach the point count the script demanded (VC-04). The soak was lengthened to 600,000 frames.
- Runs 1 and 2 tried to reach VC-20 by waiting for the user's side to win back the serve. With the user never playing the ball, the Pro opponent held serve for the whole match, so the case was never reached. It now runs on the first serve of a new match.

One observation from run 2 is worth keeping: the Pro opponent served 30 times in a row without a fault.

## Not verified

| Requirement | Status |
|---|---|
| SWR-02 court geometry and appearance | Looked at in screenshots during development; nothing asserted |
| SWR-05 opponent levels differ | Not tested |
| SWR-07 control switching and marker | Not tested |
| SWR-10 contact window limits | Not tested beyond serve and the Hit button |
| SWR-11 contact types | Run only through the computer's play; outcomes not asserted |
| SWR-12 aiming | Not tested |
| SWR-17 blocking | Not tested |
| SWR-25 floor ring, SWR-27 banner | Not tested |
| SWR-30 audio output | Only the toggle label was checked |
| SWR-34 frame rate | Not measured |

In addition, the user's side never received, set or spiked a ball in this run, the game has not been played by a person, and no browser other than Chromium has been tried.
