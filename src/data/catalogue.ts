export type SkillGroup = "Frontend" | "Tools & practices" | "Backend";

export interface Skill {
  id: string;
  name: string;
  group: SkillGroup;
  initialLevel: number;
  description: string;
  categoryRationale?: string;
}

export interface Role {
  id: string;
  title: string;
  team: string;
  workStyle: string;
  description: string;
  requirements: Record<string, number>;
  icon: "code" | "layers" | "server";
  category: "Frontend" | "Full-Stack" | "Backend";
}

export interface ProficiencyLevelMeta {
  level: number;
  name: string;
  stage: string;
  description: string;
}

export const PROFICIENCY_LEVELS: ProficiencyLevelMeta[] = [
  {
    level: 0,
    name: "Not yet",
    stage: "Beginner",
    description: "No exposure yet or still learning basic concepts.",
  },
  {
    level: 1,
    name: "Learning",
    stage: "Developing",
    description: "Understands fundamentals and can follow tutorials or guided tasks.",
  },
  {
    level: 2,
    name: "Comfortable",
    stage: "Intermediate",
    description: "Builds independently on typical features and resolves routine bugs.",
  },
  {
    level: 3,
    name: "Confident",
    stage: "Advanced",
    description: "Strong architectural grasp, writes clean tests, and guides others.",
  },
];

export const LEVEL_NAMES = PROFICIENCY_LEVELS.map((item) => item.name);

export const DEFAULT_SKILLS: Skill[] = [
  {
    id: "html-css",
    name: "HTML & CSS",
    group: "Frontend",
    initialLevel: 3,
    description: "Semantic markup, modern CSS layouts (Flexbox/Grid), and CSS variables.",
  },
  {
    id: "javascript",
    name: "JavaScript",
    group: "Frontend",
    initialLevel: 2,
    description: "ES6+ syntax, asynchronous programming, DOM APIs, and closures.",
  },
  {
    id: "react",
    name: "React",
    group: "Frontend",
    initialLevel: 2,
    description: "Component architecture, hooks, state management, and lifecycle patterns.",
  },
  {
    id: "typescript",
    name: "TypeScript",
    group: "Frontend",
    initialLevel: 1,
    description: "Static typing, generics, interfaces, and strict type checking in React.",
  },
  {
    id: "accessibility",
    name: "Web accessibility",
    group: "Frontend",
    initialLevel: 1,
    description: "WCAG standards, keyboard navigation, ARIA roles, and semantic structures.",
  },
  {
    id: "responsive",
    name: "Responsive design",
    group: "Frontend",
    initialLevel: 2,
    description: "Mobile-first layouts, fluid typography, media queries, and container queries.",
  },
  {
    id: "git",
    name: "Git & GitHub",
    group: "Tools & practices",
    initialLevel: 2,
    description: "Version control workflows, branching, pull requests, and commit discipline.",
  },
  {
    id: "testing",
    name: "Testing",
    group: "Tools & practices",
    initialLevel: 0,
    description: "Unit testing, integration testing, Vitest/Jest, and component test assertions.",
  },
  {
    id: "collaboration",
    name: "Team collaboration",
    group: "Tools & practices",
    initialLevel: 2,
    description: "Code reviews, documentation, agile workflows, and asynchronous communication.",
  },
  {
    id: "node",
    name: "Node.js",
    group: "Backend",
    initialLevel: 1,
    description: "Server runtime, package management, async I/O, and microservice basics.",
  },
  {
    id: "apis",
    name: "REST APIs",
    group: "Backend",
    initialLevel: 1,
    description: "HTTP verbs, status codes, payload design, and error response conventions.",
  },
  {
    id: "sql",
    name: "SQL & databases",
    group: "Backend",
    initialLevel: 0,
    description: "Relational database modeling, queries, joins, indices, and transactions.",
  },
];

export const DEFAULT_ROLES: Role[] = [
  {
    id: "frontend",
    title: "Frontend developer",
    team: "Product engineering",
    workStyle: "Hybrid · Entry level",
    category: "Frontend",
    description:
      "Build polished, accessible web experiences alongside designers and product teams.",
    icon: "code",
    requirements: {
      "html-css": 3,
      javascript: 3,
      react: 3,
      typescript: 2,
      accessibility: 2,
      responsive: 2,
      git: 2,
      testing: 1,
      collaboration: 2,
    },
  },
  {
    id: "fullstack",
    title: "Full-stack developer",
    team: "Early-stage product team",
    workStyle: "Remote · Junior",
    category: "Full-Stack",
    description:
      "Work across the interface, APIs, and data layer to ship features from start to finish.",
    icon: "layers",
    requirements: {
      "html-css": 2,
      javascript: 3,
      react: 2,
      typescript: 2,
      git: 2,
      testing: 2,
      node: 3,
      apis: 2,
      sql: 2,
      collaboration: 2,
    },
  },
  {
    id: "ui-engineer",
    title: "UI engineer",
    team: "Design systems",
    workStyle: "On-site · Graduate",
    category: "Frontend",
    description: "Turn thoughtful visual design into flexible, inclusive production components.",
    icon: "server",
    requirements: {
      "html-css": 3,
      javascript: 2,
      react: 3,
      typescript: 2,
      accessibility: 3,
      responsive: 3,
      git: 2,
      testing: 1,
      collaboration: 3,
    },
  },
  {
    id: "backend-junior",
    title: "Backend developer",
    team: "Platform & APIs",
    workStyle: "Hybrid · Entry level",
    category: "Backend",
    description: "Develop REST endpoints, schema migrations, and reliable server-side services.",
    icon: "server",
    requirements: {
      javascript: 2,
      typescript: 2,
      git: 2,
      testing: 2,
      node: 3,
      apis: 3,
      sql: 2,
      collaboration: 2,
    },
  },
];

export const AVAILABLE_ADDITIONAL_SKILLS: Skill[] = [
  {
    id: "tailwind",
    name: "Tailwind CSS",
    group: "Frontend",
    initialLevel: 0,
    description:
      "Utility-first CSS styling, responsive utility modifiers, and design token integration.",
  },
  {
    id: "nextjs",
    name: "Next.js",
    group: "Frontend",
    initialLevel: 0,
    description:
      "Server-side rendering, App Router, React Server Components, and static generation.",
  },
  {
    id: "docker",
    name: "Docker & Containers",
    group: "Tools & practices",
    initialLevel: 0,
    description: "Containerization, Dockerfiles, multi-stage builds, and docker-compose workflows.",
  },
  {
    id: "linux-shell",
    name: "Linux & Shell Scripting",
    group: "Tools & practices",
    initialLevel: 0,
    description:
      "Bash commands, file permissions, shell piping, process management, and environment variables.",
  },
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    group: "Tools & practices",
    initialLevel: 0,
    description:
      "Time & space complexity (Big-O), trees, graphs, sorting, and dynamic programming.",
  },
  {
    id: "python",
    name: "Python & FastAPI",
    group: "Backend",
    initialLevel: 0,
    description:
      "Python async syntax, Pydantic type validation, FastAPI endpoints, and dependency injection.",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    group: "Backend",
    initialLevel: 0,
    description:
      "Advanced relational schemas, indexing strategies, CTE queries, and ACID transactions.",
  },
  {
    id: "graphql",
    name: "GraphQL",
    group: "Backend",
    initialLevel: 0,
    description:
      "Schema definition, queries, mutations, resolvers, and Apollo/Relay client integration.",
  },
];

/**
 * Returns the combined catalogue of default and additional skills.
 */
export function getFullSkillCatalogue(): Skill[] {
  return [...DEFAULT_SKILLS, ...AVAILABLE_ADDITIONAL_SKILLS];
}

/**
 * Creates a valid Skill object from custom user input.
 */
export function createCustomSkill(
  name: string,
  group: SkillGroup,
  initialLevel: number = 1,
  description?: string,
): Skill {
  const sanitizedId = `custom-${name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;

  return {
    id: sanitizedId,
    name: name.trim(),
    group,
    initialLevel: Math.max(0, Math.min(3, initialLevel)),
    description:
      description?.trim() || `Student-defined engineering skill: ${name.trim()} (${group}).`,
  };
}
