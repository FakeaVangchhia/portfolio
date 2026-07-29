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
