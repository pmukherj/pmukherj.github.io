import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

// Exhaust fire for the player's jet.
//
// Two nested cones, both additively blended: a short blue-white shock core
// sitting inside a longer orange plume. Additive blending is what makes them
// read as light rather than as plastic — the sky brightens through them — and
// it is why the flame needs no lighting of its own.

// Where the flames sit in the flyer's own space. This is the fixed point of the
// aircraft: airframes are seated so their exhaust meets it, rather than the
// flame being moved to each new tail.
export const NOZZLE = { y: -0.295, z: 2.8 };
// The aircraft is twin-engined, so there are two of everything, this far either
// side of the centreline. Measured off the engine cans alone: the tail fins and
// the stabilators also reach this far back, and taking the rearmost geometry at
// face value puts the flames out on the fin roots instead of in the pipes.
const NOZZLE_SPREAD = 0.366;

// Peak alpha matters more than colour here. Additive blending sums towards
// white, so two bright cones stacked at full alpha bleach into a solid beam;
// keeping both well under 1 is what lets the orange stay orange.
const CORE = { radius: 0.08, length: 0.5, near: 0x9ed4ff, far: 0x2f7de0, peak: 0.5, falloff: 1.2 };
const PLUME = { radius: 0.18, length: 2.1, near: 0xff9d24, far: 0xd12b00, peak: 0.6, falloff: 1.9 };

// Length multipliers. Idle still shows a flame — a jet is never truly cold —
// and the boost is deliberately theatrical.
const IDLE_STRETCH = 0.34;
const THROTTLE_STRETCH = 0.62;
const BOOST_STRETCH = 1.7;
// How fast the plume grows towards its target length. Boost should feel like a
// kick, so lighting up is much quicker than dying down.
const IGNITE_RATE = 9;
const FADE_RATE = 3.4;

function makeFlame({ radius, length, near, far, peak, falloff }) {
  const geometry = new THREE.ConeGeometry(radius, length, 20, 1, true);
  // A cone points along +Y; the exhaust streams backwards along +Z. Shifting it
  // by half its length puts the wide mouth at the nozzle rather than
  // straddling it, so the taper runs the right way.
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, 0, length / 2);

  // Colour and fade are baked per-vertex so the plume cools and thins along its
  // length in one draw call, with no texture to load.
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 4);
  const nearColor = new THREE.Color(near);
  const farColor = new THREE.Color(far);
  const mixed = new THREE.Color();
  for (let i = 0; i < position.count; i += 1) {
    const along = THREE.MathUtils.clamp(position.getZ(i) / length, 0, 1);
    mixed.copy(nearColor).lerp(farColor, along);
    colors[i * 4 + 0] = mixed.r;
    colors[i * 4 + 1] = mixed.g;
    colors[i * 4 + 2] = mixed.b;
    colors[i * 4 + 3] = peak * (1 - along) ** falloff;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));

  return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    // Without this the flame would punch a hole in whatever is behind it.
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  }));
}

export class Afterburner {
  constructor() {
    this.group = new THREE.Group();
    // One spout per engine. The cone geometry is rebuilt rather than shared so
    // each can flicker on its own; two pipes pulsing in lockstep read as one
    // light source behind the aircraft rather than as two engines.
    this.spouts = [-NOZZLE_SPREAD, NOZZLE_SPREAD].map((x) => {
      const spout = new THREE.Group();
      spout.position.set(x, NOZZLE.y, NOZZLE.z);
      const plume = makeFlame(PLUME);
      const core = makeFlame(CORE);
      spout.add(plume, core);
      this.group.add(spout);
      return { plume, core };
    });
    this.stretch = IDLE_STRETCH;
  }

  update(delta, throttle, boosting) {
    const target = boosting
      ? BOOST_STRETCH
      : IDLE_STRETCH + throttle * THROTTLE_STRETCH;
    const rate = target > this.stretch ? IGNITE_RATE : FADE_RATE;
    this.stretch += (target - this.stretch) * Math.min(1, rate * delta);

    // Combustion is not steady, and a flame held at a fixed size reads as a
    // solid cone stuck to the tail. Independent jitter per axis keeps it alive,
    // and each engine draws its own so the pair never beats together.
    this.spouts.forEach(({ plume, core }) => {
      const lengthFlicker = 0.9 + Math.random() * 0.2;
      const widthFlicker = 0.94 + Math.random() * 0.12;
      const width = (0.82 + this.stretch * 0.18) * widthFlicker;

      plume.scale.set(width, width, this.stretch * lengthFlicker);
      // The shock core burns shorter and steadier than the plume around it.
      core.scale.set(
        width * 0.92,
        width * 0.92,
        (0.55 + this.stretch * 0.45) * (0.95 + Math.random() * 0.1),
      );
    });
  }
}
