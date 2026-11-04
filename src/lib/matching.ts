import type { Role, Skill } from "../data/catalogue";

export type SkillMatchStatus = "matched" | "partial" | "missing";

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  group: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  status: SkillMatchStatus;
  ratio: number;
}

export interface RoleMatchResult {
  roleId: string;
  roleTitle: string;
  score: number;
  matchedSkills: SkillGapItem[];
  partialSkills: SkillGapItem[];
  missingSkills: SkillGapItem[];
  allRequirements: SkillGapItem[];
  gaps: SkillGapItem[];
  totalRequirementsCount: number;
  metRequirementsCount: number;
  explanation: string;
}

/**
 * Calculates a normalized skill match score between 0 and 100
 * for a specific role against current user skill levels.
 *
 * Scoring methodology:
 * - Each required skill contributes equally: 1 / N of the total weight, where N is the number of required skills.
 * - For each required skill: credit = Math.min(currentLevel, requiredLevel) / requiredLevel (clamped to 0..1).
 * - Match score = Math.round( (sum of credits / N) * 100 ).
 * - Safe against division by zero (empty requirements yields 100 if none required, or 0 if empty list).
 */
export function calculateRoleMatch(
  role: Role,
  skillsCatalogue: Skill[],
  currentSkillLevels: Record<string, number> = {},
): RoleMatchResult {
  const reqEntries = Object.entries(role.requirements ?? {});

  if (reqEntries.length === 0) {
    return {
      roleId: role.id,
      roleTitle: role.title,
      score: 100,
      matchedSkills: [],
      partialSkills: [],
      missingSkills: [],
      allRequirements: [],
      gaps: [],
      totalRequirementsCount: 0,
      metRequirementsCount: 0,
      explanation: "This role lists no specific technical requirements.",
    };
  }

  const skillLookup = new Map<string, Skill>(skillsCatalogue.map((skill) => [skill.id, skill]));

  const matchedSkills: SkillGapItem[] = [];
  const partialSkills: SkillGapItem[] = [];
  const missingSkills: SkillGapItem[] = [];
  const allRequirements: SkillGapItem[] = [];
  const gaps: SkillGapItem[] = [];

  let totalCredit = 0;

  for (const [skillId, rawRequired] of reqEntries) {
    const requiredLevel = Math.max(1, Math.min(3, Math.round(rawRequired || 1)));
    const rawCurrent = currentSkillLevels[skillId];
    const currentLevel = Math.max(
      0,
      Math.min(
        3,
        typeof rawCurrent === "number" && !Number.isNaN(rawCurrent) ? Math.round(rawCurrent) : 0,
      ),
    );

    const catalogSkill = skillLookup.get(skillId);
    const skillName = catalogSkill?.name ?? skillId;
    const group = catalogSkill?.group ?? "Other";

    const credit = Math.min(currentLevel, requiredLevel) / requiredLevel;
    totalCredit += credit;

    const gap = Math.max(0, requiredLevel - currentLevel);
    let status: SkillMatchStatus = "missing";

    if (currentLevel >= requiredLevel) {
      status = "matched";
    } else if (currentLevel > 0) {
      status = "partial";
    } else {
      status = "missing";
    }

    const item: SkillGapItem = {
      skillId,
      skillName,
      group,
      currentLevel,
      requiredLevel,
      gap,
      status,
      ratio: credit,
    };

    allRequirements.push(item);

    if (status === "matched") {
      matchedSkills.push(item);
    } else if (status === "partial") {
      partialSkills.push(item);
      gaps.push(item);
    } else {
      missingSkills.push(item);
      gaps.push(item);
    }
  }

  // Sort gaps by gap descending, then by required level descending
  gaps.sort((a, b) => b.gap - a.gap || b.requiredLevel - a.requiredLevel);

  const normalizedScore = Math.max(
    0,
    Math.min(100, Math.round((totalCredit / reqEntries.length) * 100)),
  );

  const explanation = `${matchedSkills.length} of ${reqEntries.length} skills fully met, ${partialSkills.length} in progress, and ${missingSkills.length} to begin.`;

  return {
    roleId: role.id,
    roleTitle: role.title,
    score: normalizedScore,
    matchedSkills,
    partialSkills,
    missingSkills,
    allRequirements,
    gaps,
    totalRequirementsCount: reqEntries.length,
    metRequirementsCount: matchedSkills.length,
    explanation,
  };
}

/**
 * Ranks all roles by their match score in descending order.
 */
export function rankRoles(
  roles: Role[],
  skillsCatalogue: Skill[],
  currentSkillLevels: Record<string, number>,
): Array<Role & { match: RoleMatchResult }> {
  return roles
    .map((role) => ({
      ...role,
      match: calculateRoleMatch(role, skillsCatalogue, currentSkillLevels),
    }))
    .sort((a, b) => b.match.score - a.match.score || a.title.localeCompare(b.title));
}
