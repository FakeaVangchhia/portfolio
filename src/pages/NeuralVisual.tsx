import { useEffect, useRef } from "react";

const NeuralVisual = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let scene: any;
    let camera: any;
    let renderer: any;
    let points: any;
    let raycaster: any;
    let mouse: any;
    let hoveredIndex: number | null = null;
    let labels: string[] = [];
    let positionsAttr: any;
    let colorsAttr: any;
    let group: any;
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let radius = 20;
    let theta = Math.PI / 4;
    let phi = Math.PI / 4;

    const ensureScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existing && (existing as any)._loaded) {
          resolve();
          return;
        }
        const script = existing ?? document.createElement("script");
        script.src = src;
        script.async = true;
        const onLoad = () => {
          (script as any)._loaded = true;
          resolve();
        };
        script.addEventListener("load", onLoad, { once: true });
        script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
        if (!existing) document.head.appendChild(script);
      });
    };

    const init = async () => {
      await ensureScript("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js");
      const THREE: any = (window as any).THREE;
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

      const grid = new THREE.GridHelper(60, 30, 0x7c3aed, 0x2a2a3a);
      grid.position.y = -10;
      scene.add(grid);
      const axes = new THREE.AxesHelper(12);
      scene.add(axes);

      const randn = () => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      };

      const categories = ["animals", "tech", "food", "sports"];
      const N = 240;
      const D = 8;
      const data: number[][] = [];
      labels = [];
      const centers = categories.map((_, i) => Array.from({ length: D }, () => (i - 1.5) * 3 + randn() * 0.2));
      for (let i = 0; i < N; i++) {
        const c = Math.floor((i / N) * categories.length);
        const vec = centers[c].map((v) => v + randn() * 0.9);
        data.push(vec);
        labels.push(`${categories[c]}_${i}`);
      }

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
        let v = Array.from({ length: M.length }, () => Math.random() - 0.5);
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
      const palette = [0x22c55e, 0x3b82f6, 0xf59e0b, 0xef4444];
      for (let i = 0; i < N; i++) {
        const p = proj[i];
        positions[i * 3 + 0] = nx(p[0]);
        positions[i * 3 + 1] = ny(p[1]);
        positions[i * 3 + 2] = nz(p[2]);
        const cidx = Math.floor((i / N) * palette.length);
        const col = palette[cidx];
        const r = ((col >> 16) & 255) / 255;
        const g = ((col >> 8) & 255) / 255;
        const b = (col & 255) / 255;
        colors[i * 3 + 0] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      positionsAttr = geom.getAttribute('position');
      colorsAttr = geom.getAttribute('color');
      const mat = new THREE.PointsMaterial({ size: 0.25, vertexColors: true });
      points = new THREE.Points(geom, mat);

      group = new THREE.Group();
      group.add(points);
      scene.add(group);

      raycaster = new THREE.Raycaster();
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
                tooltipRef.current.textContent = `${labels[idx]}`;
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
    <div style={{ width: "100%", height: "100vh", position: 'relative', background: "radial-gradient(1200px 600px at var(--mouse-x,50%) var(--mouse-y,50%), rgba(124,58,237,0.25), transparent 60%)" }}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--mouse-x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--mouse-y", `${y}%`);
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          pointerEvents: 'none',
          transform: 'translate(-9999px, -9999px)',
          background: 'rgba(20,20,30,0.9)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid rgba(124,58,237,0.6)',
          fontSize: 12,
          opacity: 0,
          transition: 'opacity 120ms ease',
          boxShadow: '0 2px 12px rgba(124,58,237,0.35)'
        }}
      />
    </div>
  );
};

export default NeuralVisual;
