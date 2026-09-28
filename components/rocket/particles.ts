import * as THREE from "three";

/**
 * The point cloud the object is drawn with.
 *
 * Two position attributes, `aFrom` and `aTo`, and one `uMix` blend them in the
 * vertex shader. Every point has its own random delay, so a morph ripples
 * through the shape instead of snapping, and while a point is in flight it
 * swings out along its own direction — that swirl is the whole transition.
 * No flame and no bursts: at rest the cloud only breathes.
 *
 * The cursor pushes nearby points away (in world space, so it works at any
 * depth), which is the one thing on the stage that responds to the mouse
 * directly.
 */

const VERTEX = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aRand;

  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uMotion;
  uniform float uSwirl;
  uniform vec2 uMouse;
  uniform float uMouseOn;

  varying float vRand;
  varying float vFade;

  void main() {
    float delay = aRand * 0.4;
    float m = smoothstep(delay, delay + 0.6, uMix);
    vec3 p = mix(aFrom, aTo, m);

    vec3 dir = normalize(vec3(sin(aRand * 43.0), cos(aRand * 71.0), sin(aRand * 97.0)) + 1e-4);
    float inFlight = sin(3.14159 * m);
    p += dir * inFlight * 0.55 * uMotion;

    // Breathing at rest, a little more when the pad is hovered.
    float breath = (0.012 + uSwirl * 0.05) * uMotion;
    p += breath * vec3(sin(uTime * 1.3 + aRand * 20.0), cos(uTime * 1.1 + aRand * 17.0), sin(uTime * 0.9 + aRand * 11.0));

    vec4 world = modelMatrix * vec4(p, 1.0);
    vec2 away = world.xy - uMouse;
    float reach = smoothstep(1.1, 0.0, length(away));
    world.xy += normalize(away + 1e-4) * reach * 0.32 * uMouseOn;

    vec4 view = viewMatrix * world;
    gl_Position = projectionMatrix * view;
    gl_PointSize = uSize * uPixelRatio * (0.65 + 0.7 * aRand) / -view.z;

    vRand = aRand;
    vFade = 1.0 - 0.35 * inFlight;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;

  varying float vRand;
  varying float vFade;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);
    vec3 color = mix(uColorA, uColorB, vRand * vRand);
    gl_FragColor = vec4(color, soft * vFade * uOpacity);
  }
`;

export type ParticleCloud = {
  points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  setPair: (from: Float32Array, to: Float32Array) => void;
  uniforms: {
    uMix: { value: number };
    uTime: { value: number };
    uSize: { value: number };
    uPixelRatio: { value: number };
    uMotion: { value: number };
    uSwirl: { value: number };
    uMouse: { value: THREE.Vector2 };
    uMouseOn: { value: number };
    uColorA: { value: THREE.Color };
    uColorB: { value: THREE.Color };
    uOpacity: { value: number };
  };
};

export function createParticles(count: number, pixelRatio: number): ParticleCloud {
  const geometry = new THREE.BufferGeometry();
  // `position` is required by three for bounds; the shader never reads it.
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const from = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  const to = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  from.setUsage(THREE.DynamicDrawUsage);
  to.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("aFrom", from);
  geometry.setAttribute("aTo", to);
  const rand = new Float32Array(count);
  for (let i = 0; i < count; i += 1) rand[i] = Math.random();
  geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

  const uniforms = {
    uMix: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: 22 },
    uPixelRatio: { value: pixelRatio },
    uMotion: { value: 1 },
    uSwirl: { value: 0 },
    uMouse: { value: new THREE.Vector2(999, 999) },
    uMouseOn: { value: 1 },
    uColorA: { value: new THREE.Color(0x9edeaf) },
    uColorB: { value: new THREE.Color(0xeef6ee) },
    uOpacity: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    points,
    uniforms,
    setPair(nextFrom, nextTo) {
      (from.array as Float32Array).set(nextFrom);
      (to.array as Float32Array).set(nextTo);
      from.needsUpdate = true;
      to.needsUpdate = true;
    },
  };
}
