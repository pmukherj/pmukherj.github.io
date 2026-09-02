import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

// Exhaust fire for the player's jet.
//
// Two nested cones, both additively blended: a short blue-white shock core
// sitting inside a longer orange plume. Additive blending is what makes them
// read as light rather than as plastic — the sky brightens through them — and
// it is why the flame needs no lighting of its own.

// Where the nozzle sits in the flyer's own space, measured from the model's
// Afterburners mesh. The engine axis is below the model's vertical centre
// because the centring includes the tall tail fin.
const NOZZLE = { x: 0, y: -0.41, z: 2.8 };

// Peak alpha matters more than colour here. Additive blending sums towards
// white, so two bright cones stacked at full alpha bleach into a solid beam;
// keeping both well under 1 is what lets the orange stay orange.
const CORE = { radius: 0.1, length: 0.5, near: 0x9ed4ff, far: 0x2f7de0, peak: 0.5, falloff: 1.2 };
const PLUME = { radius: 0.22, length: 2.1, near: 0xff9d24, far: 0xd12b00, peak: 0.6, falloff: 1.9 };

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
    this.group.position.set(NOZZLE.x, NOZZLE.y, NOZZLE.z);
    this.plume = makeFlame(PLUME);
    this.core = makeFlame(CORE);
    this.group.add(this.plume, this.core);
    this.stretch = IDLE_STRETCH;
  }

  update(delta, throttle, boosting) {
    const target = boosting
      ? BOOST_STRETCH
      : IDLE_STRETCH + throttle * THROTTLE_STRETCH;
    const rate = target > this.stretch ? IGNITE_RATE : FADE_RATE;
    this.stretch += (target - this.stretch) * Math.min(1, rate * delta);

    // Combustion is not steady, and a flame held at a fixed size reads as a
    // solid cone stuck to the tail. Independent jitter per axis keeps it alive.
    const lengthFlicker = 0.9 + Math.random() * 0.2;
    const widthFlicker = 0.94 + Math.random() * 0.12;
    const width = (0.82 + this.stretch * 0.18) * widthFlicker;

    this.plume.scale.set(width, width, this.stretch * lengthFlicker);
    // The shock core burns shorter and steadier than the plume around it.
    this.core.scale.set(
      width * 0.92,
      width * 0.92,
      (0.55 + this.stretch * 0.45) * (0.95 + Math.random() * 0.1),
    );
  }
}
