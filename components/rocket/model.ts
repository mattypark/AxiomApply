/**
 * The shapes the particle object becomes, as point clouds.
 *
 * Every shape returns exactly `count` points (x, y, z) inside roughly a
 * 3.4-unit-tall box centred on the origin, so any two can be morphed point
 * for point. Sampling is seeded: the same shape is the same cloud on every
 * load, which keeps the morphs identical scroll to scroll.
 *
 * The rocket is the prototype's silhouette — the lathe profile, three fins,
 * the porthole, the nozzle — sampled as points instead of built as meshes.
 */

export type ShapeName = "rocket" | "cards" | "network" | "helix" | "torus";

type Rng = () => number;

/** Mulberry32 — small, fast, and identical on every load. */
function seeded(seed: number): Rng {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Cloud {
  readonly data: Float32Array;
  private index = 0;

  constructor(readonly count: number) {
    this.data = new Float32Array(count * 3);
  }

  get size() {
    return this.index;
  }

  get full() {
    return this.index >= this.count;
  }

  push(x: number, y: number, z: number) {
    if (this.full) return;
    this.data[this.index * 3] = x;
    this.data[this.index * 3 + 1] = y;
    this.data[this.index * 3 + 2] = z;
    this.index += 1;
  }
}

/* ------------------------------------------------------------------ */
/* rocket                                                              */
/* ------------------------------------------------------------------ */

// [radius, y] from nozzle to nose — the prototype's lathe profile, recentred.
const PROFILE: [number, number][] = [
  [0.4, -1.62], [0.6, -1.35], [0.68, -0.7], [0.66, 0.05],
  [0.55, 0.6], [0.36, 1.1], [0.15, 1.45], [0.0, 1.65],
];

function radiusAt(y: number) {
  for (let i = 0; i < PROFILE.length - 1; i += 1) {
    const [r0, y0] = PROFILE[i];
    const [r1, y1] = PROFILE[i + 1];
    if (y >= y0 && y <= y1) {
      const t = (y - y0) / (y1 - y0);
      // A cosine blend so the body reads as smooth, not faceted.
      const s = (1 - Math.cos(t * Math.PI)) / 2;
      return r0 + (r1 - r0) * s;
    }
  }
  return 0;
}

function rocket(count: number, rand: Rng) {
  const cloud = new Cloud(count);
  const bodyShare = Math.floor(count * 0.66);
  const finShare = Math.floor(count * 0.2);
  const portShare = Math.floor(count * 0.07);

  // Body surface — sampled by height with weight on radius so the wide middle
  // is not thinner than the nose.
  while (cloud.size < bodyShare) {
    const y = -1.62 + rand() * 3.27;
    const r = radiusAt(y);
    if (rand() > r / 0.68 + 0.08) continue;
    const a = rand() * Math.PI * 2;
    cloud.push(Math.cos(a) * r, y, Math.sin(a) * r);
  }

  // Three fins: triangles flaring from the lower body.
  for (let i = 0; i < finShare; i += 1) {
    const fin = i % 3;
    const angle = (fin * Math.PI * 2) / 3 + Math.PI / 6;
    let u = rand();
    let v = rand();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    // Triangle: root top (0.55, -0.55), root bottom (0.55, -1.5), tip (1.15, -1.75)
    const radial = 0.55 + v * 0.6;
    const y = -0.55 + u * -0.95 + v * -1.2;
    cloud.push(Math.cos(angle) * radial, y, Math.sin(angle) * radial);
  }

  // Porthole ring on the front.
  for (let i = 0; i < portShare; i += 1) {
    const a = rand() * Math.PI * 2;
    const r = 0.22 + rand() * 0.05;
    cloud.push(Math.cos(a) * r, 0.2 + Math.sin(a) * r, 0.66);
  }

  // Nozzle ring, the rest.
  while (!cloud.full) {
    const a = rand() * Math.PI * 2;
    const r = 0.3 + rand() * 0.1;
    cloud.push(Math.cos(a) * r, -1.62 - rand() * 0.18, Math.sin(a) * r);
  }
  return cloud.data;
}

/* ------------------------------------------------------------------ */
/* the pile — a stack of application cards                             */
/* ------------------------------------------------------------------ */

function cards(count: number, rand: Rng) {
  const cloud = new Cloud(count);
  const CARDS = 6;
  const W = 2.1;
  const H = 1.35;
  for (let i = 0; !cloud.full; i += 1) {
    const card = i % CARDS;
    const lift = (card - (CARDS - 1) / 2) * 0.42;
    const skew = (card - 2.5) * 0.08;
    // Mostly edges and a few "text lines", so each card reads as a card.
    const kind = rand();
    let x: number;
    let y: number;
    if (kind < 0.55) {
      const t = rand() * 2 * (W + H);
      if (t < W) [x, y] = [t - W / 2, H / 2];
      else if (t < W + H) [x, y] = [W / 2, H / 2 - (t - W)];
      else if (t < 2 * W + H) [x, y] = [W / 2 - (t - W - H), -H / 2];
      else [x, y] = [-W / 2, -H / 2 + (t - 2 * W - H)];
    } else {
      const line = Math.floor(rand() * 4);
      const length = line === 0 ? 0.9 : 1.5 - line * 0.2;
      x = -W / 2 + 0.2 + rand() * length;
      y = H / 2 - 0.3 - line * 0.26;
    }
    // Cards lie tilted back, fanned slightly, stacked upward.
    const cosT = Math.cos(1.05);
    const sinT = Math.sin(1.05);
    const px = x + skew;
    const py = y * cosT + lift;
    const pz = y * sinT - card * 0.05;
    cloud.push(px, py, pz);
  }
  return cloud.data;
}

/* ------------------------------------------------------------------ */
/* the intro — a network of nodes                                      */
/* ------------------------------------------------------------------ */

function network(count: number, rand: Rng) {
  const cloud = new Cloud(count);
  const NODES = 16;
  const nodes: [number, number, number][] = [];
  for (let i = 0; i < NODES; i += 1) {
    // Fibonacci sphere, squashed a little so it reads wider than tall.
    const y = 1 - (i / (NODES - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.399963;
    nodes.push([Math.cos(a) * r * 1.55, y * 1.35, Math.sin(a) * r * 1.55]);
  }
  const edges: [number, number][] = [];
  nodes.forEach((node, i) => {
    const nearest = nodes
      .map((other, j) => ({ j, d: Math.hypot(node[0] - other[0], node[1] - other[1], node[2] - other[2]) }))
      .filter(({ j }) => j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    for (const { j } of nearest) if (i < j) edges.push([i, j]);
  });

  const nodeShare = Math.floor(count * 0.42);
  for (let i = 0; i < nodeShare; i += 1) {
    const node = nodes[i % NODES];
    const u = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = 0.13;
    cloud.push(node[0] + Math.cos(a) * s * r, node[1] + u * r, node[2] + Math.sin(a) * s * r);
  }
  while (!cloud.full) {
    const [a, b] = edges[Math.floor(rand() * edges.length)];
    const t = rand();
    const jitter = () => (rand() - 0.5) * 0.02;
    cloud.push(
      nodes[a][0] + (nodes[b][0] - nodes[a][0]) * t + jitter(),
      nodes[a][1] + (nodes[b][1] - nodes[a][1]) * t + jitter(),
      nodes[a][2] + (nodes[b][2] - nodes[a][2]) * t + jitter(),
    );
  }
  return cloud.data;
}

/* ------------------------------------------------------------------ */
/* the work — a helix                                                  */
/* ------------------------------------------------------------------ */

function helix(count: number, rand: Rng) {
  const cloud = new Cloud(count);
  const TURNS = 2.6;
  const HEIGHT = 3.3;
  const R = 0.85;
  const strandShare = Math.floor(count * 0.72);
  for (let i = 0; i < strandShare; i += 1) {
    const t = rand();
    const strand = i % 2;
    const a = t * TURNS * Math.PI * 2 + strand * Math.PI;
    const wobble = (rand() - 0.5) * 0.06;
    cloud.push(Math.cos(a) * (R + wobble), -HEIGHT / 2 + t * HEIGHT, Math.sin(a) * (R + wobble));
  }
  const RUNGS = 22;
  while (!cloud.full) {
    const rung = Math.floor(rand() * RUNGS);
    const t = (rung + 0.5) / RUNGS;
    const a = t * TURNS * Math.PI * 2;
    const s = rand() * 2 - 1;
    cloud.push(Math.cos(a) * R * s, -HEIGHT / 2 + t * HEIGHT, Math.sin(a) * R * s);
  }
  return cloud.data;
}

/* ------------------------------------------------------------------ */
/* the promise — a torus                                               */
/* ------------------------------------------------------------------ */

function torus(count: number, rand: Rng) {
  const cloud = new Cloud(count);
  const R = 1.15;
  const r = 0.46;
  while (!cloud.full) {
    const u = rand() * Math.PI * 2;
    const v = rand() * Math.PI * 2;
    // Accept by area so the outer rim is not sparser than the inner one.
    if (rand() > (R + r * Math.cos(v)) / (R + r)) continue;
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    // Stood up and turned toward the viewer, like the reference's ring.
    cloud.push(x, y * 0.94 + z * 0.34, z * 0.94 - y * 0.34);
  }
  return cloud.data;
}

const BUILDERS: Record<ShapeName, (count: number, rand: Rng) => Float32Array> = {
  rocket,
  cards,
  network,
  helix,
  torus,
};

export function buildShapes(count: number): Record<ShapeName, Float32Array> {
  const out = {} as Record<ShapeName, Float32Array>;
  (Object.keys(BUILDERS) as ShapeName[]).forEach((name, index) => {
    out[name] = BUILDERS[name](count, seeded(20260927 + index * 101));
  });
  return out;
}
