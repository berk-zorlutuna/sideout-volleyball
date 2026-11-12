# System Requirements

Product: Sideout Volleyball (`index.html`). These are the top-level requirements for the game as a whole. Each is refined in [software-requirements.md](software-requirements.md).

## Functional

| ID | Requirement |
|---|---|
| SYS-01 | The system shall let one user play a six-a-side indoor volleyball match against a computer-controlled team. |
| SYS-02 | The system shall show the match as a real-time 3D view of a regulation-size indoor court (18 m × 9 m, net at 2.43 m). |
| SYS-03 | The system shall apply the core rules of indoor volleyball: rally scoring, at most three touches per side, no two consecutive touches by one player, in/out and net decisions, service rotation, sets and match. |
| SYS-04 | The user shall be able to perform every skill for their side: serve, pass, set, attack and block. |
| SYS-05 | The user shall be able to choose the strength of the computer opponent before a match. |
| SYS-06 | The system shall show the match state (points, sets, server, touches used) and tell the user what to do next. |
| SYS-07 | The user shall be able to pause, resume, abandon and restart a match. |
| SYS-08 | The system shall give audio feedback that the user can turn off. |

## Platform and quality

| ID | Requirement |
|---|---|
| SYS-09 | The system shall run in a web browser as a single page, with no installation and no server-side component. |
| SYS-10 | The system shall be fully playable with a keyboard, and fully playable with a touchscreen. |
| SYS-11 | The system shall be usable on viewports from 400 px wide (phone) to desktop size. |
| SYS-12 | The system shall run without uncaught script errors. |
| SYS-13 | The system should hold 30 frames per second or better on a typical current laptop or phone. |
| SYS-14 | The system shall be playable on an Apple iPad in Safari, by touch alone, in landscape and portrait, and shall be installable to the iPad home screen as a full-screen app. |

## Operating environment

| Item | Needed |
|---|---|
| Browser | A current browser with WebGL 1 and ES2017 JavaScript (Chrome, Edge, Firefox, Safari). Only Chromium has been tested. |
| iPad | iPadOS 15.4 or later (Safari 15.4 is the first version with the CSS `:has()` selector the menu uses). Tested only as an emulated iPad profile in Chromium, not on a device. |
| Network | Access to `cdnjs.cloudflare.com` to load three.js r128. Google Fonts is optional; system fonts are used if it is unreachable. |
| Input | Keyboard, or a touchscreen. |
| Graphics | A GPU or software renderer that supports WebGL shadow maps (2048 px on desktop, 1024 px on touch devices). |
| Display | 400 px wide or more. Landscape gives a larger view of the court. |

## Deliberate simplifications

The game is not a full rules simulation. Sets are played to 15 instead of 25. There are no substitutions, liberos, time-outs, back-row attack restrictions, foot faults, net-touch faults, or antenna faults.
