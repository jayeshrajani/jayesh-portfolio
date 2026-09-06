"use client";

import { SoccerBallIcon, TrophyIcon, UsersThreeIcon } from "@phosphor-icons/react";

import { athleteProfile } from "@/data/portfolio";

export function StudioExperience() {
  return (
    <div className="experience-layout studio-experience">
      <div className="experience-intro">
        <p>STUDIO / GYM</p>
        <h2>Built under pressure.</h2>
        <span>Physique competition, national-level football, and building a stronger fitness community.</span>
      </div>

      <section className="studio-feature">
        <div className="studio-feature__icon">
          <TrophyIcon aria-hidden="true" size={34} weight="fill" />
        </div>
        <div className="studio-feature__title">
          <span>{athleteProfile.university.context}</span>
          <h3>{athleteProfile.university.title}</h3>
          <p>{athleteProfile.university.location}</p>
        </div>
        <div className="studio-feature__years" aria-label="Winning years 2023 and 2024">
          <strong>{athleteProfile.university.years[0]}</strong>
          <i>+</i>
          <strong>{athleteProfile.university.years[1]}</strong>
        </div>
      </section>

      <div className="studio-achievement-grid">
        <section className="studio-achievement">
          <SoccerBallIcon aria-hidden="true" size={28} weight="duotone" />
          <span>NATIONAL COMPETITION</span>
          <h3>{athleteProfile.football.title}</h3>
          <strong>{athleteProfile.football.location}</strong>
          <p>{athleteProfile.football.summary}</p>
        </section>

        <section className="studio-achievement studio-achievement--club">
          <UsersThreeIcon aria-hidden="true" size={28} weight="duotone" />
          <span>COMMUNITY LEADERSHIP</span>
          <h3>{athleteProfile.club.title}</h3>
          <strong>{athleteProfile.club.role}</strong>
          <p>{athleteProfile.club.summary}</p>
        </section>
      </div>
    </div>
  );
}