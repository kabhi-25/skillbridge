import { DEFAULT_ROLES, DEFAULT_SKILLS, type Skill } from "../data/catalogue";

export const STORAGE_KEY_BASE = "skillbridge_student_state_v2";
export const STORAGE_KEY = STORAGE_KEY_BASE;
export const STORAGE_VERSION = 2;

export interface PersistedUserState {
  version: number;
  userId?: string | undefined;
  selectedRoleId: string;
  skillLevels: Record<string, number>;
  activeSkillIds: string[];
  customSkills: Skill[];
  completedSteps: string[];
  lastUpdated: string;
}

/**
 * Returns the storage key for a specific user ID, ensuring user-specific data isolation.
 */
export function getUserStorageKey(userId?: string): string {
  if (!userId || userId === "default") return STORAGE_KEY_BASE;
  return `${STORAGE_KEY_BASE}_${userId}`;
}

/**
 * Baseline default demo state for a new student.
 */
export function getDefaultUserState(userId?: string): PersistedUserState {
  const initialSkillLevels: Record<string, number> = {};
  const initialActiveIds: string[] = [];

  for (const skill of DEFAULT_SKILLS) {
    initialSkillLevels[skill.id] = skill.initialLevel;
    initialActiveIds.push(skill.id);
  }

  return {
    version: STORAGE_VERSION,
    userId: userId || "default",
    selectedRoleId: DEFAULT_ROLES[0]?.id ?? "frontend",
    skillLevels: initialSkillLevels,
    activeSkillIds: initialActiveIds,
    customSkills: [],
    completedSteps: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Validates and sanitizes a raw parsed state object.
 */
function sanitizeUserState(raw: unknown, userId?: string): PersistedUserState {
  const defaults = getDefaultUserState(userId);

  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const candidate = raw as Partial<PersistedUserState>;

  // Check version compatibility (allow v1 upgrade)
  if (typeof candidate.version !== "number" || candidate.version < 1) {
    return defaults;
  }

  // Validate selectedRoleId
  const roleExists = DEFAULT_ROLES.some((r) => r.id === candidate.selectedRoleId);
  const selectedRoleId = roleExists
    ? (candidate.selectedRoleId as string)
    : defaults.selectedRoleId;

  // Validate skillLevels: if candidate levels exist, respect them without re-injecting defaults
  const skillLevels: Record<string, number> = {};
  if (candidate.skillLevels && typeof candidate.skillLevels === "object") {
    for (const [key, val] of Object.entries(candidate.skillLevels)) {
      if (typeof val === "number" && !Number.isNaN(val)) {
        skillLevels[key] = Math.max(0, Math.min(3, Math.round(val)));
      }
    }
  } else {
    Object.assign(skillLevels, defaults.skillLevels);
  }

  // Validate activeSkillIds
  let activeSkillIds: string[] = defaults.activeSkillIds;
  if (Array.isArray(candidate.activeSkillIds)) {
    activeSkillIds = candidate.activeSkillIds.filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0,
    );
  }

  // Validate customSkills
  let customSkills: Skill[] = [];
  if (Array.isArray(candidate.customSkills)) {
    customSkills = candidate.customSkills.filter(
      (s): s is Skill =>
        typeof s === "object" &&
        s !== null &&
        typeof s.id === "string" &&
        typeof s.name === "string" &&
        typeof s.group === "string",
    );
  }

  // Validate completedSteps
  const completedSteps: string[] = Array.isArray(candidate.completedSteps)
    ? candidate.completedSteps.filter((id): id is string => typeof id === "string")
    : [];

  return {
    version: STORAGE_VERSION,
    userId: candidate.userId || userId || defaults.userId,
    selectedRoleId,
    skillLevels,
    activeSkillIds: activeSkillIds.length > 0 ? activeSkillIds : defaults.activeSkillIds,
    customSkills,
    completedSteps,
    lastUpdated:
      typeof candidate.lastUpdated === "string" ? candidate.lastUpdated : new Date().toISOString(),
  };
}

/**
 * Loads user state from browser localStorage.
 * SSR-safe: returns default state if window is undefined or localStorage is unavailable.
 */
export function loadPersistedState(userId?: string): PersistedUserState {
  if (typeof window === "undefined" || !window.localStorage) {
    return getDefaultUserState(userId);
  }

  try {
    const key = getUserStorageKey(userId);
    let raw = window.localStorage.getItem(key);

    // Fallback to legacy v1 key if user key is empty
    if (!raw && !userId) {
      raw = window.localStorage.getItem("skillbridge_student_state_v1");
    }

    if (!raw) {
      return getDefaultUserState(userId);
    }
    const parsed = JSON.parse(raw);
    return sanitizeUserState(parsed, userId);
  } catch {
    return getDefaultUserState(userId);
  }
}

/**
 * Saves user state to browser localStorage.
 * SSR-safe.
 */
export function savePersistedState(state: PersistedUserState, userId?: string): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }

  try {
    const key = getUserStorageKey(userId || state.userId);
    const payload: PersistedUserState = {
      ...state,
      version: STORAGE_VERSION,
      userId: userId || state.userId || "default",
      lastUpdated: new Date().toISOString(),
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

/**
 * Resets user state to default demo values and cleans localStorage.
 */
export function resetPersistedState(userId?: string): PersistedUserState {
  const defaults = getDefaultUserState(userId);
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const key = getUserStorageKey(userId);
      window.localStorage.removeItem(key);
      window.localStorage.setItem(key, JSON.stringify(defaults));
    } catch {
      // Ignore
    }
  }
  return defaults;
}

export const SIDEBAR_COLLAPSED_KEY = "skillbridge_sidebar_collapsed";

/**
 * Loads the user's sidebar collapsed preference from localStorage.
 * Defaults to false (expanded) on first visit or SSR.
 */
export function loadSidebarCollapsedPreference(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    const raw = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return raw === "true";
  } catch {
    return false;
  }
}

/**
 * Persists the user's sidebar collapsed preference to localStorage.
 */
export function saveSidebarCollapsedPreference(collapsed: boolean): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "true" : "false");
  } catch {
    // Ignore storage quota or security errors
  }
}
