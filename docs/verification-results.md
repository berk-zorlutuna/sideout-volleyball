# Software Verification Results

Result: **36 of 36 cases passed.** This is the third recorded run, made after the scoring fix described below. Twelve requirements have no case or only a partial one and remain unverified; see the end of this page.

The game has not been run on a real iPad or in Safari, and it has not been played by a person. The iPad cases use Chromium emulating an iPad, and the scoring cases use scripted players.

## Scoring defect found and fixed

A user reported that scoring was almost impossible. A scripted player was written to reproduce it (`tests/balance.js`), with this result on the previous version:

| Player | Rookie | Pro | All-Star |
|---|---|---|---|
| Times every touch and holds a direction to aim | 0 of 150 | 0 of 150 | 1 of 150 |
| Misses 1 touch in 12, never aims | 84 of 150 | 67 of 150 | 57 of 150 |

Cause: direction input both moved the player and aimed the hit, so following the on-screen hint "hold a direction to aim" walked the player out from under the ball. Every such rally ended "Ball down". The earlier runs did not catch it because no case had the user's side play a rally.

Changes: direction input only aims once the player is under the ball (SWR-42); Hit alone now jumps and spikes on an attack (SWR-43); the user's reach and timing window are larger (SWR-10); the computer's defenders react to a spike after a delay and reach less far (SWR-44).

Points won out of 150 in this run:

| Player | Rookie | Pro | All-Star |
|---|---|---|---|
| Careful (aims every time) | 142 (95 %) | 127 (85 %) | 94 (63 %) |
| Casual (misses 1 in 12) | 119 (79 %) | 84 (56 %) | 55 (37 %) |
| Beginner (misses 1 in 5) | 60 (40 %) | 34 (23 %) | 21 (14 %) |

These players never mistime by more than 0.2 s and never move by hand, so a person will probably score lower than the matching row.

## Run record

| Item | Value |
|---|---|
| Date | 2026-11-13 07:27 UTC |
| Item under test | `index.html` with the scoring fix (the commit that adds this run). Earlier runs: `1dc844f` 27 of 27, `iPad support` commit 33 of 33 |
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
| VC-04 | Pass | 837 points, 0 irregular score changes |
| VC-05 | Pass | 30 sets, from 15–7 to 19–17; none ended early |
| VC-06 | Pass | 12 matches completed, all ended with a team on 2 sets |
| VC-07 | Pass | Highest touch count seen: 3 |
| VC-08 | Pass | 2,968 second or third touches, 0 by the previous toucher |
| VC-09 | Pass | 575 side-outs and 262 holds, 0 wrong line-ups |
| VC-10 | Pass | 0 player-frames across or too near the centre line |
| VC-11 | Pass | 2,425 net crossings, 0 below net height |
| VC-12 | Pass | 0 page errors after 600,000 frames |
| VC-13 | Pass | 0–0, "SET 1", server marker on the user's side |
| VC-14 | Pass | Hint: "Your serve. Slide with ◀ ▶, then press J with the needle in the green." |
| VC-15 | Pass | Server x moved from 3.00 to 1.40 |
| VC-16 | Pass | Pause screen shown, needle frozen, resumed |
| VC-17 | Pass | Rally started; predicted landing x = 0.85, z = −8.67, in |
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
| VC-28 | Pass | Touch mode on; hint: "Your serve. Slide with the stick, then press Hit with the needle in the green." |
| VC-29 | Pass | Controls inside the viewport, no overlap, Hit button 100 px, document width 1194 in a 1194 px viewport |
| VC-30 | Pass | Server x moved from 3.00 to 0.33 with the stick held; Hit from a second pointer started the rally |
| VC-31 | Pass | Canvas 834 × 1194 in an 834 × 1194 viewport after rotation; Hit inside |
| VC-32 | Pass | Home-screen meta, icon link and manifest link present; manifest and icons exist |
| VC-33 | Pass | 0 page errors on the iPad profile |
| VC-34 | Pass | Careful player won 95 % against Rookie (85 % Pro, 63 % All-Star) |
| VC-35 | Pass | Casual 79 %, beginner 40 % against Rookie |
| VC-36 | Pass | Careful 95 > 85 > 63; casual 79 > 37 |

The soak in section B is random, so its counts differ from run to run.

## Earlier runs

Two runs before this one reported failures. Both were faults in the test script, and `index.html` was not changed between runs.

- Rallies between two computer teams are now much shorter (837 points in the soak against 223 before), because defenders no longer reach every spike.
- Run 1 used a 120,000-frame soak, which was too short to finish a match (VC-06) or reach the point count the script demanded (VC-04). The soak was lengthened to 600,000 frames.
- Runs 1 and 2 tried to reach VC-20 by waiting for the user's side to win back the serve. With the user never playing the ball, the Pro opponent held serve for the whole match, so the case was never reached. It now runs on the first serve of a new match.

One observation from run 2 is worth keeping: the Pro opponent served 30 times in a row without a fault.

## Not verified

| Requirement | Status |
|---|---|
| SWR-02 court geometry and appearance | Looked at in screenshots during development; nothing asserted |
| SWR-07 control switching and marker | Not tested |
| SWR-10 contact window limits | Not tested beyond serve and the Hit button |
| SWR-11 contact types | Run only through the computer's play; outcomes not asserted |
| SWR-12 aiming | Not tested |
| SWR-17 blocking | Not tested |
| SWR-25 floor ring, SWR-27 banner | Not tested |
| SWR-30 audio output | Only the toggle label was checked |
| SWR-34 frame rate | Not measured |
| SWR-39 zoom and scroll suppression | Not testable in Chromium |
| SWR-40 safe-area insets and installed full-screen behaviour | Declarations checked only (VC-32) |
| SWR-41 audio resume | Not tested |

In addition, the user's side has only been played by scripts, never by a person, and no browser other than Chromium has been tried. That includes Safari on iPad: WebKit rendering, real multi-touch, Safari gestures, audio, and frame rate on the device are all untested.
