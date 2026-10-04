import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

const GRAVITY = 3.7;
// The speed at which the wings can just carry the aircraft. Above it lift is
// capped at exactly the weight it has to lift, so hands-off level flight holds
// its altitude; below it the wings come up short and the aircraft settles,
// which is what keeps the throttle worth touching.
const FLYING_SPEED = 7;
const LIFT_PER_SPEED_SQUARED = GRAVITY / (FLYING_SPEED * FLYING_SPEED);

// A deliberately small, arcade-friendly fixed-wing flight model. It is not a
// full aerodynamics simulator, but it gives the flyer inertia, momentum, lift,
// gravity, and damping—the ingredients that make steering feel physical.
export class FlightDynamics {
  constructor(position, quaternion) {
    this.position = position;
    this.quaternion = quaternion;
    this.velocity = new THREE.Vector3(0, 0, -7);
    this.angularVelocity = new THREE.Vector3();
    this.throttle = 0.2;
    this.minAirspeed = 5.6;
    this.maxAirspeed = 22.4;
    this.boostTime = 0;
    this.tumbleTime = 0;
    this.tumbleSpin = new THREE.Vector3();

    this.forward = new THREE.Vector3();
    this.up = new THREE.Vector3();
    this.rotationStep = new THREE.Quaternion();
  }

  reset(position = new THREE.Vector3(0, 4, 0)) {
    this.position.copy(position);
    this.quaternion.identity();
    this.velocity.set(0, 0, -7);
    this.angularVelocity.set(0, 0, 0);
    this.throttle = 0.2;
    this.boostTime = 0;
    this.tumbleTime = 0;
  }

  activateBoost() {
    this.boostTime = 4;
  }

  get tumbling() {
    return this.tumbleTime > 0;
  }

  // Wrench the aircraft into a flat spin for a moment. Yaw dominates because
  // that is what reads as "caught by something" rather than as a barrel roll,
  // and the roll is dragged the same way so the spin looks driven rather than
  // chosen.
  startTumble(seconds) {
    this.tumbleTime = seconds;
    const sense = Math.random() < 0.5 ? -1 : 1;
    this.tumbleSpin.set(
      (Math.random() - 0.5) * 1.1,
      sense * (6.5 + Math.random() * 3),
      sense * (1.1 + Math.random() * 1.2),
    );
  }

  // Shared by ordinary flight and by the tumble, which needs the same
  // integration but none of the pilot's say in it.
  applyRotation(delta) {
    const turnAmount = this.angularVelocity.length() * delta;
    if (turnAmount === 0) return;
    this.rotationStep.setFromAxisAngle(this.angularVelocity.clone().normalize(), turnAmount);
    // Post-multiplication rotates around the flyer's local pitch/roll axes.
    this.quaternion.multiply(this.rotationStep);
  }

  update(delta, controls) {
    const { pitch, roll, yaw, throttle = 0 } = controls;

    // W/S adjust a persistent throttle rather than directly changing speed.
    // 5.6–22.4 m/s (20–81 km/h) keeps the plane controllable for a young pilot
    // while still leaving a satisfying sense of acceleration.
    this.throttle = THREE.MathUtils.clamp(this.throttle + throttle * 0.75 * delta, 0, 1);
    this.boostTime = Math.max(0, this.boostTime - delta);
    const isBoosting = this.boostTime > 0;

    if (this.tumbleTime > 0) {
      this.tumbleTime = Math.max(0, this.tumbleTime - delta);
      // The spin rate is imposed outright rather than fed through the usual
      // torque and clamp, which cap turns far below what a tumble should look
      // like. The controls are ignored: being out of control is the point.
      this.angularVelocity.copy(this.tumbleSpin);
      this.applyRotation(delta);
      // Momentum carries the aircraft: no thrust, no lift, just light drag and
      // a softened gravity, so a spin near the deck is not a guaranteed ground
      // strike before it can be flung clear.
      this.velocity.addScaledVector(this.velocity, -0.3 * delta);
      this.velocity.y -= GRAVITY * 0.32 * delta;
      this.position.addScaledVector(this.velocity, delta);
      return;
    }

    // Inputs are rotational acceleration (torque), not an immediate rotation.
    this.angularVelocity.x += pitch * 2.7 * delta;
    this.angularVelocity.y += yaw * 2.0 * delta;
    this.angularVelocity.z += roll * 3.3 * delta;
    this.angularVelocity.multiplyScalar(Math.exp(-2.2 * delta));
    this.angularVelocity.clampLength(0, 1.55);
    this.applyRotation(delta);

    this.forward.set(0, 0, -1).applyQuaternion(this.quaternion);
    this.up.set(0, 1, 0).applyQuaternion(this.quaternion);
    const speed = this.velocity.length();
    const cruiseTarget = THREE.MathUtils.lerp(this.minAirspeed, this.maxAirspeed, this.throttle);
    const targetAirspeed = isBoosting ? 73.5 : cruiseTarget;

    // Propeller thrust is controlled by throttle; quadratic drag establishes a
    // natural cruising speed and prevents endless acceleration.
    this.velocity.addScaledVector(
      this.forward,
      (5.6 + this.throttle * 43.4 + (isBoosting ? 147 : 0)) * delta,
    );
    this.velocity.addScaledVector(this.velocity, -0.055 * speed * delta);

    // This is the game-friendly part of the model: throttle drives a target
    // forward speed, while the other forces still determine climbing, banking,
    // and momentum. It makes W/S immediately legible on the airspeed gauge.
    const forwardSpeed = this.velocity.dot(this.forward);
    this.velocity.addScaledVector(this.forward, (targetAirspeed - forwardSpeed) * 2.8 * delta);

    // Lift grows with speed, points through the flyer's local top, and is
    // capped at the weight it carries. That cap is what makes level flight
    // level. Under the uncapped square law this model used to use, matching
    // gravity took 27 m/s while the aircraft tops out at 22.4, so it sank at
    // every throttle setting — around 7 m/s of it at the default.
    // A bank or a climb still costs height: the cap applies to lift along the
    // wings, and tilting them is what shrinks its vertical share. Boost is
    // likewise still about forward speed rather than launching vertically.
    const liftSpeed = Math.min(speed, this.maxAirspeed);
    const lift = Math.min(liftSpeed * liftSpeed * LIFT_PER_SPEED_SQUARED, GRAVITY);
    this.velocity.addScaledVector(this.up, lift * delta);
    this.velocity.y -= GRAVITY * delta;
    this.velocity.clampLength(this.minAirspeed, isBoosting ? 73.5 : this.maxAirspeed);

    this.position.addScaledVector(this.velocity, delta);
  }
}
