import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronDown,
  CircleHelp,
  CodeXml,
  Compass,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  PanelLeftClose,
  RotateCcw,
  Server,
  SlidersHorizontal,
  Target,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DEFAULT_ROLES,
  getFullSkillCatalogue,
  createCustomSkill,
  type Role,
  type Skill,
  type SkillGroup,
} from "@/data/catalogue";
import { calculateRoleMatch, rankRoles, type RoleMatchResult } from "@/lib/matching";
import { generateRoadmapActivities, type RoadmapActivity } from "@/lib/roadmap";
import {
  loadPersistedState,
  loadSidebarCollapsedPreference,
  resetPersistedState,
  savePersistedState,
  saveSidebarCollapsedPreference,
  type PersistedUserState,
} from "@/lib/storage";
import { getCurrentUser, logoutUser, type User } from "@/lib/auth";

import { AuthScreen } from "@/components/workspace/AuthScreen";
import { OverviewWorkspace } from "@/components/workspace/OverviewWorkspace";
import { ExploreRolesWorkspace } from "@/components/workspace/ExploreRolesWorkspace";
import { SkillsWorkspace } from "@/components/workspace/SkillsWorkspace";
import { RoadmapWorkspace } from "@/components/workspace/RoadmapWorkspace";
import { AddSkillModal } from "@/components/workspace/AddSkillModal";
import { RoleDetailsModal } from "@/components/workspace/RoleDetailsModal";
import { ActivityDetailsModal } from "@/components/workspace/ActivityDetailsModal";

export type PageName = "Overview" | "Explore roles" | "My skills" | "Your roadmap";

const navigation: { name: PageName; icon: typeof LayoutDashboard }[] = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Explore roles", icon: Compass },
  { name: "My skills", icon: SlidersHorizontal },
  { name: "Your roadmap", icon: ListChecks },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillBridge — Student Skill-to-Role Matching" },
      {
        name: "description",
        content:
          "Compare your CSE technical skills with early-career roles, spot the gaps, and follow a practical learning roadmap.",
      },
      { property: "og:title", content: "SkillBridge — Student Skill-to-Role Matching" },
      {
        property: "og:description",
        content:
          "See how your technical skills match early-career roles and what project to build next.",
      },
    ],
  }),
  component: SkillBridgeWorkspaceRoot,
});

/**
 * Root route component handling authentication gating and workspace initialization.
 */
function SkillBridgeWorkspaceRoot() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsClientReady(true);
  }, []);

  function handleLoginSuccess(user: User) {
    setCurrentUser(user);
  }

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    setAuthView("login");
  }

  if (!isClientReady) {
    return (
      <div className="workspace-shell" style={{ display: "grid", placeItems: "center" }}>
        <div style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>
          Initializing SkillBridge workspace...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen view={authView} onSwitchView={setAuthView} onLoginSuccess={handleLoginSuccess} />
    );
  }

  return <SkillBridgeWorkspace user={currentUser} onLogout={handleLogout} />;
}

interface SkillBridgeWorkspaceProps {
  user: User;
  onLogout: () => void;
}

function SkillBridgeWorkspace({ user, onLogout }: SkillBridgeWorkspaceProps) {
  const [page, setPage] = useState<PageName>("Overview");

  // Load user-isolated state
  const [persisted, setPersisted] = useState<PersistedUserState>(() => loadPersistedState(user.id));

  // Sidebar collapsed preference persisted in localStorage
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() =>
    loadSidebarCollapsedPreference(),
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 760px)");
    setIsMobile(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (!e.matches) {
        setIsMobileOpen(false);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (typeof document === "undefined" || !isMobile || !isMobileOpen) {
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobile, isMobileOpen]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (typeof window === "undefined" || !isMobileOpen) {
      return;
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  const isSidebarVisible = isMobile ? isMobileOpen : !isDesktopCollapsed;

  function handleToggleSidebar() {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsDesktopCollapsed((prev) => {
        const next = !prev;
        saveSidebarCollapsedPreference(next);
        return next;
      });
    }
  }

  function handleNavigate(newPage: PageName) {
    setPage(newPage);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }

  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [roleCategoryFilter, setRoleCategoryFilter] = useState<string>("All");
  const [skillsFilter, setSkillsFilter] = useState<"all" | "required" | "gaps">("all");

  // Detail Modal States
  const [inspectingRole, setInspectingRole] = useState<Role | null>(null);
  const [inspectingActivity, setInspectingActivity] = useState<RoadmapActivity | null>(null);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [skillToRemove, setSkillToRemove] = useState<Skill | null>(null);

  // Sync state whenever persisted state changes
  useEffect(() => {
    savePersistedState(persisted, user.id);
  }, [persisted, user.id]);

  // Combined skills catalogue: catalogue + any user-created custom skills
  const allAvailableSkills: Skill[] = useMemo(() => {
    const full = getFullSkillCatalogue();
    const custom = persisted.customSkills || [];
    return [...full, ...custom];
  }, [persisted.customSkills]);

  // Active skills in the student's profile
  const activeSkills: Skill[] = useMemo(() => {
    const activeIds = new Set(persisted.activeSkillIds);
    return allAvailableSkills.filter((s) => activeIds.has(s.id));
  }, [allAvailableSkills, persisted.activeSkillIds]);

  // Selected target role & fallback
  const selectedRole: Role = useMemo(() => {
    return DEFAULT_ROLES.find((r) => r.id === persisted.selectedRoleId) ?? DEFAULT_ROLES[0]!;
  }, [persisted.selectedRoleId]);

  // Real-time matching calculation based on student's current skill levels
  const matchResult: RoleMatchResult = useMemo(() => {
    return calculateRoleMatch(selectedRole, activeSkills, persisted.skillLevels);
  }, [selectedRole, activeSkills, persisted.skillLevels]);

  // Ranked roles across catalogue
  const rankedRoles = useMemo(() => {
    return rankRoles(DEFAULT_ROLES, activeSkills, persisted.skillLevels);
  }, [activeSkills, persisted.skillLevels]);

  // Filtered roles for explore view
  const filteredRoles = useMemo(() => {
    return rankedRoles.filter((item) => {
      const matchesCategory = roleCategoryFilter === "All" || item.category === roleCategoryFilter;
      const searchTerms =
        `${item.title} ${item.team} ${item.workStyle} ${item.description} ${Object.keys(
          item.requirements,
        ).join(" ")}`.toLowerCase();
      const matchesSearch = searchTerms.includes(roleSearchQuery.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [rankedRoles, roleCategoryFilter, roleSearchQuery]);

  // Dynamic roadmap activities (corrected parameter order: role, gaps, skillsCatalogue)
  const roadmapActivities: RoadmapActivity[] = useMemo(() => {
    return generateRoadmapActivities(selectedRole, matchResult.gaps, activeSkills);
  }, [selectedRole, activeSkills, matchResult.gaps]);

  function handleSelectRole(roleId: string) {
    setPersisted((prev) => ({
      ...prev,
      selectedRoleId: roleId,
    }));
    setPage("Overview");
  }

  function handleSetSkillLevel(skillId: string, level: number) {
    setPersisted((prev) => ({
      ...prev,
      skillLevels: {
        ...prev.skillLevels,
        [skillId]: Math.max(0, Math.min(3, level)),
      },
    }));
  }

  function handleAddExistingSkill(skill: Skill, initialLevel: number) {
    setPersisted((prev) => {
      const activeIds = prev.activeSkillIds.includes(skill.id)
        ? prev.activeSkillIds
        : [...prev.activeSkillIds, skill.id];

      return {
        ...prev,
        activeSkillIds: activeIds,
        skillLevels: {
          ...prev.skillLevels,
          [skill.id]: Math.max(0, Math.min(3, initialLevel)),
        },
      };
    });
    setIsAddSkillOpen(false);
  }

  function handleAddCustomSkill(
    name: string,
    group: SkillGroup,
    level: number,
    description?: string,
  ) {
    const newSkill = createCustomSkill(name, group, level, description);
    setPersisted((prev) => ({
      ...prev,
      customSkills: [...prev.customSkills, newSkill],
      activeSkillIds: [...prev.activeSkillIds, newSkill.id],
      skillLevels: {
        ...prev.skillLevels,
        [newSkill.id]: Math.max(0, Math.min(3, level)),
      },
    }));
    setIsAddSkillOpen(false);
  }

  function handleConfirmRemoveSkill() {
    if (!skillToRemove) return;
    const targetId = skillToRemove.id;

    setPersisted((prev) => {
      const nextLevels = { ...prev.skillLevels };
      delete nextLevels[targetId];

      return {
        ...prev,
        activeSkillIds: prev.activeSkillIds.filter((id) => id !== targetId),
        customSkills: prev.customSkills.filter((s) => s.id !== targetId),
        skillLevels: nextLevels,
      };
    });
    setSkillToRemove(null);
  }

  function handleToggleRoadmapStep(stepId: string) {
    setPersisted((prev) => {
      const isDone = prev.completedSteps.includes(stepId);
      const nextSteps = isDone
        ? prev.completedSteps.filter((id) => id !== stepId)
        : [...prev.completedSteps, stepId];

      return {
        ...prev,
        completedSteps: nextSteps,
      };
    });
  }

  function handleResetRoadmap() {
    setPersisted((prev) => ({
      ...prev,
      completedSteps: [],
    }));
  }

  function handleResetAllData() {
    const fresh = resetPersistedState(user.id);
    setPersisted(fresh);
    setPage("Overview");
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }

  const roleIcon = (icon: Role["icon"]) => {
    if (icon === "layers") return <Layers size={17} />;
    if (icon === "server") return <Server size={17} />;
    return <CodeXml size={17} />;
  };

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "S";

  return (
    <div
      className={`workspace-shell ${isDesktopCollapsed ? "sidebar-collapsed" : ""} ${
        isMobileOpen ? "mobile-sidebar-open" : ""
      }`}
    >
      {/* Dimmed backdrop for mobile overlay drawer */}
      <div
        className={`sidebar-backdrop ${isMobile && isMobileOpen ? "visible" : ""}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* SIDEBAR NAVIGATION */}
      <aside
        id="workspace-sidebar"
        className="workspace-sidebar"
        aria-label="Main application navigation"
        aria-hidden={!isSidebarVisible}
      >
        <div className="sidebar-header-row">
          <a
            className="wordmark"
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate("Overview");
            }}
            aria-label="SkillBridge Home"
          >
            <span className="wordmark-icon" aria-hidden="true">
              <Target size={19} />
            </span>
            <span>
              skillbridge<span className="wordmark-period">.</span>
            </span>
          </a>
          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X size={17} aria-hidden="true" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>

        <div className="sidebar-caption">YOUR WORKSPACE</div>
        <nav className="workspace-nav" aria-label="Workspaces">
          {navigation.map(({ name, icon: Icon }) => (
            <Button
              key={name}
              type="button"
              variant="ghost"
              className={`nav-button ${page === name ? "nav-button-active" : ""}`}
              aria-current={page === name ? "page" : undefined}
              onClick={() => handleNavigate(name)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{name}</span>
              {name === "Your roadmap" && matchResult.gaps.length > 0 && (
                <span
                  className="nav-counter"
                  title={`${matchResult.gaps.length} skills requiring focus`}
                >
                  {matchResult.gaps.length}
                </span>
              )}
            </Button>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-caption">YOUR TARGET ROLE</div>
        <button
          className="target-role-switcher"
          type="button"
          onClick={() => handleNavigate("Explore roles")}
          aria-label={`Target role: ${selectedRole.title}. Click to switch role.`}
        >
          <span className="role-mini-icon">{roleIcon(selectedRole.icon)}</span>
          <span className="target-role-label">
            <span>{selectedRole.title}</span>
            <small>
              {selectedRole.category} · {matchResult.score}% match
            </small>
          </span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>

        <div className="sidebar-spacer" />

        {/* RESET PROGRESS DIALOG */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="reset-action-btn"
              style={{ margin: "0 0 10px 4px" }}
              aria-label="Reset workspace to default demo data"
            >
              <RotateCcw size={12} />
              <span>Reset demo data</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all progress to demo baseline?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset your skill ratings, default target role ({DEFAULT_ROLES[0]?.title}),
                and clear completed roadmap steps for user <strong>{user.email}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetAllData}>Reset to default</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* LOGOUT TRIGGER */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="reset-action-btn"
              style={{ margin: "0 0 14px 4px" }}
              aria-label="Sign out of SkillBridge"
            >
              <LogOut size={12} />
              <span>Sign out</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out of SkillBridge?</AlertDialogTitle>
              <AlertDialogDescription>
                Your changes remain securely stored in your local browser storage. You can sign back
                in anytime using <strong>{user.email}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onLogout}>Sign out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="sidebar-privacy">
          <CircleHelp size={15} />
          <span>Local storage · Multi-user ready</span>
        </div>

        <div className="profile-row">
          <span className="profile-avatar" aria-hidden="true">
            {userInitial}
          </span>
          <span className="profile-details">
            <span>{user.name}</span>
            <small>{user.email}</small>
          </span>
          <span className="profile-status" aria-label="User profile active" />
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="workspace-main" id="main-content">
        <header className="workspace-topbar" aria-label="Top navigation bar">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={handleToggleSidebar}
              aria-label={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
              aria-expanded={isSidebarVisible}
              aria-controls="workspace-sidebar"
              title={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
            >
              {isSidebarVisible ? (
                <PanelLeftClose size={18} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
              )}
              <span className="sr-only">{isSidebarVisible ? "Hide sidebar" : "Show sidebar"}</span>
            </button>

            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <button
                type="button"
                onClick={() => handleNavigate("Overview")}
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                SkillBridge
              </button>
              <span className="breadcrumb-slash">/</span>
              <span className="breadcrumb-current">{page}</span>
            </nav>
          </div>

          <div className="topbar-right">
            <span className="sample-data-label">
              <span className="sample-dot" /> Curated CSE benchmark profiles
            </span>
            <span className="topbar-avatar" aria-label={`Logged in as ${user.name}`}>
              {userInitial}
            </span>
          </div>
        </header>

        <div className="workspace-content">
          {page === "Overview" && (
            <OverviewWorkspace
              selectedRole={selectedRole}
              matchResult={matchResult}
              rankedRoles={rankedRoles}
              completedSteps={persisted.completedSteps}
              roadmapActivities={roadmapActivities}
              onNavigate={setPage}
              onSelectRole={handleSelectRole}
              onInspectRole={setInspectingRole}
            />
          )}

          {page === "Explore roles" && (
            <ExploreRolesWorkspace
              roles={filteredRoles}
              selectedRoleId={persisted.selectedRoleId}
              searchQuery={roleSearchQuery}
              onSearchChange={setRoleSearchQuery}
              categoryFilter={roleCategoryFilter}
              onCategoryChange={setRoleCategoryFilter}
              onSelectRole={handleSelectRole}
              onInspectRole={setInspectingRole}
            />
          )}

          {page === "My skills" && (
            <SkillsWorkspace
              skills={activeSkills}
              allCatalogueSkills={allAvailableSkills}
              selectedRole={selectedRole}
              skillLevels={persisted.skillLevels}
              onSetSkillLevel={handleSetSkillLevel}
              filter={skillsFilter}
              onFilterChange={setSkillsFilter}
              onOpenAddSkill={() => setIsAddSkillOpen(true)}
              onRequestRemoveSkill={setSkillToRemove}
              onResetToDefault={handleResetAllData}
            />
          )}

          {page === "Your roadmap" && (
            <RoadmapWorkspace
              selectedRole={selectedRole}
              activities={roadmapActivities}
              completedSteps={persisted.completedSteps}
              onToggleStep={handleToggleRoadmapStep}
              onInspectActivity={setInspectingActivity}
              onResetRoadmap={handleResetRoadmap}
              onExploreRoles={() => setPage("Explore roles")}
            />
          )}

          <footer className="workspace-footer" aria-label="Application footer">
            <span>SkillBridge — Designed for the path between learning and your first role.</span>
            <span>
              Local data is saved per user in browser storage. Benchmark roles are educational
              examples.
            </span>
          </footer>
        </div>
      </main>

      {/* MODALS */}
      <AddSkillModal
        isOpen={isAddSkillOpen}
        onClose={() => setIsAddSkillOpen(false)}
        activeSkillIds={persisted.activeSkillIds}
        allCatalogueSkills={allAvailableSkills}
        onAddExistingSkill={handleAddExistingSkill}
        onAddCustomSkill={handleAddCustomSkill}
      />

      <AlertDialog
        open={Boolean(skillToRemove)}
        onOpenChange={(open) => !open && setSkillToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {skillToRemove?.name} from your profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your proficiency rating for <strong>{skillToRemove?.name}</strong>.
              Your match scores and personalized roadmap will adjust immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSkillToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemoveSkill}>Remove skill</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {inspectingRole && (
        <RoleDetailsModal
          role={inspectingRole}
          matchResult={calculateRoleMatch(inspectingRole, activeSkills, persisted.skillLevels)}
          skillLevels={persisted.skillLevels}
          activeSkills={activeSkills}
          onClose={() => setInspectingRole(null)}
          onSelectGoal={() => {
            handleSelectRole(inspectingRole.id);
            setInspectingRole(null);
          }}
          isCurrentGoal={persisted.selectedRoleId === inspectingRole.id}
        />
      )}

      {inspectingActivity && (
        <ActivityDetailsModal
          activity={inspectingActivity}
          isCompleted={persisted.completedSteps.includes(inspectingActivity.id)}
          onToggleComplete={() => handleToggleRoadmapStep(inspectingActivity.id)}
          onClose={() => setInspectingActivity(null)}
        />
      )}
    </div>
  );
}
