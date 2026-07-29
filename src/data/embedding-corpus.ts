import { projectItems, techStack } from "@/data/portfolio";
import { buildTermMatrix } from "@/lib/featurize";

/**
 * Builds the feature space that `/neural_visual` projects.
 *
 * Every document is assembled from strings that already exist elsewhere on the
 * site — technology names, project titles, project summaries. Nothing is
 * generated or invented, so the structure the projection finds is real
 * structure in the portfolio: technologies that appear in the same project are
 * pulled toward it, and toward each other.
 */

export type CorpusGroup = 0 | 1 | 2;

export const groupLabels: Record<CorpusGroup, string> = {
  0: "Project",
  1: "Technology used in a listed project",
  2: "Toolbox technology",
};

/**
 * How much of a technology's vector is its own name versus the projects that
 * use it. At 0 a technology would sit exactly on top of its project; at 1 it
 * would ignore its projects entirely and the plot would show nothing but string
 * similarity. Half and half keeps both signals legible.
 */
const IDENTITY_WEIGHT = 0.5;

export type FeaturePoint = {
  /** Shown in the hover tooltip. */
  label: string;
  /** Extra tooltip context: where this point's text comes from. */
  detail: string;
  group: CorpusGroup;
};

export type FeatureSpace = {
  points: FeaturePoint[];
  /** One L2-normalized vector per point, in the same order. */
  vectors: number[][];
  /** Feature count, surfaced so the page can describe itself accurately. */
  dimensions: number;
};

const projectsUsing = (tech: string) =>
  projectItems.filter((project) =>
    project.stack.some((entry) => entry.toLowerCase() === tech.toLowerCase()),
  );

const normalize = (vector: number[]) => {
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? vector.map((v) => v / magnitude) : vector;
};

export function buildFeatureSpace(): FeatureSpace {
  const projectTexts = projectItems.map(
    (project) => `${project.title} ${project.summary} ${project.stack.join(" ")}`,
  );

  // One shared vocabulary so project and technology vectors are comparable.
  const { vectors: baseVectors, vocabulary } = buildTermMatrix([
    ...projectTexts,
    ...techStack,
  ]);

  const projectVectors = baseVectors.slice(0, projectItems.length);
  const techNameVectors = baseVectors.slice(projectItems.length);

  const points: FeaturePoint[] = projectItems.map((project) => ({
    label: project.title,
    detail: "Project · title + summary + stack",
    group: 0,
  }));
  const vectors: number[][] = [...projectVectors];

  techStack.forEach((tech, i) => {
    const used = projectsUsing(tech);
    const nameVector = techNameVectors[i];

    // Blend the technology's own name with the centroid of the projects that
    // list it. A technology with no listed project keeps its name vector alone.
    const blended = used.length
      ? normalize(
          nameVector.map((value, dim) => {
            const contextMean =
              used.reduce(
                (sum, project) =>
                  sum + projectVectors[projectItems.indexOf(project)][dim],
                0,
              ) / used.length;
            return IDENTITY_WEIGHT * value + (1 - IDENTITY_WEIGHT) * contextMean;
          }),
        )
      : nameVector;

    points.push({
      label: tech,
      detail: used.length
        ? `Used in: ${used.map((p) => p.title).join(", ")}`
        : "Toolbox · not listed in a featured project",
      group: used.length ? 1 : 2,
    });
    vectors.push(blended);
  });

  return { points, vectors, dimensions: vocabulary.length };
}
