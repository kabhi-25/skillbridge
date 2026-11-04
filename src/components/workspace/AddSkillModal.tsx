import { useEffect, useMemo, useState } from "react";
import { Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PROFICIENCY_LEVELS, type Skill, type SkillGroup } from "@/data/catalogue";

export interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSkillIds: string[];
  allCatalogueSkills: Skill[];
  onAddExistingSkill: (skill: Skill, initialLevel: number) => void;
  onAddCustomSkill: (name: string, group: SkillGroup, level: number, desc?: string) => void;
}

export function AddSkillModal({
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
                style={{
                  display: "block",
                  fontSize: "10px",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
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
                style={{
                  display: "block",
                  fontSize: "10px",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
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
