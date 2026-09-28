"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  addLights,
  buildRocket,
  disposeTree,
  glowSprite,
  makeGlowTexture,
  makeRingTexture,
} from "@/components/rocket/model";
import {
  COMPACT_PATH,
  DESKTOP_MIN_WIDTH,
  DESKTOP_PATH,
  resolveBeats,
  scrollToCurve,
  type Beat,
  type ResolvedPath,
} from "@/components/rocket/path";

/**
 * The scroll-scrubbed rocket: one fixed, transparent, full-viewport canvas
 * that never takes a click.
 *
 * Everything on screen — position, roll, trail, which orbs are lit — is a pure
 * function of scroll position, so scrolling up plays it backwards with no
 * extra logic. The only state carried between frames is the eased scroll
 * value, which is what makes it feel like a scrubbed video rather than a
 * jittery one.
 *
 * Loaded through next/dynamic with ssr:false (RocketLayer), so three never
 * ships in the server bundle or delays first paint.
 */

const CAM_Z = 9;
const FOV = 40;
const TAN = Math.tan((FOV * Math.PI) / 360);
const TRAIL_POINTS = 140;
/** Eased scroll: fraction of the remaining distance covered per frame. */
const INERTIA = 0.075;

/** Where along each path the "passions" hang, as beat indices. */
const ORB_BEATS = {
  desktop: [1.5, 3.5, 5, 11, 15.5, 17.5, 23],
  compact: [1.5, 3.5, 5.5, 7.5],
};
const ORB_COLORS = [0x7dffa0, 0xffd166, 0x6be3ff, 0xff8fb1, 0xc9a7ff, 0xffffff, 0xff9d5c];

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function RocketScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // The prototype's colours were tuned with colour management off (r128's
    // default). Matching that keeps its exact greens.
    THREE.ColorManagement.enabled = false;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true });
    } catch {
      // No WebGL: the page is complete without the rocket.
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);
    addLights(scene);

    const glowTexture = makeGlowTexture();
    const ringTexture = makeRingTexture();
    const parts = buildRocket(glowTexture);
    scene.add(parts.rocket);

    // Orbs — the passions the rocket lights up as it passes.
    type Orb = {
      beat: number;
      dy: number;
      color: THREE.Color;
      mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
      glow: THREE.Sprite;
      shock: THREE.Sprite;
      u: number;
    };
    const dim = new THREE.Color(0x1a3a22);
    let orbs: Orb[] = [];

    function buildOrbs(beats: number[]) {
      for (const orb of orbs) {
        scene.remove(orb.mesh);
        disposeTree(orb.mesh);
      }
      orbs = beats.map((beat, index) => {
        const color = ORB_COLORS[index % ORB_COLORS.length];
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 24, 16),
          new THREE.MeshBasicMaterial({ color: 0x1a3a22 }),
        );
        const glow = glowSprite(glowTexture.clone(), color, 0.15);
        glow.scale.set(0.9, 0.9, 1);
        mesh.add(glow);
        const shock = glowSprite(ringTexture.clone(), color, 0);
        mesh.add(shock);
        scene.add(mesh);
        return { beat, dy: index % 2 ? -0.9 : 0.9, color: new THREE.Color(color), mesh, glow, shock, u: 0 };
      });
    }

    // Exhaust trail. Normal blending with per-point alpha rather than the
    // prototype's additive points, which vanished on the pale gradient.
    const trailPositions = new Float32Array(TRAIL_POINTS * 3);
    const trailColors = new Float32Array(TRAIL_POINTS * 4);
    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute("color", new THREE.BufferAttribute(trailColors, 4));
    const trail = new THREE.Points(
      trailGeometry,
      new THREE.PointsMaterial({
        size: 0.42,
        map: glowTexture.clone(),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    trail.frustumCulled = false;
    scene.add(trail);

    // Layout-dependent state, rebuilt on resize and on layout shifts.
    let curve = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(0, 1, 0)]);
    let resolved: ResolvedPath = { positions: [0, 1], stretchFrom: 0, max: 1 };
    let beatCount = 2;
    let baseScale = 0.62;
    let compact = false;
    let orbsAllowed = true;

    function layout() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      const nextCompact = width < DESKTOP_MIN_WIDTH;
      const beats: Beat[] = nextCompact ? COMPACT_PATH : DESKTOP_PATH;
      // Desktop is a notch smaller than the prototype's 0.62 so an upright
      // rocket fits inside the gutters beside the 49.5rem text column.
      baseScale = nextCompact ? (width < 640 ? 0.2 : 0.3) : 0.5 * Math.min(1, aspect * 0.85);
      // The trail is sized in world units; tie it to the rocket so a phone's
      // small rocket does not drag a desktop-sized smear across the copy.
      (trail.material as THREE.PointsMaterial).size = 0.42 * (baseScale / 0.5);

      curve = new THREE.CatmullRomCurve3(
        beats.map((beat) => {
          const halfHeight = (CAM_Z - beat.z) * TAN;
          return new THREE.Vector3(beat.x * halfHeight * aspect, beat.y * halfHeight, beat.z);
        }),
        false,
        "centripetal",
      );
      beatCount = beats.length;
      resolved = resolveBeats(beats);

      if (nextCompact !== compact || orbs.length === 0) {
        compact = nextCompact;
        buildOrbs(compact ? ORB_BEATS.compact : ORB_BEATS.desktop);
      }
      for (const orb of orbs) {
        orb.u = orb.beat / (beatCount - 1);
        const point = curve.getPoint(orb.u);
        const lift = orb.dy * (compact ? 0.35 : 0.5 + Math.max(0, point.z) * 0.12);
        orb.mesh.position.set(point.x, point.y + lift, point.z - 0.4);
      }
      // Phones get the rocket alone; orbs at that size are specks over text.
      orbsAllowed = !compact || width >= 640;
    }

    // Scroll, eased.
    let target = window.scrollY;
    let current = target;
    let previousU = 0;
    const onScroll = () => {
      target = window.scrollY;
    };

    let layoutFrame = 0;
    const scheduleLayout = () => {
      if (layoutFrame) return;
      layoutFrame = requestAnimationFrame(() => {
        layoutFrame = 0;
        layout();
      });
    };

    const up = new THREE.Vector3(0, 1, 0);
    const tangent = new THREE.Vector3();
    const facing = new THREE.Quaternion();
    const trailHead = new THREE.Color(0.85, 1, 0.8);
    const trailTail = new THREE.Color(0.12, 0.55, 0.24);
    const scratch = new THREE.Color();

    let frame = 0;

    function tick(now: number) {
      frame = requestAnimationFrame(tick);
      const time = now * 0.001;

      current += (target - current) * (reduce ? 1 : INERTIA);
      const u = scrollToCurve(current, resolved);
      const velocity = u - previousU;
      previousU = u;
      const speed = Math.min(1, Math.abs(velocity) * 260);

      const position = curve.getPoint(u);
      curve.getTangent(u, tangent);
      tangent.z *= 0.35;
      tangent.normalize();
      facing.setFromUnitVectors(up, tangent);
      parts.rocket.quaternion.slerp(facing, reduce ? 1 : 0.25);

      const bob = reduce ? 0 : Math.sin(time * 1.6) * 0.06 * (1 - speed);
      parts.rocket.position.set(position.x, position.y + bob, position.z);
      parts.rocket.scale.setScalar(baseScale);
      parts.spin.rotation.y = u * Math.PI * 8 + (reduce ? 0 : Math.sin(time * 0.8) * 0.05);

      // Flame: bigger with speed, flickering unless motion is reduced.
      const intensity = 0.45 + 0.55 * speed;
      const flicker = reduce ? 1 : 1 + (Math.sin(time * 41) + Math.sin(time * 23.7)) * 0.05;
      const stretch = reduce ? 1 : 1 + Math.sin(time * 31) * 0.06;
      parts.flame.scale.set(flicker, (0.5 + intensity * 0.9) * stretch, flicker);
      parts.flameLight.intensity = (1 + intensity * 2.4) * Math.PI;
      (parts.flameGlow.material as THREE.SpriteMaterial).opacity = 0.5 + intensity * 0.45;
      (parts.halo.material as THREE.SpriteMaterial).opacity = 0.18 + intensity * 0.2;

      // Orbit rings exist only in the close-up. The prototype kept them faintly
      // on the whole way, and their bright dots drifted across copy.
      const zoom = smoothstep(0.8, 2.2, position.z);
      for (const orbit of parts.orbits) {
        orbit.tilt.visible = zoom > 0.01;
        orbit.tilt.scale.setScalar(0.6 + 0.4 * zoom);
      }
      parts.orbits[0].mat.opacity = 0.7 * zoom;
      parts.orbits[1].mat.opacity = 0.5 * zoom;
      parts.orbits[0].pivot.rotation.z = (reduce ? 0 : time * 1.2) + u * 20;
      parts.orbits[1].pivot.rotation.z = -(reduce ? 0 : time * 0.8) - u * 14;

      // Trail: the last stretch of the path behind the rocket.
      const visible = 0.35 + 0.65 * intensity;
      for (let index = 0; index < TRAIL_POINTS; index += 1) {
        const fraction = index / TRAIL_POINTS;
        const t = u - 0.004 - index * 0.0009;
        const alive = t >= 0 ? 1 : 0;
        const point = curve.getPoint(Math.max(0, t));
        const wobble = reduce ? 0 : 0.05 * fraction;
        trailPositions[index * 3] = point.x + Math.sin(index * 1.7 + time * 3) * wobble;
        trailPositions[index * 3 + 1] = point.y + Math.cos(index * 1.3 + time * 2.6) * wobble;
        trailPositions[index * 3 + 2] = point.z;
        scratch.copy(trailHead).lerp(trailTail, fraction);
        trailColors[index * 4] = scratch.r;
        trailColors[index * 4 + 1] = scratch.g;
        trailColors[index * 4 + 2] = scratch.b;
        trailColors[index * 4 + 3] = Math.pow(1 - fraction, 1.6) * 0.85 * visible * alive;
      }
      trailGeometry.attributes.position.needsUpdate = true;
      trailGeometry.attributes.color.needsUpdate = true;

      // Orbs: each exists only around its own moment. The path is in screen
      // space, so an orb left on screen would sit over whatever section
      // scrolls under it later — the prototype's orbs covered its headline.
      // Each fades in as the rocket approaches, lights as it passes, pops a
      // ring, and fades out behind it.
      const span = 0.06;
      for (const orb of orbs) {
        const presence =
          smoothstep(orb.u - span * 1.6, orb.u - span * 0.4, u) *
          (1 - smoothstep(orb.u + span * 0.8, orb.u + span * 1.8, u));
        orb.mesh.visible = orbsAllowed && presence > 0.01;
        const lit = smoothstep(orb.u - 0.012, orb.u + 0.012, u);
        orb.mesh.material.color.copy(dim).lerp(orb.color, lit);
        const pulse = reduce ? 0 : Math.sin(time * 2 + orb.u * 30) * 0.03 * lit;
        orb.mesh.scale.setScalar((0.6 + 0.6 * lit + pulse) * presence);
        // Kept low: the glow is additive, and on the pale end of the page a
        // bright one reads as a white disc rather than as light.
        (orb.glow.material as THREE.SpriteMaterial).opacity = (0.1 + 0.4 * lit) * presence;
        const since = u - orb.u;
        const shock = orb.shock.material as THREE.SpriteMaterial;
        if (since > 0 && since < 0.04) {
          const k = since / 0.04;
          shock.opacity = (1 - k) * 0.9;
          orb.shock.scale.setScalar(1 + k * 7);
        } else {
          shock.opacity = 0;
        }
      }

      camera.position.x = compact ? 0 : Math.sin(u * Math.PI * 2) * 0.25;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }

    // A hidden tab renders nothing.
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (document.visibilityState === "visible") {
        target = current = window.scrollY;
        frame = requestAnimationFrame(tick);
      }
    };

    // Sections move when fonts land, images decode or the FAQ opens; the
    // beats are measured from them, so re-measure whenever the page resizes.
    const observer = new ResizeObserver(scheduleLayout);
    observer.observe(document.body);

    layout();
    current = target = window.scrollY;
    previousU = scrollToCurve(current, resolved);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleLayout);
    document.addEventListener("visibilitychange", onVisibility);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(layoutFrame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleLayout);
      document.removeEventListener("visibilitychange", onVisibility);
      disposeTree(scene);
      glowTexture.dispose();
      ringTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
    />
  );
}
