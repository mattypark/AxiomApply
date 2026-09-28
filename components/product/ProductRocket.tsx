"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { addProductLights, buildProductRocket, disposeProduct } from "@/components/product/model";

/**
 * The product, on its own: a canvas that fills whatever box it is put in and
 * shows the rocket turning slowly, floating, and tilting toward the cursor.
 *
 * It renders only while its box is on screen, so the hero and the apply
 * block can each have one without both running. No scroll-driven motion —
 * like Moonshot's device, it just sits there being looked at.
 */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function ProductRocket({ scale = 1, turn = 0 }: { scale?: number; turn?: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    THREE.ColorManagement.enabled = false;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.2, 11);
    addProductLights(scene);

    const product = buildProductRocket();
    product.root.scale.setScalar(scale);
    product.root.rotation.z = -0.18;
    scene.add(product.root);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const sizer = new ResizeObserver(resize);
    sizer.observe(host);
    resize();

    // Where the cursor is, relative to the product's box (-1..1).
    const look = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      look.tx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      look.ty = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
    };
    if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

    let visible = false;
    let frame = 0;
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      const t = time * 0.001;
      look.x = lerp(look.x, look.tx, 0.05);
      look.y = lerp(look.y, look.ty, 0.05);

      product.spin.rotation.y = turn + (reduce ? 0.6 : t * 0.35);
      product.root.rotation.x = 0.08 + look.y * 0.22;
      product.root.rotation.y = look.x * 0.4;
      product.root.position.y = reduce ? 0 : Math.sin(t * 1.1) * 0.12;
      product.rings[0].pivot.rotation.z = reduce ? 0.8 : t * 0.6;
      product.rings[1].pivot.rotation.z = reduce ? 2.4 : -t * 0.4;
      renderer.render(scene, camera);
    };

    const onScreen = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === visible) return;
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(tick);
    });
    onScreen.observe(host);

    return () => {
      cancelAnimationFrame(frame);
      onScreen.disconnect();
      sizer.disconnect();
      window.removeEventListener("pointermove", onMove);
      disposeProduct(product.root);
      renderer.dispose();
    };
  }, [scale, turn]);

  return (
    <div ref={hostRef} className="absolute inset-0">
      <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
    </div>
  );
}
