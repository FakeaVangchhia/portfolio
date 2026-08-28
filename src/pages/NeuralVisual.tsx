import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { buildFeatureSpace, groupLabels } from "@/data/embedding-corpus";
import { loadThree } from "@/lib/three-loader";

// Mirrors `navItems` in Index.tsx — these link back to sections on that page.
const navItems = [
  "home",
  "capabilities",
  "experience",
  "projects",
  "assistant",
  "contact",
];

// Must match the `palette` used for the point colours below.
const legendSwatches = ["#000000", "#5a5a5a", "#9a9a9a"];

const NeuralVisual = () => {
  // No portfolio section is active here — this is its own route, so the section
  // tabs stay unhighlighted and "Neural Vision" carries aria-current instead.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // three.js comes from a CDN, so "no scene" is a reachable state that needs to
  // say something rather than leave an empty box.
  const [loadFailed, setLoadFailed] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  // Same feature space the scene builds, used to describe itself in the legend.
  const corpusStats = useMemo(() => {
    const { points, dimensions } = buildFeatureSpace();
    return {
      projects: points.filter((doc) => doc.group === 0).length,
      technologies: points.filter((doc) => doc.group !== 0).length,
      dimensions,
    };
  }, []);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const goToSection = (sectionId: string) => {
    navigate({ pathname: "/", hash: `#${sectionId}` });
  };

  // Escape closes the mobile menu and returns focus to its trigger.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    let scene: any;
    let camera: any;
    let renderer: any;
    let points: any;
    let raycaster: any;
    let mouse: any;
    let hoveredIndex: number | null = null;
    let labels: string[] = [];
    let details: string[] = [];
    let groups: number[] = [];
    let positionsAttr: any;
    let colorsAttr: any;
    let group: any;
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let radius = 20;
    let theta = Math.PI / 4;
    let phi = Math.PI / 4;

    const init = async () => {
      let THREE: any;
      try {
        THREE = await loadThree();
      } catch {
        setLoadFailed(true);
        return;
      }
      if (!THREE || !containerRef.current) return;

      const width = containerRef.current.clientWidth || window.innerWidth;
      const height = containerRef.current.clientHeight || window.innerHeight;

      scene = new THREE.Scene();
      scene.background = null;
      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      const setCameraFromSpherical = () => {
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        camera.position.set(x, y, z);
        camera.lookAt(0, 0, 0);
      };
      setCameraFromSpherical();

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rendererRef.current = renderer;

      if (containerRef.current) containerRef.current.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambient);

      const grid = new THREE.GridHelper(60, 30, 0x000000, 0xb0b0b0);
      grid.position.y = -10;
      scene.add(grid);
      const axes = new THREE.AxesHelper(12);
      // AxesHelper ships red/green/blue vertex colours; force it to neutral ink.
      axes.material.vertexColors = false;
      axes.material.color.setHex(0x333333);
      axes.material.needsUpdate = true;
      scene.add(axes);

      // Real corpus: the site's own technologies and projects, featurized into
      // character-bigram term-frequency vectors. No synthetic points.
      const { points: corpus, vectors: data } = buildFeatureSpace();
      const N = corpus.length;
      labels = corpus.map((doc) => doc.label);
      details = corpus.map((doc) => doc.detail);
      groups = corpus.map((doc) => doc.group);

      const centerData = (X: number[][]) => {
        const n = X.length, d = X[0].length;
        const mean = new Array(d).fill(0);
        for (let i = 0; i < n; i++) for (let j = 0; j < d; j++) mean[j] += X[i][j];
        for (let j = 0; j < d; j++) mean[j] /= n;
        const Y = X.map(row => row.map((v, j) => v - mean[j]));
        return { Y, mean };
      };

      const covariance = (X: number[][]) => {
        const n = X.length, d = X[0].length;
        const C = Array.from({ length: d }, () => new Array(d).fill(0));
        for (let i = 0; i < n; i++) {
          const xi = X[i];
          for (let a = 0; a < d; a++) {
            for (let b = a; b < d; b++) {
              C[a][b] += xi[a] * xi[b];
            }
          }
        }
        for (let a = 0; a < d; a++) {
          for (let b = a; b < d; b++) {
            C[a][b] /= (n - 1);
            C[b][a] = C[a][b];
          }
        }
        return C;
      };

      const norm = (v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
      const matVec = (M: number[][], v: number[]) => M.map(row => row.reduce((s, m, j) => s + m * v[j], 0));
      const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
      const subVec = (a: number[], b: number[]) => a.map((x, i) => x - b[i]);
      const outer = (a: number[], b: number[]) => a.map(ai => b.map(bj => ai * bj));
      const subMat = (A: number[][], B: number[][]) => A.map((row, i) => row.map((x, j) => x - B[i][j]));

      const powerIteration = (M: number[][], iters = 150) => {
        // Deterministic start vector (fixed-seed LCG) so the same corpus always
        // lands in the same place — a random seed made the layout jump on every
        // page load, which reads as noise rather than structure.
        let seed = 20260101;
        let v = Array.from({ length: M.length }, () => {
          seed = (seed * 1664525 + 1013904223) % 4294967296;
          return seed / 4294967296 - 0.5;
        });
        for (let k = 0; k < iters; k++) {
          const Mv = matVec(M, v);
          const nrm = norm(Mv) || 1;
          v = Mv.map(x => x / nrm);
        }
        const lambda = dot(v, matVec(M, v)) / (dot(v, v) || 1);
        return { vec: v, val: lambda };
      };

      const { Y } = centerData(data);
      let C = covariance(Y);
      const components: number[][] = [];
      for (let k = 0; k < 3; k++) {
        const { vec } = powerIteration(C, 200);
        components.push(vec);
        const lam = dot(vec, matVec(C, vec));
        const outerV = outer(vec, vec).map(row => row.map(x => x * lam));
        C = subMat(C, outerV);
      }
      const W = components; // 3 x D
      const proj = Y.map(row => {
        const p = [0, 0, 0];
        for (let k = 0; k < 3; k++) {
          p[k] = dot(W[k], row);
        }
        return p;
      });

      const xs = proj.map(p => p[0]);
      const ys = proj.map(p => p[1]);
      const zs = proj.map(p => p[2]);
      const min = (arr: number[]) => Math.min(...arr);
      const max = (arr: number[]) => Math.max(...arr);
      const range = (lo: number, hi: number) => hi - lo || 1;
      const nx = (x: number) => ((x - min(xs)) / range(min(xs), max(xs)) - 0.5) * 30;
      const ny = (y: number) => ((y - min(ys)) / range(min(ys), max(ys)) - 0.5) * 30;
      const nz = (z: number) => ((z - min(zs)) / range(min(zs), max(zs)) - 0.5) * 30;

      const positions = new Float32Array(N * 3);
      const colors = new Float32Array(N * 3);
      // Monochrome ramp keyed to the document's group, not its index. The page
      // behind this canvas is pure white, so the ramp stays in the dark half —
      // anything past ~0x9a9a9a washes out against the background.
      const palette = [0x000000, 0x5a5a5a, 0x9a9a9a];
      for (let i = 0; i < N; i++) {
        const p = proj[i];
        positions[i * 3 + 0] = nx(p[0]);
        positions[i * 3 + 1] = ny(p[1]);
        positions[i * 3 + 2] = nz(p[2]);
        const col = palette[groups[i]] ?? palette[palette.length - 1];
        colors[i * 3 + 0] = ((col >> 16) & 255) / 255;
        colors[i * 3 + 1] = ((col >> 8) & 255) / 255;
        colors[i * 3 + 2] = (col & 255) / 255;
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      positionsAttr = geom.getAttribute('position');
      colorsAttr = geom.getAttribute('color');
      // Far fewer points than the old synthetic cloud, so each one has to be
      // big enough to aim at.
      const mat = new THREE.PointsMaterial({ size: 1.1, vertexColors: true, sizeAttenuation: true });
      points = new THREE.Points(geom, mat);

      group = new THREE.Group();
      group.add(points);
      scene.add(group);

      raycaster = new THREE.Raycaster();
      // Default threshold is tuned for dense clouds; match it to the point size.
      raycaster.params.Points.threshold = 0.9;
      mouse = new THREE.Vector2();

      const onPointerMove = (ev: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      };
      const onMouseDown = (ev: MouseEvent) => { isDragging = true; lastX = ev.clientX; lastY = ev.clientY; };
      const onMouseUp = () => { isDragging = false; };
      const onMouseMoveDrag = (ev: MouseEvent) => {
        if (!isDragging) return;
        const dx = ev.clientX - lastX;
        const dy = ev.clientY - lastY;
        lastX = ev.clientX; lastY = ev.clientY;
        theta -= dx * 0.005;
        phi -= dy * 0.005;
        const eps = 0.001;
        phi = Math.max(eps, Math.min(Math.PI - eps, phi));
        setCameraFromSpherical();
      };
      const onWheel = (ev: WheelEvent) => {
        radius *= ev.deltaY > 0 ? 1.05 : 0.95;
        radius = Math.max(5, Math.min(80, radius));
        setCameraFromSpherical();
      };
      renderer.domElement.addEventListener('mousemove', onPointerMove);
      renderer.domElement.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMoveDrag);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

      let t = 0;
      const animate = () => {
        t += 0.01;
        if (group) group.rotation.y += 0.0005;

        if (raycaster && points) {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObject(points);
          if (intersects.length > 0) {
            const idx = intersects[0].index ?? null;
            if (idx !== null) {
              hoveredIndex = idx;
              const pos = new (window as any).THREE.Vector3(
                positionsAttr.getX(idx),
                positionsAttr.getY(idx),
                positionsAttr.getZ(idx)
              );
              const projected = pos.clone().project(camera);
              const x = (projected.x * 0.5 + 0.5) * (containerRef.current?.clientWidth || window.innerWidth);
              const y = (-projected.y * 0.5 + 0.5) * (containerRef.current?.clientHeight || window.innerHeight);
              if (tooltipRef.current) {
                tooltipRef.current.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
                tooltipRef.current.style.opacity = '1';
                tooltipRef.current.innerHTML = "";
                const name = document.createElement("div");
                name.style.fontWeight = "600";
                name.textContent = labels[idx];
                const detail = document.createElement("div");
                detail.style.opacity = "0.65";
                detail.style.marginTop = "2px";
                detail.textContent = details[idx] ?? "";
                tooltipRef.current.append(name, detail);
              }
            }
          } else if (tooltipRef.current) {
            tooltipRef.current.style.opacity = '0';
            hoveredIndex = null;
          }
        }
        renderer.render(scene, camera);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        const w = containerRef.current?.clientWidth || window.innerWidth;
        const h = containerRef.current?.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        renderer.domElement.removeEventListener('mousemove', onPointerMove);
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('mousemove', onMouseMoveDrag);
        renderer.domElement.removeEventListener('wheel', onWheel);
      };
    };

    let cleanupResize: (() => void) | undefined;
    init().then((c) => {
      cleanupResize = c as any;
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (rendererRef.current) {
        try {
          rendererRef.current.dispose?.();
        } catch {}
      }
      if (containerRef.current && containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      if (cleanupResize) cleanupResize();
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", background: "radial-gradient(1200px 600px at var(--mouse-x,50%) var(--mouse-y,50%), hsl(0 0% 0% / 0.06), transparent 60%)" }}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--mouse-x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--mouse-y", `${y}%`);
      }}
    >
      <nav
        aria-label="Primary"
        className="neon-nav-shell fixed left-1/2 top-4 z-50 w-[min(1120px,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl px-4 backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between py-3 md:px-2">
          <button
            onClick={() => navigate("/")}
            className="display-font rounded-md text-lg font-semibold tracking-tight text-primary"
          >
            Fakea Vangchhia
          </button>

          <div className="neon-tabs hidden items-center gap-1 rounded-full p-1 md:flex">
            {navItems.map((item) => (
              <button key={item} onClick={() => goToSection(item)} className="neon-tab">
                {item}
              </button>
            ))}
            <Button
              onClick={() => navigate("/neural_visual")}
              aria-current="page"
              className="h-9 rounded-full px-5"
            >
              Neural Vision
            </Button>
          </div>

          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-controls="neural-mobile-menu"
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div
            id="neural-mobile-menu"
            className="neon-tabs mb-2 mt-1 rounded-xl px-3 py-3 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    goToSection(item);
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium capitalize text-muted-foreground transition-all hover:bg-background hover:text-foreground"
                >
                  {item}
                </button>
              ))}
              <Button
                onClick={() => {
                  navigate("/neural_visual");
                  setMobileMenuOpen(false);
                }}
                aria-current="page"
                className="mt-2"
              >
                Neural Vision
              </Button>
            </div>
          </div>
        )}
      </nav>

      <div ref={containerRef} style={{ width: "100%", height: "100%", paddingTop: "92px" }} />

      {loadFailed && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-6">
          <div className="glass-panel max-w-md rounded-2xl p-8 text-center">
            <h1 className="display-font text-xl font-semibold tracking-tight">
              The 3D view could not load
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This page fetches three.js from a CDN at runtime, and that request
              failed — usually an offline connection or a blocked CDN. Everything
              else on the portfolio works without it.
            </p>
            <Button onClick={() => goToSection("projects")} className="mt-6 rounded-full px-6">
              Back to projects
            </Button>
          </div>
        </div>
      )}

      <aside className="glass-panel pointer-events-none absolute bottom-6 left-6 z-40 hidden max-w-xs rounded-2xl p-5 md:block">
        <h1 className="display-font text-lg font-semibold tracking-tight">
          Portfolio feature space
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Every point is a real entry from this site — {corpusStats.projects} projects and{" "}
          {corpusStats.technologies} technologies. Their text is featurized into{" "}
          {corpusStats.dimensions}-dimensional character-bigram vectors, then projected to
          3D with PCA computed in the browser. Technologies that share a project
          share its text, so they land near each other.
        </p>
        <ul className="mt-4 space-y-2">
          {([0, 1, 2] as const).map((group) => (
            <li key={group} className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: legendSwatches[group] }}
              />
              {groupLabels[group]}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.7rem] text-muted-foreground/70">
          Drag to orbit · scroll to zoom · hover a point for its label
        </p>
      </aside>
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none",
          transform: "translate(-9999px, -9999px)",
          color: "hsl(0 0% 0%)",
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid hsl(0 0% 89%)",
          fontSize: 12,
          opacity: 0,
          transition: "opacity 120ms ease",
          backgroundColor: "hsl(0 0% 100% / 0.95)",
          boxShadow: "0 2px 12px hsl(0 0% 0% / 0.12)"
        }}
      />
    </div>
  );
};

export default NeuralVisual;
