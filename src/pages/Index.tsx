import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BrainCircuit, Database, Linkedin, Mail, Phone, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = ["home", "capabilities", "projects", "contact"];

const capabilityItems = [
  {
    icon: BrainCircuit,
    title: "Applied AI",
    details: "LLM workflows, prompt engineering, and task-specific model integration for practical business outcomes.",
  },
  {
    icon: Database,
    title: "Backend Engineering",
    details: "FastAPI and Django services designed for reliability, maintainability, and scale.",
  },
  {
    icon: Workflow,
    title: "Automation Systems",
    details: "Event-driven automations with Redis queues, API orchestration, and CI/CD delivery pipelines.",
  },
];

const projectItems = [
  {
    title: "Mobile CRM + Business Card Scanner",
    summary: "React Native and FastAPI pipeline using OCR + PyTorch with around 95% extraction accuracy.",
    stack: ["React Native", "FastAPI", "OpenCV", "PyTorch", "OCR"],
  },
  {
    title: "Social Media Automation Platform",
    summary: "Worker-based scheduler with Redis and Docker for reliable post batching and API throughput.",
    stack: ["FastAPI", "Redis", "Docker", "CI/CD", "Facebook Graph"],
  },
  {
    title: "Hotel Chawngthu Commerce Platform",
    summary: "Django booking and e-commerce system with Stripe integration and measurable booking growth.",
    stack: ["Django", "PostgreSQL", "Stripe", "Admin Dashboard"],
  },
];

const GRID_SIZE = 44;
const BUG_COUNT = 12;

type GridBug = {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
  hue: number;
  trail: number;
  twinkle: number;
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gridBugs, setGridBugs] = useState<GridBug[]>([]);
  const [gridBounds, setGridBounds] = useState({ cols: 0, rows: 0 });
  const bugLayerRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
      if (scrolledToBottom) {
        setActiveSection("contact");
        return;
      }

      for (const section of navItems) {
        const element = document.getElementById(section);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        if (rect.top <= 130 && rect.bottom >= 130) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const sectionId = location.hash.slice(1);
    const scrollToHashTarget = () => {
      const target = document.getElementById(sectionId);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    };

    // Wait one frame so section nodes are present after route transition.
    const frame = requestAnimationFrame(scrollToHashTarget);
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  useEffect(() => {
    const node = bugLayerRef.current;
    if (!node) return;

    const updateBounds = () => {
      const cols = Math.max(4, Math.floor(node.clientWidth / GRID_SIZE));
      const rows = Math.max(4, Math.floor(node.clientHeight / GRID_SIZE));
      setGridBounds({ cols, rows });
    };

    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (gridBounds.cols === 0 || gridBounds.rows === 0) return;
    setGridBugs(
      Array.from({ length: BUG_COUNT }, (_, id) => ({
        id,
        x: Math.floor(Math.random() * gridBounds.cols),
        y: Math.floor(Math.random() * gridBounds.rows),
        delay: Math.random() * 1.2,
        size: 7 + Math.random() * 4,
        hue: Math.round(-8 + Math.random() * 28),
        trail: 8 + Math.random() * 14,
        twinkle: 1.3 + Math.random() * 1.8,
      })),
    );
  }, [gridBounds.cols, gridBounds.rows]);

  useEffect(() => {
    if (!gridBugs.length || gridBounds.cols === 0 || gridBounds.rows === 0) return;

    const timer = window.setInterval(() => {
      setGridBugs((prev) =>
        prev.map((bug) => {
          if (Math.random() < 0.15) return bug;

          const horizontal = Math.random() < 0.5;
          const step = Math.random() < 0.5 ? -1 : 1;
          let nextX = bug.x;
          let nextY = bug.y;

          if (horizontal) {
            nextX = Math.min(Math.max(bug.x + step, 0), gridBounds.cols - 1);
          } else {
            nextY = Math.min(Math.max(bug.y + step, 0), gridBounds.rows - 1);
          }

          return { ...bug, x: nextX, y: nextY };
        }),
      );
    }, 430);

    return () => window.clearInterval(timer);
  }, [gridBugs.length, gridBounds.cols, gridBounds.rows]);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen text-foreground">
      <nav className="neon-nav-shell fixed left-1/2 top-4 z-50 w-[min(1120px,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl px-4 backdrop-blur-2xl">
        <div className="flex items-center justify-between py-3 md:px-2">
          <button onClick={() => scrollToSection("home")} className="display-font text-lg font-semibold tracking-tight text-primary">
            Fakea Vangchhia
          </button>

          <div className="neon-tabs hidden items-center gap-1 rounded-full p-1 md:flex">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`neon-tab ${
                  activeSection === item ? "neon-tab-active" : ""
                }`}
              >
                {item}
              </button>
            ))}
            <Button onClick={() => navigate("/neural_visual")} className="h-9 rounded-full px-5">
              Neural Vision
            </Button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground md:hidden"
          >
            Menu
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="neon-tabs mb-2 mt-1 rounded-xl px-3 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    scrollToSection(item);
                    setMobileMenuOpen(false);
                  }}
                  className={`rounded-md px-3 py-2 text-left text-sm font-medium capitalize transition-all ${
                    activeSection === item
                      ? "bg-primary/80 text-primary-foreground shadow-[0_0_14px_hsl(var(--primary)/0.45)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
              <Button
                onClick={() => {
                  navigate("/neural_visual");
                  setMobileMenuOpen(false);
                }}
                className="mt-2"
              >
                Neural Vision
              </Button>
            </div>
          </div>
        )}
      </nav>

      <main className="container pt-36">
        <section id="home" className="section-anchor relative overflow-hidden pb-20 pt-8 md:pb-24">
          <div className="hero-grid pointer-events-none absolute inset-0" />
          <div ref={bugLayerRef} className="hero-bug-layer pointer-events-none absolute inset-0">
            {gridBugs.map((bug) => (
              <span
                key={bug.id}
                className="hero-bug"
                style={{
                  left: `${bug.x * GRID_SIZE}px`,
                  top: `${bug.y * GRID_SIZE}px`,
                  animationDelay: `${bug.delay}s`,
                  animationDuration: `${bug.twinkle}s`,
                  ["--bug-size" as string]: `${bug.size}px`,
                  ["--bug-hue" as string]: `${bug.hue}deg`,
                  ["--bug-trail" as string]: `${bug.trail}px`,
                }}
              />
            ))}
          </div>
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="fade-in">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI Engineer Portfolio
              </p>
              <h1 className="display-font mb-6 text-4xl font-semibold tracking-tight md:text-6xl">
                Building dependable AI products, not just demos.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                I am Lalfakawma Vangchhia, an AI Engineer and full-stack developer focused on LLM-powered features,
                robust APIs, and automation pipelines that ship to production.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={() => scrollToSection("projects")} className="rounded-full px-6">
                  Explore Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={() => scrollToSection("contact")} variant="outline" className="rounded-full px-6">
                  Let&apos;s Collaborate
                </Button>
              </div>
            </div>

            <Card className="glass-panel elevated-card fade-in">
              <CardHeader className="pb-2">
                <CardTitle className="display-font text-xl">Profile Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">Generative AI, ML Integration, Backend Systems</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Core Stack</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["FastAPI", "Django", "PyTorch", "Redis", "Docker", "React"].map((item) => (
                      <span key={item} className="tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="rounded-xl border border-border/70 bg-card/70 p-4">
                    <p className="display-font text-2xl text-primary">95%</p>
                    <p className="text-xs text-muted-foreground">OCR extraction precision</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card/70 p-4">
                    <p className="display-font text-2xl text-primary">30%</p>
                    <p className="text-xs text-muted-foreground">booking uplift on platform work</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="capabilities" className="section-anchor py-12 md:py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="display-font text-3xl font-semibold tracking-tight md:text-4xl">Capabilities</h2>
            <p className="max-w-md text-sm text-muted-foreground">From model orchestration to APIs and deployment workflows.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {capabilityItems.map((item) => (
              <Card key={item.title} className="glass-panel elevated-card">
                <CardContent className="pt-6">
                  <item.icon className="mb-4 h-8 w-8 text-primary" />
                  <h3 className="display-font mb-2 text-xl font-medium">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="projects" className="section-anchor py-12 md:py-16">
          <div className="mb-8">
            <h2 className="display-font text-3xl font-semibold tracking-tight md:text-4xl">Selected Projects</h2>
          </div>
          <div className="space-y-4">
            {projectItems.map((project) => (
              <Card key={project.title} className="glass-panel elevated-card">
                <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-2xl">
                    <h3 className="display-font text-xl font-medium">{project.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
                  </div>
                  <div className="flex max-w-sm flex-wrap gap-2 md:justify-end">
                    {project.stack.map((tech) => (
                      <span key={tech} className="tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section id="contact" className="section-anchor py-12 pb-20 md:py-16">
          <Card className="glass-panel">
            <CardContent className="grid gap-8 p-8 md:grid-cols-[1.15fr_0.85fr] md:p-10">
              <div>
                <h2 className="display-font text-3xl font-semibold tracking-tight md:text-4xl">Let&apos;s Build Something Valuable</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Open to AI engineering, backend architecture, and product-focused roles where technical rigor and business impact both matter.
                </p>
                <div className="mt-6">
                  <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="rounded-full px-6">
                      View Resume
                    </Button>
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <a href="mailto:fakeavangchhia@gmail.com" className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/75 p-4 transition hover:border-primary/40">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-sm">fakeavangchhia@gmail.com</span>
                </a>
                <a href="tel:8787698473" className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/75 p-4 transition hover:border-primary/40">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-sm">+91 8787698473</span>
                </a>
                <a href="https://www.linkedin.com/in/fakeavangchhia/" className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/75 p-4 transition hover:border-primary/40">
                  <Linkedin className="h-5 w-5 text-primary" />
                  <span className="text-sm">linkedin.com/in/fakeavangchhia</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Copyright 2026 Lalfakawma Vangchhia
      </footer>
    </div>
  );
};

export default Index;
