"use client";

import { useState } from "react";

import { ProjectPresentation } from "@/components/experiences/ProjectPresentation";
import { education, projects } from "@/data/portfolio";

export function CollegeExperience() {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];

  return (
    <div className="experience-layout college-experience">
      <div className="experience-intro">
        <p>LEARNING LOOP</p>
        <h2>Foundations, experiments, and shipped ideas.</h2>
        <span>Computer science foundations and two systems built around real-time data.</span>
      </div>

      <section className="education-strip">
        <div>
          <span>INSTITUTION</span>
          <strong>{education.institution}</strong>
        </div>
        <div>
          <span>DEGREE</span>
          <strong>{education.degree}</strong>
        </div>
        <div>
          <span>TIMELINE</span>
          <strong>{education.timeline}</strong>
        </div>
        <div>
          <span>SCHOOL</span>
          <strong>{education.details}</strong>
        </div>
      </section>

      <div className="project-browser">
        <div className="project-selector" role="tablist" aria-label="Projects">
          {projects.map((project, index) => (
            <button
              key={project.id}
              type="button"
              role="tab"
              aria-selected={selectedProject.id === project.id}
              onClick={() => setSelectedProjectId(project.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {project.title}
            </button>
          ))}
        </div>
        <ProjectPresentation project={selectedProject} />
      </div>
    </div>
  );
}