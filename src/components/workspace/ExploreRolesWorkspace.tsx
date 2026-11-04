import { ArrowRight, Check, CodeXml, Info, Search, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_ROLES, type Role } from "@/data/catalogue";
import type { RoleMatchResult } from "@/lib/matching";

export interface ExploreRolesWorkspaceProps {
  roles: Array<Role & { match: RoleMatchResult }>;
  selectedRoleId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  onSelectRole: (roleId: string) => void;
  onInspectRole: (role: Role) => void;
}

export function ExploreRolesWorkspace({
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
