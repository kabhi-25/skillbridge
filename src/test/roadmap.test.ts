import { describe, expect, it } from "vitest";
import { DEFAULT_ROLES, DEFAULT_SKILLS } from "../data/catalogue";
import { calculateRoleMatch } from "../lib/matching";
import { generateRoadmapActivities } from "../lib/roadmap";

describe("Roadmap Generation Logic", () => {
  const frontendRole = DEFAULT_ROLES.find((r) => r.id === "frontend")!;

  it("generates an activity for each skill gap", () => {
    // Zero proficiency creates gaps for all requirements
    const matchResult = calculateRoleMatch(frontendRole, DEFAULT_SKILLS, {});
    const activities = generateRoadmapActivities(frontendRole, matchResult.gaps, DEFAULT_SKILLS);

    expect(activities.length).toBe(matchResult.gaps.length);
    expect(activities.length).toBeGreaterThan(0);

    const first = activities[0];
    expect(first).toBeDefined();
    expect(first?.roleId).toBe(frontendRole.id);
    expect(first?.objectives.length).toBeGreaterThan(0);
    expect(first?.practicalExercise.length).toBeGreaterThan(0);
    expect(first?.duration).toBeDefined();
    expect(first?.recommendedTopic).toBeDefined();
  });

  it("returns empty activities when student has zero skill gaps", () => {
    const perfectLevels: Record<string, number> = {
      "html-css": 3,
      javascript: 3,
      react: 3,
      typescript: 3,
      accessibility: 3,
      responsive: 3,
      git: 3,
      testing: 3,
      collaboration: 3,
    };
    const matchResult = calculateRoleMatch(frontendRole, DEFAULT_SKILLS, perfectLevels);
    const activities = generateRoadmapActivities(frontendRole, matchResult.gaps);

    expect(activities).toHaveLength(0);
  });
});
