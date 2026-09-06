"use client";

import {
  ArrowSquareOutIcon,
  ArrowsOutSimpleIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  MapPinIcon,
  NewspaperIcon,
  PersonSimpleThrowIcon,
  PhoneIcon,
  XIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  contactDetails,
  education,
  projects,
  resumePath,
  skillGroups,
  workExperiences,
} from "@/data/portfolio";

const TABS = ["EXPERIENCE", "TOOLKIT", "RESUME", "CONTACT"] as const;
type WorkTab = (typeof TABS)[number];
export type ResumeViewerPhase = "closed" | "preparing" | "launching" | "open";
export type ResumeThrowOrigin = { x: number; y: number };

function ExperienceView() {
  return (
    <div className="work-view work-history">
      {workExperiences.map((experience) => (
        <article className="work-history__entry" key={`${experience.company}-${experience.role}`}>
          <div className="role-lockup">
            <span>{experience.company}</span>
            <h3>{experience.role}</h3>
            <div className="role-lockup__meta">
              {experience.dates ? <p>{experience.dates}</p> : null}
              <p>{experience.location}</p>
            </div>
          </div>
          <ul className="experience-highlights">
            {experience.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function ToolkitView() {
  return (
    <div className="skill-columns">
      {skillGroups.map((group) => (
        <section key={group.label}>
          <h3>{group.label}</h3>
          <ul>
            {group.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

type ResumeViewerProps = {
  phase: Exclude<ResumeViewerPhase, "closed">;
  origin: ResumeThrowOrigin;
  onClose: () => void;
  onLanded: () => void;
};

function ResumeViewer({ phase, origin, onClose, onLanded }: ResumeViewerProps) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const closeViewer = useEffectEvent(onClose);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      event.stopImmediatePropagation();
      closeViewer();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  useEffect(() => {
    if (phase === "open") closeButton.current?.focus();
  }, [phase]);

  const viewerStyle = {
    "--resume-origin-x": `${origin.x}px`,
    "--resume-origin-y": `${origin.y}px`,
  } as CSSProperties;

  return createPortal(
    <div
      className="resume-expanded"
      data-phase={phase}
      data-resume-active="true"
      data-resume-expanded={phase === "open" ? "true" : undefined}
      role={phase === "open" ? "dialog" : undefined}
      aria-modal={phase === "open" ? true : undefined}
      aria-hidden={phase === "open" ? undefined : true}
      aria-label="Expanded resume"
      style={viewerStyle}
    >
      <div
        className="resume-expanded__sheet"
        onAnimationEnd={(event) => {
          if (
            phase === "launching" &&
            event.target === event.currentTarget &&
            event.animationName === "resume-sheet-throw"
          ) {
            onLanded();
          }
        }}
      >
        <header>
          <div>
            <NewspaperIcon aria-hidden="true" size={22} weight="bold" />
            <span>THE JAYESH TIMES</span>
            <strong>RESUME / FULL EDITION</strong>
          </div>
          <nav aria-label="Resume actions">
            <a href={resumePath} target="_blank" rel="noreferrer" tabIndex={phase === "open" ? 0 : -1}>
              <ArrowSquareOutIcon aria-hidden="true" size={17} weight="bold" />
              OPEN PDF
            </a>
            <a href={resumePath} download tabIndex={phase === "open" ? 0 : -1}>
              <DownloadSimpleIcon aria-hidden="true" size={17} weight="bold" />
              DOWNLOAD
            </a>
            <button
              ref={closeButton}
              type="button"
              onClick={onClose}
              aria-label="Close resume"
              title="Close resume"
              tabIndex={phase === "open" ? 0 : -1}
            >
              <XIcon aria-hidden="true" size={19} weight="bold" />
            </button>
          </nav>
        </header>
        <div className="resume-expanded__content">
          <Image
            className="resume-expanded__preview"
            src="/Jayesh_Rajani_Resume-preview.png"
            alt="Jayesh Rajani resume"
            fill
            sizes="100vw"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

type ResumeViewProps = {
  active: boolean;
  onThrow: () => void;
};

function ResumeView({ active, onThrow }: ResumeViewProps) {
  const currentRole = workExperiences[0];

  return (
    <div className="resume-view">
      <div className="resume-preview">
        <Image
          src="/Jayesh_Rajani_Resume-preview.png"
          alt="First page preview of Jayesh Rajani's resume"
          fill
          sizes="(max-width: 767px) 340px, 282px"
        />
        <button type="button" onClick={onThrow} disabled={active}>
          <PersonSimpleThrowIcon aria-hidden="true" size={21} weight="bold" />
          TOSS OPEN RESUME
          <ArrowsOutSimpleIcon aria-hidden="true" size={17} weight="bold" />
        </button>
      </div>

      <div className="resume-view__summary">
        <div>
          <span>EXPERIENCE</span>
          <strong>{currentRole.role}, {currentRole.company}</strong>
        </div>
        <div>
          <span>EDUCATION</span>
          <strong>{education.degree}</strong>
        </div>
        <div>
          <span>PROJECTS</span>
          <strong>{projects.length} selected project case studies</strong>
        </div>
        <a className="primary-action" href={resumePath} download>
          <DownloadSimpleIcon aria-hidden="true" size={17} weight="bold" />
          DOWNLOAD RESUME
        </a>
      </div>
    </div>
  );
}

function ContactIcon({ label }: { label: (typeof contactDetails)[number]["label"] }) {
  if (label === "EMAIL") return <EnvelopeSimpleIcon aria-hidden="true" size={22} weight="bold" />;
  if (label === "PHONE") return <PhoneIcon aria-hidden="true" size={22} weight="bold" />;
  if (label === "LINKEDIN") return <LinkedinLogoIcon aria-hidden="true" size={22} weight="bold" />;
  if (label === "GITHUB") return <GithubLogoIcon aria-hidden="true" size={22} weight="bold" />;
  return <MapPinIcon aria-hidden="true" size={22} weight="bold" />;
}

function ContactView() {
  return (
    <div className="contact-view">
      <h3>Let&apos;s build something useful.</h3>
      <p>Based in Bengaluru, India. Open to thoughtful engineering conversations.</p>
      <div className="contact-list">
        {contactDetails.map((detail) => {
          const content = (
            <>
              <ContactIcon label={detail.label} />
              <span>
                <small>{detail.label}</small>
                <strong>{detail.value}</strong>
              </span>
              {"href" in detail ? (
                <ArrowSquareOutIcon className="contact-row__arrow" aria-hidden="true" size={17} weight="bold" />
              ) : null}
            </>
          );

          return "href" in detail ? (
            <a
              className="contact-row"
              href={detail.href}
              target={detail.href.startsWith("http") ? "_blank" : undefined}
              rel={detail.href.startsWith("http") ? "noreferrer" : undefined}
              key={detail.label}
            >
              {content}
            </a>
          ) : (
            <div className="contact-row contact-row--static" key={detail.label}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type WorkExperienceProps = {
  resumeViewerPhase: ResumeViewerPhase;
  resumeThrowOrigin: ResumeThrowOrigin;
  onResumeThrow: () => void;
  onResumeLanded: () => void;
  onResumeClose: () => void;
};

export function WorkExperience({
  resumeViewerPhase,
  resumeThrowOrigin,
  onResumeThrow,
  onResumeLanded,
  onResumeClose,
}: WorkExperienceProps) {
  const [activeTab, setActiveTab] = useState<WorkTab>("EXPERIENCE");

  return (
    <>
      <div className="experience-layout">
        <div className="experience-intro">
          <p>WORK</p>
          <h2>Engineering systems that hold up.</h2>
          <span>Production AI, observability, and web platforms built for measurable outcomes.</span>
        </div>

        <div className="experience-tabs" role="tablist" aria-label="Work sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="experience-tab-panel" role="tabpanel">
          {activeTab === "EXPERIENCE" ? <ExperienceView /> : null}
          {activeTab === "TOOLKIT" ? <ToolkitView /> : null}
          {activeTab === "RESUME" ? (
            <ResumeView active={resumeViewerPhase !== "closed"} onThrow={onResumeThrow} />
          ) : null}
          {activeTab === "CONTACT" ? <ContactView /> : null}
        </div>
      </div>

      {resumeViewerPhase !== "closed" ? (
        <ResumeViewer
          phase={resumeViewerPhase}
          origin={resumeThrowOrigin}
          onClose={onResumeClose}
          onLanded={onResumeLanded}
        />
      ) : null}
    </>
  );
}