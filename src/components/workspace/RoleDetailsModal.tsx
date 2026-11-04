import { CodeXml } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LEVEL_NAMES, type Role, type Skill } from "@/data/catalogue";
import type { RoleMatchResult } from "@/lib/matching";

export interface RoleDetailsModalProps {
  role: Role;
  matchResult: RoleMatchResult;
  skillLevels: Record<string, number>;
  activeSkills: Skill[];
  onClose: () => void;
  onSelectGoal: () => void;
  isCurrentGoal: boolean;
}

export function RoleDetailsModal({
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
