# Jayesh Interactive Portfolio V1

## Product Direction

Build a desktop-first software engineering portfolio as a compact, playable 3D coastal island. The world is the primary navigation. It should feel like a premium miniature game level rather than a conventional portfolio with a decorative canvas.

Professional identity stays centered on software engineering, AI, systems, and creative technology. Content creation and athletics add personality without competing with the Work location.

## Design System

- Design variance: 8
- Motion intensity: 6
- Visual density: 4
- Visual language: low-poly architectural maquette, cool coastal daylight, matte natural materials
- Palette: muted green, blue-grey water, concrete, charcoal, off-white, and one restrained coral interaction accent
- Typography: modern sans-serif with a technical monospace companion
- Shape rule: architectural geometry stays mostly sharp; interface surfaces use a maximum 4px radius
- Theme: one locked dark HUD over a daylight 3D world

## World

The island has exactly three major destinations:

1. Work: the largest landmark, containing LSEG experience, software engineering, AI, systems, skills, resume, and contact.
2. Studio / Gym: a smaller combined area for content creation and athletic identity.
3. Learning Loop: education plus exactly three reusable project presentations.

Landmarks must be distinct in silhouette and visible from other parts of the island. Paths should connect them in a compact loop. The environment may include authored trees, rocks, shoreline forms, water, and subtle ambient motion, but no NPCs or advanced game systems.

## First Milestone

Ship a playable greybox before adding portfolio overlays or final assets:

- Procedural coastal island and animated ocean
- Three recognizable landmark silhouettes
- Stylized blocky player with idle and walk motion
- WASD and arrow-key movement
- Enter and click interaction at nearby doors
- Island-boundary and building-footprint collision
- Smooth elevated third-person follow camera with a short arrival move
- Floating labels identify each destination from the island view
- Opt-in layered ambience and contextual interaction cues
- Minimal loading state and HUD

Continuous movement and camera values stay outside React state. React state is reserved for discrete interface changes.

## Architecture Rules

- Keep the App Router page and layout as server components.
- Isolate Canvas, controls, frame updates, and browser APIs in client components.
- Use one camera controller and one explicit camera mode source.
- Store portfolio copy in structured data, never directly in 3D meshes.
- Keep each location modular.
- Reuse one interaction contract for entrances and objects in later phases.
- Do not add Rapier until primitive collision is no longer sufficient.
- Do not add GSAP until location transitions need authored cinematic timelines.

## Content Rules

Do not invent dates, achievements, metrics, URLs, project details, or academic results. Unknown information remains clearly marked as placeholder content. Copy should be direct, concise, technically credible, and lightly witty.

## Asset Rules

Prefer coherent, commercial-use-compatible GLB or glTF assets when greybox replacement begins. Record every external asset in `assets.json` with source URL, license, attribution requirements, and local filename. Use procedural geometry when a coherent licensed asset is unavailable.

## Performance Rules

- Keep the island intentionally small.
- Avoid unnecessary draw calls and animated objects.
- Use instancing where repeated geometry warrants it.
- Compress models and textures before shipping.
- Keep post-processing restrained.
- Respect reduced-motion preferences.
- Validate TypeScript, lint, production build, runtime errors, movement, collision, and camera behavior after each phase.