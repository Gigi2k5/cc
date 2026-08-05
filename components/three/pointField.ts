/**
 * Pure geometry for the network layer — no React, no three, so it can be
 * reasoned about (and tested) on its own.
 *
 * Seeded on purpose: the scene must render identically across reloads, both
 * so HMR doesn't reshuffle the composition and so visual checks are comparable.
 */

/** mulberry32 — small, fast, good enough for scatter. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type PointFieldConfig = {
  /** Total points, split between the near and far layers. */
  count: number;
  /** Half-extents in x and y. */
  extent: readonly [number, number];
  /**
   * z range, asymmetric on purpose. The upper bound must stay well clear of
   * the camera: with size attenuation, a point a few tenths of a unit from the
   * lens becomes a screen-filling blob.
   */
  zRange: readonly [number, number];
  /** Points never spawn inside this radius, keeping the chip legible. */
  holeRadius: number;
  /** Points closer than this get linked. */
  linkDistance: number;
  /** Hard cap on line segments — the count explodes quadratically. */
  maxLinks: number;
  seed?: number;
};

export type PointFieldData = {
  /** Toward the camera: fewer, larger, softer. */
  near: Float32Array;
  /** Away from the camera: many, small, crisp. */
  far: Float32Array;
  /** Flat pairs of vertices for lineSegments. */
  links: Float32Array;
  nearCount: number;
  farCount: number;
  linkCount: number;
};

/** z above this belongs to the near (soft, large) layer. */
const NEAR_PLANE = 0.5;

export function buildPointField(config: PointFieldConfig): PointFieldData {
  const {
    count,
    extent,
    zRange,
    holeRadius,
    linkDistance,
    maxLinks,
    seed = 20220101,
  } = config;
  const random = seededRandom(seed);
  const [ex, ey] = extent;
  const [zMin, zMax] = zRange;

  const points: number[][] = [];
  let guard = 0;

  while (points.length < count && guard < count * 40) {
    guard++;
    const x = (random() * 2 - 1) * ex;
    const y = (random() * 2 - 1) * ey;
    // Biaisé vers l'arrière : le réseau doit se lire derrière la puce.
    const z = zMin + (zMax - zMin) * random() ** 1.7;

    if (Math.hypot(x, y, z) < holeRadius) continue;
    points.push([x, y, z]);
  }

  const near: number[] = [];
  const far: number[] = [];
  for (const [x, y, z] of points) {
    (z > NEAR_PLANE ? near : far).push(x, y, z);
  }

  // Liens de proximité. O(n²) mais exécuté une seule fois au montage.
  const links: number[] = [];
  const limitSq = linkDistance * linkDistance;
  outer: for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      const dz = points[i][2] - points[j][2];
      if (dx * dx + dy * dy + dz * dz > limitSq) continue;

      links.push(...points[i], ...points[j]);
      if (links.length / 6 >= maxLinks) break outer;
    }
  }

  return {
    near: new Float32Array(near),
    far: new Float32Array(far),
    links: new Float32Array(links),
    nearCount: near.length / 3,
    farCount: far.length / 3,
    linkCount: links.length / 6,
  };
}

/**
 * Radial-gradient sprite drawn on a canvas — no image asset, no request.
 * `softness` 0 = crisp disc, 1 = wide halo.
 */
export function createPointSprite(softness: number, size = 64): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  const core = 0.34 - softness * 0.3;

  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(Math.max(0.02, core), "rgba(255,255,255,0.92)");
  gradient.addColorStop(Math.min(0.95, core + 0.22 + softness * 0.4), "rgba(255,255,255,0.16)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}
