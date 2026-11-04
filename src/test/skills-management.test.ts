import { beforeEach, describe, expect, it } from "vitest";
import {
  AVAILABLE_ADDITIONAL_SKILLS,
  createCustomSkill,
  DEFAULT_ROLES,
  DEFAULT_SKILLS,
} from "../data/catalogue";
import { calculateRoleMatch } from "../lib/matching";
import { getDefaultUserState, loadPersistedState, savePersistedState } from "../lib/storage";

describe("Skills Management & Multi-Account Isolation", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates custom skills with normalized IDs and correct groups", () => {
    const custom = createCustomSkill("Kubernetes & Helm", "Tools & practices", 2);
    expect(custom.id).toBe("custom-kubernetes-helm");
    expect(custom.name).toBe("Kubernetes & Helm");
    expect(custom.group).toBe("Tools & practices");
    expect(custom.initialLevel).toBe(2);
  });

  it("adds an additional skill from the extended catalogue to user profile", () => {
    const userState = getDefaultUserState("student-1");
    const tailwindSkill = AVAILABLE_ADDITIONAL_SKILLS.find((s) => s.id === "tailwind")!;

    expect(userState.activeSkillIds).not.toContain("tailwind");

    // Add tailwind with proficiency 2
    userState.activeSkillIds.push(tailwindSkill.id);
    userState.skillLevels["tailwind"] = 2;

    savePersistedState(userState, "student-1");

    const reloaded = loadPersistedState("student-1");
    expect(reloaded.activeSkillIds).toContain("tailwind");
    expect(reloaded.skillLevels["tailwind"]).toBe(2);
  });

  it("removes a skill from user profile and deletes its level", () => {
    const userState = getDefaultUserState("student-2");
    expect(userState.activeSkillIds).toContain("testing");

    // Remove testing skill
    userState.activeSkillIds = userState.activeSkillIds.filter((id) => id !== "testing");
    delete userState.skillLevels["testing"];

    savePersistedState(userState, "student-2");

    const reloaded = loadPersistedState("student-2");
    expect(reloaded.activeSkillIds).not.toContain("testing");
    expect(reloaded.skillLevels["testing"]).toBeUndefined();
  });

  it("recalculates role match scores immediately after adding or removing skills", () => {
    const frontendRole = DEFAULT_ROLES.find((r) => r.id === "frontend")!;

    // Baseline calculation with default skills
    const baseLevels: Record<string, number> = {
      "html-css": 2,
      javascript: 2,
      react: 2,
      typescript: 1,
      accessibility: 1,
      responsive: 1,
      git: 2,
      testing: 0,
      collaboration: 1,
    };
    const initialMatch = calculateRoleMatch(frontendRole, DEFAULT_SKILLS, baseLevels);

    // Increase proficiency in testing (0 -> 1) and typescript (1 -> 2)
    const improvedLevels = {
      ...baseLevels,
      testing: 1,
      typescript: 2,
    };
    const improvedMatch = calculateRoleMatch(frontendRole, DEFAULT_SKILLS, improvedLevels);

    expect(improvedMatch.score).toBeGreaterThan(initialMatch.score);
    expect(improvedMatch.metRequirementsCount).toBeGreaterThan(initialMatch.metRequirementsCount);
  });

  it("isolates data completely between different student accounts", () => {
    const userAState = {
      ...getDefaultUserState("user-A"),
      selectedRoleId: "frontend",
      skillLevels: { react: 3, javascript: 3 },
    };
    const userBState = {
      ...getDefaultUserState("user-B"),
      selectedRoleId: "backend-junior",
      skillLevels: { node: 3, sql: 3 },
    };

    savePersistedState(userAState, "user-A");
    savePersistedState(userBState, "user-B");

    const loadedA = loadPersistedState("user-A");
    const loadedB = loadPersistedState("user-B");

    expect(loadedA.selectedRoleId).toBe("frontend");
    expect(loadedA.skillLevels["react"]).toBe(3);

    expect(loadedB.selectedRoleId).toBe("backend-junior");
    expect(loadedB.skillLevels["node"]).toBe(3);
    expect(loadedB.skillLevels["react"]).toBeUndefined();
  });
});
