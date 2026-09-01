import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/loaders/GLTFLoader.js';
import { GameAudio } from './audio.js';
import { FlightDynamics } from './flight-dynamics.js?v=flight-speed-70-1';
import { createTerrain, terrainHeightAt, updateTerrainAround } from './terrain.js';

const canvas = document.querySelector('#world');
const aimTargetElement = document.querySelector('#aim-target');
const altimeterValue = document.querySelector('#altimeter-value');
const airspeedValue = document.querySelector('#airspeed-value');
const attitudeWorld = document.querySelector('#attitude-world');
const audio = new GameAudio();
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
// Thirty detailed animated enemy models are deliberately more demanding than
// the original scene, so cap resolution before the GPU runs out of headroom.
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x92d4ff);
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  window.reportClientError?.({ type: 'webglcontextlost', message: 'WebGL context lost' });
});

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x92d4ff, 110, 900);

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 250);
camera.position.set(0, 5, 12);

// A simple sky dome gives the world a soft horizon instead of a flat blue backdrop.
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(190, 32, 16),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color('#3daff3') },
      horizonColor: { value: new THREE.Color('#c9efff') },
      bottomColor: { value: new THREE.Color('#f5fcff') },
    },
    vertexShader: `varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;
      void main() {
        float height = normalize(vWorldPosition).y;
        vec3 color = mix(horizonColor, topColor, smoothstep(0.0, 0.9, height));
        color = mix(color, bottomColor, smoothstep(-0.55, -0.05, height));
        gl_FragColor = vec4(color, 1.0);
      }`,
  }),
);
scene.add(sky);

const sun = new THREE.DirectionalLight(0xfff3cf, 2.2);
sun.position.set(-18, 24, -30);
scene.add(sun, new THREE.HemisphereLight(0xbfeaff, 0xffffff, 2.4));

const terrain = createTerrain();
scene.add(terrain);

// A red hue-shifted copy of the original UV map. Its panel lines, pale pieces,
// and insignia are all preserved because this is the same texture layout.
const planeTexture = new THREE.TextureLoader().load(
  './assets/plane-model/textures/gltf_red_0.png?v=2',
);
planeTexture.colorSpace = THREE.SRGBColorSpace;
planeTexture.flipY = false;

function makeCloud(x, y, z, scale = 1) {
  const cloud = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const puffGeometry = new THREE.SphereGeometry(1, 16, 12);
  const puffs = [
    [-1.45, 0.0, 0.15, 0.95], [-0.65, 0.2, 0, 1.25], [0.25, 0.3, 0.1, 1.45],
    [1.25, 0.1, 0.2, 1.05], [0.45, -0.25, 0.35, 1.1], [-0.5, -0.28, 0.3, 1.05],
  ];
  puffs.forEach(([px, py, pz, size]) => {
    const puff = new THREE.Mesh(puffGeometry, material);
    puff.position.set(px, py, pz);
    puff.scale.setScalar(size);
    cloud.add(puff);
  });
  cloud.position.set(x, y, z);
  cloud.userData.startPosition = cloud.position.clone();
  cloud.scale.setScalar(scale);
  cloud.userData.drift = 0.07 + Math.random() * 0.07;
  scene.add(cloud);
  return cloud;
}

const clouds = [
  makeCloud(-22, 9, -55, 2.7), makeCloud(14, 13, -72, 3.4),
  makeCloud(-6, 5.5, -38, 1.45), makeCloud(30, 7, -48, 2.1),
  makeCloud(-36, 15, -92, 4.2), makeCloud(45, 16, -100, 4.4),
];

// Fill the sky at several depths. Clouds are only visual scenery: there are no
// collision checks, so the flyer can always pass straight through them.
for (let index = 0; index < 90; index += 1) {
  const distance = 75 + index * 42 + Math.random() * 55;
  const spread = 55 + distance * 0.28;
  clouds.push(makeCloud(
    (Math.random() - 0.5) * spread * 2,
    3 + Math.random() * 28,
    -distance,
    0.9 + Math.random() * 3.8,
  ));
}

// The flight simulation drives this wrapper, while the supplied glTF plane is
// loaded into it once ready.
const flyer = new THREE.Group();
flyer.position.set(0, 4, 0);
scene.add(flyer);

const loader = new GLTFLoader();
let planeModel;
let propellerPivot;
loader.load(
  './assets/plane-model/source/model.gltf',
  (gltf) => {
    planeModel = gltf.scene;
    planeModel.scale.setScalar(0.38);
    const modelBounds = new THREE.Box3().setFromObject(planeModel);
    planeModel.position.y = -(modelBounds.min.y + modelBounds.max.y) / 2;
    planeModel.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.map = planeTexture;
        material.color.set('#ffffff');
        material.metalness = 0.08;
        material.roughness = 0.46;
        material.needsUpdate = true;
      });
    });
    flyer.add(planeModel);

    // The exported Propeller parent is rooted at the plane origin, not the
    // hub. Re-parent it under a pivot placed at its own visual centre, so its
    // blades spin in place at the nose rather than orbiting the aircraft.
    const propeller = planeModel.getObjectByName('Propeller');
    if (propeller) {
      planeModel.updateMatrixWorld(true);
      const propellerCentre = new THREE.Box3().setFromObject(propeller)
        .getCenter(new THREE.Vector3());
      planeModel.worldToLocal(propellerCentre);
      propellerPivot = new THREE.Group();
      propellerPivot.position.copy(propellerCentre);
      planeModel.add(propellerPivot);
      propellerPivot.attach(propeller);
    }
  },
  undefined,
  (error) => console.error('Could not load plane model:', error),
);

const enemyLoader = new GLTFLoader();
enemyLoader.load(
  './assets/enemy-plane/scene.gltf',
  (gltf) => {
    const enemyTemplate = gltf.scene;
    const originalBounds = new THREE.Box3().setFromObject(enemyTemplate);
    const originalSize = originalBounds.getSize(new THREE.Vector3());
    enemyTemplate.scale.setScalar(7 / Math.max(originalSize.x, originalSize.z));
    const scaledBounds = new THREE.Box3().setFromObject(enemyTemplate);
    enemyTemplate.position.y = -(scaledBounds.min.y + scaledBounds.max.y) / 2;
    const scaledSize = scaledBounds.getSize(new THREE.Vector3());
    // A generous sphere makes a moving aircraft satisfyingly hittable.
    enemyTemplate.userData.radius = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 0.48;
    createEnemies(enemyTemplate, gltf.animations);
  },
  undefined,
  (error) => console.error('Could not load enemy planes:', error),
);

const followOffset = new THREE.Vector3(0, 3.2, 10);
const lookAhead = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();
const cameraUp = new THREE.Vector3();
const pressedKeys = new Set();
const flight = new FlightDynamics(flyer.position, flyer.quaternion);
const projectiles = [];
const impactBlips = [];
const explosions = [];
const enemies = [];
const projectileGeometry = new THREE.CylinderGeometry(0.045, 0.045, 0.52, 8);
const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xffef8b });
const impactGeometry = new THREE.SphereGeometry(0.18, 10, 8);
const impactMaterial = new THREE.MeshBasicMaterial({ color: 0xff7600 });
const explosionGeometry = new THREE.SphereGeometry(1, 16, 12);
const wingMuzzles = [
  new THREE.Vector3(-1.28, 0, -0.45),
  new THREE.Vector3(1.28, 0, -0.45),
];
const projectileDirection = new THREE.Vector3();
const projectileUp = new THREE.Vector3(0, 1, 0);
const aimPoint = new THREE.Vector3();
const projectedTarget = new THREE.Vector3();
const forwardReticlePoint = new THREE.Vector3();
const defaultAimDistance = 36;
const enemyDirection = new THREE.Vector3();
const enemyLookPoint = new THREE.Vector3();
const homingDirection = new THREE.Vector3();
const cameraVelocity = new THREE.Vector3();
const lastCameraPosition = new THREE.Vector3();
const flightEuler = new THREE.Euler();
let lockedTarget = null;

function shootGuns() {
  audio.shoot();
  const lockedEnemy = enemies.find((enemy) => enemy.group === lockedTarget) ?? null;
  wingMuzzles.forEach((muzzle) => {
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    projectile.position.copy(muzzle).applyQuaternion(flyer.quaternion).add(flyer.position);
    if (lockedTarget) {
      aimPoint.copy(lockedTarget.position);
    } else {
      aimPoint.set(0, 0, -defaultAimDistance)
        .applyQuaternion(flyer.quaternion)
        .add(flyer.position);
    }
    projectileDirection.copy(aimPoint).sub(projectile.position).normalize();
    projectile.quaternion.setFromUnitVectors(projectileUp, projectileDirection);
    projectile.userData.velocity = projectileDirection.clone().multiplyScalar(46);
    projectile.userData.life = 3;
    // A locked aircraft is tracked from launch; otherwise a bullet can still
    // pick up an enemy when it passes close enough to one.
    projectile.userData.homingTarget = lockedEnemy;
    projectiles.push(projectile);
    scene.add(projectile);
  });
}

function createImpactBlip(position) {
  const blip = new THREE.Mesh(impactGeometry, impactMaterial);
  blip.position.copy(position);
  blip.userData.life = 0.28;
  impactBlips.push(blip);
  scene.add(blip);
}

function createExplosion(position) {
  audio.explode();
  const explosion = new THREE.Mesh(
    explosionGeometry,
    new THREE.MeshBasicMaterial({ color: 0xff6300, transparent: true, opacity: 0.9 }),
  );
  explosion.position.copy(position);
  explosion.userData.life = 0.75;
  explosion.scale.setScalar(0.25);
  explosions.push(explosion);
  scene.add(explosion);
}

function placeEnemy(enemy) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 120 + Math.random() * 260;
  enemy.group.position.set(
    flyer.position.x + Math.sin(angle) * distance,
    12 + Math.random() * 38,
    flyer.position.z + Math.cos(angle) * distance,
  );
  enemy.heading = Math.random() * Math.PI * 2;
  enemy.altitude = enemy.group.position.y;
}

function createEnemies(template, clips) {
  for (let index = 0; index < 30; index += 1) {
    const group = new THREE.Group();
    const model = template.clone(true);
    group.add(model);
    const mixer = new THREE.AnimationMixer(model);
    if (clips[0]) mixer.clipAction(clips[0]).play();
    const enemy = {
      group,
      model,
      mixer,
      speed: 11 + Math.random() * 8,
      heading: 0,
      altitude: 0,
      phase: Math.random() * Math.PI * 2,
      buzz: null,
      velocity: new THREE.Vector3(),
      radius: template.userData.radius,
    };
    placeEnemy(enemy);
    enemies.push(enemy);
    scene.add(group);
  }
}

function updateEnemies(delta, time) {
  enemies.forEach((enemy) => {
    const turn = Math.sin(time * 0.19 + enemy.phase) * 0.32
      + Math.sin(time * 0.07 + enemy.phase * 2) * 0.12;
    enemy.heading += turn * delta;
    const desiredAltitude = enemy.altitude + Math.sin(time * 0.31 + enemy.phase) * 5;
    enemy.velocity.set(Math.sin(enemy.heading), (desiredAltitude - enemy.group.position.y) * 0.8,
      Math.cos(enemy.heading)).normalize().multiplyScalar(enemy.speed);
    enemy.group.position.addScaledVector(enemy.velocity, delta);
    enemyLookPoint.copy(enemy.group.position).add(enemyDirection.copy(enemy.velocity).normalize());
    enemy.group.lookAt(enemyLookPoint);
    enemy.model.rotation.z = -turn * 0.75;
    enemy.mixer.update(delta * 2.4);

    if (enemy.group.position.distanceTo(flyer.position) > 620) placeEnemy(enemy);
    if (!enemy.buzz && audio.isReady()) enemy.buzz = audio.createEnemyBuzz();
  });
}

function updateEnemyAudio() {
  enemies.forEach((enemy) => {
    audio.updateEnemyBuzz(
      enemy.buzz,
      enemy.group.position,
      enemy.velocity,
      camera.position,
      cameraVelocity,
    );
  });
}

function updateAutoAim() {
  const halfWidth = window.innerWidth / 2;
  const halfHeight = window.innerHeight / 2;
  const snapDistance = 120;
  let closest = null;
  let closestDistance = snapDistance * snapDistance;
  forwardReticlePoint.set(0, 0, -defaultAimDistance)
    .applyQuaternion(flyer.quaternion)
    .add(flyer.position);
  projectedTarget.copy(forwardReticlePoint).project(camera);
  let targetX = (projectedTarget.x + 1) * halfWidth;
  let targetY = (1 - projectedTarget.y) * halfHeight;
  const baseTargetX = targetX;
  const baseTargetY = targetY;

  const considerTarget = (target) => {
    projectedTarget.copy(target.position).project(camera);
    if (projectedTarget.z < -1 || projectedTarget.z > 1) return;
    const x = (projectedTarget.x + 1) * halfWidth;
    const y = (1 - projectedTarget.y) * halfHeight;
    const distance = (x - baseTargetX) ** 2 + (y - baseTargetY) ** 2;
    if (distance < closestDistance) {
      closest = target;
      closestDistance = distance;
      targetX = x;
      targetY = y;
    }
  };

  enemies.forEach((enemy) => considerTarget(enemy.group));

  lockedTarget = closest;
  aimTargetElement.style.left = `${targetX}px`;
  aimTargetElement.style.top = `${targetY}px`;
  aimTargetElement.classList.toggle('locked', Boolean(lockedTarget));
}

function destroyEnemy(enemy) {
  createExplosion(enemy.group.position);
  audio.stopEnemyBuzz(enemy.buzz);
  scene.remove(enemy.group);
  const index = enemies.indexOf(enemy);
  if (index !== -1) enemies.splice(index, 1);
  if (lockedTarget === enemy.group) lockedTarget = null;
}

function resetFlight() {
  // Return to the original altitude, surrounded by the opening cloud field.
  flight.reset();
  clouds.forEach((cloud) => cloud.position.copy(cloud.userData.startPosition));
}

function updateInstruments() {
  const altitude = Math.max(0, flyer.position.y - terrainHeightAt(flyer.position.x, flyer.position.z));
  altimeterValue.textContent = String(Math.round(altitude)).padStart(3, '0');
  airspeedValue.textContent = String(Math.round(flight.velocity.length() * 3.6)).padStart(3, '0');
  flightEuler.setFromQuaternion(flyer.quaternion, 'YXZ');
  const pitchOffset = THREE.MathUtils.clamp(flightEuler.x * 72, -42, 42);
  const bank = THREE.MathUtils.clamp(-THREE.MathUtils.radToDeg(flightEuler.z), -75, 75);
  attitudeWorld.style.transform = `translateY(${pitchOffset}px) rotate(${bank}deg)`;
}

window.addEventListener('keydown', (event) => {
  audio.unlock();
  if (event.code === 'Space' && !event.repeat) {
    event.preventDefault();
    shootGuns();
    return;
  }

  if (event.code === 'KeyB' && !event.repeat) {
    event.preventDefault();
    flight.activateBoost();
    return;
  }

  if (event.code === 'KeyI' && !event.repeat) {
    event.preventDefault();
    if (planeModel) planeModel.visible = !planeModel.visible;
    return;
  }

  if (event.code === 'KeyR') {
    event.preventDefault();
    resetFlight();
    return;
  }

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(event.code)) {
    event.preventDefault();
    pressedKeys.add(event.code);
  }
});

window.addEventListener('keyup', (event) => {
  pressedKeys.delete(event.code);
});

window.addEventListener('blur', () => pressedKeys.clear());
canvas.addEventListener('pointerdown', () => audio.unlock());

const clock = new THREE.Clock();
function render() {
  const delta = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  flight.update(delta, {
    pitch: Number(pressedKeys.has('ArrowUp')) - Number(pressedKeys.has('ArrowDown')),
    roll: Number(pressedKeys.has('ArrowLeft')) - Number(pressedKeys.has('ArrowRight')),
    yaw: Number(pressedKeys.has('KeyA')) - Number(pressedKeys.has('KeyD')),
    throttle: Number(pressedKeys.has('KeyW')) - Number(pressedKeys.has('KeyS')),
  });
  updateInstruments();

  updateEnemies(delta, time);

  updateTerrainAround(terrain, flyer.position.x, flyer.position.z);

  for (let index = projectiles.length - 1; index >= 0; index -= 1) {
    const projectile = projectiles[index];
    let homingTarget = projectile.userData.homingTarget;
    if (!homingTarget || !enemies.includes(homingTarget)) {
      homingTarget = enemies.reduce((closest, enemy) => {
        const distance = enemy.group.position.distanceToSquared(projectile.position);
        if (distance > 14 ** 2) return closest;
        return !closest || distance < closest.distance ? { enemy, distance } : closest;
      }, null)?.enemy ?? null;
      projectile.userData.homingTarget = homingTarget;
    }
    if (homingTarget) {
      // Turn gradually, preserving the bullet's speed, for a readable
      // heat-seeking arc rather than an instant direction change.
      homingDirection.copy(homingTarget.group.position)
        .addScaledVector(homingTarget.velocity, 0.13)
        .sub(projectile.position)
        .normalize();
      projectile.userData.velocity.normalize()
        .lerp(homingDirection, Math.min(1, delta * 5.5))
        .normalize()
        .multiplyScalar(46);
      projectile.quaternion.setFromUnitVectors(projectileUp, projectile.userData.velocity.clone().normalize());
    }
    projectile.position.addScaledVector(projectile.userData.velocity, delta);
    projectile.userData.life -= delta;
    const enemyIndex = enemies.findIndex((enemy) => (
      enemy.group.position.distanceToSquared(projectile.position) < enemy.radius ** 2
    ));
    if (enemyIndex !== -1) {
      destroyEnemy(enemies[enemyIndex]);
      scene.remove(projectile);
      projectiles.splice(index, 1);
      continue;
    }
    const groundHeight = terrainHeightAt(projectile.position.x, projectile.position.z);
    if (projectile.position.y <= groundHeight) {
      projectile.position.y = groundHeight + 0.08;
      createImpactBlip(projectile.position);
      scene.remove(projectile);
      projectiles.splice(index, 1);
    } else if (projectile.userData.life <= 0) {
      scene.remove(projectile);
      projectiles.splice(index, 1);
    }
  }

  for (let index = impactBlips.length - 1; index >= 0; index -= 1) {
    const blip = impactBlips[index];
    blip.userData.life -= delta;
    blip.scale.setScalar(1 + (0.28 - blip.userData.life) * 2.5);
    if (blip.userData.life <= 0) {
      scene.remove(blip);
      impactBlips.splice(index, 1);
    }
  }

  for (let index = explosions.length - 1; index >= 0; index -= 1) {
    const explosion = explosions[index];
    explosion.userData.life -= delta;
    const elapsed = 0.75 - explosion.userData.life;
    explosion.scale.setScalar(0.25 + elapsed * 4.2);
    explosion.material.opacity = Math.max(0, explosion.userData.life / 0.75);
    if (explosion.userData.life <= 0) {
      scene.remove(explosion);
      explosion.material.dispose();
      explosions.splice(index, 1);
    }
  }

  if (propellerPivot) {
    // The propeller sits on the model's local Z axis; a little speed coupling
    // makes it spin faster as the plane gathers pace.
    propellerPivot.rotateZ((18 + flight.velocity.length() * 3.5) * delta);
  }

  // No crash sequence yet: a ground touch simply starts another flight.
  if (flyer.position.y <= terrainHeightAt(flyer.position.x, flyer.position.z) + 0.35) {
    resetFlight();
  }

  // The view stays locked to the back of the flyer, including its turns and bank.
  desiredCameraPosition.copy(followOffset).applyQuaternion(flyer.quaternion).add(flyer.position);
  camera.position.copy(desiredCameraPosition);
  // Look a little way down the flight path. This keeps the plane below the
  // forward reticle instead of projecting the reticle over its fuselage.
  lookAhead.set(0, 0, -12).applyQuaternion(flyer.quaternion).add(flyer.position);
  cameraUp.set(0, 1, 0).applyQuaternion(flyer.quaternion);
  camera.up.copy(cameraUp);
  camera.lookAt(lookAhead);
  updateAutoAim();
  cameraVelocity.copy(camera.position).sub(lastCameraPosition).divideScalar(Math.max(delta, 0.001));
  lastCameraPosition.copy(camera.position);
  audio.updateListener(camera.position);
  updateEnemyAudio();

  // The sky is an infinite-looking dome: move it with the camera so flying
  // far from the starting point can never expose the renderer's empty void.
  sky.position.copy(camera.position);

  clouds.forEach((cloud, index) => {
    cloud.position.x += Math.sin(time * cloud.userData.drift + index) * 0.0015;
    cloud.rotation.y = Math.sin(time * 0.08 + index) * 0.04;

    // Recycle scenery after it is well behind the camera for an endless sky.
    if (cloud.position.distanceTo(flyer.position) > 180 && cloud.position.z > flyer.position.z) {
      cloud.position.z = flyer.position.z - 220 - Math.random() * 360;
      cloud.position.x = flyer.position.x + (Math.random() - 0.5) * 150;
      cloud.position.y = 2.5 + Math.random() * 21;
    }
  });
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function resize() {
  const { innerWidth: width, innerHeight: height } = window;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
window.addEventListener('resize', resize);
resize();
render();
