"use client";

import { XIcon } from "@phosphor-icons/react";
import { useEffect } from "react";

import { CollegeExperience } from "@/components/experiences/CollegeExperience";
import { StudioExperience } from "@/components/experiences/StudioExperience";
import {
  WorkExperience,
  type ResumeThrowOrigin,
  type ResumeViewerPhase,
} from "@/components/experiences/WorkExperience";
import type { ExperienceId } from "@/data/world";

type ExperienceOverlayProps = {
  activeExperience: ExperienceId | null;
  resumeViewerPhase: ResumeViewerPhase;
  resumeThrowOrigin: ResumeThrowOrigin;
  onExit: () => void;
  onResumeThrow: () => void;
  onResumeLanded: () => void;
  onResumeClose: () => void;
};

const TITLES: Record<ExperienceId, string> = {
  work: "WORK",
  studio: "STUDIO / GYM",
  college: "LEARNING LOOP",
};

export function ExperienceOverlay({
  activeExperience,
  resumeViewerPhase,
  resumeThrowOrigin,
  onExit,
  onResumeThrow,
  onResumeLanded,
  onResumeClose,
}: ExperienceOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (resumeViewerPhase !== "closed") return;
      if (event.key === "Escape" && activeExperience) onExit();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeExperience, onExit, resumeViewerPhase]);

  if (!activeExperience) return null;

  return (
    <section
      className={`experience-overlay${resumeViewerPhase !== "closed" ? " experience-overlay--resume-active" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${TITLES[activeExperience]} experience`}
    >
      <header className="experience-overlay__header">
        <div>
          <span>LOCATION EXPERIENCE</span>
          <strong>{TITLES[activeExperience]}</strong>
        </div>
        <button type="button" onClick={onExit} aria-label="Return to island" title="Return to island" autoFocus>
          <XIcon aria-hidden="true" size={19} weight="bold" />
        </button>
      </header>

      <div className="experience-overlay__body">
        {activeExperience === "work" ? (
          <WorkExperience
            resumeViewerPhase={resumeViewerPhase}
            resumeThrowOrigin={resumeThrowOrigin}
            onResumeThrow={onResumeThrow}
            onResumeLanded={onResumeLanded}
            onResumeClose={onResumeClose}
          />
        ) : null}
        {activeExperience === "studio" ? <StudioExperience /> : null}
        {activeExperience === "college" ? <CollegeExperience /> : null}
      </div>

      <footer className="experience-overlay__footer">
        <span>ESC TO RETURN</span>
      </footer>
    </section>
  );
}