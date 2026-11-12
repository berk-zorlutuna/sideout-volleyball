# Software Verification Cases

All cases are automated in [`tests/verify.js`](../tests/verify.js) and run in headless Chromium through Playwright. Requirement IDs refer to [software-requirements.md](software-requirements.md).

The script reads game state through the `window.__sideout` hook in `index.html` and can advance the simulation with `__sideout.step(n)` (n frames of 1/60 s) without waiting for real time.

## Run

```bash
npm install playwright three@0.128.0
```

```bash
THREE_PATH=node_modules/three/build/three.min.js node tests/verify.js
```

`THREE_PATH` serves three.js from disk; omit it if the machine can reach cdnjs.

## A. Load and attract mode (1280 × 720)

| ID | Verifies | Procedure | Pass criterion |
|---|---|---|---|
| VC-01 | SWR-01, SWR-33 | Open the page. | three.js is loaded and no uncaught error is reported. |
| VC-02 | SWR-04 | Inspect the page after load. | Menu visible, scoreboard hidden, game state is serve, rally or point. |
| VC-03 | SWR-03 | Count players in each team. | Six and six. |

## B. Rule invariants (computer v computer, 600,000 frames ≈ 2 h 47 min of play)

The state is checked after every frame.

| ID | Verifies | Check | Pass criterion |
|---|---|---|---|
| VC-04 | SWR-18 | Every change of the score. | More than 100 points observed; every change is +1 for exactly one team, or a reset to 0–0. |
| VC-05 | SWR-20 | Score at each moment a set is awarded. | At least one set; winner has 15 or more and leads by 2 or more every time. |
| VC-06 | SWR-21 | Sets won when a match ends. | At least one match; no team ever exceeds 2 sets; each match ends with a team on 2. |
| VC-07 | SWR-15 | Touch counter during rallies. | Never above 3. |
| VC-08 | SWR-16 | Each second or third touch of a possession. | More than 50 observed; the player always differs from the previous toucher. |
| VC-09 | SWR-19 | Line-ups before and after each point, against which team served. | More than 5 side-outs and 5 holds; on a side-out the winner's line-up is shifted by one and the loser's is unchanged; on a hold both are unchanged. |
| VC-10 | SWR-22 | z of all twelve players. | Never closer than 0.45 to the centre line or beyond it. |
| VC-11 | SWR-14 | Ball height whenever it changes half between the posts. | More than 50 crossings; never below 2.13 (net height less a 0.3 one-frame tolerance). |
| VC-12 | SWR-23, SWR-33 | Error log after the soak. | No uncaught error; the computer completed whole matches unaided (VC-06). |

## C. Live match with keyboard (1280 × 720, opponent Pro)

| ID | Verifies | Procedure | Pass criterion |
|---|---|---|---|
| VC-13 | SWR-06, SWR-24 | Select Pro, press Start match. | Menu hidden, scoreboard visible, 0–0, "SET 1", server marker on the user's side only. |
| VC-14 | SWR-26 | Wait for the power meter, read the hint. | Hint begins "Your serve". |
| VC-15 | SWR-08, SWR-13 | Hold ArrowLeft for 0.6 s. | Server's x decreases by more than 0.3. |
| VC-16 | SWR-28 | Press P, wait 0.5 s, press P. | Pause screen appears, meter needle does not move while paused, screen closes and needle moves again. |
| VC-17 | SWR-13 | Press J with the needle between 72 % and 88 %. | State becomes rally; predicted landing is inside the opponents' court. |
| VC-18 | SWR-09 | Press Space during the rally. | A player of the user's team is more than 0.3 above the floor. |
| VC-19 | SWR-30 | Click the sound button. | Label changes from "Sound on" to "Sound off". |
| VC-21 | SWR-29, SWR-21 | Play the match out with the user serving but never playing the ball. | State is over, result screen visible, title names a winner with 2 sets, set scores listed. |
| VC-22 | SWR-29 | Click Play again. | Result screen hidden, 0–0, state serve. |
| VC-20 | SWR-13 | In the new match press J with the needle at 96 % or more. | Predicted landing is beyond the opponents' baseline and flagged out. |
| VC-23 | SWR-28 | Press P, click Quit to menu. | Menu visible, scoreboard hidden. |
| VC-24 | SWR-33 | Error log after the live match. | No uncaught error. |

## D. Phone (400 × 800, touch emulation)

| ID | Verifies | Procedure | Pass criterion |
|---|---|---|---|
| VC-25 | SWR-31 | Open the page. | Document is no wider than the viewport; Start button lies inside it. |
| VC-26 | SWR-32, SWR-10 | Tap Start match, wait for the meter, tap Hit. | Stick, Hit and Jump are visible; state becomes rally. |
| VC-27 | SWR-33 | Error log. | No uncaught error. |

## E. iPad profile (1194 × 834 at 2× scale, touch, Safari-on-Mac user agent)

This is Chromium emulating an iPad's viewport, touch input and user agent. It is not Safari and not a device.

| ID | Verifies | Procedure | Pass criterion |
|---|---|---|---|
| VC-28 | SWR-35, SWR-32 | Tap Start match, wait for the meter. | Touch mode is on, stick and Hit are visible, hint says "press Hit". |
| VC-29 | SWR-37, SWR-31 | Measure Hit, Jump and the hint. | All inside the viewport, none overlapping, Hit at least 88 px, no horizontal overflow. |
| VC-30 | SWR-36 | Hold the stick left with one pointer for 40 frames, then press Hit with a second pointer. | Server's x decreases by more than 0.5 and the state becomes rally. |
| VC-31 | SWR-38 | Change the viewport to 834 × 1194. | Canvas fills the new viewport, no horizontal overflow, Hit inside the viewport. |
| VC-32 | SWR-40 | Inspect the page head and the repository. | Home-screen meta tag, icon link and manifest link present; viewport disables zoom and covers the safe area; manifest and both icons exist. |
| VC-33 | SWR-33 | Error log. | No uncaught error. |

## Requirements with no verification case

| Requirement | Why |
|---|---|
| SWR-02 court geometry and appearance | Needs visual judgement. Screenshots were looked at during development but nothing is asserted. |
| SWR-05 opponent levels | No case compares the three levels. |
| SWR-07 control switching and marker | Not asserted. |
| SWR-10 contact window limits | Only the serve and the Hit button are exercised; the distance and timing limits are not probed. |
| SWR-11 contact types | Exercised only through the computer's play in section B; the outcome of each type is not asserted. |
| SWR-12 aiming | Not asserted. |
| SWR-17 blocking | Not asserted. |
| SWR-25 floor ring, SWR-27 banner | Not asserted. |
| SWR-30 audio output | Only the button label is checked; no sound is captured. |
| SWR-34 frame rate | Headless software rendering says nothing about real devices. |
| SWR-39 zoom and scroll suppression | These are Safari gestures; they cannot be produced in Chromium. |
| SWR-40 safe-area insets, installed full-screen behaviour | Needs a real iPad. Only the declarations are checked (VC-32). |
| SWR-41 audio resume | No audio device in the test. |
