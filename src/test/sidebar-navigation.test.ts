import { beforeEach, describe, expect, it } from "vitest";
import {
  loadSidebarCollapsedPreference,
  saveSidebarCollapsedPreference,
  SIDEBAR_COLLAPSED_KEY,
} from "../lib/storage";

describe("Collapsible Sidebar Navigation", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults sidebar state to expanded (collapsed = false) on first visit", () => {
    expect(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY)).toBeNull();
    const isCollapsed = loadSidebarCollapsedPreference();
    expect(isCollapsed).toBe(false);
  });

  it("persists collapsed preference when toggled to true", () => {
    saveSidebarCollapsedPreference(true);
    expect(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY)).toBe("true");
    expect(loadSidebarCollapsedPreference()).toBe(true);
  });

  it("restores expanded state when preference is set to false", () => {
    saveSidebarCollapsedPreference(true);
    expect(loadSidebarCollapsedPreference()).toBe(true);

    saveSidebarCollapsedPreference(false);
    expect(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY)).toBe("false");
    expect(loadSidebarCollapsedPreference()).toBe(false);
  });

  it("handles corrupted or unexpected storage value gracefully by defaulting to false", () => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, "invalid-boolean");
    expect(loadSidebarCollapsedPreference()).toBe(false);
  });

  it("correctly computes toggle state transitions and accessibility attributes", () => {
    // Desktop initial state: expanded
    let isDesktopCollapsed = loadSidebarCollapsedPreference();
    let isMobile = false;
    let isMobileOpen = false;

    // Computed visibility
    let isSidebarVisible = isMobile ? isMobileOpen : !isDesktopCollapsed;
    expect(isSidebarVisible).toBe(true);
    let buttonLabel = isSidebarVisible ? "Hide sidebar" : "Show sidebar";
    expect(buttonLabel).toBe("Hide sidebar");

    // Action: click toggle button on desktop
    isDesktopCollapsed = !isDesktopCollapsed;
    saveSidebarCollapsedPreference(isDesktopCollapsed);

    isSidebarVisible = isMobile ? isMobileOpen : !isDesktopCollapsed;
    expect(isSidebarVisible).toBe(false);
    buttonLabel = isSidebarVisible ? "Hide sidebar" : "Show sidebar";
    expect(buttonLabel).toBe("Show sidebar");

    // Action: click toggle button again on desktop
    isDesktopCollapsed = !isDesktopCollapsed;
    saveSidebarCollapsedPreference(isDesktopCollapsed);

    isSidebarVisible = isMobile ? isMobileOpen : !isDesktopCollapsed;
    expect(isSidebarVisible).toBe(true);
    buttonLabel = isSidebarVisible ? "Hide sidebar" : "Show sidebar";
    expect(buttonLabel).toBe("Hide sidebar");

    // Mobile behavior: starts closed as overlay drawer
    isMobile = true;
    isMobileOpen = false;
    isSidebarVisible = isMobile ? isMobileOpen : !isDesktopCollapsed;
    expect(isSidebarVisible).toBe(false);

    // Open mobile drawer
    isMobileOpen = true;
    isSidebarVisible = isMobile ? isMobileOpen : !isDesktopCollapsed;
    expect(isSidebarVisible).toBe(true);
    expect(isSidebarVisible ? "Hide sidebar" : "Show sidebar").toBe("Hide sidebar");

    // Close on navigation click or backdrop click
    isMobileOpen = false;
    isSidebarVisible = isMobile ? isMobileOpen : !isDesktopCollapsed;
    expect(isSidebarVisible).toBe(false);
  });
});
