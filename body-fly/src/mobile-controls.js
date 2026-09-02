import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

// Tilt-to-fly for phones and tablets.
//
// The flight model takes torque rather than angles, so tilt is mapped to a
// rotation *rate*: hold the phone banked and the plane keeps rolling, exactly
// as holding an arrow key does. Angles are measured against a neutral pose
// captured the moment the pilot taps to start, so any comfortable hold becomes
// level flight — there is no one correct way to grip the phone.

const DEG = Math.PI / 180;

// Hands shake, so tilt below the deadzone reads as level. Tilt at the full
// angle gives the same input as a fully held arrow key.
const DEADZONE_DEG = 5;
const FULL_TILT_DEG = { pitch: 32, roll: 38, yaw: 30 };

// Device axis conventions vary. If an axis feels inverted on some handset,
// flipping its sign here is the whole fix. Roll is negated because dropping
// the phone's right edge should bank right, and a right bank is negative in
// the flight model's frame.
const SENSE = { pitch: 1, roll: -1, yaw: 1 };

// Raw sensor readings are noisy; this eases them without adding felt lag.
const SMOOTHING = 0.25;

// A fingertip is far bigger than the plane is on screen, so the tap target
// never shrinks below a comfortable size.
export const MIN_TAP_RADIUS = 44;

const deviceEuler = new THREE.Euler();
const screenTwist = new THREE.Quaternion();
const zAxis = new THREE.Vector3(0, 0, 1);
// The screen faces the pilot, not the sky: a -90° turn about X drops the
// device frame into the same Y-up world the game already uses.
const screenFacing = new THREE.Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2);

export function supportsTilt() {
  return 'DeviceOrientationEvent' in window
    && window.matchMedia('(pointer: coarse)').matches;
}

// Angles subtract cleanly only when wrapped back into -PI..PI.
function wrapAngle(value) {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function axisInput(angle, fullTiltDeg, sense) {
  const degrees = angle / DEG;
  const beyondDeadzone = Math.abs(degrees) - DEADZONE_DEG;
  if (beyondDeadzone <= 0) return 0;
  const span = Math.max(1, fullTiltDeg - DEADZONE_DEG);
  return sense * Math.sign(degrees) * Math.min(1, beyondDeadzone / span);
}

export class TiltControls {
  constructor() {
    this.enabled = false;
    this.hasReading = false;
    this.neutral = null;
    this.orientation = new THREE.Quaternion();
    this.fromNeutral = new THREE.Quaternion();
    this.relativeEuler = new THREE.Euler();
    this.raw = { pitch: 0, roll: 0, yaw: 0 };
    this.smoothed = { pitch: 0, roll: 0, yaw: 0 };
    this.handleOrientation = this.handleOrientation.bind(this);
    this.recenter = this.recenter.bind(this);
  }

  async start() {
    // iOS 13+ hands out orientation only after an explicit grant, and only
    // when asked from inside a user gesture — hence the tap-to-start button.
    const { DeviceOrientationEvent } = window;
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      const response = await DeviceOrientationEvent.requestPermission();
      if (response !== 'granted') return false;
    }
    window.addEventListener('deviceorientation', this.handleOrientation);
    // Turning the phone changes what its axes mean, so level flight is
    // re-learned rather than carried across the rotation.
    window.addEventListener('orientationchange', this.recenter);
    this.enabled = true;
    return true;
  }

  stop() {
    window.removeEventListener('deviceorientation', this.handleOrientation);
    window.removeEventListener('orientationchange', this.recenter);
    this.enabled = false;
    this.hasReading = false;
    this.neutral = null;
  }

  // The next reading becomes the new definition of level flight.
  recenter() {
    this.neutral = null;
  }

  handleOrientation(event) {
    if (event.alpha === null && event.beta === null && event.gamma === null) return;

    const screenAngle = (screen.orientation?.angle ?? window.orientation ?? 0) * DEG;
    deviceEuler.set((event.beta ?? 0) * DEG, (event.alpha ?? 0) * DEG, -(event.gamma ?? 0) * DEG, 'YXZ');
    this.orientation.setFromEuler(deviceEuler);
    this.orientation.multiply(screenFacing);
    this.orientation.multiply(screenTwist.setFromAxisAngle(zAxis, -screenAngle));

    if (!this.neutral) {
      this.neutral = this.orientation.clone().invert();
      this.smoothed.pitch = 0;
      this.smoothed.roll = 0;
      this.smoothed.yaw = 0;
    }

    // Everything is measured as the turn *away from* the neutral pose rather
    // than as an absolute attitude. Absolute angles are degenerate at some
    // holds — a phone held bolt upright has its long axis pointing at the sky,
    // so twisting it reads as yaw on one axis and as nothing on another. A
    // relative turn, decomposed in the phone's own frame, means the same
    // gesture gives the same control from any starting grip.
    this.fromNeutral.copy(this.neutral).multiply(this.orientation);
    this.relativeEuler.setFromQuaternion(this.fromNeutral, 'YXZ');

    // In the phone's frame: X runs across the screen, Y up it, Z out of it.
    //
    // Y is deliberately wired to roll rather than to yaw. Turning a reclined
    // phone about its own up-axis is, strictly, a yaw — but tilting the phone
    // left and right is the gesture every player already reaches for to steer,
    // and on an aircraft steering means banking. Wiring it to yaw instead is
    // faithful to the sensor and awful to fly: the plane skids around flat and
    // never banks. Twisting the phone about Z, the axis pointing away from
    // your face, is left for the rarer yaw.
    this.raw.pitch = this.relativeEuler.x;  // tipped towards or away from you
    this.raw.roll = this.relativeEuler.y;   // tilted left or right to steer
    this.raw.yaw = this.relativeEuler.z;    // twisted flat, like a door handle

    this.hasReading = true;
  }

  // Returns arrow-key-equivalent inputs in -1..1, or null while the sensor
  // has nothing to say.
  read() {
    if (!this.enabled || !this.hasReading || !this.neutral) return null;

    this.smoothed.pitch += wrapAngle(this.raw.pitch - this.smoothed.pitch) * SMOOTHING;
    this.smoothed.roll += wrapAngle(this.raw.roll - this.smoothed.roll) * SMOOTHING;
    this.smoothed.yaw += wrapAngle(this.raw.yaw - this.smoothed.yaw) * SMOOTHING;

    return {
      pitch: axisInput(this.smoothed.pitch, FULL_TILT_DEG.pitch, SENSE.pitch),
      roll: axisInput(this.smoothed.roll, FULL_TILT_DEG.roll, SENSE.roll),
      yaw: axisInput(this.smoothed.yaw, FULL_TILT_DEG.yaw, SENSE.yaw),
    };
  }
}
