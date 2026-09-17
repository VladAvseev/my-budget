/* [WEB-PORT] Unit-mass closed-form spring renderer.
 * Physical parameters are [ANDROIDX-M3E]; browser scheduling is [WEB-PORT].
 * Solves: x'' + 2*zeta*sqrt(k)*x' + k*(x - target) = 0
 */

export interface SpringSpec {
  dampingRatio: number;
  stiffness: number;
}

export interface SpringSample {
  value: number;
  velocity: number;
}

export interface SpringState {
  value: number;
  velocity: number;
  target: number;
}

export interface SampleSpringParams {
  time: number;
  from?: number;
  velocity?: number;
  target?: number;
  dampingRatio: number;
  stiffness: number;
}

export interface AnimateSpringOptions {
  from?: number;
  velocity?: number;
  target?: number;
  spec?: SpringSpec;
  onUpdate?: (state: SpringState) => void;
  onFinish?: (state: SpringState) => void;
  positionThreshold?: number;
  velocityThreshold?: number;
}

export interface SpringAnimationControl {
  state: SpringState;
  cancel: () => void;
  retarget: (newTarget: number) => void;
}

export const expressiveMotion = Object.freeze({
  defaultSpatial: { dampingRatio: 0.8, stiffness: 380 },
  fastSpatial: { dampingRatio: 0.6, stiffness: 800 },
  slowSpatial: { dampingRatio: 0.8, stiffness: 200 },
  defaultEffects: { dampingRatio: 1.0, stiffness: 1600 },
  fastEffects: { dampingRatio: 1.0, stiffness: 3800 },
  slowEffects: { dampingRatio: 1.0, stiffness: 800 },
} as const satisfies Record<string, SpringSpec>);

export function sampleSpring({
  time,
  from = 0,
  velocity = 0,
  target = 1,
  dampingRatio,
  stiffness,
}: SampleSpringParams): SpringSample {
  const y0 = from - target;
  const w0 = Math.sqrt(stiffness);
  const z = dampingRatio;
  let y: number;
  let v: number;

  if (z < 1 - 1e-9) {
    // Underdamped
    const wd = w0 * Math.sqrt(1 - z * z);
    const a = y0;
    const b = (velocity + z * w0 * y0) / wd;
    const e = Math.exp(-z * w0 * time);
    const c = Math.cos(wd * time);
    const s = Math.sin(wd * time);
    y = e * (a * c + b * s);
    v = e * (-z * w0 * (a * c + b * s) + (-a * wd * s + b * wd * c));
  } else if (z > 1 + 1e-9) {
    // Overdamped
    const r = Math.sqrt(z * z - 1);
    const r1 = -w0 * (z - r);
    const r2 = -w0 * (z + r);
    const c1 = (velocity - r2 * y0) / (r1 - r2);
    const c2 = y0 - c1;
    y = c1 * Math.exp(r1 * time) + c2 * Math.exp(r2 * time);
    v = c1 * r1 * Math.exp(r1 * time) + c2 * r2 * Math.exp(r2 * time);
  } else {
    // Critically damped
    const a = y0;
    const b = velocity + w0 * y0;
    const e = Math.exp(-w0 * time);
    y = (a + b * time) * e;
    v = (b - w0 * (a + b * time)) * e;
  }

  return { value: target + y, velocity: v };
}

export function animateSpring({
  from = 0,
  velocity = 0,
  target = 1,
  spec = expressiveMotion.defaultSpatial,
  onUpdate,
  onFinish,
  positionThreshold = 0.001,
  velocityThreshold = 0.001,
}: AnimateSpringOptions): SpringAnimationControl {
  let start = performance.now();
  let cancelled = false;
  let currentFrom = from;
  let currentVelocity = velocity;
  let currentTarget = target;
  const state: SpringState = { value: from, velocity, target };

  function frame(now: number) {
    if (cancelled) return;
    const t = (now - start) / 1000;
    const s = sampleSpring({
      time: t,
      from: currentFrom,
      velocity: currentVelocity,
      target: currentTarget,
      ...spec,
    });
    state.value = s.value;
    state.velocity = s.velocity;
    state.target = currentTarget;

    onUpdate?.(state);

    if (
      Math.abs(state.value - currentTarget) <= positionThreshold &&
      Math.abs(state.velocity) <= velocityThreshold
    ) {
      state.value = currentTarget;
      state.velocity = 0;
      onUpdate?.(state);
      onFinish?.(state);
      return;
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  return {
    state,
    cancel() {
      cancelled = true;
    },
    retarget(newTarget: number) {
      currentFrom = state.value;
      currentVelocity = state.velocity;
      currentTarget = newTarget;
      state.target = newTarget;
      start = performance.now();
    },
  };
}
