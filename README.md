# Jayesh Interactive Portfolio

A software engineering portfolio built as a playable miniature coastal island. Visitors move through the world to discover Work, Studio / Gym, and Learning Loop experiences on desktop or mobile.

**Live site:** [jayeshrajani.vercel.app](https://jayeshrajani.vercel.app)

## Current Build

- Procedural low-poly island, shoreline, water, paths, trees, rocks, and three landmarks
- Blocky animated player with WASD, arrow-key, and analog joystick controls
- Smooth elevated follow camera and cinematic location transitions
- Boundary and building collision
- Proximity-aware doors opened by Enter, click, or the contextual mobile action
- Floating labels identify Work, Studio / Gym, and Learning Loop
- In-world Work, Studio / Gym, and Learning Loop presentations
- Linked Instagram profile in the Studio / Gym experience
- Resume-backed experience, project, education, and contact content
- Opt-in procedural surf, wind, coastal birds, footsteps, doors, and navigation cues
- Landscape mobile layout with a portrait rotation gate and safe-area-aware controls
- Reduced-motion and reduced-transparency fallbacks

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture Guide

See [HOW_TO_CREATE.md](HOW_TO_CREATE.md) for the complete implementation walkthrough, including the scene graph, world geometry, player animation, camera state machine, interaction flow, overlays, audio, and deployment model.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

## Content And Decisions

- Portfolio content: `src/data/portfolio.ts`
- World layout and interactions: `src/data/world.ts`
- Product and architecture decisions: `docs/portfolio-v1-spec.md`
- Asset provenance: `assets.json`

Replace bracketed placeholders only with verified personal details. External 3D assets must be added to the manifest before use.
