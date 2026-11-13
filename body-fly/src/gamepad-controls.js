// Gamepad flying, built around a Logitech F710.
//
// The Gamepad API has no events for button state: getGamepads() hands back a
// fresh snapshot and everything must be polled, so this is driven once per
// frame from the render loop rather than from listeners.

// Chrome remaps the F710 in DirectInput mode (USB 046d:c219) onto the standard
// layout, so standard indices are the primary path. A pad that arrives with no
// mapping falls back to the raw DirectInput order the hardware sends, where the
// face buttons sit in a different order: X, A, B, Y rather than A, B, X, Y.
const STANDARD_LAYOUT = { fire: 7, boost: 1, hide: 2, yawLeft: 4, yawRight: 5 };
const DIRECT_INPUT_LAYOUT = { fire: 7, boost: 2, hide: 0, yawLeft: 4, yawRight: 5 };

const AXIS = { leftX: 0, leftY: 1, rightX: 2, rightY: 3 };

// F710 sticks rest off-centre, and a drifting stick the pilot is not touching
// would roll the aircraft on its own. Measured radially per stick so a diagonal
// nudge is not treated as two separate inputs.
const DEADZONE = 0.16;

// A trigger that fires once per pull feels broken, so holding it keeps firing.
// This is a little slower than the audio's own 90ms gate, which would otherwise
// swallow some of the shots it triggers.
const FIRE_REPEAT_SECONDS = 0.125;

// The sticks follow the keyboard rather than flight-sim convention: pushing up
// pitches up, the way the arrow keys already work. Flip this to fly the other
// way round.
const INVERT_PITCH = false;

function applyDeadzone(x, y) {
  const magnitude = Math.hypot(x, y);
  if (magnitude < DEADZONE) return [0, 0];
  // Rescale what is left so the travel just past the deadzone starts from zero
  // instead of jumping straight to a sixth of full deflection.
  const scaled = (magnitude - DEADZONE) / (1 - DEADZONE) / magnitude;
  return [x * scaled, y * scaled];
}

export class GamepadControls {
  constructor({ onFire, onBoost, onToggleHidden } = {}) {
    this.onFire = onFire;
    this.onBoost = onBoost;
    this.onToggleHidden = onToggleHidden;
    this.held = new Map();
    this.fireCooldown = 0;
    this.lastId = null;
  }

  // The API returns a sparse array padded with nulls, and a pad that has been
  // unplugged lingers in it as disconnected.
  static firstPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const pad of pads) if (pad && pad.connected) return pad;
    return null;
  }

  get connected() {
    return GamepadControls.firstPad() !== null;
  }

  // True on the frame a button goes down, false while it is held.
  pressedNow(pad, index) {
    const button = pad.buttons[index];
    const down = Boolean(button && button.pressed);
    const was = this.held.get(index) ?? false;
    this.held.set(index, down);
    return down && !was;
  }

  isDown(pad, index) {
    const button = pad.buttons[index];
    return Boolean(button && button.pressed);
  }

  // Polls buttons, runs their callbacks, and returns stick inputs in -1..1, or
  // null when no pad is attached.
  update(delta) {
    const pad = GamepadControls.firstPad();
    if (!pad) {
      this.held.clear();
      this.fireCooldown = 0;
      return null;
    }

    const layout = pad.mapping === 'standard' ? STANDARD_LAYOUT : DIRECT_INPUT_LAYOUT;
    if (pad.id !== this.lastId) {
      this.lastId = pad.id;
      console.info(`Gamepad: ${pad.id} (mapping: ${pad.mapping || 'non-standard'})`);
    }

    this.fireCooldown = Math.max(0, this.fireCooldown - delta);
    if (this.isDown(pad, layout.fire)) {
      if (this.fireCooldown === 0) {
        this.fireCooldown = FIRE_REPEAT_SECONDS;
        this.onFire?.();
      }
    } else {
      // Let go and the next pull fires at once rather than waiting out the gap.
      this.fireCooldown = 0;
    }
    // Boost restarts its own timer and hiding is a toggle, so both want the
    // edge rather than the held state.
    if (this.pressedNow(pad, layout.boost)) this.onBoost?.();
    if (this.pressedNow(pad, layout.hide)) this.onToggleHidden?.();

    const [leftX, leftY] = applyDeadzone(pad.axes[AXIS.leftX] ?? 0, pad.axes[AXIS.leftY] ?? 0);
    const [rightX, rightY] = applyDeadzone(pad.axes[AXIS.rightX] ?? 0, pad.axes[AXIS.rightY] ?? 0);

    // Sticks report up and left as negative, while the game counts nose-up,
    // bank-left, turn-left and throttle-up as positive, so every axis inverts.
    let yaw = -rightX;
    // The shoulders double as a rudder for anyone who would rather not fly the
    // right stick in two directions at once.
    if (this.isDown(pad, layout.yawLeft)) yaw += 1;
    if (this.isDown(pad, layout.yawRight)) yaw -= 1;

    return {
      pitch: (INVERT_PITCH ? leftY : -leftY),
      roll: -leftX,
      yaw: Math.max(-1, Math.min(1, yaw)),
      throttle: -rightY,
    };
  }
}
