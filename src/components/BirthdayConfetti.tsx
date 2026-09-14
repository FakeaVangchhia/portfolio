import { useEffect, useRef } from "react";

import { CONFETTI_BURST_EVENT, type ConfettiBurstDetail } from "@/lib/birthday";

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vrot: number;
  color: string;
  shape: "rect" | "circle" | "ribbon";
  /** Bursts fade out; the ambient drizzle is immortal and recycles at the top. */
  life: number;
  ambient: boolean;
};

const PALETTE_TOKENS = [
  "--party-pink",
  "--party-gold",
  "--party-sky",
  "--party-mint",
  "--party-lavender",
  "--party-coral",
];

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

/**
 * Fixed full-viewport confetti layer for birthday mode: a light ambient drizzle
 * of pieces tumbling down the page, plus bursts fired by `popConfetti()` via a
 * window event. Reads the `--party-*` tokens off the document so the colours
 * stay in step with the palette. Under `prefers-reduced-motion` it scatters one
 * settled frame and runs no loop, and bursts are ignored.
 */
const BirthdayConfetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const styles = getComputedStyle(document.documentElement);
    const colors = PALETTE_TOKENS.map((token) => {
      const hsl = styles.getPropertyValue(token).trim();
      return hsl ? `hsl(${hsl})` : "hsl(335 85% 55%)";
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let pieces: Piece[] = [];
    let raf = 0;
    let last = performance.now();

    const makePiece = (x: number, y: number, ambient: boolean): Piece => {
      const size = 5 + Math.random() * 6;
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.5 + Math.random() * 0.9,
        w: size,
        h: size * (0.5 + Math.random() * 0.8),
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.08,
        color: pick(colors),
        shape: pick(["rect", "rect", "circle", "ribbon"] as Piece["shape"][]),
        life: 1,
        ambient,
      };
    };

    const build = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Sparse on purpose — it sits behind body copy all the way down the page.
      const count = Math.min(70, Math.max(24, Math.floor((width * height) / 26000)));
      pieces = Array.from({ length: count }, () =>
        makePiece(Math.random() * width, Math.random() * height, true),
      );
    };

    const burst = (x: number, y: number, amount = 140) => {
      for (let i = 0; i < amount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 9;
        const piece = makePiece(x, y, false);
        piece.vx = Math.cos(angle) * speed;
        piece.vy = Math.sin(angle) * speed - 4;
        piece.vrot = (Math.random() - 0.5) * 0.4;
        pieces.push(piece);
      }
    };

    const drawPiece = (piece: Piece) => {
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rot);
      ctx.globalAlpha = piece.ambient ? 0.85 : Math.max(0, piece.life);
      ctx.fillStyle = piece.color;
      if (piece.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, piece.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (piece.shape === "ribbon") {
        ctx.fillRect(-piece.w / 2, -piece.h / 6, piece.w * 1.6, piece.h / 3);
      } else {
        ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      }
      ctx.restore();
    };

    const step = (now: number) => {
      // Normalise to 60fps so the drizzle speed is display-independent.
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;

      ctx.clearRect(0, 0, width, height);

      for (let i = pieces.length - 1; i >= 0; i--) {
        const piece = pieces[i];
        piece.x += piece.vx * dt + Math.sin(piece.rot * 2) * 0.3 * dt;
        piece.y += piece.vy * dt;
        piece.rot += piece.vrot * dt;

        if (piece.ambient) {
          if (piece.y > height + 12) {
            piece.y = -12;
            piece.x = Math.random() * width;
          }
          if (piece.x < -12) piece.x = width + 12;
          if (piece.x > width + 12) piece.x = -12;
        } else {
          // Burst pieces: gravity, drag, and a fade so they never pile up.
          piece.vy += 0.22 * dt;
          piece.vx *= 0.985;
          piece.vy *= 0.985;
          piece.life -= 0.011 * dt;
          if (piece.life <= 0 || piece.y > height + 20) {
            pieces.splice(i, 1);
            continue;
          }
        }

        drawPiece(piece);
      }

      raf = requestAnimationFrame(step);
    };

    const onBurst = (event: Event) => {
      const { x, y } = (event as CustomEvent<ConfettiBurstDetail>).detail;
      burst(x, y);
    };

    const resizeObserver = new ResizeObserver(() => build());
    resizeObserver.observe(canvas);
    build();

    if (reduced) {
      pieces.forEach(drawPiece);
      return () => resizeObserver.disconnect();
    }

    raf = requestAnimationFrame(step);
    window.addEventListener(CONFETTI_BURST_EVENT, onBurst);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener(CONFETTI_BURST_EVENT, onBurst);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="confetti-canvas pointer-events-none fixed inset-0 z-[5] h-full w-full"
      aria-hidden="true"
    />
  );
};

export default BirthdayConfetti;
