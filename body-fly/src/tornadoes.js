import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/loaders/GLTFLoader.js';
import { terrainHeightAt } from './terrain.js';

// Fire tornadoes: roaming hazards rooted to the ground and tall enough to fly
// into. The model's colour comes from emissive factors rather than textures,
// so they stay vivid whatever the light is doing.

const MODEL = './assets/tornado/scene.gltf';
const COUNT = 10;

// The model is authored squat — wider than it is tall — so it is stretched
// rather than scaled. A real funnel is far taller than it is wide, and the
// stretch is also what puts the column in the plane's cruising altitude
// instead of leaving a bowl on the ground.
const HEIGHT = 78;
const TOP_WIDTH = 38;

// The funnel pinches towards the ground, and the collision cylinder tapers
// with it, so skimming underneath the flare is a near miss rather than a
// mysterious crash in clear air.
const BASE_RADIUS_FRACTION = 0.18;
// Roughly the plane's half-span, so a wingtip counts as a strike.
const PLANE_RADIUS = 2.3;

// The camera's far plane is 250, so the ring is drawn well inside it: spawned
// any further out and most of the field would be spent standing in clipped
// space where nobody can see it.
const SPAWN_MIN = 110;
const SPAWN_MAX = 220;
// Past the far plane, so a tornado is only ever recycled out of sight.
const RECYCLE_DISTANCE = 330;
// Clear space around the plane after a reset. Without it a twister parked over
// the start point would kill the new flight the instant it began, on repeat.
const RESPAWN_CLEARANCE = 115;

const SPIN_MIN = 1.1;
const SPIN_MAX = 2.4;
const DRIFT_MIN = 1.5;
const DRIFT_MAX = 4.5;
const WANDER_RATE = 0.25;

export class TornadoField {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.tornadoes = [];
    this.anchorPoint = new THREE.Vector3();
  }

  load(onError) {
    new GLTFLoader().load(MODEL, (gltf) => this.build(gltf.scene), undefined, onError);
  }

  build(template) {
    template.updateMatrixWorld(true);
    const rawSize = new THREE.Box3().setFromObject(template).getSize(new THREE.Vector3());
    template.scale.set(TOP_WIDTH / Math.max(rawSize.x, rawSize.z), HEIGHT / rawSize.y, TOP_WIDTH / Math.max(rawSize.x, rawSize.z));
    template.updateMatrixWorld(true);

    // The authored model neither sits on the origin nor stands on it, so it is
    // re-seated: centred on its own axis, which is what lets it spin in place
    // rather than orbit, and dropped so its tip meets the ground.
    const seated = new THREE.Box3().setFromObject(template);
    const centre = seated.getCenter(new THREE.Vector3());
    const offset = new THREE.Vector3(-centre.x, -seated.min.y, -centre.z);

    for (let index = 0; index < COUNT; index += 1) {
      const anchor = new THREE.Group();
      const spinner = new THREE.Group();
      const model = template.clone(true);
      model.position.copy(offset);
      spinner.add(model);
      anchor.add(spinner);
      this.group.add(anchor);

      const tornado = { anchor, spinner, spin: 0, driftAngle: 0, driftSpeed: 0, height: HEIGHT, topRadius: TOP_WIDTH / 2, baseRadius: 0 };
      this.tornadoes.push(tornado);
      this.place(tornado, this.anchorPoint);
    }
  }

  place(tornado, around, minDistance = SPAWN_MIN) {
    const angle = Math.random() * Math.PI * 2;
    const near = Math.max(minDistance, SPAWN_MIN);
    const far = Math.max(near + 60, SPAWN_MAX);
    const distance = near + Math.random() * (far - near);
    const x = around.x + Math.sin(angle) * distance;
    const z = around.z + Math.cos(angle) * distance;
    tornado.anchor.position.set(x, terrainHeightAt(x, z), z);

    // Varying the size per twister stops a dozen identical columns reading as
    // wallpaper. One scale keeps the base planted whatever the size.
    const size = 0.78 + Math.random() * 0.55;
    tornado.spinner.scale.setScalar(size);
    tornado.height = HEIGHT * size;
    tornado.topRadius = (TOP_WIDTH / 2) * size;
    tornado.baseRadius = tornado.topRadius * BASE_RADIUS_FRACTION;

    tornado.spin = (SPIN_MIN + Math.random() * (SPIN_MAX - SPIN_MIN)) * (Math.random() < 0.5 ? -1 : 1);
    tornado.driftAngle = Math.random() * Math.PI * 2;
    tornado.driftSpeed = DRIFT_MIN + Math.random() * (DRIFT_MAX - DRIFT_MIN);
    tornado.spinner.rotation.y = Math.random() * Math.PI * 2;
  }

  update(delta, playerPosition) {
    this.anchorPoint.copy(playerPosition);
    this.tornadoes.forEach((tornado) => {
      tornado.spinner.rotation.y += tornado.spin * delta;

      // A wandering heading keeps them crossing the field instead of tracking
      // in straight lines.
      tornado.driftAngle += (Math.random() - 0.5) * WANDER_RATE;
      const position = tornado.anchor.position;
      position.x += Math.sin(tornado.driftAngle) * tornado.driftSpeed * delta;
      position.z += Math.cos(tornado.driftAngle) * tornado.driftSpeed * delta;
      // Re-seat on the hills it has drifted over, so the tip never floats.
      position.y = terrainHeightAt(position.x, position.z);

      const dx = position.x - playerPosition.x;
      const dz = position.z - playerPosition.z;
      if (dx * dx + dz * dz > RECYCLE_DISTANCE * RECYCLE_DISTANCE) this.place(tornado, playerPosition);
    });
  }

  // Move any tornado standing too close to the given point out of the way.
  clearAround(position, safeRadius = RESPAWN_CLEARANCE) {
    this.tornadoes.forEach((tornado) => {
      const dx = tornado.anchor.position.x - position.x;
      const dz = tornado.anchor.position.z - position.z;
      if (dx * dx + dz * dz < safeRadius * safeRadius) this.place(tornado, position, safeRadius * 1.15);
    });
  }

  // Returns the tornado the given point is inside, or null.
  strikes(position) {
    for (const tornado of this.tornadoes) {
      const climb = (position.y - tornado.anchor.position.y) / tornado.height;
      if (climb < 0 || climb > 1) continue;
      const radius = THREE.MathUtils.lerp(tornado.baseRadius, tornado.topRadius, climb) + PLANE_RADIUS;
      const dx = position.x - tornado.anchor.position.x;
      const dz = position.z - tornado.anchor.position.z;
      if (dx * dx + dz * dz <= radius * radius) return tornado;
    }
    return null;
  }
}
