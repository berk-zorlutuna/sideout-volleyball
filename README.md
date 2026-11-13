# sideout-volleyball

A 3D, six-a-side indoor volleyball game that runs in the browser. You play the blue side against the computer: serve, pass, set, spike and block. Best of three sets to 15.

## Play

Open `index.html` in a browser. It is a single file; three.js and the fonts load from a CDN, so it needs an internet connection.

## Play on iPad

The page has to be served over the web; Safari on iPad cannot open the file from the repository directly. Once it is hosted (for example with GitHub Pages), open the address in Safari. For a full-screen app, tap Share, then Add to Home Screen.

Touch controls appear automatically: a stick under your left thumb, Hit and Jump under your right. Landscape gives the best view. A hardware keyboard also works.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | WASD or arrows | Left stick |
| Hit / serve | J or Enter | Hit button |
| Block (jump) | Space | Jump button |
| Aim | Hold a direction as you hit | Hold the stick as you hit |

On an attack, Hit alone makes your player jump and spike. Press it as the floor ring turns green.
| Pause | P | Pause button |

## Documentation

- [System requirements](docs/system-requirements.md)
- [Software requirements](docs/software-requirements.md)
- [Software verification cases](docs/verification-cases.md)
- [Software verification results](docs/verification-results.md)

The verification cases are automated in `tests/verify.js`; `tests/balance.js` measures how often scripted players win points at each level.
