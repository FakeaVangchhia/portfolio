import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
};

/**
 * A lightweight animated "neural network": nodes drift on a canvas and wire
 * themselves to nearby neighbours, forming connections that fade with distance.
 * The field parallaxes slightly on scroll and reacts to the pointer, giving the
 * whole page an ambient AI feel without any heavy 3D dependency.
 */
const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue("--primary").trim() || "136 44% 42%";
    const accent = styles.getPropertyValue("--accent").trim() || "152 42% 52%";

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;
    const pointer = { x: -9999, y: -9999 };

    const build = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(96, Math.max(28, Math.floor((width * height) / 20000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1.1 + Math.random() * 1.9,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const LINK_DIST = 132;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Gentle pull toward the pointer for an interactive "focus".
        const dxp = pointer.x - node.x;
        const dyp = pointer.y - node.y;
        const distp = Math.hypot(dxp, dyp);
        if (distp < 160 && distp > 0.5) {
          node.x += (dxp / distp) * 0.35;
          node.y += (dyp / distp) * 0.35;
        }
      }

      // Connections.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > LINK_DIST) continue;
          const alpha = (1 - dist / LINK_DIST) * 0.32;
          ctx.strokeStyle = `hsl(${primary} / ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Nodes.
      for (const node of nodes) {
        const glow = 0.55 + Math.sin(node.pulse) * 0.35;
        ctx.fillStyle = `hsl(${accent} / ${glow.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const onScroll = () => {
      const next = window.scrollY * 0.04;
      // Translate the field for a subtle parallax as the page scrolls.
      canvas.style.transform = `translateY(${(-next % 40).toFixed(2)}px)`;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const resizeObserver = new ResizeObserver(() => build());
    resizeObserver.observe(canvas);
    build();
    draw();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="neural-canvas pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
};

export default NeuralBackground;
