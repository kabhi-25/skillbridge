import { describe, expect, it } from "vitest";
import { DEFAULT_ROLES, DEFAULT_SKILLS, type Role } from "../data/catalogue";
import { calculateRoleMatch, rankRoles } from "../lib/matching";

describe("Transparent Matching Engine", () => {
  const frontendRole = DEFAULT_ROLES.find((r) => r.id === "frontend")!;

  it("calculates 100% when all requirements are fully satisfied or exceeded", () => {
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

    const result = calculateRoleMatch(frontendRole, DEFAULT_SKILLS, perfectLevels);
    expect(result.score).toBe(100);
    expect(result.gaps).toHaveLength(0);
    expect(result.missingSkills).toHaveLength(0);
    expect(result.partialSkills).toHaveLength(0);
    expect(result.matchedSkills.length).toBe(Object.keys(frontendRole.requirements).length);
  });

  it("calculates 0% when student has 0 in every required skill", () => {
    const zeroLevels: Record<string, number> = {};
    const result = calculateRoleMatch(frontendRole, DEFAULT_SKILLS, zeroLevels);

    expect(result.score).toBe(0);
    expect(result.matchedSkills).toHaveLength(0);
    expect(result.missingSkills.length).toBe(Object.keys(frontendRole.requirements).length);
    expect(result.gaps.length).toBe(Object.keys(frontendRole.requirements).length);
  });

  it("calculates proportional credit for partial skill matches", () => {
    // If a skill requires 2 and student has 1, credit is 1/2 = 0.5
    const partialRole: Role = {
      id: "test-role",
      title: "Test Role",
      team: "Testing",
      workStyle: "Remote",
      category: "Frontend",
      description: "Test description",
      icon: "code",
      requirements: {
        javascript: 2,
        react: 2,
      },
    };

    // User has 1 in javascript (0.5 credit) and 0 in react (0 credit)
    // Total credit = 0.5 / 2 = 25%
    const result = calculateRoleMatch(partialRole, DEFAULT_SKILLS, { javascript: 1 });
    expect(result.score).toBe(25);
    expect(result.partialSkills.map((s) => s.skillId)).toContain("javascript");
    expect(result.missingSkills.map((s) => s.skillId)).toContain("react");
    expect(result.gaps).toHaveLength(2);
  });

  it("handles roles with empty requirements safely without divide-by-zero", () => {
    const emptyRole: Role = {
      id: "empty-role",
      title: "Empty Requirements Role",
      team: "Platform",
      workStyle: "Remote",
      category: "Frontend",
      description: "No tech requirements",
      icon: "code",
      requirements: {},
    };

    const result = calculateRoleMatch(emptyRole, DEFAULT_SKILLS, {});
    expect(result.score).toBe(100);
    expect(result.gaps).toHaveLength(0);
    expect(Number.isNaN(result.score)).toBe(false);
  });

  it("handles unknown or missing skill IDs safely", () => {
    const weirdRole: Role = {
      id: "unknown-skills-role",
      title: "Unknown Skills Role",
      team: "Experimental",
      workStyle: "Hybrid",
      category: "Backend",
      description: "Role with non-catalog skills",
      icon: "server",
      requirements: {
        "quantum-computing": 3,
        react: 2,
      },
    };

    const result = calculateRoleMatch(weirdRole, DEFAULT_SKILLS, { react: 2 });
    expect(result.score).toBe(50);
    expect(result.matchedSkills.some((s) => s.skillId === "react")).toBe(true);
    expect(result.missingSkills.some((s) => s.skillId === "quantum-computing")).toBe(true);
  });

  it("ranks roles correctly by score descending", () => {
    const skillLevels: Record<string, number> = {
      "html-css": 3,
      javascript: 3,
      react: 3,
      typescript: 2,
      accessibility: 2,
      responsive: 2,
      git: 2,
      testing: 1,
      collaboration: 2,
    };

    const ranked = rankRoles(DEFAULT_ROLES, DEFAULT_SKILLS, skillLevels);
    expect(ranked.length).toBe(DEFAULT_ROLES.length);
    expect(ranked[0]?.match.score).toBeGreaterThanOrEqual(ranked[1]?.match.score ?? 0);
    expect(ranked[1]?.match.score).toBeGreaterThanOrEqual(ranked[2]?.match.score ?? 0);
  });
});
