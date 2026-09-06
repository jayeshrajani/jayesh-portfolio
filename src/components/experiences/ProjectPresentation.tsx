"use client";

import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import Image from "next/image";

import type { Project } from "@/data/portfolio";

type ProjectPresentationProps = {
  project: Project;
};

export function ProjectPresentation({ project }: ProjectPresentationProps) {
  return (
    <article className="project-presentation">
      <a
        className="project-presentation__visual"
        href={project.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${project.title} source on GitHub`}
        title={`Open ${project.title} source on GitHub`}
      >
        <Image
          src={project.banner}
          alt={project.bannerAlt}
          fill
          sizes="(max-width: 767px) calc(100vw - 40px), 420px"
        />
        <ArrowSquareOutIcon aria-hidden="true" size={18} weight="bold" />
      </a>

      <div className="project-presentation__heading">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>

      <dl className="project-presentation__details">
        <div>
          <dt>PROBLEM</dt>
          <dd>{project.problem}</dd>
        </div>
        <div>
          <dt>SOLUTION</dt>
          <dd>{project.solution}</dd>
        </div>
        <div>
          <dt>TECHNOLOGY</dt>
          <dd>{project.technology}</dd>
        </div>
        <div>
          <dt>ARCHITECTURE</dt>
          <dd>{project.architecture}</dd>
        </div>
        <div>
          <dt>RESULT</dt>
          <dd>{project.result}</dd>
        </div>
      </dl>
    </article>
  );
}