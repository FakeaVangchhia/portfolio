import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  BrainCircuit,
  Compass,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  FlaskConical,
  GraduationCap,
  Linkedin,
  Mail,
  PartyPopper,
  Phone,
  Rocket,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BirthdayConfetti from "@/components/BirthdayConfetti";
import ChatbotPanel from "@/components/ChatbotPanel";
import NeuralBackground from "@/components/NeuralBackground";
import ScrollNeuralScene from "@/components/ScrollNeuralScene";
import TypingRoles from "@/components/TypingRoles";
import {
  education,
  experience,
  projectItems,
  publication,
  techStack,
} from "@/data/portfolio";
import {
  useCountUp,
  useScrollProgress,
  useScrollReveal,
} from "@/hooks/use-scroll-reveal";
import { BIRTHDAY, isBirthdayMode, popConfetti } from "@/lib/birthday";

const navItems = [
  "home",
  "capabilities",
  "experience",
  "projects",
  "assistant",
  "contact",
];

// Resolved once: `applyBirthdayMode()` in main.tsx has already set the class.
const birthdayMode = isBirthdayMode();

const BIRTHDAY_LABEL = new Date(2000, BIRTHDAY.month - 1, BIRTHDAY.day)
  .toLocaleDateString("en-GB", { day: "numeric", month: "long" });

const wishSubject = encodeURIComponent("Happy Birthday, Fakea! 🎂");
const wishBody = encodeURIComponent(
  "Hi Fakea,\n\nHappy birthday! Hope your day is full of cake and green CI pipelines.\n\n",
);
const wishHref = `mailto:fakeavangchhia@gmail.com?subject=${wishSubject}&body=${wishBody}`;

// Pennant count for the garland; more flags than the widest hero needs, the
// container clips the overflow.
const buntingFlags = Array.from({ length: 34 }, (_, i) => i);

const balloons = [
  { emoji: "🎈", className: "-left-2 bottom-2 md:left-0", delay: "0ms" },
  { emoji: "🎈", className: "right-4 top-16 md:right-12", delay: "1200ms" },
  { emoji: "🎁", className: "left-[42%] top-8 hidden md:block", delay: "2400ms" },
  { emoji: "🎉", className: "bottom-10 right-2 md:right-6", delay: "800ms" },
];

const heroRoles = [
  "LLM-powered products.",
  "reliable backend APIs.",
  "automation pipelines.",
  "AI that ships to production.",
];

const stats = [
  { value: 95, suffix: "%", label: "OCR extraction precision" },
  { value: 40, suffix: "%", label: "faster real-time extraction" },
  { value: 30, suffix: "%", label: "booking uplift delivered" },
  // Derived, so the claim cannot drift away from the toolbox actually listed.
  { value: techStack.length, suffix: "+", label: "technologies in production use" },
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

const suggestedQuestions = [
  "What is your strongest AI project?",
  "Which backend frameworks do you use?",
  "How do you deploy models to production?",
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
  // Screen readers get the settled figure; only sighted users see it tick up.
  return (
    <span
      ref={ref}
      className="display-font text-4xl font-semibold tracking-tight text-primary md:text-5xl"
    >
      <span aria-hidden="true">
        {current}
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </span>
  );
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  // Question handed to the assistant panel when a suggestion chip is clicked.
  const [pendingQuestion, setPendingQuestion] = useState("");
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
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

  // Close the mobile menu on Escape and restore focus to its trigger, so a
  // keyboard user is never stranded inside a dismissed panel.
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
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />
      <NeuralBackground />
      {birthdayMode && <BirthdayConfetti />}

      <nav
        aria-label="Primary"
        className="neon-nav-shell fixed left-1/2 top-4 z-50 w-[min(1120px,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl px-4 backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between py-3 md:px-2">
          <button
            onClick={() => scrollToSection("home")}
            className="display-font rounded-md text-lg font-semibold tracking-tight text-primary"
          >
            Fakea Vangchhia
            {birthdayMode && (
              <span className="cake-wiggle ml-2" role="img" aria-label="birthday cake">
                🎂
              </span>
            )}
          </button>

          <div className="neon-tabs hidden items-center gap-1 rounded-full p-1 md:flex">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                aria-current={activeSection === item ? "true" : undefined}
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
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="neon-tabs mb-2 mt-1 rounded-xl px-3 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    scrollToSection(item);
                    setMobileMenuOpen(false);
                  }}
                  aria-current={activeSection === item ? "true" : undefined}
                  className={`rounded-md px-3 py-2 text-left text-sm font-medium capitalize transition-all ${
                    activeSection === item
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
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

      {/* tabIndex is what actually moves focus here when the skip link fires. */}
      <main id="main" tabIndex={-1} className="container pt-36 focus:outline-none">
        {/* Hero */}
        <section
          id="home"
          className="section-anchor relative overflow-hidden pb-16 pt-8 md:pb-24"
        >
          <div className="hero-grid pointer-events-none absolute inset-0" />
          <div className="float-slow pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-foreground/[0.06] blur-3xl" />
          <div className="float-slow pointer-events-none absolute right-0 top-40 h-52 w-52 rounded-full bg-foreground/[0.04] blur-3xl" />

          {birthdayMode && (
            <>
              <div className="bunting" aria-hidden="true">
                {buntingFlags.map((i) => (
                  <span
                    key={i}
                    className="bunting-flag"
                    style={{ ["--flag-delay" as string]: `${(i % 6) * 180}ms` }}
                  />
                ))}
              </div>
              {balloons.map((balloon, i) => (
                <span
                  key={i}
                  className={`balloon ${balloon.className}`}
                  style={{ ["--balloon-delay" as string]: balloon.delay }}
                  aria-hidden="true"
                >
                  {balloon.emoji}
                </span>
              ))}
            </>
          )}

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div data-reveal>
              {birthdayMode ? (
                <p className="section-eyebrow birthday-eyebrow mb-5">
                  <PartyPopper className="h-3.5 w-3.5" /> Birthday edition · {BIRTHDAY_LABEL}
                </p>
              ) : (
                <p className="section-eyebrow mb-5">
                  <Sparkles className="h-3.5 w-3.5" /> AI Engineer Portfolio
                </p>
              )}
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

              {birthdayMode && (
                <div className="birthday-card mt-8 rounded-2xl p-5" data-reveal>
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="display-font text-lg font-semibold">
                        <span className="cake-wiggle mr-2" role="img" aria-label="birthday cake">
                          🎂
                        </span>
                        It&apos;s my birthday today!
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        The site is wearing its party colours for the day. Pop some
                        confetti, or drop me a wish — both are appreciated.
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        onClick={(event) => {
                          const rect = event.currentTarget.getBoundingClientRect();
                          popConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
                        }}
                        className="party-button rounded-full px-5"
                      >
                        <PartyPopper className="h-4 w-4" />
                        Pop confetti
                      </Button>
                      <a href={wishHref}>
                        <Button variant="outline" className="rounded-full px-5">
                          Send a wish
                          <Mail className="ml-1 h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              )}
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
                  <div className="rounded-xl border border-border bg-card/70 p-4">
                    <p className="display-font text-2xl text-primary">95%</p>
                    <p className="text-xs text-muted-foreground">
                      OCR extraction precision
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card/70 p-4">
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
        <section
          id="capabilities"
          className="section-anchor py-12 md:py-16"
          aria-labelledby="capabilities-heading"
        >
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div data-reveal>
              <p className="section-eyebrow mb-3">What I do</p>
              <h2
                id="capabilities-heading"
                className="display-font text-3xl font-semibold tracking-tight md:text-4xl"
              >
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
        <section className="py-6" data-reveal aria-label="Technology toolbox">
          <p className="section-eyebrow mb-5">Toolbox</p>
          {/* The track is duplicated to loop seamlessly; the whole thing is
              decorative, so the real list is exposed to assistive tech instead. */}
          <div className="marquee overflow-hidden" aria-hidden="true">
            <div className="marquee-track">
              {[...techStack, ...techStack].map((tech, i) => (
                <span key={`${tech}-${i}`} className="marquee-chip">
                  <span className="marquee-dot h-1.5 w-1.5 rounded-full bg-primary" />
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <ul className="sr-only">
            {techStack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </section>

        {/* Experience */}
        <section
          id="experience"
          className="section-anchor py-12 md:py-16"
          aria-labelledby="experience-heading"
        >
          <div className="mb-8" data-reveal>
            <p className="section-eyebrow mb-3">Career</p>
            <div className="flex items-center gap-5">
              <h2
                id="experience-heading"
                className="display-font text-3xl font-semibold tracking-tight md:text-4xl"
              >
                Experience
              </h2>
              <span className="section-rule" aria-hidden="true" />
            </div>
          </div>

          {/* The rule is drawn once behind the whole list rather than per-item,
              so it reads as one continuous spine. */}
          <ol className="relative ml-1 space-y-6 pl-8">
            <span
              className="timeline-line absolute bottom-2 left-0 top-2 w-px"
              aria-hidden="true"
            />
            {experience.map((role, i) => (
              <li
                key={`${role.company}-${role.period}`}
                className="relative"
                data-reveal="left"
                style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}
              >
                <span
                  className="timeline-dot absolute -left-8 top-6 h-2.5 w-2.5 translate-x-[-3px] rounded-full bg-primary"
                  aria-hidden="true"
                />
                <Card className="glass-panel elevated-card">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="display-font text-xl font-medium leading-snug">
                        {role.title}
                        <span className="text-muted-foreground"> · {role.company}</span>
                      </h3>
                      <p className="flex items-center gap-2 text-sm tabular-nums text-muted-foreground">
                        {role.period}
                        {role.current && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Now
                          </span>
                        )}
                      </p>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {role.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                        >
                          <span
                            className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-muted-foreground"
                            aria-hidden="true"
                          />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>

          {/* Education + publication: the credentials a recruiter scans for. */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Card className="glass-panel elevated-card" data-reveal>
              <CardContent className="p-6">
                <span className="capability-icon">
                  <GraduationCap className="h-6 w-6" />
                </span>
                <h3 className="display-font mb-4 text-lg font-medium">Education</h3>
                <ul className="space-y-4">
                  {education.map((item) => (
                    <li key={item.qualification}>
                      <p className="font-medium">
                        {item.qualification}
                        <span className="text-muted-foreground">
                          {" "}
                          · {item.institution}
                        </span>
                      </p>
                      <p className="text-sm tabular-nums text-muted-foreground">
                        {item.period} · {item.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card
              className="glass-panel elevated-card"
              data-reveal
              style={{ ["--reveal-delay" as string]: "120ms" }}
            >
              <CardContent className="p-6">
                <span className="capability-icon">
                  <FileText className="h-6 w-6" />
                </span>
                <h3 className="display-font mb-4 text-lg font-medium">Publication</h3>
                <p className="text-sm leading-relaxed">{publication.title}</p>
                <a
                  href={publication.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Read it on {publication.venue}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Projects */}
        <section
          id="projects"
          className="section-anchor py-12 md:py-16"
          aria-labelledby="projects-heading"
        >
          <div className="mb-8" data-reveal>
            <p className="section-eyebrow mb-3">Work</p>
            <div className="flex items-center gap-5">
              <h2
                id="projects-heading"
                className="display-font text-3xl font-semibold tracking-tight md:text-4xl"
              >
                Selected Projects
              </h2>
              <span className="section-rule" aria-hidden="true" />
            </div>
          </div>
          <div className="space-y-4">
            {projectItems.map((project, i) => (
              <Card
                key={project.title}
                className="glass-panel elevated-card"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}
              >
                <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between md:gap-8">
                  <div className="flex max-w-2xl gap-4">
                    <span
                      className="display-font pt-1 text-sm font-semibold tabular-nums text-muted-foreground"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="display-font text-xl font-medium leading-snug">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {project.summary}
                      </p>
                    </div>
                  </div>
                  <ul className="flex max-w-sm flex-wrap gap-2 md:justify-end">
                    {project.stack.map((tech) => (
                      <li key={tech} className="tag">
                        {tech}
                      </li>
                    ))}
                  </ul>
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

        <ScrollNeuralScene />

        {/* AI Assistant */}
        <section
          id="assistant"
          className="section-anchor py-12 md:py-16"
          aria-labelledby="assistant-heading"
        >
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div data-reveal="left">
              <p className="section-eyebrow mb-3">
                <BrainCircuit className="h-3.5 w-3.5" aria-hidden="true" /> Live demo
              </p>
              <h2
                id="assistant-heading"
                className="display-font text-3xl font-semibold tracking-tight md:text-4xl"
              >
                Talk to my AI assistant
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                Instead of reading a static bio, ask a question. The answers come
                from flint — a Gemma 4 model I fine-tuned on my own writing, served
                from a GPU that spins up on demand. Not a wrapper around someone
                else's API: the weights, the training data, and the serving stack
                are all mine.
              </p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Try asking
              </p>
              <ul className="mt-3 space-y-2">
                {suggestedQuestions.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => setPendingQuestion(q)}
                      className="link-row w-full text-left text-sm"
                    >
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{q}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal="right">
              <ChatbotPanel
                pendingQuestion={pendingQuestion}
                onPendingQuestionUsed={() => setPendingQuestion("")}
              />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="section-anchor py-12 pb-20 md:py-16"
          aria-labelledby="contact-heading"
        >
          <Card className="glass-panel" data-reveal>
            <CardContent className="grid gap-8 p-8 md:grid-cols-[1.15fr_0.85fr] md:p-10">
              <div>
                <h2
                  id="contact-heading"
                  className="display-font text-3xl font-semibold tracking-tight md:text-4xl"
                >
                  Let&apos;s Build Something Valuable
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Open to AI engineering, backend architecture, and product-focused
                  roles where technical rigor and business impact both matter.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="mailto:fakeavangchhia@gmail.com">
                    <Button className="rounded-full px-6">
                      Get in touch
                      <Mail className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                  <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="rounded-full px-6">
                      View Resume
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <a href="mailto:fakeavangchhia@gmail.com" className="link-row">
                  <Mail className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">fakeavangchhia@gmail.com</span>
                </a>
                <a href="tel:+918787698473" className="link-row">
                  <Phone className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">+91 8787698473</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/fakeavangchhia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-row"
                >
                  <Linkedin className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">linkedin.com/in/fakeavangchhia</span>
                  <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-8 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Lalfakawma Vangchhia</p>
          <p>
            {birthdayMode
              ? "Built with React, Tailwind & a slice of birthday cake. 🎂"
              : "Built with React, Tailwind & a little neural flair."}
          </p>
        </div>
      </footer>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        // Hidden state must leave the tab order, not just fade out.
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-[0_4px_16px_hsl(var(--foreground)/0.12)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-secondary ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Index;
