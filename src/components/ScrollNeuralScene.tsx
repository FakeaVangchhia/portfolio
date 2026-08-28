import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { loadThree, type Three } from "@/lib/three-loader";

/**
 * A scroll-driven 3D feed-forward network.
 *
 * Honesty note, because the rest of this site holds to it: unlike
 * `/neural_visual`, this plots **nothing real**. It is a diagram of a generic
 * MLP whose forward pass is wired to scroll position — an illustration, not a
 * projection of the portfolio. The copy beside it says so, and the link points
 * at the page that does plot real vectors.
 *
 * Three constraints shape the implementation:
 * - three.js arrives from a CDN (see `three-loader`), so it can fail. On
 *   failure the section keeps its heading, copy, and link; only the canvas is
 *   missing.
 * - It only starts loading once the section is near the viewport, so a visitor
 *   who never scrolls this far never pays the ~600KB.
 * - Under `prefers-reduced-motion` it renders exactly one settled frame and
 *   never starts an animation loop.
 */

const LAYERS = [5, 8, 8, 3];
const LAYER_GAP = 3.2;
const NODE_GAP = 1.05;

/** Signal particles travelling the edges, drawn as one Points cloud. */
const SIGNAL_COUNT = 90;

type Status = "idle" | "ready" | "failed";

const ScrollNeuralScene = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const navigate = useNavigate();

  useEffect(() => {
    const host = hostRef.current;
    const section = sectionRef.current;
    if (!host || !section) return;

    // Everything the async setup allocates, tracked so cleanup can run even if
    // the component unmounts mid-load.
    let disposed = false;
    let frame = 0;
    let renderer: Three = null;
    let scene: Three = null;
    let camera: Three = null;
    let resizeObserver: ResizeObserver | null = null;
    let onScroll: (() => void) | null = null;
    const disposables: Three[] = [];

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /**
     * Read an HSL design token and hand three.js something it can parse.
     *
     * Tailwind stores these channels space-separated (`0 0% 45%`) so they can be
     * composed as `hsl(var(--x) / <alpha>)` in CSS. three.js's colour parser
     * only accepts the legacy comma form, and on a miss it does not throw — it
     * silently leaves the colour white, which on this white page means an
     * invisible scene. So convert rather than interpolate.
     */
    const readInk = (token: string, fallback: string) => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue(token)
        .trim();
      if (!raw) return fallback;
      const parts = raw.split(/\s+/);
      return parts.length === 3
        ? `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})`
        : fallback;
    };

    const build = async () => {
      let THREE: Three;
      try {
        THREE = await loadThree();
      } catch {
        if (!disposed) setStatus("failed");
        return;
      }
      if (disposed || !hostRef.current) return;

      const width = hostRef.current.clientWidth || 1;
      const height = hostRef.current.clientHeight || 1;

      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        // No WebGL context available (old GPU, blocklisted driver, headless).
        setStatus("failed");
        return;
      }
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      hostRef.current.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      // Framed so the widest layer nearly fills the canvas; `draw` dollies in
      // slightly as the section scrolls past.
      camera.position.set(0, 0, 12);

      const ink = new THREE.Color(readInk("--primary", "hsl(0, 0%, 0%)"));
      const inkSoft = new THREE.Color(readInk("--ink-soft", "hsl(0, 0%, 45%)"));

      // PointsMaterial draws squares unless given a texture. A white disc works
      // as a mask: the material colour multiplies through it, so one texture
      // serves every layer regardless of ink.
      const discCanvas = document.createElement("canvas");
      discCanvas.width = discCanvas.height = 64;
      const discCtx = discCanvas.getContext("2d");
      if (discCtx) {
        discCtx.beginPath();
        discCtx.arc(32, 32, 30, 0, Math.PI * 2);
        discCtx.fillStyle = "#ffffff";
        discCtx.fill();
      }
      const disc = new THREE.CanvasTexture(discCanvas);
      disposables.push(disc);

      // The whole network hangs off one group, so scroll rotates it as a unit.
      const group = new THREE.Group();
      scene.add(group);

      // --- node positions -----------------------------------------------
      const layerPositions: number[][][] = LAYERS.map((count, layerIndex) => {
        const x = (layerIndex - (LAYERS.length - 1) / 2) * LAYER_GAP;
        return Array.from({ length: count }, (_, i) => {
          const y = (i - (count - 1) / 2) * NODE_GAP;
          // A little depth keeps it from reading as a flat SVG when it turns.
          const z = Math.sin(i * 1.7 + layerIndex) * 0.45;
          return [x, y, z];
        });
      });

      // --- nodes, one Points object per layer so they can reveal in order --
      const layerPoints = layerPositions.map((positions, layerIndex) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions.flat(), 3),
        );
        const material = new THREE.PointsMaterial({
          color: layerIndex === 0 || layerIndex === LAYERS.length - 1 ? ink : inkSoft,
          map: disc,
          size: 0.4,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        });
        const points = new THREE.Points(geometry, material);
        group.add(points);
        disposables.push(geometry, material);
        return points;
      });

      // --- edges ----------------------------------------------------------
      const edges: { from: number[]; to: number[] }[] = [];
      for (let l = 0; l < layerPositions.length - 1; l += 1) {
        for (const from of layerPositions[l]) {
          for (const to of layerPositions[l + 1]) {
            edges.push({ from, to });
          }
        }
      }

      const edgeGeometry = new THREE.BufferGeometry();
      edgeGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          edges.flatMap((edge) => [...edge.from, ...edge.to]),
          3,
        ),
      );
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: inkSoft,
        transparent: true,
        opacity: 0,
      });
      const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      group.add(edgeLines);
      disposables.push(edgeGeometry, edgeMaterial);

      // --- signal particles ------------------------------------------------
      // Each rides one edge; `offset` staggers them so the flow looks continuous
      // rather than a single synchronised wavefront.
      const signals = Array.from({ length: SIGNAL_COUNT }, () => ({
        edge: edges[Math.floor(Math.random() * edges.length)],
        offset: Math.random(),
      }));
      const signalGeometry = new THREE.BufferGeometry();
      const signalPositions = new Float32Array(SIGNAL_COUNT * 3);
      signalGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(signalPositions, 3),
      );
      const signalMaterial = new THREE.PointsMaterial({
        color: ink,
        map: disc,
        size: 0.19,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const signalPoints = new THREE.Points(signalGeometry, signalMaterial);
      group.add(signalPoints);
      disposables.push(signalGeometry, signalMaterial);

      // --- scroll → progress ------------------------------------------------
      // 0 as the section enters from below, 1 as it leaves through the top.
      let progress = reduceMotion ? 1 : 0;
      const measure = () => {
        const rect = section.getBoundingClientRect();
        const travel = window.innerHeight + rect.height;
        const seen = window.innerHeight - rect.top;
        return Math.min(1, Math.max(0, seen / travel));
      };

      const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

      const draw = (time: number) => {
        // Layers light up in sequence across the first 70% of the scroll, so the
        // network reads as assembling left-to-right rather than fading in flat.
        layerPoints.forEach((points, i) => {
          const start = (i / LAYERS.length) * 0.7;
          points.material.opacity = clamp01((progress - start) / 0.18) * 0.95;
        });
        // 128 edges overlap into a hairball if drawn too strongly; kept faint so
        // the nodes and travelling signals stay the readable elements.
        edgeMaterial.opacity = clamp01((progress - 0.2) / 0.4) * 0.15;
        signalMaterial.opacity = clamp01((progress - 0.35) / 0.3) * 0.9;

        // A quarter-turn total, centred so mid-section is close to face-on.
        group.rotation.y = (progress - 0.5) * 0.8;
        group.rotation.x = (progress - 0.5) * 0.18;
        camera.position.z = 12 - progress * 1.8;

        for (let i = 0; i < signals.length; i += 1) {
          const signal = signals[i];
          const t = reduceMotion
            ? signal.offset
            : (signal.offset + time * 0.00022) % 1;
          // Ease so packets accelerate out of a node and settle into the next.
          const eased = t * t * (3 - 2 * t);
          signalPositions[i * 3] =
            signal.edge.from[0] + (signal.edge.to[0] - signal.edge.from[0]) * eased;
          signalPositions[i * 3 + 1] =
            signal.edge.from[1] + (signal.edge.to[1] - signal.edge.from[1]) * eased;
          signalPositions[i * 3 + 2] =
            signal.edge.from[2] + (signal.edge.to[2] - signal.edge.from[2]) * eased;
        }
        signalGeometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      };

      setStatus("ready");

      if (reduceMotion) {
        // One settled frame, no loop, no scroll listener.
        draw(0);
      } else {
        progress = measure();
        let pending = false;
        onScroll = () => {
          if (pending) return;
          pending = true;
          requestAnimationFrame(() => {
            progress = measure();
            pending = false;
          });
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        const loop = (time: number) => {
          draw(time);
          frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
      }

      resizeObserver = new ResizeObserver(() => {
        const node = hostRef.current;
        if (!node || !renderer || !camera) return;
        const w = node.clientWidth || 1;
        const h = node.clientHeight || 1;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (reduceMotion) draw(0);
      });
      resizeObserver.observe(hostRef.current);
    };

    // Only pay for three.js if the visitor actually scrolls near this section.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void build();
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(section);

    return () => {
      disposed = true;
      observer.disconnect();
      resizeObserver?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      if (onScroll) window.removeEventListener("scroll", onScroll);
      disposables.forEach((item) => item.dispose?.());
      if (renderer) {
        renderer.domElement.remove();
        renderer.dispose();
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-12 md:py-16" aria-labelledby="network-heading">
      <div className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div data-reveal="left">
          <p className="section-eyebrow mb-3">Forward pass</p>
          <h2
            id="network-heading"
            className="display-font text-3xl font-semibold tracking-tight md:text-4xl"
          >
            A network that <span className="gradient-text">fires as you scroll</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Layers assemble left to right and activations travel the edges, driven
            by scroll position rather than a timeline. It is a diagram of a
            feed-forward network — deliberately generic, and plotting no real
            data.
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            For the honest version, Neural Vision projects this portfolio&apos;s
            actual technologies and projects through a real featurizer and PCA.
          </p>
          <Button
            onClick={() => navigate("/neural_visual")}
            variant="outline"
            className="group mt-6 rounded-full px-6"
          >
            See the real projection
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Purely decorative: the paragraph above carries the meaning. */}
        <div
          ref={hostRef}
          aria-hidden="true"
          className="h-[300px] w-full overflow-hidden rounded-2xl md:h-[420px]"
          data-reveal="right"
        >
          {status === "failed" && (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border">
              <p className="px-6 text-center text-sm text-muted-foreground">
                The 3D view needs to fetch three.js and could not reach the CDN.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ScrollNeuralScene;
