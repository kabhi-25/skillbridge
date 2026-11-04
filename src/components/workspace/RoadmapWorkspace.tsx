import { ArrowRight, BookOpen, Check, Clock3, Info, RotateCcw, Sparkles } from "lucide-react";
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
import { LEVEL_NAMES, type Role } from "@/data/catalogue";
import type { RoadmapActivity } from "@/lib/roadmap";

export interface RoadmapWorkspaceProps {
  selectedRole: Role;
  activities: RoadmapActivity[];
  completedSteps: string[];
  onToggleStep: (stepId: string) => void;
  onInspectActivity: (act: RoadmapActivity) => void;
  onResetRoadmap: () => void;
  onExploreRoles: () => void;
}

export function RoadmapWorkspace({
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
