# Body Fly

Body Fly is a browser-based Three.js flying game designed as the foundation for a
future camera/body-controlled experience. At present it is keyboard controlled;
camera-based body input has not been added yet.

This directory is the copy deployed to <https://pmukherj.github.io/body-fly/>. See
[Hosted copy](#hosted-copy) at the bottom for how it differs from the working copy.

## Run it

From this folder, serve the page with any static server, for example:

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173> in a modern browser. The scene imports Three.js
from a CDN, so the first load needs an internet connection.

## World

- A sky-blue shader sky dome follows the camera, avoiding the black void that appeared when flying far from the origin.
- Soft, transparent cloud groups fill the sky at varied heights and distances. They drift, recycle behind the player, and have no collision, so the plane can pass through them.
- Rolling green terrain uses a generated grass texture and a repeating tile system around the player, making the ground effectively endless.
- Touching terrain resets the flight.

## Player aircraft and camera

- The player flies the F-16 in `assets/plane-model2`, keeping its own liveries
  and materials. It replaced the earlier prop plane in `assets/plane-model`,
  which is no longer loaded.
- The model is authored nose-towards +Z, so it is turned 180 degrees to face the
  -Z the game flies along. `PLANE_SCALE` sizes it by wingspan rather than
  length: the jet is longer and narrower than the prop plane it replaced, and
  matching span is what keeps its presence on screen familiar.
- The gun muzzles sit at the same fraction of the wing half-span as before, so
  they stayed on the wings across the swap rather than hanging past the tips.
- The prop plane's red UV retint is gone. It was applied to every mesh, which
  on a 60-material airframe would have painted the whole jet in one borrowed
  texture.
- The propeller re-parenting code remains and is inert: it is guarded on a
  `Propeller` node, and a jet has none.
- The follow camera remains behind the plane and looks ahead along its path.
- `I` toggles player-plane visibility and `R` resets the plane, velocity, and opening cloud position.

## Flight model and controls

Keyboard:

- `Arrow keys`: pitch and roll.
- `A` / `D`: yaw.
- `W` / `S`: increase/decrease throttle.
- `B`: four-second cartoon boost.
- `Space`: fire guns.

Phone and tablet (`src/mobile-controls.js`), on any device with a coarse
pointer:

- Tip the phone towards or away from you: pitch.
- Tilt it left or right: roll.
- Twist it flat, like a door handle: yaw.
- Tap the plane itself: fire guns.

Tilt drives a rotation *rate*, not an attitude, so holding a bank keeps the
plane rolling exactly as holding an arrow key does — the flight model takes
torque, and the phone feeds the same kind of input the keyboard does. Tilt is
added to the keyboard rather than replacing it, so a keyboard paired with a
tablet keeps working.

Three details are worth knowing before changing this code:

- **Angles are relative to a neutral pose** captured when the pilot taps to
  start, and re-captured on `orientationchange`. Any comfortable grip becomes
  level flight. Absolute angles were tried first and are a trap: a phone held
  bolt upright sits exactly on the ZXY gimbal lock, where roll is unreachable
  and left/right tilt reads as yaw.
- **Left/right tilt is wired to roll, not yaw.** Strictly it is a yaw, but
  banking is what steering an aircraft means, and mapping it to yaw makes the
  plane skid around flat. `SENSE` in the module flips any axis that feels
  inverted on a given handset.
- **iOS only releases the motion sensors from inside a user gesture**, via
  `DeviceOrientationEvent.requestPermission()`. That is why the game cannot
  just start listening on load, and why there is a tap-to-start overlay.

Flight uses a small arcade fixed-wing model with rotational inertia, thrust, drag,
lift, gravity, speed limits, and a target-airspeed throttle system. The current
player speed envelope is 70% of the earlier tuning:

- Normal airspeed: 5.6–22.4 m/s (about 20–81 km/h).
- Boost top speed: 73.5 m/s (about 265 km/h).
- Boost duration: four seconds.

## HUD

The bottom-left instrument cluster includes:

- Altimeter: height above terrain.
- Airspeed: current velocity in km/h.
- Artificial horizon: pitch and bank indication.

The centre reticle sits at the guns' convergence point ahead of the aircraft. It
turns yellow and snaps to targets within its screen-space lock range.

## Weapons and effects

- Firing creates twin projectiles from the wing guns.
- Projectiles leave a small orange impact blip when they strike the terrain.
- Hits create expanding orange explosions and remove the target.
- Bullets track a locked enemy, or gently acquire an enemy that passes close to their path.

## Enemy aircraft

- The supplied `assets/enemy-plane` glTF is used for enemy aircraft.
- Thirty large enemy planes spawn around the player, follow gentle randomized turning and altitude trajectories, and recycle once far away.
- Their embedded animation clip drives their model animation/propeller motion.
- They are the reticle's lock targets and are destroyed by the projectile system.
- Enemy fly-bys use spatialized low buzz audio with a simple Doppler-pitch calculation.

## Audio

- Background music loops from `assets/music/Dogfight Over Dawn.mp3`.
- Gunfire uses `assets/sounds/bullet_sound.mp3`.
- Each explosion randomly selects one of the four supplied cartoon plane explosion sounds.
- Audio begins after a click or key press, which is required by browser autoplay policies.

## Project structure

- `src/main.js`: scene, assets, player, enemies, targeting, projectiles, HUD updates, and render loop.
- `src/flight-dynamics.js`: standalone flight/throttle/boost dynamics module.
- `src/terrain.js`: procedural tiled terrain and terrain-height lookup.
- `src/audio.js`: music, effects, and enemy spatial audio.
- `src/mobile-controls.js`: device-orientation steering for phones and tablets.
- `src/style.css`: game and HUD presentation.

## Hosted copy

This directory is copied into `dist/` by `.github/workflows/deploy.yml`, alongside
the other static pages on the site. It differs from the `scratchpad/body-fly`
working copy in five ways; **redo these edits when re-syncing**.

**1. Crate targets removed.** The working copy scatters 520 floating crates, built
by splitting the supplied `assets/boxes` model into its five source box types and
scaling them. Here `assets/boxes/` is deleted, along with `createBoxTemplates()`,
`scatterBoxTargets()`, the crate glTF loader, and the crate branches of aim-lock
and bullet collision. Enemy planes are now the only targets, so the shared
`lockedBoxTarget` variable is renamed `lockedTarget`. This also drops ~9 MB, most
of it the crate `metallicRoughness` and `normal` textures.

**2. Player aircraft swapped** to the F-16 in `assets/plane-model2`. The working
copy still flies the prop plane from `assets/plane-model`. Note this is a 16.9 MB
model — by far the largest thing the page loads.

**3. Tilt controls added.** `src/mobile-controls.js`, the tap-to-start overlay,
and the tap-the-plane-to-fire hit test exist only here.

**4. Explosion sounds renamed.** The originals contain a literal `#`, which is a
fragment delimiter in URLs; they are `explosion-1..4.mp3` here, and `src/audio.js`
points at the new names.

**5. Local debugging stripped.** The working copy has a `dev-server.py` that serves
the game at <http://localhost:8000> and records uncaught browser errors, promise
rejections, and WebGL context-loss events in `logs/browser-console.log` — added to
diagnose an earlier render-loop crash caused by a stale reticle variable. It is
driven by an inline `<script>` in `index.html` that POSTs to `/__client-log`. That
script, `dev-server.py`, and `logs/` are all omitted here, since GitHub Pages has
no such endpoint. The one caller in `src/main.js` is optional-chained, so it is a
no-op without them.
