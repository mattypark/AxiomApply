import * as THREE from "three";

/**
 * The product on the home page: Matthew's prototype rocket (the lathe body,
 * three fins, porthole and nozzle from axiom-rocket-scroll.html), as a solid
 * object — no flame, no thrust, no trail. It is shown the way Moonshot shows
 * its device: on its own, lit like a product shot, turning slowly.
 *
 * Nose is +Y. `spin` rolls it around its own axis; the scene owns the rest.
 * Placeholder until Axiom has a real product object to put here.
 */

export type ProductParts = {
  root: THREE.Group;
  spin: THREE.Group;
  /** The two painted surfaces — the body and the fins — for re-tinting. */
  paint: { body: THREE.MeshStandardMaterial; fins: THREE.MeshStandardMaterial };
  rings: { tilt: THREE.Group; pivot: THREE.Group; material: THREE.MeshBasicMaterial }[];
};

const PROFILE: [number, number][] = [
  [0.001, -1.25], [0.4, -1.22], [0.6, -0.95], [0.68, -0.3], [0.66, 0.45],
  [0.55, 1.0], [0.36, 1.5], [0.15, 1.85], [0.001, 2.05],
];

export function addProductLights(scene: THREE.Scene) {
  // Soft sky from above, a warm key from the front-right, a cool rim behind:
  // the lighting of a product photographed outdoors on a clear day.
  scene.add(new THREE.HemisphereLight(0xf2f8ff, 0x55605a, 0.55 * Math.PI));
  const key = new THREE.DirectionalLight(0xfff4e6, 1.5 * Math.PI);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfe6ff, 1.1 * Math.PI);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
}

export function buildProductRocket(): ProductParts {
  const root = new THREE.Group();
  const spin = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = -0.4;
  root.add(spin);
  spin.add(body);

  const green = new THREE.MeshStandardMaterial({ color: 0x3f7a52, roughness: 0.34, metalness: 0.18 });
  const deep = new THREE.MeshStandardMaterial({ color: 0x2c5a3c, roughness: 0.42, metalness: 0.15 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf6f8f7, roughness: 0.3, metalness: 0.05 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x2a3130, roughness: 0.35, metalness: 0.75 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xbfe6ff,
    roughness: 0.06,
    metalness: 0.1,
    emissive: 0x5aa9d6,
    emissiveIntensity: 0.35,
  });

  const profile = new THREE.SplineCurve(PROFILE.map(([x, y]) => new THREE.Vector2(x, y)))
    .getPoints(64)
    .map((point) => new THREE.Vector2(Math.max(0.001, point.x), point.y));
  const radiusAt = (y: number) =>
    profile.reduce((best, point) => (Math.abs(point.y - y) < Math.abs(best.y - y) ? point : best)).x;
  body.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 96), green));

  for (const y of [-0.55, 0.95]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(radiusAt(y) + 0.004, 0.045, 16, 96), white);
    band.rotation.x = Math.PI / 2;
    band.position.y = y;
    body.add(band);
  }

  const portholeRim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.06, 16, 48), white);
  portholeRim.position.set(0, 0.45, 0.62);
  body.add(portholeRim);
  const portholeGlass = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 16), glass);
  portholeGlass.scale.set(1, 1, 0.35);
  portholeGlass.position.set(0, 0.45, 0.62);
  body.add(portholeGlass);

  const finShape = new THREE.Shape();
  finShape.moveTo(0.5, -0.1);
  finShape.lineTo(1.08, -1.0);
  finShape.lineTo(1.08, -1.38);
  finShape.lineTo(0.5, -1.15);
  finShape.closePath();
  const finGeometry = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.07,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
  });
  finGeometry.translate(0, 0, -0.035);
  for (let index = 0; index < 3; index += 1) {
    const fin = new THREE.Mesh(finGeometry, deep);
    fin.rotation.y = (index * Math.PI * 2) / 3;
    body.add(fin);
  }

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.3, 48), metal);
  nozzle.position.y = -1.38;
  body.add(nozzle);

  // Two thin rings around it, drifting — the one flourish, kept quiet.
  const ring = (radius: number, tiltX: number, tiltY: number, opacity: number) => {
    const tilt = new THREE.Group();
    tilt.rotation.set(tiltX, tiltY, 0);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity });
    tilt.add(new THREE.Mesh(new THREE.TorusGeometry(radius, 0.01, 8, 160), material));
    const pivot = new THREE.Group();
    tilt.add(pivot);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    dot.position.x = radius;
    pivot.add(dot);
    root.add(tilt);
    return { tilt, pivot, material };
  };

  return {
    root,
    spin,
    paint: { body: green, fins: deep },
    rings: [ring(2.0, 1.2, 0.35, 0.55), ring(2.45, 0.6, -0.55, 0.35)],
  };
}

/**
 * Paint jobs. The apply block re-tints the rocket to match the path picked:
 * Axiom green for interns, the startup blue from the picker's dot, near-black
 * for chapters. The white bands and the metal nozzle never change.
 */
export const PAINT = {
  green: { body: 0x3f7a52, fins: 0x2c5a3c },
  blue: { body: 0x4f6fc9, fins: 0x3b56a3 },
  black: { body: 0x26292d, fins: 0x15171a },
} as const;

export type Paint = keyof typeof PAINT;

export function disposeProduct(root: THREE.Object3D) {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const material of materials) material.dispose();
  });
}
