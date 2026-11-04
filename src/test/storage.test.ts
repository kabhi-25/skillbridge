import { beforeEach, describe, expect, it } from "vitest";
import {
  getDefaultUserState,
  loadPersistedState,
  loadSidebarCollapsedPreference,
  resetPersistedState,
  savePersistedState,
  saveSidebarCollapsedPreference,
  STORAGE_KEY,
} from "../lib/storage";

describe("SSR-Safe Local Storage Persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns default state when storage is empty", () => {
    const state = loadPersistedState();
    expect(state.selectedRoleId).toBe("frontend");
    expect(state.completedSteps).toEqual([]);
    expect(state.skillLevels["html-css"]).toBe(3);
  });

  it("saves and reloads state properly", () => {
    const customState = {
      ...getDefaultUserState(),
      selectedRoleId: "fullstack",
      skillLevels: { react: 3, node: 3 },
      completedSteps: ["fullstack::node"],
    };

    savePersistedState(customState);

    const loaded = loadPersistedState();
    expect(loaded.selectedRoleId).toBe("fullstack");
    expect(loaded.completedSteps).toEqual(["fullstack::node"]);
    expect(loaded.skillLevels["react"]).toBe(3);
    expect(loaded.skillLevels["node"]).toBe(3);
  });

  it("handles corrupted JSON gracefully by returning defaults", () => {
    window.localStorage.setItem(STORAGE_KEY, "this-is-not-valid-json{{{");
    const state = loadPersistedState();
    expect(state.selectedRoleId).toBe("frontend");
  });

  it("resets state to defaults cleanly", () => {
    savePersistedState({
      ...getDefaultUserState(),
      selectedRoleId: "fullstack",
      completedSteps: ["step-1"],
    });

    const reset = resetPersistedState();
    expect(reset.selectedRoleId).toBe("frontend");
    expect(reset.completedSteps).toEqual([]);
    expect(loadPersistedState().selectedRoleId).toBe("frontend");
  });

  it("defaults sidebar collapsed preference to false (expanded) on first visit", () => {
    expect(loadSidebarCollapsedPreference()).toBe(false);
  });

  it("saves and loads sidebar collapsed preference correctly", () => {
    saveSidebarCollapsedPreference(true);
    expect(loadSidebarCollapsedPreference()).toBe(true);

    saveSidebarCollapsedPreference(false);
    expect(loadSidebarCollapsedPreference()).toBe(false);
  });
});
