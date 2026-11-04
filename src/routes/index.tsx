import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Clock3,
  Compass,
  CodeXml,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  PanelLeftClose,
  Plus,
  RotateCcw,
  Search,
  Server,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import studyWorkspace from "@/assets/skill-workspace.jpg";

import {
  DEFAULT_ROLES,
  getFullSkillCatalogue,
  createCustomSkill,
  LEVEL_NAMES,
  PROFICIENCY_LEVELS,
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
import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  DEMO_CREDENTIALS,
  type User,
} from "@/lib/auth";

type PageName = "Overview" | "Explore roles" | "My skills" | "Your roadmap";

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
 * Root component handling authentication gating and workspace rendering.
 */
function SkillBridgeWorkspaceRoot() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [isClientReady, setIsClientReady] = useState(false);

  // Check auth session on mount
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

  // During SSR or prior to client mount, render safe container to prevent hydration flash
  if (!isClientReady) {
    return (
      <div className="workspace-shell" style={{ display: "grid", placeItems: "center" }}>
        <div style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>
          Initializing SkillBridge workspace...
        </div>
      </div>
    );
  }

  // Gated: Show login or registration if unauthenticated
  if (!currentUser) {
    return (
      <AuthScreen view={authView} onSwitchView={setAuthView} onLoginSuccess={handleLoginSuccess} />
    );
  }

  // Authenticated workspace
  return <SkillBridgeWorkspace user={currentUser} onLogout={handleLogout} />;
}

/* =========================================================================
   PHASE 2: AUTHENTICATION SCREEN (LOGIN & REGISTRATION)
   ========================================================================= */

interface AuthScreenProps {
  view: "login" | "register";
  onSwitchView: (view: "login" | "register") => void;
  onLoginSuccess: (user: User) => void;
}

function AuthScreen({ view, onSwitchView, onLoginSuccess }: AuthScreenProps) {
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Autofill demo credentials for instant evaluation
  function handleFillDemo() {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrorMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (view === "login") {
        const result = await loginUser(email, password);
        if (result.success && result.user) {
          onLoginSuccess(result.user);
        } else {
          setErrorMessage(result.error || "Login failed. Please check your credentials.");
        }
      } else {
        const result = await registerUser(name, email, password, confirmPassword);
        if (result.success && result.user) {
          onLoginSuccess(result.user);
        } else {
          setErrorMessage(result.error || "Registration failed. Please check your input.");
        }
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card" role="main" aria-labelledby="auth-heading">
        <header className="auth-header">
          <div className="wordmark">
            <span className="wordmark-icon" aria-hidden="true">
              <Target size={19} />
            </span>
            <span>
              skillbridge<span className="wordmark-period">.</span>
            </span>
          </div>
          <h1 id="auth-heading">{view === "login" ? "Welcome back" : "Create your account"}</h1>
          <p>
            {view === "login"
              ? "Sign in to access your skill-to-role matching portfolio and roadmap."
              : "Register to track your technical proficiency and early-career goals."}
          </p>
        </header>

        {/* Demo Account Quick-Fill Hint */}
        {view === "login" && (
          <div className="auth-demo-hint">
            <div className="auth-demo-hint-title">
              <span>Demo Student Account</span>
              <button
                type="button"
                onClick={handleFillDemo}
                style={{
                  background: "transparent",
                  border: 0,
                  color: "var(--primary)",
                  cursor: "pointer",
                  fontSize: "9px",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Auto-fill credentials
              </button>
            </div>
            <div className="auth-demo-hint-text">
              Email: <code>alex.chen@student.edu</code> · Pass: <code>Password123!</code>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            <Info size={14} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {view === "register" && (
            <div className="auth-field">
              <label htmlFor="reg-name">Full name</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-name"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Student email address</label>
            <div className="auth-input-wrapper">
              <input
                id="auth-email"
                type="email"
                className="auth-input"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={view === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {view === "register" && (
            <div className="auth-field">
              <label htmlFor="reg-confirm-password">Confirm password</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                  }
                  title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            style={{ marginTop: "6px" }}
          >
            {isLoading
              ? "Authenticating..."
              : view === "login"
                ? "Sign in to SkillBridge"
                : "Create student account"}
          </Button>
        </form>

        <footer className="auth-footer">
          {view === "login" ? (
            <span>
              Don't have a profile yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  onSwitchView("register");
                }}
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  onSwitchView("login");
                }}
              >
                Sign in to your account
              </button>
            </span>
          )}
        </footer>
      </div>
    </div>
  );
}

/* =========================================================================
   AUTHENTICATED WORKSPACE SHELL
   ========================================================================= */

interface SkillBridgeWorkspaceProps {
  user: User;
  onLogout: () => void;
}

function SkillBridgeWorkspace({ user, onLogout }: SkillBridgeWorkspaceProps) {
  const [page, setPage] = useState<PageName>("Overview");

  // Load user-isolated state
  const [persisted, setPersisted] = useState<PersistedUserState>(() => loadPersistedState(user.id));

  // Sidebar collapsed preference persisted in localStorage (defaults to expanded on first visit)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() =>
    loadSidebarCollapsedPreference(),
  );
  // Mobile drawer state: ephemeral, starts closed
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

  // Dynamic roadmap activities
  const roadmapActivities: RoadmapActivity[] = useMemo(() => {
    return generateRoadmapActivities(selectedRole, activeSkills, matchResult.gaps);
  }, [selectedRole, activeSkills, matchResult.gaps]);

  // State Mutators
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

      {/* =========================================================================
          MODALS & DIALOGS
          ========================================================================= */}

      {/* 1. ADD SKILL MODAL */}
      <AddSkillModal
        isOpen={isAddSkillOpen}
        onClose={() => setIsAddSkillOpen(false)}
        activeSkillIds={persisted.activeSkillIds}
        allCatalogueSkills={allAvailableSkills}
        onAddExistingSkill={handleAddExistingSkill}
        onAddCustomSkill={handleAddCustomSkill}
      />

      {/* 2. REMOVE SKILL CONFIRMATION MODAL */}
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

      {/* 3. VIEW ROLE DETAILS MODAL */}
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

      {/* 4. VIEW ROADMAP ACTIVITY DETAILS MODAL */}
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

/* =========================================================================
   1. OVERVIEW WORKSPACE
   ========================================================================= */

interface OverviewWorkspaceProps {
  selectedRole: Role;
  matchResult: RoleMatchResult;
  rankedRoles: Array<Role & { match: RoleMatchResult }>;
  completedSteps: string[];
  roadmapActivities: RoadmapActivity[];
  onNavigate: (page: PageName) => void;
  onSelectRole: (roleId: string) => void;
  onInspectRole: (role: Role) => void;
}

function OverviewWorkspace({
  selectedRole,
  matchResult,
  rankedRoles,
  completedSteps,
  roadmapActivities,
  onNavigate,
  onSelectRole,
  onInspectRole,
}: OverviewWorkspaceProps) {
  const bestRole = rankedRoles[0] ?? { ...selectedRole, match: matchResult };
  const completedCount = completedSteps.length;
  const totalSuggested = roadmapActivities.length;
  const roadmapPct = totalSuggested > 0 ? Math.round((completedCount / totalSuggested) * 100) : 100;

  return (
    <>
      <section className="welcome-row" aria-labelledby="welcome-heading">
        <div className="welcome-copy">
          <div className="eyebrow">
            <span className="eyebrow-mark" /> YOUR NEXT CHAPTER IN TECH
          </div>
          <h1 id="welcome-heading">
            See where your skills
            <br className="desktop-break" /> can take you.
          </h1>
          <p>
            Good tech careers start with an honest picture of where you are today—and one clear,
            practical step forward.
          </p>
        </div>
        <figure className="welcome-photo">
          <img
            src={studyWorkspace}
            alt="CSE student learning web engineering in a university workspace"
            width={1600}
            height={912}
            loading="eager"
          />
          <figcaption>
            <span className="photo-status-dot" /> Your skills, in context
          </figcaption>
        </figure>
      </section>

      {/* Snapshot Strip */}
      <section className="stats-strip" aria-label="Career overview metrics">
        <article className="stat-item">
          <span className="stat-icon stat-icon-blue" aria-hidden="true">
            <Target size={18} />
          </span>
          <div>
            <span className="stat-label">BEST ROLE MATCH</span>
            <div className="stat-value">
              {bestRole.match.score}
              <span className="stat-unit">%</span>
            </div>
            <span className="stat-caption">
              For <span className="inline-role-name">{bestRole.title}</span>
            </span>
          </div>
        </article>

        <div className="stat-separator" aria-hidden="true" />

        <article className="stat-item">
          <span className="stat-icon stat-icon-green" aria-hidden="true">
            <TrendingUp size={18} />
          </span>
          <div>
            <span className="stat-label">CURRENT TARGET GOAL</span>
            <div className="stat-value stat-value-text">
              {matchResult.gaps.length} <span className="stat-small-unit">skills to grow</span>
            </div>
            <span className="stat-caption">
              For <span className="inline-role-name">{selectedRole.title}</span> (
              {matchResult.score}%)
            </span>
          </div>
        </article>

        <div className="stat-separator" aria-hidden="true" />

        <article className="stat-item">
          <span className="stat-icon stat-icon-amber" aria-hidden="true">
            <CheckCheck size={18} />
          </span>
          <div>
            <span className="stat-label">ROADMAP MOMENTUM</span>
            <div className="stat-value stat-value-text">
              {completedCount}{" "}
              <span className="stat-small-unit">
                {completedCount === 1 ? "step done" : "steps done"}
              </span>
            </div>
            <span className="stat-caption">
              {totalSuggested > 0
                ? `${roadmapPct}% of suggested activities complete`
                : "All target skills met"}
            </span>
          </div>
        </article>
      </section>

      {/* Main Grid: Roles & Strongest Opportunities */}
      <section className="overview-grid">
        <div className="overview-primary">
          <div className="section-heading-row">
            <div>
              <div className="eyebrow">BUILT AROUND YOUR SKILLS</div>
              <h2>Roles worth exploring</h2>
            </div>
            <Button
              variant="ghost"
              className="text-action"
              onClick={() => onNavigate("Explore roles")}
              aria-label="View all curated roles"
            >
              All roles <ArrowRight size={15} />
            </Button>
          </div>

          <div className="role-card-list" role="list" aria-label="Top matching roles">
            {rankedRoles.map((role, index) => {
              const isSelected = role.id === selectedRole.id;
              const RoleIconComponent =
                role.icon === "layers"
                  ? BriefcaseBusiness
                  : role.icon === "server"
                    ? GraduationCap
                    : CodeXml;

              return (
                <div
                  key={role.id}
                  className={`role-card ${isSelected ? "role-card-selected" : ""}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <button
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flex: 1,
                      background: "transparent",
                      border: 0,
                      textAlign: "left",
                      color: "inherit",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    onClick={() => onSelectRole(role.id)}
                    aria-label={`${role.title}, ${role.match.score}% match. ${isSelected ? "Currently selected goal." : "Click to select as career goal."}`}
                  >
                    <span
                      className={`role-card-icon role-icon-${Math.min(index, 2)}`}
                      aria-hidden="true"
                    >
                      <RoleIconComponent size={19} strokeWidth={1.8} />
                    </span>
                    <span className="role-card-copy">
                      <span className="role-card-title">
                        {role.title}
                        {index === 0 && <span className="role-fit-label">TOP MATCH</span>}
                        {isSelected && (
                          <span
                            className="role-fit-label"
                            style={{
                              background: "var(--blue-soft)",
                              color: "var(--blue-mid)",
                            }}
                          >
                            SELECTED GOAL
                          </span>
                        )}
                      </span>
                      <span className="role-card-detail">
                        {role.team}
                        <span className="meta-dot">·</span>
                        {role.workStyle}
                      </span>
                    </span>
                    <span className="role-card-match">
                      <span className="role-match-number">{role.match.score}%</span>
                      <span className="role-match-label">match</span>
                    </span>
                  </button>

                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ height: "28px", fontSize: "9px", marginLeft: "8px", padding: "0 6px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectRole(role);
                    }}
                    aria-label={`View full details for ${role.title}`}
                  >
                    <Info size={13} style={{ marginRight: "3px" }} /> Details
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Strongest Opportunities (Skill Gaps) */}
          <section className="gap-preview" aria-labelledby="gap-preview-title">
            <div className="gap-heading">
              <div className="gap-heading-icon" aria-hidden="true">
                <Sparkles size={17} />
              </div>
              <div>
                <span className="eyebrow">TARGETED OPPORTUNITIES</span>
                <h3 id="gap-preview-title">Your strongest skill-gap opportunities</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="small-arrow"
                aria-label="Edit your skills in My Skills workspace"
                onClick={() => onNavigate("My skills")}
              >
                <ArrowUpRight size={17} />
              </Button>
            </div>

            {matchResult.gaps.length > 0 ? (
              <div className="gap-chip-list" aria-label="Identified skill gaps for target role">
                {matchResult.gaps.slice(0, 6).map((gap) => (
                  <button
                    key={gap.skillId}
                    type="button"
                    className="gap-chip"
                    onClick={() => onNavigate("My skills")}
                    title={`Click to adjust ${gap.skillName} in My skills`}
                  >
                    <span className="gap-chip-dot" aria-hidden="true" />
                    <strong>{gap.skillName}</strong>
                    <small>
                      Level {gap.currentLevel} → {gap.requiredLevel} (
                      {LEVEL_NAMES[gap.requiredLevel]})
                    </small>
                  </button>
                ))}
              </div>
            ) : (
              <p className="all-set-note">
                <Check size={16} /> You have satisfied every listed requirement for{" "}
                {selectedRole.title}. Keep strengthening your portfolio projects and code reviews!
              </p>
            )}
          </section>
        </div>

        {/* Sidebar Column: Learning Path Preview */}
        <aside className="overview-secondary" aria-label="Roadmap preview">
          <section className="roadmap-card">
            <div className="side-panel-heading">
              <span className="side-panel-icon" aria-hidden="true">
                <BookOpen size={17} />
              </span>
              <div>
                <span className="eyebrow">YOUR LEARNING PATH</span>
                <h3>Start with one focused project</h3>
              </div>
            </div>
            <p className="learning-intro">
              Targeted hands-on practice directly aligned with your{" "}
              {selectedRole.title.toLowerCase()} goal:
            </p>

            <div className="learning-steps-list">
              {roadmapActivities.slice(0, 3).map((act, index) => {
                const isDone = completedSteps.includes(act.id);
                return (
                  <div className="learning-step" key={act.id}>
                    <div
                      className={`step-number ${isDone ? "step-number-done" : ""}`}
                      aria-label={isDone ? `Step ${index + 1} completed` : `Step ${index + 1}`}
                    >
                      {isDone ? <Check size={14} /> : index + 1}
                    </div>
                    <div className="step-content">
                      <span className="step-topic">{act.skillName}</span>
                      <p>{act.title}</p>
                      <span className="step-duration">
                        <Clock3 size={12} /> {act.duration}
                      </span>
                    </div>
                  </div>
                );
              })}

              {roadmapActivities.length === 0 && (
                <p className="plan-empty">
                  Your rated skills satisfy every requirement for {selectedRole.title}. Explore
                  another role or dive into advanced portfolio polish.
                </p>
              )}
            </div>

            <Button className="roadmap-button" onClick={() => onNavigate("Your roadmap")}>
              <span>View full learning roadmap</span>
              <ArrowRight size={16} />
            </Button>
          </section>

          <button
            className="profile-prompt"
            onClick={() => onNavigate("My skills")}
            type="button"
            aria-label="Navigate to My skills workspace to rate proficiencies"
          >
            <span className="prompt-icon" aria-hidden="true">
              <ChartNoAxesColumnIncreasing size={18} />
            </span>
            <span className="prompt-copy">
              <strong>Make this match yours</strong>
              <small>Update your skill levels to recalculate your real-time matches.</small>
            </span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </aside>
      </section>
    </>
  );
}

/* =========================================================================
   2. EXPLORE ROLES WORKSPACE
   ========================================================================= */

interface ExploreRolesWorkspaceProps {
  roles: Array<Role & { match: RoleMatchResult }>;
  selectedRoleId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  onSelectRole: (roleId: string) => void;
  onInspectRole: (role: Role) => void;
}

function ExploreRolesWorkspace({
  roles: matchingRoles,
  selectedRoleId,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  onSelectRole,
  onInspectRole,
}: ExploreRolesWorkspaceProps) {
  const categories = ["All", "Frontend", "Full-Stack", "Backend"];

  return (
    <section className="content-page" aria-labelledby="roles-page-title">
      <header className="page-heading">
        <div className="eyebrow">ROLES, WITHOUT THE GUESSWORK</div>
        <h1 id="roles-page-title">Explore early-career possibilities.</h1>
        <p>
          Compare your current technical skills against realistic entry-level engineering profiles.
          Select any role to update your target goal and learning roadmap.
        </p>
      </header>

      {/* Search Input */}
      <label className="search-field">
        <Search size={17} aria-hidden="true" />
        <span className="sr-only">Search roles by title, team, or skills</span>
        <input
          type="search"
          placeholder="Search by role title, team, work style, or technical skill..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onSearchChange("");
            }
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            style={{
              background: "transparent",
              border: 0,
              color: "var(--muted-foreground)",
              cursor: "pointer",
              fontSize: "11px",
              padding: "0 6px",
            }}
          >
            Clear
          </button>
        )}
        <kbd>Esc</kbd>
      </label>

      {/* Category Filter Pills */}
      <div className="filter-pill-list" role="tablist" aria-label="Filter roles by category">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`filter-pill ${categoryFilter === cat ? "filter-pill-active" : ""}`}
            onClick={() => onCategoryChange(cat)}
            role="tab"
            aria-selected={categoryFilter === cat}
          >
            <span>{cat}</span>
            <span className="filter-pill-count">
              (
              {cat === "All"
                ? DEFAULT_ROLES.length
                : DEFAULT_ROLES.filter((r) => r.category === cat).length}
              )
            </span>
          </button>
        ))}
      </div>

      <div className="roles-notice">
        <span className="notice-dot" aria-hidden="true" />
        <span>
          Curated CSE benchmark profiles to help students map learning priorities—not verified live
          vacancies.
        </span>
      </div>

      <div className="explore-layout">
        <div className="explore-results">
          <div className="results-count">
            {matchingRoles.length} {matchingRoles.length === 1 ? "ROLE PROFILE" : "ROLE PROFILES"}
            <span>·</span> ORDERED BY SKILL MATCH SCORE
          </div>

          {matchingRoles.map((role, index) => {
            const isSelected = selectedRoleId === role.id;
            const skillGaps = role.match.gaps;
            const metCount = role.match.metRequirementsCount;
            const totalCount = role.match.totalRequirementsCount;

            return (
              <article
                key={role.id}
                className={`explore-role-card ${isSelected ? "explore-role-card-active" : ""}`}
                aria-label={`${role.title}, ${role.match.score}% match`}
              >
                <div className="explore-role-header">
                  <span
                    className={`role-card-icon role-icon-${Math.min(index, 2)}`}
                    aria-hidden="true"
                  >
                    <CodeXml size={19} />
                  </span>
                  <div className="explore-role-titles">
                    <h2>{role.title}</h2>
                    <span>
                      {role.team}
                      <span className="meta-dot">·</span>
                      {role.workStyle}
                      <span className="meta-dot">·</span>
                      <strong style={{ color: "var(--foreground)" }}>{role.category}</strong>
                    </span>
                  </div>
                  <div className="explore-match">
                    <strong>{role.match.score}%</strong>
                    <span>match</span>
                  </div>
                </div>

                <p className="explore-description">{role.description}</p>

                <div className="explore-coverage">
                  <span className="coverage-text">
                    {metCount} of {totalCount} skills at target level
                  </span>
                  <progress
                    className="match-progress"
                    aria-label={`${role.match.score}% skill match for ${role.title}`}
                    value={role.match.score}
                    max={100}
                  >
                    {role.match.score}%
                  </progress>
                </div>

                <div className="role-gap-summary">
                  {skillGaps.length > 0 ? (
                    <>
                      <span className="eyebrow">KEY SKILLS TO KEEP BUILDING</span>
                      <div className="gap-chip-list">
                        {skillGaps.slice(0, 4).map((gap) => (
                          <span className="gap-chip" key={gap.skillId}>
                            <span className="gap-chip-dot" />
                            {gap.skillName}
                            <small>
                              Level {gap.currentLevel} → {gap.requiredLevel}
                            </small>
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="all-set-note">
                      <Check size={15} /> All listed requirements met at target level
                    </span>
                  )}
                </div>

                <div
                  style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}
                >
                  <Button
                    variant={isSelected ? "secondary" : "default"}
                    className="select-role-button"
                    onClick={() => onSelectRole(role.id)}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? (
                      <>
                        <Check size={14} /> Current career goal
                      </>
                    ) : (
                      <>
                        Set as target goal <ArrowRight size={14} />
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="select-role-button"
                    onClick={() => onInspectRole(role)}
                    aria-label={`View role requirements breakdown for ${role.title}`}
                  >
                    <Info size={14} style={{ marginRight: "4px" }} /> View breakdown
                  </Button>
                </div>
              </article>
            );
          })}

          {matchingRoles.length === 0 && (
            <div className="empty-results">
              <Search size={24} />
              <strong>No matching role profiles found</strong>
              <span>Try searching for another keyword or clearing your category filters.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSearchChange("");
                  onCategoryChange("All");
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Aside: Matching explanation */}
        <aside className="explore-side-note" aria-label="Scoring methodology">
          <span className="side-panel-icon" aria-hidden="true">
            <Target size={17} />
          </span>
          <span className="eyebrow">HOW THE ENGINE WORKS</span>
          <h3>A transparent benchmark, not a hiring verdict.</h3>
          <p>
            Your match score compares your self-rated proficiency (0 to 3) against the requirements
            of each role. Partial credit is awarded proportionally for developing skills.
          </p>
          <div className="note-rule" />
          <p style={{ fontSize: "9px", color: "var(--muted-foreground)", lineHeight: "1.6" }}>
            The score is an educational navigation tool to help you identify which practical
            projects yield the greatest skill growth.
          </p>
          <div className="note-rule" />
          <span className="note-mini">
            <TrendingUp size={15} /> Rating skills immediately updates scores across all roles.
          </span>
        </aside>
      </div>
    </section>
  );
}

/* =========================================================================
   3. MY SKILLS WORKSPACE (WITH ADD & REMOVE ACTIONS)
   ========================================================================= */

interface SkillsWorkspaceProps {
  skills: Skill[];
  allCatalogueSkills: Skill[];
  selectedRole: Role;
  skillLevels: Record<string, number>;
  onSetSkillLevel: (skillId: string, level: number) => void;
  filter: "all" | "required" | "gaps";
  onFilterChange: (filter: "all" | "required" | "gaps") => void;
  onOpenAddSkill: () => void;
  onRequestRemoveSkill: (skill: Skill) => void;
  onResetToDefault: () => void;
}

function SkillsWorkspace({
  skills,
  allCatalogueSkills,
  selectedRole,
  skillLevels,
  onSetSkillLevel,
  filter,
  onFilterChange,
  onOpenAddSkill,
  onRequestRemoveSkill,
  onResetToDefault,
}: SkillsWorkspaceProps) {
  const groups: SkillGroup[] = ["Frontend", "Tools & practices", "Backend"];
  const roleReqs = selectedRole.requirements;

  const totalRequired = Object.keys(roleReqs).length;
  const metRequired = Object.entries(roleReqs).filter(
    ([id, req]) => (skillLevels[id] ?? 0) >= req,
  ).length;

  return (
    <section className="content-page" aria-labelledby="skills-page-title">
      <header className="page-heading">
        <div className="eyebrow">YOUR PERSONAL SKILL PROFILE</div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1 id="skills-page-title">Start with what you honestly know.</h1>
            <p>
              Rate your practical familiarity on a 4-point scale. Add new skills from the catalogue
              or create custom topics to personalize your profile.
            </p>
          </div>
          <button
            type="button"
            className="skill-add-btn"
            onClick={onOpenAddSkill}
            aria-label="Add a new skill to your profile"
          >
            <Plus size={14} />
            <span>Add Skill</span>
          </button>
        </div>
      </header>

      {/* Summary Banner */}
      <div className="skill-summary-banner" aria-label="Skills status summary">
        <span className="skill-summary-icon" aria-hidden="true">
          <SlidersHorizontal size={18} />
        </span>
        <div>
          <strong>
            {metRequired} of {totalRequired} required skills met
          </strong>
          <small>
            For current goal: <em>{selectedRole.title}</em> · {skills.length} skills in profile
          </small>
        </div>

        <div className="level-explainer" aria-hidden="true">
          <span className="legend-swatch legend-filled" /> At or above target
          <span className="legend-swatch legend-empty" /> In progress / gap
        </div>
      </div>

      {/* Filter Tabs & Reset Trigger */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        <div className="filter-pill-list" style={{ margin: 0 }}>
          <button
            type="button"
            className={`filter-pill ${filter === "all" ? "filter-pill-active" : ""}`}
            onClick={() => onFilterChange("all")}
          >
            All profile skills ({skills.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === "required" ? "filter-pill-active" : ""}`}
            onClick={() => onFilterChange("required")}
          >
            Required for {selectedRole.title} ({totalRequired})
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === "gaps" ? "filter-pill-active" : ""}`}
            onClick={() => onFilterChange("gaps")}
          >
            Skills needing focus ({Math.max(0, totalRequired - metRequired)})
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" className="reset-action-btn">
                <RotateCcw size={12} />
                <span>Reset all skills</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all skills to demo defaults?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all skills back to their initial baseline demo ratings and restore
                  the default catalogue.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onResetToDefault}>Reset to default</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Grouped Skills List */}
      {groups.map((group) => {
        let groupSkills = skills.filter((s) => s.group === group);

        if (filter === "required") {
          groupSkills = groupSkills.filter((s) => Boolean(roleReqs[s.id]));
        } else if (filter === "gaps") {
          groupSkills = groupSkills.filter((s) => {
            const req = roleReqs[s.id];
            return typeof req === "number" && (skillLevels[s.id] ?? 0) < req;
          });
        }

        if (groupSkills.length === 0) return null;

        return (
          <section className="skill-group" key={group} aria-labelledby={`group-${group}`}>
            <div className="skill-group-heading">
              <h2 id={`group-${group}`}>{group}</h2>
              <span>{groupSkills.length} skills listed</span>
            </div>

            <div className="skill-list">
              {groupSkills.map((skill) => {
                const currentLevel = skillLevels[skill.id] ?? 0;
                const requiredLevel = roleReqs[skill.id];
                const isRequired = typeof requiredLevel === "number";
                const isMet = isRequired && currentLevel >= requiredLevel;
                const gap = isRequired ? Math.max(0, requiredLevel - currentLevel) : 0;

                return (
                  <article className="skill-row" key={skill.id}>
                    <div className="skill-title-block">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="skill-name">{skill.name}</span>
                        {skill.id.startsWith("custom-") && (
                          <span
                            style={{
                              fontSize: "8px",
                              padding: "1px 4px",
                              borderRadius: "3px",
                              background: "var(--blue-soft)",
                              color: "var(--blue-mid)",
                              fontWeight: 600,
                            }}
                          >
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <span className="skill-role-context">
                        {isRequired ? (
                          <>
                            Role target: <strong>{LEVEL_NAMES[requiredLevel]}</strong> (Level{" "}
                            {requiredLevel}) ·{" "}
                            {isMet ? (
                              <span style={{ color: "var(--success)" }}>
                                Requirement satisfied ✓
                              </span>
                            ) : (
                              <span style={{ color: "var(--amber)" }}>
                                {gap} {gap === 1 ? "level" : "levels"} to target
                              </span>
                            )}
                          </>
                        ) : (
                          "Optional for current role goal"
                        )}
                      </span>
                    </div>

                    <div
                      className="skill-rating-controls"
                      role="radiogroup"
                      aria-label={`Select proficiency level for ${skill.name}`}
                    >
                      {PROFICIENCY_LEVELS.map((meta) => {
                        const isSelected = currentLevel === meta.level;
                        return (
                          <Button
                            key={meta.level}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={`level-button ${isSelected ? "level-button-active" : ""}`}
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`${skill.name}: Level ${meta.level} - ${meta.name} (${meta.stage})`}
                            title={`${meta.name} (${meta.stage}): ${meta.description}`}
                            onClick={() => onSetSkillLevel(skill.id, meta.level)}
                          >
                            {meta.name}
                          </Button>
                        );
                      })}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        justifySelf: "end",
                      }}
                    >
                      <span
                        className={`skill-current-level skill-level-${currentLevel}`}
                        aria-label={`Current level: ${LEVEL_NAMES[currentLevel]}`}
                      >
                        {LEVEL_NAMES[currentLevel]}
                      </span>

                      {/* Remove Skill Action */}
                      <button
                        type="button"
                        className="skill-remove-btn"
                        onClick={() => onRequestRemoveSkill(skill)}
                        aria-label={`Remove ${skill.name} from profile`}
                        title={`Remove ${skill.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {skills.length === 0 && (
        <div className="empty-results" style={{ marginTop: "24px", padding: "32px 16px" }}>
          <SlidersHorizontal size={26} />
          <strong>No skills found in this filter</strong>
          <span>Click "Add Skill" to include a technology or clear your active filter.</span>
          <Button onClick={onOpenAddSkill}>
            <Plus size={14} style={{ marginRight: "4px" }} /> Add a skill to your profile
          </Button>
        </div>
      )}

      <p className="self-report-note">
        <CircleHelp size={15} />
        Proficiency scale: <strong>Not yet (0)</strong> = Beginner, <strong>Learning (1)</strong> =
        Developing, <strong>Comfortable (2)</strong> = Intermediate, <strong>Confident (3)</strong>{" "}
        = Advanced. Changes are saved to your browser automatically.
      </p>
    </section>
  );
}

/* =========================================================================
   4. YOUR ROADMAP WORKSPACE
   ========================================================================= */

interface RoadmapWorkspaceProps {
  selectedRole: Role;
  activities: RoadmapActivity[];
  completedSteps: string[];
  onToggleStep: (stepId: string) => void;
  onInspectActivity: (act: RoadmapActivity) => void;
  onResetRoadmap: () => void;
  onExploreRoles: () => void;
}

function RoadmapWorkspace({
  selectedRole,
  activities,
  completedSteps,
  onToggleStep,
  onInspectActivity,
  onResetRoadmap,
  onExploreRoles,
}: RoadmapWorkspaceProps) {
  const totalActivities = activities.length;
  const completedInCurrent = activities.filter((act) => completedSteps.includes(act.id)).length;
  const progressPct =
    totalActivities > 0 ? Math.round((completedInCurrent / totalActivities) * 100) : 100;

  return (
    <section className="content-page" aria-labelledby="roadmap-page-title">
      <header className="page-heading">
        <div className="eyebrow">A PERSONALIZED LEARNING ROADMAP</div>
        <h1 id="roadmap-page-title">One focused project at a time.</h1>
        <p>
          Practical hands-on exercises formulated to close your identified skill gaps for the{" "}
          <strong>{selectedRole.title}</strong> role. Mark each activity complete as you build.
        </p>
      </header>

      {/* Intro Summary Banner */}
      <section className="roadmap-intro" aria-label="Roadmap summary">
        <div className="roadmap-intro-left">
          <span className="roadmap-intro-mark" aria-hidden="true">
            <BookOpen size={21} />
          </span>
          <div>
            <span className="eyebrow">TARGET CAREER FOCUS</span>
            <h2>{selectedRole.title}</h2>
            <p>
              {totalActivities > 0
                ? `${totalActivities} recommended activities designed to bridge your gaps, self-paced.`
                : `Every technical requirement for ${selectedRole.title} has been satisfied!`}
            </p>
          </div>
        </div>
        <span className="time-estimate">
          <Clock3 size={15} /> ~2–3 hrs per activity
        </span>
      </section>

      {/* Progress Block */}
      <section className="roadmap-progress-block" aria-label="Roadmap progress">
        <div className="progress-block-head">
          <span className="eyebrow">YOUR PROGRESSION</span>
          <span>
            {completedInCurrent} of {totalActivities} suggested activities completed ({progressPct}
            %)
          </span>
        </div>
        <progress
          className="roadmap-progress"
          aria-label={`${completedInCurrent} of ${totalActivities} activities completed`}
          value={completedInCurrent}
          max={Math.max(totalActivities, 1)}
        >
          {progressPct}%
        </progress>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "4px",
          }}
        >
          <span className="all-completed-label">
            {completedInCurrent === totalActivities && totalActivities > 0
              ? "All suggested steps completed! Outstanding effort."
              : "Every exercise completed is permanent evidence for your portfolio."}
          </span>

          {completedInCurrent > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button type="button" className="reset-action-btn">
                  <RotateCcw size={11} />
                  <span>Restart roadmap</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restart roadmap progress?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear completion marks for all learning activities. Your rated skill
                    levels will not be changed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onResetRoadmap}>Restart roadmap</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </section>

      {/* Activities List */}
      <div className="learning-roadmap-list" role="list" aria-label="Learning roadmap activities">
        {activities.length > 0 ? (
          activities.map((act, index) => {
            const isCompleted = completedSteps.includes(act.id);

            return (
              <article
                key={act.id}
                className={`roadmap-step-card ${isCompleted ? "roadmap-step-complete" : ""}`}
                aria-label={`Activity ${index + 1}: ${act.title}. ${isCompleted ? "Completed." : "Incomplete."}`}
              >
                <div
                  className="roadmap-step-marker"
                  aria-label={isCompleted ? "Completed step" : `Step number ${index + 1}`}
                >
                  {isCompleted ? <Check size={16} /> : String(index + 1).padStart(2, "0")}
                </div>

                <div className="roadmap-step-main">
                  <div>
                    <span className="roadmap-skill-tag">
                      {act.skillName} · CURRENT LEVEL {act.currentLevel} → TARGET {act.targetLevel}{" "}
                      ({LEVEL_NAMES[act.targetLevel]})
                    </span>
                  </div>

                  <h2>{act.title}</h2>
                  <p>{act.detail}</p>

                  <div className="roadmap-exercise-box">
                    <div className="exercise-section-title">Key Learning Objectives:</div>
                    <ul className="objectives-list">
                      {act.objectives.slice(0, 2).map((obj) => (
                        <li key={obj}>{obj}</li>
                      ))}
                    </ul>

                    <div className="practical-project-card">
                      <span className="practical-project-label">Hands-on Task:</span>
                      {act.practicalExercise}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "8px",
                      }}
                    >
                      <span className="roadmap-duration">
                        <Clock3 size={13} /> {act.duration}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ height: "26px", fontSize: "9px" }}
                        onClick={() => onInspectActivity(act)}
                        aria-label={`View full exercise specification for ${act.title}`}
                      >
                        <Info size={13} style={{ marginRight: "3px" }} /> Full Project Guide
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  variant={isCompleted ? "secondary" : "outline"}
                  className="complete-step-button"
                  onClick={() => onToggleStep(act.id)}
                  aria-pressed={isCompleted}
                >
                  {isCompleted ? (
                    <>
                      <Check size={14} /> Completed
                    </>
                  ) : (
                    "Mark complete"
                  )}
                </Button>
              </article>
            );
          })
        ) : (
          <div className="roadmap-empty">
            <span className="roadmap-empty-icon" aria-hidden="true">
              <Sparkles size={22} />
            </span>
            <h2>You have met all listed requirements!</h2>
            <p>
              Your rated skills already satisfy or exceed every requirement for the{" "}
              <strong>{selectedRole.title}</strong> role. You can explore a broader engineering
              profile or consolidate your portfolio code.
            </p>
            <Button onClick={onExploreRoles}>
              Explore another role <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>

      <p className="roadmap-disclaimer">
        <Sparkles size={15} /> All roadmap recommendations are structured around real-world software
        engineering practices. Completed milestones persist locally in your browser.
      </p>
    </section>
  );
}

/* =========================================================================
   ADD SKILL MODAL COMPONENT (PHASE 3)
   ========================================================================= */

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSkillIds: string[];
  allCatalogueSkills: Skill[];
  onAddExistingSkill: (skill: Skill, initialLevel: number) => void;
  onAddCustomSkill: (name: string, group: SkillGroup, level: number, desc?: string) => void;
}

function AddSkillModal({
  isOpen,
  onClose,
  activeSkillIds,
  allCatalogueSkills,
  onAddExistingSkill,
  onAddCustomSkill,
}: AddSkillModalProps) {
  const [tab, setTab] = useState<"catalogue" | "custom">("catalogue");
  const [search, setSearch] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [chosenLevel, setChosenLevel] = useState<number>(1);

  // Custom skill form
  const [customName, setCustomName] = useState("");
  const [customGroup, setCustomGroup] = useState<SkillGroup>("Frontend");
  const [customDesc, setCustomDesc] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter skills not yet in profile
  const availableCatalogue = useMemo(() => {
    return allCatalogueSkills
      .filter((s) => !activeSkillIds.includes(s.id))
      .filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.group.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase()),
      );
  }, [allCatalogueSkills, activeSkillIds, search]);

  useEffect(() => {
    if (availableCatalogue.length > 0 && !selectedSkillId) {
      setSelectedSkillId(availableCatalogue[0]?.id || "");
    }
  }, [availableCatalogue, selectedSkillId]);

  function handleAddCatalogueSkill() {
    setValidationError(null);
    const targetSkill = allCatalogueSkills.find((s) => s.id === selectedSkillId);
    if (!targetSkill) {
      setValidationError("Please select a skill from the list.");
      return;
    }
    if (activeSkillIds.includes(targetSkill.id)) {
      setValidationError("This skill is already in your profile.");
      return;
    }

    onAddExistingSkill(targetSkill, chosenLevel);
    setSearch("");
  }

  function handleCreateCustom() {
    setValidationError(null);
    const trimmed = customName.trim();
    if (!trimmed || trimmed.length < 2) {
      setValidationError("Please enter a skill name (at least 2 characters).");
      return;
    }

    // Check duplicate name
    const alreadyExists = allCatalogueSkills.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (alreadyExists) {
      setValidationError(
        "A skill with this name already exists in the catalogue. Please add it from the catalogue list.",
      );
      return;
    }

    onAddCustomSkill(trimmed, customGroup, chosenLevel, customDesc);
    setCustomName("");
    setCustomDesc("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add a Technical Skill</DialogTitle>
          <DialogDescription>
            Expand your student profile to track additional engineering proficiencies.
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="filter-pill-list" style={{ margin: "4px 0 12px" }}>
          <button
            type="button"
            className={`filter-pill ${tab === "catalogue" ? "filter-pill-active" : ""}`}
            onClick={() => {
              setValidationError(null);
              setTab("catalogue");
            }}
          >
            From Curated Catalogue
          </button>
          <button
            type="button"
            className={`filter-pill ${tab === "custom" ? "filter-pill-active" : ""}`}
            onClick={() => {
              setValidationError(null);
              setTab("custom");
            }}
          >
            Create Custom Skill
          </button>
        </div>

        {validationError && (
          <div className="auth-error-banner" role="alert" style={{ marginBottom: "12px" }}>
            <Info size={14} />
            <span>{validationError}</span>
          </div>
        )}

        {tab === "catalogue" ? (
          <div style={{ display: "grid", gap: "12px" }}>
            <label className="search-field" style={{ margin: 0, height: "36px" }}>
              <Search size={15} />
              <input
                type="search"
                placeholder="Search available catalogue skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <div
              style={{
                maxHeight: "190px",
                overflowY: "auto",
                border: "1px solid var(--border)",
                borderRadius: "5px",
                background: "var(--card)",
              }}
              role="listbox"
              aria-label="Available skills catalogue"
            >
              {availableCatalogue.map((skill) => {
                const isSelected = selectedSkillId === skill.id;
                return (
                  <button
                    key={skill.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedSkillId(skill.id);
                      setValidationError(null);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      padding: "8px 12px",
                      borderBottom: "1px solid var(--border)",
                      background: isSelected ? "var(--surface-raised)" : "transparent",
                      borderLeft: isSelected ? "3px solid var(--primary)" : "3px solid transparent",
                      color: "var(--foreground)",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong style={{ fontSize: "11px" }}>{skill.name}</strong>
                      <span style={{ fontSize: "8px", color: "var(--muted-foreground)" }}>
                        {skill.group}
                      </span>
                    </div>
                    <small
                      style={{
                        fontSize: "9px",
                        color: "var(--muted-foreground)",
                        marginTop: "2px",
                      }}
                    >
                      {skill.description}
                    </small>
                  </button>
                );
              })}

              {availableCatalogue.length === 0 && (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "var(--muted-foreground)",
                    fontSize: "10px",
                  }}
                >
                  All catalogue skills are already added, or no matches found.
                </div>
              )}
            </div>

            {/* Proficiency radio selection */}
            <div>
              <label
                style={{ display: "block", fontSize: "10px", fontWeight: 600, marginBottom: "6px" }}
              >
                Your current proficiency level:
              </label>
              <div className="skill-rating-controls" role="radiogroup">
                {PROFICIENCY_LEVELS.map((meta) => (
                  <Button
                    key={meta.level}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`level-button ${chosenLevel === meta.level ? "level-button-active" : ""}`}
                    onClick={() => setChosenLevel(meta.level)}
                    aria-label={`Level ${meta.level}: ${meta.name}`}
                  >
                    {meta.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Custom Skill Creation */
          <div style={{ display: "grid", gap: "12px" }}>
            <div className="auth-field">
              <label htmlFor="custom-skill-name">Skill name</label>
              <input
                id="custom-skill-name"
                className="auth-input"
                placeholder="e.g. Kubernetes, WebGL, Rust"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="custom-skill-group">Category</label>
              <select
                id="custom-skill-group"
                className="auth-input"
                value={customGroup}
                onChange={(e) => setCustomGroup(e.target.value as SkillGroup)}
                style={{ cursor: "pointer" }}
              >
                <option value="Frontend">Frontend</option>
                <option value="Tools & practices">Tools & practices</option>
                <option value="Backend">Backend</option>
              </select>
            </div>

            <div className="auth-field">
              <label htmlFor="custom-skill-desc">Description (optional)</label>
              <input
                id="custom-skill-desc"
                className="auth-input"
                placeholder="Brief summary of practical exposure"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
              />
            </div>

            <div>
              <label
                style={{ display: "block", fontSize: "10px", fontWeight: 600, marginBottom: "6px" }}
              >
                Initial proficiency level:
              </label>
              <div className="skill-rating-controls">
                {PROFICIENCY_LEVELS.map((meta) => (
                  <Button
                    key={meta.level}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`level-button ${chosenLevel === meta.level ? "level-button-active" : ""}`}
                    onClick={() => setChosenLevel(meta.level)}
                  >
                    {meta.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter style={{ marginTop: "14px" }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={tab === "catalogue" ? handleAddCatalogueSkill : handleCreateCustom}
            disabled={tab === "catalogue" && availableCatalogue.length === 0}
          >
            Add to profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================================
   ROLE DETAILS MODAL (PHASE 4)
   ========================================================================= */

interface RoleDetailsModalProps {
  role: Role;
  matchResult: RoleMatchResult;
  skillLevels: Record<string, number>;
  activeSkills: Skill[];
  onClose: () => void;
  onSelectGoal: () => void;
  isCurrentGoal: boolean;
}

function RoleDetailsModal({
  role,
  matchResult,
  skillLevels,
  activeSkills,
  onClose,
  onSelectGoal,
  isCurrentGoal,
}: RoleDetailsModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              className="role-mini-icon"
              style={{ width: "28px", height: "28px" }}
              aria-hidden="true"
            >
              <CodeXml size={16} />
            </span>
            <div>
              <DialogTitle>{role.title}</DialogTitle>
              <DialogDescription>
                {role.team} · {role.workStyle} · {role.category}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p style={{ fontSize: "11px", color: "var(--foreground)", lineHeight: "1.6" }}>
          {role.description}
        </p>

        {/* Match progress bar */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "4px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10px",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontWeight: 600 }}>Your calculated match score:</span>
            <strong style={{ color: "var(--primary)" }}>{matchResult.score}%</strong>
          </div>
          <progress
            className="match-progress"
            style={{ width: "100%", height: "6px" }}
            value={matchResult.score}
            max={100}
          >
            {matchResult.score}%
          </progress>
          <small
            style={{
              display: "block",
              color: "var(--muted-foreground)",
              fontSize: "9px",
              marginTop: "4px",
            }}
          >
            {matchResult.explanation}
          </small>
        </div>

        {/* Requirements breakdown table */}
        <div style={{ marginTop: "10px" }}>
          <div className="eyebrow" style={{ marginBottom: "6px" }}>
            TECHNICAL REQUIREMENTS BREAKDOWN
          </div>
          <div
            style={{
              maxHeight: "180px",
              overflowY: "auto",
              border: "1px solid var(--border)",
              borderRadius: "5px",
              background: "var(--card)",
            }}
          >
            {Object.entries(role.requirements).map(([skillId, reqLevel]) => {
              const current = skillLevels[skillId] ?? 0;
              const skillObj = activeSkills.find((s) => s.id === skillId);
              const skillName = skillObj?.name ?? skillId;
              const isMet = current >= reqLevel;

              return (
                <div
                  key={skillId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "7px 12px",
                    borderBottom: "1px solid var(--border)",
                    fontSize: "10px",
                  }}
                >
                  <div>
                    <strong>{skillName}</strong>
                    <span style={{ color: "var(--muted-foreground)", marginLeft: "6px" }}>
                      Target: Level {reqLevel} ({LEVEL_NAMES[reqLevel]})
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "9px", color: "var(--muted-foreground)" }}>
                      Current: Level {current}
                    </span>
                    <span
                      className={`status-badge ${
                        isMet
                          ? "status-badge-matched"
                          : current > 0
                            ? "status-badge-partial"
                            : "status-badge-missing"
                      }`}
                    >
                      {isMet ? "Met ✓" : current > 0 ? "Partial" : "Missing"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter style={{ marginTop: "14px" }}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onSelectGoal} disabled={isCurrentGoal}>
            {isCurrentGoal ? "Currently selected goal" : "Set as target goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================================
   ROADMAP ACTIVITY SPECIFICATION MODAL (PHASE 4)
   ========================================================================= */

interface ActivityDetailsModalProps {
  activity: RoadmapActivity;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onClose: () => void;
}

function ActivityDetailsModal({
  activity,
  isCompleted,
  onToggleComplete,
  onClose,
}: ActivityDetailsModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <span className="roadmap-skill-tag" style={{ width: "fit-content", marginBottom: "4px" }}>
            {activity.skillName} · LEVEL {activity.currentLevel} → {activity.targetLevel}
          </span>
          <DialogTitle>{activity.title}</DialogTitle>
          <DialogDescription>
            Estimated commitment: {activity.duration} · Self-paced practical task
          </DialogDescription>
        </DialogHeader>

        <p style={{ fontSize: "11px", color: "var(--foreground)", lineHeight: "1.6" }}>
          {activity.detail}
        </p>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
          <div className="exercise-section-title">Key Learning Objectives:</div>
          <ul className="objectives-list">
            {activity.objectives.map((obj) => (
              <li key={obj}>{obj}</li>
            ))}
          </ul>
        </div>

        <div className="practical-project-card">
          <span className="practical-project-label">Hands-on Portfolio Task:</span>
          {activity.practicalExercise}
        </div>

        <div className="recommended-topic-tag" style={{ marginTop: "12px" }}>
          <BookOpen size={14} />
          <span>Curriculum reference: {activity.recommendedTopic}</span>
        </div>

        <DialogFooter style={{ marginTop: "16px" }}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant={isCompleted ? "secondary" : "default"}
            onClick={() => {
              onToggleComplete();
              onClose();
            }}
          >
            {isCompleted ? "Mark incomplete" : "Mark step completed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
