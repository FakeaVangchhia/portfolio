/**
 * Portfolio content that more than one page needs to agree on.
 *
 * `Index.tsx` renders these directly; `NeuralVisual.tsx` featurizes them into
 * the vectors it projects. Keeping one copy is what makes that visualization
 * honest — it plots the real toolbox, not a parallel hardcoded list that can
 * drift away from what the site actually claims.
 */

export type Project = {
  title: string;
  summary: string;
  stack: string[];
};

export type Role = {
  title: string;
  company: string;
  period: string;
  /** Set on the current role; drives the "Present" pill in the timeline. */
  current?: boolean;
  highlights: string[];
};

export type Credential = {
  qualification: string;
  institution: string;
  period: string;
  detail: string;
};

export const techStack = [
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

export const projectItems: Project[] = [
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

/**
 * Work history, newest first — mirrors `public/resume.pdf`.
 *
 * The resume is the source of truth for dates and claims. If one changes,
 * change both, or a recruiter reading the PDF and the site side by side sees
 * two different candidates.
 */
export const experience: Role[] = [
  {
    title: "AI Lead",
    company: "LushAITech Pvt. Ltd.",
    period: "Nov 2025 — Present",
    current: true,
    highlights: [
      "Build AI chatbots and applications with LLMs, prompt engineering, and evaluation pipelines.",
      "Integrate automation and translation APIs on FastAPI and PostgreSQL backends.",
      "Design and evaluate prompt strategies, measuring the lift in response quality.",
      "Double as DevOps on AWS, owning end-to-end deployments with Docker and CI/CD.",
    ],
  },
  {
    title: "AI Software Developer",
    company: "ThorSignia",
    period: "Apr 2025 — Aug 2025",
    highlights: [
      "Developed AI-driven applications combining ML, LLMs, and automation pipelines.",
      "Built recommendation systems and translation workflows in Django, FastAPI, and PostgreSQL.",
      "Took an OCR business-card scanner from 80% to 95% accuracy, with 40% faster real-time extraction.",
      "Shipped scalable APIs and deployments with Docker and CI/CD.",
    ],
  },
];

export const education: Credential[] = [
  {
    qualification: "MCA",
    institution: "CMR University",
    period: "2023 — 2025",
    detail: "CGPA 8.72 / 10.0",
  },
  {
    qualification: "BCA",
    institution: "Govt. Champhai College",
    period: "2020 — 2023",
    detail: "CGPA 8.88 / 10.0",
  },
];

export const publication = {
  title:
    "Trapped in the Loop: The Pervasive Influence of Deep Neural Networks on Social Media",
  venue: "IJCRT",
  url: "https://www.ijcrt.org/papers/IJCRT2508451.pdf",
};
