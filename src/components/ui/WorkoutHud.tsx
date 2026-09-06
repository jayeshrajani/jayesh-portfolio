"use client";

import { BarbellIcon, XIcon } from "@phosphor-icons/react";

import type { WorkoutExercise } from "@/data/world";

export type GymSession = "closed" | "entering" | "ready" | "exiting";
export type RepCounts = Record<WorkoutExercise, number>;

type WorkoutHudProps = {
  session: GymSession;
  activeExercise: WorkoutExercise | null;
  queuedReps: number;
  repCounts: RepCounts;
  onExercise: (exercise: WorkoutExercise) => void;
  onExit: () => void;
};

const EXERCISES = [
  { id: "squat", key: "S", label: "SQUAT" },
  { id: "deadlift", key: "D", label: "DEADLIFT" },
  { id: "bench", key: "B", label: "BENCH PRESS" },
] as const satisfies readonly {
  id: WorkoutExercise;
  key: string;
  label: string;
}[];

export function WorkoutHud({
  session,
  activeExercise,
  queuedReps,
  repCounts,
  onExercise,
  onExit,
}: WorkoutHudProps) {
  if (session === "closed") return null;

  const totalReps = Object.values(repCounts).reduce((total, count) => total + count, 0);
  const currentExercise = EXERCISES.find(({ id }) => id === activeExercise);
  const isReady = session === "ready";

  return (
    <section className="workout-hud" data-state={session} aria-label="Gym training controls">
      <header className="workout-hud__header">
        <BarbellIcon aria-hidden="true" size={20} weight="bold" />
        <div>
          <span>STUDIO / GYM</span>
          <strong>
            {session === "entering"
              ? "SETTING UP"
              : session === "exiting"
                ? "SESSION COMPLETE"
                : currentExercise?.label ?? "CHOOSE A LIFT"}
          </strong>
        </div>
        <div className="workout-hud__counter" role="status" aria-live="polite">
          <strong>{String(totalReps).padStart(2, "0")}</strong>
          <span>TOTAL REPS</span>
        </div>
        <button
          type="button"
          className="workout-hud__close"
          aria-label="Leave the gym"
          disabled={!isReady}
          onClick={onExit}
        >
          <XIcon aria-hidden="true" size={17} weight="bold" />
        </button>
      </header>

      <div className="workout-hud__options">
        {EXERCISES.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            data-active={activeExercise === exercise.id}
            disabled={!isReady}
            onClick={() => onExercise(exercise.id)}
          >
            <kbd>{exercise.key}</kbd>
            <span>{exercise.label}</span>
            <strong aria-label={`${repCounts[exercise.id]} completed reps`}>
              {String(repCounts[exercise.id]).padStart(2, "0")}
            </strong>
          </button>
        ))}
      </div>

      <footer>
        <span>{queuedReps > 0 ? `${queuedReps} REP${queuedReps === 1 ? "" : "S"} QUEUED` : "PRESS A KEY FOR EACH REP"}</span>
        <span>ESC TO EXIT</span>
      </footer>
    </section>
  );
}