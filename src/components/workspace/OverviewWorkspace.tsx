import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCheck,
  Clock3,
  CodeXml,
  GraduationCap,
  Info,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import studyWorkspace from "@/assets/skill-workspace.jpg";
import { LEVEL_NAMES, type Role } from "@/data/catalogue";
import type { RoleMatchResult } from "@/lib/matching";
import type { RoadmapActivity } from "@/lib/roadmap";

export interface OverviewWorkspaceProps {
  selectedRole: Role;
  rankedRoles: Array<Role & { match: RoleMatchResult }>;
  matchResult: RoleMatchResult;
  completedSteps: string[];
  roadmapActivities: RoadmapActivity[];
  onNavigate: (page: "Overview" | "Explore roles" | "My skills" | "Your roadmap") => void;
  onSelectRole: (roleId: string) => void;
  onInspectRole: (role: Role) => void;
}

export function OverviewWorkspace({
  selectedRole,
  rankedRoles,
  matchResult,
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
                    style={{
                      height: "28px",
                      fontSize: "9px",
                      marginLeft: "8px",
                      padding: "0 6px",
                    }}
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
