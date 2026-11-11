# Software Requirements

Derived from [system-requirements.md](system-requirements.md). The "Trace" column names the system requirement each one refines. Distances are in metres, with the net on the line z = 0 and the user's half at z > 0.

## Structure and start-up

| ID | Requirement | Trace |
|---|---|---|
| SWR-01 | The game shall be one HTML file that loads three.js r128 from cdnjs and needs no other script. | SYS-09 |
| SWR-02 | The scene shall contain an 18 × 9 court with boundary, centre and 3 m attack lines, a net with its top at 2.43, posts and antennas. | SYS-02 |
| SWR-03 | Each team shall have six players, assigned to rotation positions 1 to 6 (three front row, three back row). | SYS-01 |
| SWR-04 | On load the game shall show the menu over a computer-versus-computer match, with the scoreboard hidden. | SYS-06 |
| SWR-05 | The menu shall offer three opponent levels (Rookie, Pro, All-Star) that change the opponent's movement speed, passing, setting and hitting accuracy, spike speed, block rate and serve. | SYS-05 |
| SWR-06 | Starting a match shall hide the menu, show the scoreboard at 0–0 in set 1, and give the user's team the first serve. | SYS-01, SYS-06 |

## User control

| ID | Requirement | Trace |
|---|---|---|
| SWR-07 | The user shall control one player at a time. While the ball is to be played by the user's side, control goes to the player chosen to play it; otherwise it goes to the front-row player nearest the opponents' attack. The controlled player shall be marked. | SYS-04 |
| SWR-08 | Direction input (WASD, arrow keys, or the touch stick) shall move the controlled player. With no direction input, the controlled player shall walk to the predicted contact point unaided. | SYS-04, SYS-10 |
| SWR-09 | Jump input (Space or the Jump button) shall make the controlled player jump when they are on the floor during a rally. | SYS-04, SYS-10 |
| SWR-10 | Hit input (J, Enter or the Hit button) shall open a 0.34 s contact window. The player contacts the ball if, inside that window, the ball is on their side, within 1.25 horizontally and between 0.15 and 2.65 above their feet. | SYS-04, SYS-10 |
| SWR-11 | The contact type shall follow the team's touch count: first touch passes toward the setter position, second touch sets to a front-row attack position, third touch sends the ball over. A contact made in the air with the ball at 2.5 or higher shall be a spike. | SYS-04 |
| SWR-12 | The direction held at contact shall aim the ball: left/right choose the set target or the side of the opponents' court; forward/back choose a deep or short attack. | SYS-04 |
| SWR-13 | For the user's serve, the server shall slide along the baseline with left/right, and a power meter shall sweep back and forth. Hit serves the ball; power sets depth, and power above about 93 % shall send the serve past the baseline. | SYS-04 |

## Ball and rules

| ID | Requirement | Trace |
|---|---|---|
| SWR-14 | The ball shall follow ballistic flight (g = 9.81). A ball reaching the net plane below 2.43 between the posts shall rebound to the side it came from; one clipping the tape shall be slowed and carry over. | SYS-03 |
| SWR-15 | A side shall get at most three touches. The count shall reset when the ball crosses the net. | SYS-03 |
| SWR-16 | A player shall not contact the ball twice in succession. | SYS-03 |
| SWR-17 | An airborne player within 1.7 of the net shall block an opponent's spike that passes within reach of their hands. A block shall not count as one of the three touches. | SYS-03, SYS-04 |
| SWR-18 | A rally shall end when the ball touches the floor. In bounds, the point goes to the team opposite the half it landed in; out of bounds, to the opponents of the team that touched it last. Each rally awards exactly one point. | SYS-03 |
| SWR-19 | If the receiving team wins the rally it shall gain the serve and rotate one position (position 2 to 1, 1 to 6, and so on). If the serving team wins, both line-ups shall stay as they are. | SYS-03 |
| SWR-20 | A set shall be won by the first team to reach 15 points with a lead of at least two. | SYS-03 |
| SWR-21 | The match shall be won by the first team to win two sets. The first server shall alternate from set to set. | SYS-03 |
| SWR-22 | Players shall stay in their own half, at least 0.45 from the centre line. | SYS-03 |
| SWR-23 | The computer shall play its side with the same contact rules as the user: receive, set, attack, serve, block, and leave balls it judges to be going out. | SYS-01 |

## Display, flow and audio

| ID | Requirement | Trace |
|---|---|---|
| SWR-24 | The scoreboard shall show each team's points and sets won, the set number, a marker beside the serving team, and the touches used in the current possession. | SYS-06 |
| SWR-25 | During a rally a ring on the floor shall show the predicted contact point, with a second ring that closes as the ball arrives. It shall turn red for a ball predicted out and green when it is time to jump for an attack. | SYS-06 |
| SWR-26 | A one-line hint shall name the action expected of the user in the current situation. | SYS-06 |
| SWR-27 | After each rally a banner shall state the outcome and who won the point. | SYS-06 |
| SWR-28 | Pause (P, Escape or the Pause button, and automatically when the tab is hidden) shall freeze the game and show Resume and Quit to menu. | SYS-07 |
| SWR-29 | When the match ends a screen shall show the winner and the set scores, with Play again and Change opponent. | SYS-07 |
| SWR-30 | Sound effects shall be synthesised in the browser, start only after the user presses Start, and stop when the user selects Sound off. | SYS-08 |
| SWR-31 | At 400 px wide the page shall not scroll horizontally and all menu controls shall be inside the viewport. The camera distance shall adapt to the aspect ratio so the full court width is visible. | SYS-11 |
| SWR-32 | On coarse-pointer devices the game shall show a movement stick and Hit and Jump buttons during a match. | SYS-10 |
| SWR-33 | The game shall raise no uncaught script errors. | SYS-12 |
| SWR-34 | The game should render at 30 frames per second or better on a typical current laptop or phone. | SYS-13 |
