import type { Role, Skill } from "../data/catalogue";
import type { SkillGapItem } from "./matching";

export interface RoadmapActivity {
  id: string;
  skillId: string;
  skillName: string;
  roleId: string;
  currentLevel: number;
  targetLevel: number;
  title: string;
  detail: string;
  duration: string;
  objectives: string[];
  practicalExercise: string;
  recommendedTopic: string;
}

const SKILL_ACTIVITIES: Record<
  string,
  {
    title: string;
    detail: string;
    duration: string;
    objectives: string[];
    practicalExercise: string;
    recommendedTopic: string;
  }
> = {
  javascript: {
    title: "Make an interactive application state feel alive",
    detail:
      "Add client-side filtering, form validation, and asynchronous data fetching with proper loading and error feedback.",
    duration: "2–3 hours",
    objectives: [
      "Master array transformation methods (map, filter, reduce)",
      "Handle asynchronous promises with async/await and robust try/catch blocks",
      "Prevent race conditions and manage debounce/throttle timers",
    ],
    practicalExercise:
      "Build an in-memory searchable catalog with category tags, debounce input, and active filter counts.",
    recommendedTopic: "MDN JavaScript Guide: Asynchronous Programming & Array Methods",
  },
  react: {
    title: "Build composed UI features with reusable parts",
    detail:
      "Break complex views into modular components, custom hooks for shared logic, and clean state lifting.",
    duration: "2–3 hours",
    objectives: [
      "Structure reusable props and TypeScript interfaces",
      "Encapsulate state transitions with custom React hooks",
      "Prevent unnecessary re-renders using useMemo and useCallback",
    ],
    practicalExercise:
      "Build a multi-step modal wizard that collects form input with validation before confirming.",
    recommendedTopic: "React Documentation: Managing State & Thinking in React",
  },
  typescript: {
    title: "Add strict type safety to an existing feature",
    detail:
      "Define discriminated unions, generic helper utilities, and strict component prop interfaces.",
    duration: "1–2 hours",
    objectives: [
      "Convert loosely typed objects to discriminated unions",
      "Enforce exhaustive switch checks with TypeScript 'never'",
      "Define generic response wrappers for API payloads",
    ],
    practicalExercise:
      "Refactor an untyped API response handler into strongly typed union states (idle, loading, success, error).",
    recommendedTopic: "TypeScript Handbook: Everyday Types & Discriminated Unions",
  },
  accessibility: {
    title: "Make web interactions accessible and keyboard-friendly",
    detail:
      "Ensure full keyboard navigability, meaningful ARIA attributes, semantic landmarks, and WCAG color contrast.",
    duration: "1–2 hours",
    objectives: [
      "Test complete user workflows using only Tab and Space/Enter keys",
      "Implement visible focus rings and skip-to-content anchors",
      "Ensure color contrast meets WCAG AA 4.5:1 ratio",
    ],
    practicalExercise:
      "Audit and remediate an interactive modal dialog with focus trapping and ESC key dismissal.",
    recommendedTopic: "W3C WAI ARIA Authoring Practices Guide (APG)",
  },
  testing: {
    title: "Write resilient automated tests for core user journeys",
    detail:
      "Create unit and integration test suites using Vitest and React Testing Library testing behavior, not implementation details.",
    duration: "2–3 hours",
    objectives: [
      "Write deterministic unit tests for business logic and pure calculations",
      "Simulate user interactions with user-event and query by accessible roles",
      "Assert accessibility landmarks and expected state transitions",
    ],
    practicalExercise:
      "Write a test suite verifying edge cases for a calculation engine and a dynamic form submission.",
    recommendedTopic: "Testing Library Documentation: Guiding Principles & Queries",
  },
  node: {
    title: "Create a lightweight server and API service",
    detail:
      "Set up a clean Node.js service handling route dispatch, JSON body parsing, and standardized error responses.",
    duration: "2–3 hours",
    objectives: [
      "Implement RESTful route handlers for CRUD operations",
      "Add middleware for request validation and error logging",
      "Handle environment configuration safely",
    ],
    practicalExercise:
      "Build a minimal HTTP service that validates incoming student skill evaluations and returns structured JSON.",
    recommendedTopic: "Node.js Official Guides: HTTP Transactions & Event Loop",
  },
  apis: {
    title: "Design and integrate clean REST API endpoints",
    detail:
      "Work with standard HTTP status codes, pagination headers, query filters, and consistent JSON error formats.",
    duration: "1–2 hours",
    objectives: [
      "Use appropriate HTTP methods (GET, POST, PUT, DELETE, PATCH)",
      "Implement pagination and query param filtering",
      "Design standard error envelopes with informative problem details",
    ],
    practicalExercise:
      "Design an OpenAPI-compliant endpoint schema for a student progress tracker.",
    recommendedTopic: "REST API Best Practices: RESTful Web API Design Principles",
  },
  sql: {
    title: "Design a relational schema and write analytical queries",
    detail:
      "Model normalized entities, set foreign key constraints, and write multi-table JOINs and aggregation queries.",
    duration: "2–3 hours",
    objectives: [
      "Model 1:N and N:M relationships with foreign keys and join tables",
      "Write efficient SELECT queries with GROUP BY and HAVING clauses",
      "Understand table indexing trade-offs for query performance",
    ],
    practicalExercise:
      "Write a schema for students, skills, and target roles, and query top matching students per role.",
    recommendedTopic: "Use The Index, Luke: SQL Indexing and Relational Modeling",
  },
  responsive: {
    title: "Deliver flawless mobile-first responsive layouts",
    detail:
      "Refine layouts across phone, tablet, and widescreen breakpoints with modern CSS Grid and Flexbox techniques.",
    duration: "1–2 hours",
    objectives: [
      "Design mobile-first layouts with flexible container queries",
      "Prevent horizontal overflow and clipped text on small touch devices",
      "Ensure touch targets are at least 44x44px",
    ],
    practicalExercise:
      "Refactor a multi-column desktop dashboard into a collapsible, fluid mobile drawer view.",
    recommendedTopic: "web.dev: Learn Responsive Design by Google",
  },
  collaboration: {
    title: "Foster clear documentation and structured code reviews",
    detail:
      "Author informative PR descriptions, maintain a comprehensive README, and give actionable peer feedback.",
    duration: "1–2 hours",
    objectives: [
      "Write clear commit messages using Conventional Commits format",
      "Author reproducible local setup instructions in Markdown",
      "Conduct a constructive peer code review identifying edge cases",
    ],
    practicalExercise:
      "Draft a pull request checklist template and review documentation for an open-source project.",
    recommendedTopic: "GitHub Skills: Reviewing pull requests and collaborative workflows",
  },
  "html-css": {
    title: "Refactor components with semantic HTML and modern CSS",
    detail:
      "Structure pages with appropriate HTML5 elements and leverage modern CSS custom properties and resets.",
    duration: "1–2 hours",
    objectives: [
      "Replace generic div tags with semantic main, section, nav, and article elements",
      "Organize CSS custom properties for a unified design system token palette",
      "Support system color schemes and prefers-reduced-motion media query",
    ],
    practicalExercise:
      "Rebuild a complex card component using only semantic tags and CSS variable tokens.",
    recommendedTopic: "MDN Web Docs: HTML Elements Reference & CSS Custom Properties",
  },
  git: {
    title: "Master clean Git version control workflows",
    detail:
      "Organize feature branches, write atomic commits, resolve merge conflicts, and manage tags.",
    duration: "1–2 hours",
    objectives: [
      "Create clean feature branches from main and rebase cleanly",
      "Resolve conflicting file changes without losing work",
      "Draft interactive git log summaries for release milestones",
    ],
    practicalExercise:
      "Simulate a merge conflict between two branches, resolve it cleanly, and tag a v1.0.0 release.",
    recommendedTopic: "Pro Git Book by Scott Chacon and Ben Straub",
  },
};

/**
 * Generates an ordered list of roadmap learning activities
 * targeted specifically at closing the student's gaps for a selected role.
 */
export function generateRoadmapActivities(
  role: Role,
  gaps: SkillGapItem[],
  skillsCatalogue: Skill[] = [],
): RoadmapActivity[] {
  const catalogueMap = new Map<string, Skill>(skillsCatalogue.map((skill) => [skill.id, skill]));

  return gaps.map((gap, index) => {
    const predefined = SKILL_ACTIVITIES[gap.skillId];
    const catalogItem = catalogueMap.get(gap.skillId);
    const resolvedSkillName = gap.skillName || catalogItem?.name || gap.skillId;
    const duration = index === 0 ? "2–3 hours" : "1–2 hours";

    const title =
      predefined?.title ??
      `Hands-on practice: ${resolvedSkillName} (Level ${gap.currentLevel} → ${gap.requiredLevel})`;
    const detail =
      predefined?.detail ??
      `Build a focused mini-project demonstrating practical competence in ${resolvedSkillName}.`;
    const objectives = predefined?.objectives ?? [
      `Review key fundamentals of ${resolvedSkillName}`,
      `Implement practical code examples meeting Level ${gap.requiredLevel} standards`,
      `Document the learnings in your portfolio repository`,
    ];
    const practicalExercise =
      predefined?.practicalExercise ??
      `Create a standalone demo project in your workspace showcasing ${resolvedSkillName}.`;
    const recommendedTopic =
      predefined?.recommendedTopic ??
      `Curated learning path: ${resolvedSkillName} core documentation`;

    return {
      id: `${role.id}::${gap.skillId}`,
      skillId: gap.skillId,
      skillName: resolvedSkillName,
      roleId: role.id,
      currentLevel: gap.currentLevel,
      targetLevel: gap.requiredLevel,
      title,
      detail,
      duration: predefined?.duration ?? duration,
      objectives,
      practicalExercise,
      recommendedTopic,
    };
  });
}
