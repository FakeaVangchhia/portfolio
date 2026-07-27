import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  BrainCircuit,
  Compass,
  Cpu,
  Database,
  FlaskConical,
  Linkedin,
  Mail,
  Phone,
  Rocket,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatbotPanel from "@/components/ChatbotPanel";
import NeuralBackground from "@/components/NeuralBackground";
import TypingRoles from "@/components/TypingRoles";
import {
  useCountUp,
  useScrollProgress,
  useScrollReveal,
} from "@/hooks/use-scroll-reveal";

const navItems = ["home", "capabilities", "projects", "assistant", "contact"];

const heroRoles = [
  "LLM-powered products.",
  "reliable backend APIs.",
  "automation pipelines.",
  "AI that ships to production.",
];

const stats = [
  { value: 95, suffix: "%", label: "OCR extraction precision" },
  { value: 30, suffix: "%", label: "booking uplift delivered" },
  { value: 3, suffix: "", label: "production platforms shipped" },
  { value: 6, suffix: "+", label: "core technologies mastered" },
];

const capabilityItems = [
  {
    icon: BrainCircuit,
    title: "Applied AI",
    details:
      "LLM workflows, prompt engineering, RAG, and task-specific model integration for practical business outcomes.",
  },
  {
    icon: Database,
    title: "Backend Engineering",
    details:
      "FastAPI and Django services designed for reliability, maintainability, and scale under real traffic.",
  },
  {
    icon: Workflow,
    title: "Automation Systems",
    details:
      "Event-driven automations with Redis queues, API orchestration, and CI/CD delivery pipelines.",
  },
];

const techStack = [
  "Python",
  "FastAPI",
  "Django",
  "PyTorch",
  "LangChain",
  "OpenAI",
  "Gemini",
  "RAG",
  "Redis",
  "Docker",
  "PostgreSQL",
  "React",
  "TypeScript",
  "OpenCV",
  "Vector DBs",
  "CI/CD",
];

const projectItems = [
  {
    title: "Mobile CRM + Business Card Scanner",
    summary:
      "React Native and FastAPI pipeline using OCR + PyTorch with around 95% extraction accuracy.",
    stack: ["React Native", "FastAPI", "OpenCV", "PyTorch", "OCR"],
  },
  {
    title: "Social Media Automation Platform",
    summary:
      "Worker-based scheduler with Redis and Docker for reliable post batching and API throughput.",
    stack: ["FastAPI", "Redis", "Docker", "CI/CD", "Facebook Graph"],
  },
  {
    title: "Hotel Chawngthu Commerce Platform",
    summary:
      "Django booking and e-commerce system with Stripe integration and measurable booking growth.",
    stack: ["Django", "PostgreSQL", "Stripe", "Admin Dashboard"],
  },
];

const processSteps = [
  {
    icon: Compass,
    title: "Discover",
    details:
      "Frame the real problem, define success metrics, and audit the data before writing a line of code.",
  },
  {
    icon: FlaskConical,
    title: "Prototype",
    details:
      "Rapid LLM and ML prototypes to validate feasibility fast and de-risk the hardest assumptions first.",
  },
  {
    icon: Cpu,
    title: "Engineer",
    details:
      "Harden into reliable APIs with tests, queues, and observability so it survives production traffic.",
  },
  {
    icon: Rocket,
    title: "Ship & Iterate",
    details:
      "Deploy through CI/CD, watch real usage, and improve continuously against measurable outcomes.",
  },
];

const Counter = ({ value, suffix }: { value: number; suffix: string }) => {
  const { ref, value: current } = useCountUp(value);
  return (
    <span ref={ref} className="display-font text-4xl font-semibold text-primary md:text-5xl">
      {current}
      {suffix}
    </span>
  );
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollProgress = useScrollProgress();

  useScrollReveal();

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 640);

      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;
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

    window.addEventListener("scroll", onScroll, { passive: true });
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

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen text-foreground">
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />
      <NeuralBackground />

      <nav className="neon-nav-shell fixed left-1/2 top-4 z-50 w-[min(1120px,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl px-4 backdrop-blur-2xl">
        <div className="flex items-center justify-between py-3 md:px-2">
          <button
            onClick={() => scrollToSection("home")}
            className="display-font text-lg font-semibold tracking-tight text-primary"
          >
            Fakea Vangchhia
          </button>

          <div className="neon-tabs hidden items-center gap-1 rounded-full p-1 md:flex">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`neon-tab ${activeSection === item ? "neon-tab-active" : ""}`}
              >
                {item}
              </button>
            ))}
            <Button
              onClick={() => navigate("/neural_visual")}
              className="h-9 rounded-full px-5"
            >
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
        {/* Hero */}
        <section
          id="home"
          className="section-anchor relative overflow-hidden pb-16 pt-8 md:pb-24"
        >
          <div className="hero-grid pointer-events-none absolute inset-0" />
          <div className="float-slow pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="float-slow pointer-events-none absolute right-0 top-40 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div data-reveal>
              <p className="section-eyebrow mb-5">
                <Sparkles className="h-3.5 w-3.5" /> AI Engineer Portfolio
              </p>
              <h1 className="display-font mb-4 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Building dependable
                <span className="gradient-text"> AI products</span>, not just demos.
              </h1>
              <p className="display-font mb-6 text-lg font-medium text-muted-foreground md:text-2xl">
                I engineer{" "}
                <TypingRoles roles={heroRoles} className="text-primary" />
              </p>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                I am Lalfakawma Vangchhia, an AI Engineer and full-stack developer
                focused on LLM-powered features, robust APIs, and automation
                pipelines that ship to production.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  onClick={() => scrollToSection("projects")}
                  className="group rounded-full px-6"
                >
                  Explore Projects
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  onClick={() => scrollToSection("contact")}
                  variant="outline"
                  className="rounded-full px-6"
                >
                  Let&apos;s Collaborate
                </Button>
              </div>
            </div>

            <Card className="glass-panel elevated-card" data-reveal="right">
              <CardHeader className="pb-2">
                <CardTitle className="display-font text-xl">Profile Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">
                    Generative AI, ML Integration, Backend Systems
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Core Stack</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["FastAPI", "Django", "PyTorch", "Redis", "Docker", "React"].map(
                      (item) => (
                        <span key={item} className="tag">
                          {item}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="rounded-xl border border-border/70 bg-card/70 p-4">
                    <p className="display-font text-2xl text-primary">95%</p>
                    <p className="text-xs text-muted-foreground">
                      OCR extraction precision
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card/70 p-4">
                    <p className="display-font text-2xl text-primary">30%</p>
                    <p className="text-xs text-muted-foreground">
                      booking uplift on platform work
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Animated stat band */}
        <section className="py-8" data-reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="stat-card"
                data-reveal="scale"
                style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
              >
                <Counter value={stat.value} suffix={stat.suffix} />
                <p className="mt-2 text-xs leading-snug text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Capabilities */}
        <section id="capabilities" className="section-anchor py-12 md:py-16">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div data-reveal>
              <p className="section-eyebrow mb-3">What I do</p>
              <h2 className="display-font text-3xl font-semibold tracking-tight md:text-4xl">
                Capabilities
              </h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground" data-reveal="left">
              From model orchestration to APIs and deployment workflows.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {capabilityItems.map((item, i) => (
              <Card
                key={item.title}
                className="glass-panel elevated-card"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}
              >
                <CardContent className="pt-6">
                  <span className="capability-icon">
                    <item.icon className="h-6 w-6" />
                  </span>
                  <h3 className="display-font mb-2 text-xl font-medium">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tech stack marquee */}
        <section className="py-6" data-reveal>
          <p className="section-eyebrow mb-5">Toolbox</p>
          <div className="marquee overflow-hidden">
            <div className="marquee-track">
              {[...techStack, ...techStack].map((tech, i) => (
                <span key={`${tech}-${i}`} className="marquee-chip">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="section-anchor py-12 md:py-16">
          <div className="mb-8" data-reveal>
            <p className="section-eyebrow mb-3">Work</p>
            <h2 className="display-font text-3xl font-semibold tracking-tight md:text-4xl">
              Selected Projects
            </h2>
          </div>
          <div className="space-y-4">
            {projectItems.map((project, i) => (
              <Card
                key={project.title}
                className="glass-panel elevated-card"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}
              >
                <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="display-font text-sm font-semibold text-primary/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="display-font text-xl font-medium">
                        {project.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {project.summary}
                    </p>
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

        {/* Process / how I work */}
        <section className="py-12 md:py-16">
          <div className="mb-8" data-reveal>
            <p className="section-eyebrow mb-3">Approach</p>
            <h2 className="display-font text-3xl font-semibold tracking-tight md:text-4xl">
              How I Take AI From Idea to Production
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <div
                key={step.title}
                className="glass-panel elevated-card relative rounded-2xl p-6"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}
              >
                <span className="capability-icon">
                  <step.icon className="h-6 w-6" />
                </span>
                <p className="display-font mb-1 text-xs font-semibold uppercase tracking-widest text-primary/70">
                  Step {i + 1}
                </p>
                <h3 className="display-font mb-2 text-lg font-medium">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.details}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* AI Assistant */}
        <section id="assistant" className="section-anchor py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div data-reveal="left">
              <p className="section-eyebrow mb-3">
                <BrainCircuit className="h-3.5 w-3.5" /> Live demo
              </p>
              <h2 className="display-font text-3xl font-semibold tracking-tight md:text-4xl">
                Talk to my AI assistant
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                Instead of reading a static bio, ask a question. This assistant is
                wired to a live LLM backend and answers about my projects, skills,
                and experience — a small showcase of the kind of AI features I build.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {[
                  "What is your strongest AI project?",
                  "Which backend frameworks do you use?",
                  "How do you deploy models to production?",
                ].map((q) => (
                  <li key={q} className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal="right">
              <ChatbotPanel />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="section-anchor py-12 pb-20 md:py-16">
          <Card className="glass-panel" data-reveal>
            <CardContent className="grid gap-8 p-8 md:grid-cols-[1.15fr_0.85fr] md:p-10">
              <div>
                <h2 className="display-font text-3xl font-semibold tracking-tight md:text-4xl">
                  Let&apos;s Build Something Valuable
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Open to AI engineering, backend architecture, and product-focused
                  roles where technical rigor and business impact both matter.
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
                <a
                  href="mailto:fakeavangchhia@gmail.com"
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/75 p-4 transition hover:border-primary/40 hover:-translate-y-0.5"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-sm">fakeavangchhia@gmail.com</span>
                </a>
                <a
                  href="tel:8787698473"
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/75 p-4 transition hover:border-primary/40 hover:-translate-y-0.5"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-sm">+91 8787698473</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/fakeavangchhia/"
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/75 p-4 transition hover:border-primary/40 hover:-translate-y-0.5"
                >
                  <Linkedin className="h-5 w-5 text-primary" />
                  <span className="text-sm">linkedin.com/in/fakeavangchhia</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Copyright 2026 Lalfakawma Vangchhia · Built with React, Tailwind &amp; a
        little neural flair.
      </footer>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 bg-card/80 text-primary shadow-[0_0_18px_hsl(var(--primary)/0.35)] backdrop-blur transition-all duration-300 hover:-translate-y-1 ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Index;
