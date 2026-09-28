import * as THREE from "three";

/**
 * The Axiom rocket, built from primitives — a port of the standalone prototype
 * (Downloads/files/axiom-rocket-scroll.html) to three r186.
 *
 * Nose is +Y. Three nested groups so each motion has one owner:
 *   rocket — position + orientation along the flight path (set by the scene)
 *   spin   — roll around its own axis, driven by scroll progress
 *   body   — offsets the geometry so the pivot sits at the centre of mass
 *
 * The prototype was written for r128 with colour management off; the scene
 * turns ColorManagement off too, so these hex values land exactly as they did
 * there. Light intensities are multiplied by PI for the same reason: r155+
 * lights are physically based, and PI is the conversion from the old units.
 */

export type RocketParts = {
  rocket: THREE.Group;
  spin: THREE.Group;
  flame: THREE.Group;
  flameGlow: THREE.Sprite;
  flameLight: THREE.PointLight;
  halo: THREE.Sprite;
  orbits: { mat: THREE.MeshBasicMaterial; pivot: THREE.Group; tilt: THREE.Group }[];
};

function canvasTexture(draw: (g: CanvasRenderingContext2D, size: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) draw(context, 128);
  return new THREE.CanvasTexture(canvas);
}

/** Soft round light — every glow, the trail points and the orb halos. */
export function makeGlowTexture() {
  return canvasTexture((g, s) => {
    const gradient = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.25, "rgba(255,255,255,.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gradient;
    g.fillRect(0, 0, s, s);
  });
}

/** A ring of light — the shockwave when an orb is collected. */
export function makeRingTexture() {
  return canvasTexture((g, s) => {
    const gradient = g.createRadialGradient(s / 2, s / 2, s * 0.3, s / 2, s / 2, s / 2);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.62, "rgba(255,255,255,.95)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gradient;
    g.fillRect(0, 0, s, s);
  });
}

export function glowSprite(texture: THREE.Texture, color: number, opacity: number) {
  return new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
}

export function addLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xdfffe6, 0x0a2a12, 0.9 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, 2.2 * Math.PI);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7dffa0, 1.7 * Math.PI);
  rim.position.set(-4, 1, -3);
  scene.add(rim);
}

const PROFILE: [number, number][] = [
  [0.001, -1.25], [0.4, -1.22], [0.6, -0.95], [0.68, -0.3], [0.66, 0.45],
  [0.55, 1.0], [0.36, 1.5], [0.15, 1.85], [0.001, 2.05],
];

export function buildRocket(glow: THREE.Texture): RocketParts {
  const rocket = new THREE.Group();
  const spin = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = -0.4;
  rocket.add(spin);
  spin.add(body);

  const green = new THREE.MeshStandardMaterial({ color: 0x0f8a26, roughness: 0.32, metalness: 0.25 });
  const deep = new THREE.MeshStandardMaterial({ color: 0x0a6a1c, roughness: 0.4, metalness: 0.2 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf4fff4, roughness: 0.28, metalness: 0.1 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x2a3430, roughness: 0.35, metalness: 0.8 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x9fe8ff,
    roughness: 0.08,
    metalness: 0.1,
    emissive: 0x2a9bd0,
    emissiveIntensity: 0.7,
  });

  // Body: a lathe of a smoothed profile.
  const profile = new THREE.SplineCurve(PROFILE.map(([x, y]) => new THREE.Vector2(x, y)))
    .getPoints(60)
    .map((point) => new THREE.Vector2(Math.max(0.001, point.x), point.y));
  const radiusAt = (y: number) =>
    profile.reduce((best, point) => (Math.abs(point.y - y) < Math.abs(best.y - y) ? point : best)).x;
  body.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 72), green));

  // Two white bands.
  for (const y of [-0.55, 0.95]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(radiusAt(y) + 0.004, 0.045, 16, 72), white);
    band.rotation.x = Math.PI / 2;
    band.position.y = y;
    body.add(band);
  }

  // Porthole.
  const portholeRim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.06, 16, 48), white);
  portholeRim.position.set(0, 0.45, 0.62);
  body.add(portholeRim);
  const portholeGlass = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 16), glass);
  portholeGlass.scale.set(1, 1, 0.35);
  portholeGlass.position.set(0, 0.45, 0.62);
  body.add(portholeGlass);

  // Three fins.
  const finShape = new THREE.Shape();
  finShape.moveTo(0.5, -0.1);
  finShape.lineTo(1.08, -1.0);
  finShape.lineTo(1.08, -1.38);
  finShape.lineTo(0.5, -1.15);
  finShape.closePath();
  const finGeometry = new THREE.ExtrudeGeometry(finShape, { depth: 0.07, bevelEnabled: false });
  finGeometry.translate(0, 0, -0.035);
  for (let index = 0; index < 3; index += 1) {
    const fin = new THREE.Mesh(finGeometry, deep);
    fin.rotation.y = (index * Math.PI * 2) / 3;
    body.add(fin);
  }

  // Nozzle.
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.3, 32), metal);
  nozzle.position.y = -1.38;
  body.add(nozzle);

  // Flame. The prototype drew it additively, which vanishes on the pale end
  // of the gradient (additive orange on near-white is near-white). Normal
  // blending keeps it visible on both grounds; the glow sprite behind it
  // stays additive, so on the dark sky it still blooms.
  const flame = new THREE.Group();
  flame.position.y = -1.5;
  body.add(flame);
  const flameOuter = new THREE.Mesh(
    new THREE.ConeGeometry(0.42, 2.0, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff8a1f, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }),
  );
  flameOuter.rotation.x = Math.PI;
  flameOuter.position.y = -1.0;
  flame.add(flameOuter);
  const flameInner = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 1.3, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide }),
  );
  flameInner.rotation.x = Math.PI;
  flameInner.position.y = -0.65;
  flame.add(flameInner);
  const flameGlow = glowSprite(glow, 0xff9a3a, 0.9);
  flameGlow.scale.set(2.2, 2.2, 1);
  flameGlow.position.y = -0.4;
  flame.add(flameGlow);
  const flameLight = new THREE.PointLight(0xff7a2a, 2 * Math.PI, 7, 1);
  flameLight.position.set(0, -1.8, 0);
  body.add(flameLight);

  // Halo behind the whole rocket.
  const halo = glowSprite(glow, 0x4dff7a, 0.35);
  halo.scale.set(6, 6, 1);
  rocket.add(halo);

  // Orbit rings — the "finding your passion" flourish around the close-up.
  const orbit = (radius: number, tiltX: number, tiltY: number, color: number) => {
    const tilt = new THREE.Group();
    tilt.rotation.set(tiltX, tiltY, 0);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    tilt.add(new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 8, 128), mat));
    const pivot = new THREE.Group();
    tilt.add(pivot);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), new THREE.MeshBasicMaterial({ color }));
    dot.position.x = radius;
    pivot.add(dot);
    const dotGlow = glowSprite(glow, color, 0.9);
    dotGlow.scale.set(0.6, 0.6, 1);
    dot.add(dotGlow);
    rocket.add(tilt);
    return { mat, pivot, tilt };
  };

  return {
    rocket,
    spin,
    flame,
    flameGlow,
    flameLight,
    halo,
    orbits: [orbit(1.9, 1.15, 0.35, 0x7dffa0), orbit(2.35, 0.55, -0.6, 0xffffff)],
  };
}

/** Every geometry, material and texture under `root`, released. */
export function disposeTree(root: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const material of materials) {
      const map = (material as THREE.MeshBasicMaterial).map;
      if (map) textures.add(map);
      material.dispose();
    }
  });
  for (const texture of textures) texture.dispose();
}
