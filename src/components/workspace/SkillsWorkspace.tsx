import { CircleHelp, Plus, RotateCcw, SlidersHorizontal, Trash2 } from "lucide-react";
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
  LEVEL_NAMES,
  PROFICIENCY_LEVELS,
  type Role,
  type Skill,
  type SkillGroup,
} from "@/data/catalogue";

export interface SkillsWorkspaceProps {
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

export function SkillsWorkspace({
  skills,
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
