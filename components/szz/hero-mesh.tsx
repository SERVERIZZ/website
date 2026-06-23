"use client";

import * as React from "react";

/**
 * HeroMeshBackdrop — a subtle, cursor-interactive dot mesh painted on a
 * <canvas> that fills its nearest positioned ancestor. A grid of accent-blue
 * dots brightens and swells as the (eased) pointer passes over them, giving the
 * homepage hero a quiet sense of depth without competing with the copy.
 *
 * Ported verbatim from the SERVERIZZ design comp's `initHeroMesh()`:
 *   - 30px dot grid, 150px cursor influence radius, quadratic (t²) falloff
 *   - dot radius 1 → 3.4px, alpha 0.07 → 0.77, colour rgba(96,165,250, a)
 *   - cursor eased toward the target at 0.12/frame for a trailing feel
 *   - DPR-aware backing store (capped at 2), repaints on resize
 *   - respects prefers-reduced-motion (draws one static frame, no RAF loop)
 *
 * Render it as the FIRST child of a `position:relative; overflow:hidden`
 * wrapper; the hero content should sit above it with `position:relative` and a
 * higher z-index. Pointer tracking is bound to the canvas's parent element so
 * the whole hero region is interactive even though the canvas itself is
 * `pointer-events:none`.
 */
export function HeroMeshBackdrop() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const S = {
      mx: -9999,
      my: -9999,
      tx: -9999,
      ty: -9999,
      w: 0,
      h: 0,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    };

    const gap = 30;
    const R = 150;

    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      S.w = rect.width;
      S.h = rect.height;
      canvas.width = Math.round(rect.width * S.dpr);
      canvas.height = Math.round(rect.height * S.dpr);
      ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      S.tx = e.clientX - rect.left;
      S.ty = e.clientY - rect.top;
      // snap to the target on the first move so it doesn't streak in from (-9999)
      if (S.mx < -9000) {
        S.mx = S.tx;
        S.my = S.ty;
      }
    };

    const onLeave = () => {
      S.tx = -9999;
      S.ty = -9999;
    };

    const draw = () => {
      // ease the cursor for a smooth trailing feel
      if (S.tx < -9000) {
        S.mx = S.tx;
        S.my = S.ty;
      } else {
        S.mx += (S.tx - S.mx) * 0.12;
        S.my += (S.ty - S.my) * 0.12;
      }
      ctx.clearRect(0, 0, S.w, S.h);
      for (let y = gap / 2; y < S.h; y += gap) {
        for (let x = gap / 2; x < S.w; x += gap) {
          const dx = x - S.mx;
          const dy = y - S.my;
          const t = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / R);
          const e = t * t;
          const r = 1 + e * 2.4;
          const a = 0.07 + e * 0.7;
          ctx.fillStyle = "rgba(96,165,250," + a.toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 6.2832);
          ctx.fill();
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.9,
      }}
    />
  );
}
