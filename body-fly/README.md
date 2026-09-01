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

- The original triangle prototype was replaced with the supplied glTF plane model from `assets/plane-model`.
- The plane uses a red-tinted version of its original UV texture so panel detail and decals are retained.
- The propeller is re-parented around its visual hub and spins independently.
- The follow camera remains behind the plane and looks ahead along its path.
- `I` toggles player-plane visibility and `R` resets the plane, velocity, and opening cloud position.

## Flight model and controls

- `Arrow keys`: pitch and roll.
- `A` / `D`: yaw.
- `W` / `S`: increase/decrease throttle.
- `B`: four-second cartoon boost.
- `Space`: fire guns.

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
- `src/style.css`: game and HUD presentation.

## Hosted copy

This directory is copied into `dist/` by `.github/workflows/deploy.yml`, alongside
the other static pages on the site. It differs from the `scratchpad/body-fly`
working copy in three ways; **redo these edits when re-syncing**.

**1. Crate targets removed.** The working copy scatters 520 floating crates, built
by splitting the supplied `assets/boxes` model into its five source box types and
scaling them. Here `assets/boxes/` is deleted, along with `createBoxTemplates()`,
`scatterBoxTargets()`, the crate glTF loader, and the crate branches of aim-lock
and bullet collision. Enemy planes are now the only targets, so the shared
`lockedBoxTarget` variable is renamed `lockedTarget`. This also drops ~9 MB, most
of it the crate `metallicRoughness` and `normal` textures.

**2. Explosion sounds renamed.** The originals contain a literal `#`, which is a
fragment delimiter in URLs; they are `explosion-1..4.mp3` here, and `src/audio.js`
points at the new names.

**3. Local debugging stripped.** The working copy has a `dev-server.py` that serves
the game at <http://localhost:8000> and records uncaught browser errors, promise
rejections, and WebGL context-loss events in `logs/browser-console.log` — added to
diagnose an earlier render-loop crash caused by a stale reticle variable. It is
driven by an inline `<script>` in `index.html` that POSTs to `/__client-log`. That
script, `dev-server.py`, and `logs/` are all omitted here, since GitHub Pages has
no such endpoint. The one caller in `src/main.js` is optional-chained, so it is a
no-op without them.
