import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

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
  }

  activateBoost() {
    this.boostTime = 4;
  }

  update(delta, controls) {
    const { pitch, roll, yaw, throttle = 0 } = controls;

    // W/S adjust a persistent throttle rather than directly changing speed.
    // 5.6–22.4 m/s (20–81 km/h) keeps the plane controllable for a young pilot
    // while still leaving a satisfying sense of acceleration.
    this.throttle = THREE.MathUtils.clamp(this.throttle + throttle * 0.75 * delta, 0, 1);
    this.boostTime = Math.max(0, this.boostTime - delta);
    const isBoosting = this.boostTime > 0;

    // Inputs are rotational acceleration (torque), not an immediate rotation.
    this.angularVelocity.x += pitch * 2.7 * delta;
    this.angularVelocity.y += yaw * 2.0 * delta;
    this.angularVelocity.z += roll * 3.3 * delta;
    this.angularVelocity.multiplyScalar(Math.exp(-2.2 * delta));
    this.angularVelocity.clampLength(0, 1.55);

    const turnAmount = this.angularVelocity.length() * delta;
    if (turnAmount > 0) {
      this.rotationStep.setFromAxisAngle(
        this.angularVelocity.clone().normalize(),
        turnAmount,
      );
      // Post-multiplication rotates around the flyer's local pitch/roll axes.
      this.quaternion.multiply(this.rotationStep);
    }

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

    // Lift grows rapidly with speed and points through the flyer's local top.
    // A light gravity term means a steep bank or climb naturally costs height.
    // Boost is deliberately about forward speed, not launching vertically.
    // Cap its lift calculation at normal top speed to keep the terrain racing
    // beneath the player during the cartoon burst.
    const liftSpeed = Math.min(speed, this.maxAirspeed);
    this.velocity.addScaledVector(this.up, liftSpeed * liftSpeed * 0.005 * delta);
    this.velocity.y -= 3.7 * delta;
    this.velocity.clampLength(this.minAirspeed, isBoosting ? 73.5 : this.maxAirspeed);

    this.position.addScaledVector(this.velocity, delta);
  }
}
