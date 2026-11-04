import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RoadmapActivity } from "@/lib/roadmap";

export interface ActivityDetailsModalProps {
  activity: RoadmapActivity;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onClose: () => void;
}

export function ActivityDetailsModal({
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
