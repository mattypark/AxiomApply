"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CHAPTERS } from "@/components/rocket/chapters";
import { buildShapes, type ShapeName } from "@/components/rocket/model";
import { createParticles } from "@/components/rocket/particles";
import { clamp01, landingAt, liftAt, morphAt } from "@/components/rocket/path";

/**
 * The 3D object: one fixed, transparent canvas that never takes a click, and
 * one particle cloud that lives in two places on the page.
 *
 *   story   — sits in the pinned stage (`[data-story-stage]`), morphing shape
 *             per chapter and holding still while each chapter's text arrives.
 *             After the last chapter it lifts off, slowly, up and out.
 *   landing — comes back down as the closing band scrolls in and settles on
 *             the pad (`[data-landing-pad]`), which lights when it touches.
 *
 * Positions come from the DOM every frame, so the object is always exactly
 * over its stage or its pad whatever the layout does. Every motion is eased
 * twice — once by the eased scroll, once by a slow follow — which is what
 * makes it turn like something heavy instead of snapping.
 *
 * Desktop only; RocketLayer does not mount it below 1024px.
 */

const COUNT = 6500;
const CAM_Z = 9;
const FOV = 40;
const TAN = Math.tan((FOV * Math.PI) / 360);
/** Shape clouds are ~3.4 units tall. */
const SHAPE_HEIGHT = 3.4;
/** How much of each frame's gap the scroll closes. Lower is heavier. */
const SCROLL_EASE = 0.07;
/** How much of each frame's gap position/rotation close. Lower turns slower. */
const FOLLOW = 0.06;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function RocketScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true });
    } catch {
      return; // No WebGL: the page is complete without the object.
    }
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);

    const shapes = buildShapes(COUNT);
    const chapterShapes: ShapeName[] = CHAPTERS.map((chapter) => chapter.shape);
    const cloud = createParticles(COUNT, pixelRatio);
    cloud.uniforms.uMotion.value = reduce ? 0 : 1;
    cloud.uniforms.uMouseOn.value = reduce ? 0 : 1;
    const object = new THREE.Group();
    object.add(cloud.points);
    scene.add(object);

    let pair = "";
    function showPair(from: ShapeName, to: ShapeName) {
      const key = `${from}>${to}`;
      if (key === pair) return;
      pair = key;
      cloud.setPair(shapes[from], shapes[to]);
    }
    showPair("rocket", "rocket");

    // ---- layout ---------------------------------------------------------
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    const halfWorld = CAM_Z * TAN; // world half-height at z = 0

    function resize() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      renderer.setSize(vw, vh, false);
      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();
    }

    const toWorldX = (px: number) => ((px - vw / 2) / (vh / 2)) * halfWorld;
    const toWorldY = (py: number) => (-(py - vh / 2) / (vh / 2)) * halfWorld;
    const pxToWorld = (px: number) => (px / (vh / 2)) * halfWorld;

    // ---- input ------------------------------------------------------------
    let targetScroll = window.scrollY;
    let scroll = targetScroll;
    const onScroll = () => {
      targetScroll = window.scrollY;
    };

    const mouse = { x: 0, y: 0, nx: 0, ny: 0, inside: false };
    const onMove = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.nx = event.clientX / vw - 0.5;
      mouse.ny = event.clientY / vh - 0.5;
      mouse.inside = true;
    };
    const onLeave = () => {
      mouse.inside = false;
    };

    let padHover = false;
    const onPadEnter = () => {
      padHover = true;
    };
    const onPadLeave = () => {
      padHover = false;
    };
    const padElement = document.querySelector<HTMLElement>("[data-landing-pad]");
    padElement?.addEventListener("pointerenter", onPadEnter);
    padElement?.addEventListener("pointerleave", onPadLeave);

    // ---- the frame --------------------------------------------------------
    const target = { x: 0, y: 0, scale: 1, tilt: 0, opacity: 0 };
    const now = { x: 0, y: 0, scale: 1, tilt: 0, opacity: 0, spin: 0, lookX: 0, lookY: 0 };
    let frame = 0;
    let settled = false;
    let landed = false;

    function tick(time: number) {
      frame = requestAnimationFrame(tick);
      const t = time * 0.001;
      scroll += (targetScroll - scroll) * (reduce ? 1 : SCROLL_EASE);

      const story = document.querySelector<HTMLElement>("[data-story]");
      const stage = document.querySelector<HTMLElement>("[data-story-stage]");

      let mode: "story" | "landing" | "none" = "none";
      let chapterFloat = 0;
      let landing = 0;
      let padRect: DOMRect | null = null;

      if (padElement) {
        padRect = padElement.getBoundingClientRect();
        // Measured against the eased scroll, not the live one, so the descent
        // has the same weight as everything else.
        const easedCentre = padRect.top + padRect.height / 2 + (window.scrollY - scroll);
        landing = landingAt(easedCentre, vh);
        if (landing > 0) mode = "landing";
      }

      if (mode === "none" && story && stage) {
        const storyTop = story.getBoundingClientRect().top + window.scrollY;
        chapterFloat = (scroll - storyTop) / vh;
        const rect = stage.getBoundingClientRect();
        const lift = liftAt(chapterFloat, CHAPTERS.length);
        if (rect.bottom > 0 && rect.top < vh && lift < 1) {
          mode = "story";
          const morph = morphAt(chapterFloat, chapterShapes);
          showPair(morph.from, morph.to);
          cloud.uniforms.uMix.value = morph.mix;

          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height * 0.5;
          const size = Math.min(rect.width, rect.height) * 0.5;
          // Lift-off: rises most of a screen and drifts right, leaning into it.
          target.x = toWorldX(cx + lift * vw * 0.18);
          target.y = toWorldY(cy - lift * vh * 1.15);
          target.scale = pxToWorld(size) / SHAPE_HEIGHT;
          target.tilt = -lift * 0.32;
          target.opacity = 1 - clamp01((lift - 0.75) / 0.25);
        }
      }

      if (mode === "landing" && padRect) {
        showPair("rocket", "rocket");
        cloud.uniforms.uMix.value = 0;
        const padX = padRect.left + padRect.width / 2;
        const padY = padRect.top + padRect.height * 0.35;
        const height = Math.min(260, vh * 0.3);
        // A gentle arc in from the upper right that flattens into the pad.
        const q = landing;
        const sx = padX + vw * 0.22;
        const sy = padY - vh * 1.05;
        const cx = padX + vw * 0.2;
        const cy = padY - vh * 0.35;
        const ex = padX;
        const ey = padY - height / 2;
        const a = (1 - q) * (1 - q);
        const b = 2 * (1 - q) * q;
        const c = q * q;
        target.x = toWorldX(a * sx + b * cx + c * ex);
        target.y = toWorldY(a * sy + b * cy + c * ey);
        target.scale = pxToWorld(height) / SHAPE_HEIGHT;
        // Leans back against its own descent and straightens as it arrives.
        target.tilt = 0.28 * (1 - q) ** 1.5;
        target.opacity = clamp01(q * 3);
      }

      if (mode === "none") target.opacity = 0;

      // Slow follow: this is what makes it turn like something with mass. In
      // the story the stage itself is the anchor, so position follows it
      // tightly and only rotation carries the weight; the lift-off and the
      // landing are free flight, and follow slowly.
      const lifting = mode === "story" && liftAt(chapterFloat, CHAPTERS.length) > 0;
      const follow = reduce ? 1 : mode === "story" && !lifting ? 0.35 : FOLLOW;
      const jump = !settled || reduce;
      now.x = jump ? target.x : lerp(now.x, target.x, follow);
      now.y = jump ? target.y : lerp(now.y, target.y, follow);
      now.scale = jump ? target.scale : lerp(now.scale, target.scale, follow);
      now.tilt = lerp(now.tilt, target.tilt, reduce ? 1 : 0.04);
      now.opacity = lerp(now.opacity, target.opacity, reduce ? 1 : 0.08);
      if (mode !== "none") settled = true;

      // The cursor: the object leans toward it, slowly.
      const lookX = mouse.inside && !reduce ? mouse.nx : 0;
      const lookY = mouse.inside && !reduce ? mouse.ny : 0;
      now.lookX = lerp(now.lookX, lookX, 0.04);
      now.lookY = lerp(now.lookY, lookY, 0.04);

      // Turning: a slow idle spin plus a quarter-turn per chapter.
      const spinTarget = (reduce ? 0 : t * 0.12) + (mode === "story" ? chapterFloat * 0.9 : 0);
      now.spin = lerp(now.spin, spinTarget, reduce ? 1 : 0.05);

      object.position.set(now.x, now.y, 0);
      object.scale.setScalar(now.scale);
      object.rotation.set(0.12 + now.lookY * 0.35, now.spin + now.lookX * 0.6, now.tilt);

      cloud.uniforms.uTime.value = t;
      cloud.uniforms.uOpacity.value = now.opacity;
      cloud.uniforms.uSize.value = 22 * Math.min(1.4, Math.max(0.7, now.scale / 0.55));
      cloud.uniforms.uSwirl.value = lerp(cloud.uniforms.uSwirl.value, padHover ? 1 : 0, 0.08);
      cloud.uniforms.uMouse.value.set(
        mouse.inside ? toWorldX(mouse.x) : 999,
        mouse.inside ? toWorldY(mouse.y) : 999,
      );

      // The pad lights when the rocket is down on it.
      const isLanded = mode === "landing" && landing > 0.97;
      if (isLanded !== landed && padElement) {
        landed = isLanded;
        padElement.dataset.landed = String(landed);
      }

      if (now.opacity < 0.005) {
        renderer.clear();
        return;
      }
      renderer.render(scene, camera);
    }

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (document.visibilityState === "visible") {
        targetScroll = scroll = window.scrollY;
        frame = requestAnimationFrame(tick);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      padElement?.removeEventListener("pointerenter", onPadEnter);
      padElement?.removeEventListener("pointerleave", onPadLeave);
      if (padElement) delete padElement.dataset.landed;
      cloud.points.geometry.dispose();
      cloud.points.material.dispose();
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
