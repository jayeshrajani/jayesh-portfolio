export type Point2D = readonly [x: number, z: number];

export type WorldLocation = {
  id: "coast" | "work" | "studio" | "college";
  label: string;
  position: Point2D;
  radius: number;
};

export type ExperienceId = "work" | "studio" | "college";
export type ActivityId = "slide" | "gym";
export type InteractionId = ExperienceId | ActivityId;
export type PlayerActivityAction = "slide" | "gym-enter" | "gym-exit";
export type WorkoutExercise = "squat" | "deadlift" | "bench";

export type PlayerActivityRequest = {
  requestId: number;
  action: PlayerActivityAction;
};

export type WorkoutRequest = {
  requestId: number;
  exercise: WorkoutExercise;
};

export type CameraMode = "INTRO" | "FOLLOW" | "ENTER" | "EXPERIENCE" | "EXIT";

export type InteractionTarget = {
  id: InteractionId;
  kind: "experience" | "activity";
  label: string;
  position: Point2D;
  radius: number;
  cameraPosition: readonly [number, number, number];
  cameraTarget: readonly [number, number, number];
};

export const LANDMARK_POSITIONS = {
  work: [-9, 6],
  studio: [0.6, -12],
  college: [11, 5.4],
} as const satisfies Record<ExperienceId, Point2D>;

export const WORLD = {
  playerSpeed: 5.6,
  playerRadius: 0.48,
  playerSpawn: [0, 0.56, 10.5] as const,
  cameraOffset: [10.5, 11.5, 14] as const,
  islandOutline: [
    [-20, -6],
    [-18, -13],
    [-10, -17],
    [-1, -16.5],
    [8, -17.5],
    [17, -13],
    [21, -5],
    [20, 4],
    [16, 12.5],
    [8, 16],
    [-1, 17.5],
    [-11, 15.5],
    [-18, 10],
    [-21.5, 2],
  ] satisfies Point2D[],
  buildingColliders: [
    { minX: -13.8, maxX: -4.2, minZ: 3.4, maxZ: 8.9 },
    { minX: 6.4, maxX: 15.8, minZ: 2.2, maxZ: 8.7 },
    { minX: -4.2, maxX: 5.4, minZ: -15.3, maxZ: -8.7 },
  ],
} as const;

export const ACTIVITY_POSITIONS = {
  slide: {
    interaction: [-9, -0.25],
    ladderBottom: [-9, 0.56, -1.05],
    ladderTop: [-9, 2.95, -2.05],
    slideExit: [-9, 0.56, -5.85],
  },
  gym: {
    interaction: [3.1, -8],
    workout: [3.1, 0.86, -11.2],
    exit: [3.1, 0.56, -8],
  },
} as const;

export const WORLD_LOCATIONS: readonly WorldLocation[] = [
  { id: "work", label: "WORK", position: [-9, 8.9], radius: 5.7 },
  { id: "studio", label: "STUDIO / GYM", position: [0.6, -11.5], radius: 7 },
  { id: "college", label: "LEARNING LOOP", position: [11, 5], radius: 8 },
  { id: "coast", label: "BENGALURU", position: [0, 10.5], radius: 7 },
];

export const INTERACTION_TARGETS: readonly InteractionTarget[] = [
  {
    id: "work",
    kind: "experience",
    label: "OPEN WORK",
    position: [-8.9, 9.65],
    radius: 2.4,
    cameraPosition: [-0.2, 7.1, 14.2],
    cameraTarget: [-8.8, 2.1, 6.5],
  },
  {
    id: "studio",
    kind: "experience",
    label: "OPEN STUDIO / GYM",
    position: [-1.65, -8.15],
    radius: 2.35,
    cameraPosition: [8.2, 7.1, -3.2],
    cameraTarget: [0.25, 1.65, -12],
  },
  {
    id: "college",
    kind: "experience",
    label: "OPEN LEARNING LOOP",
    position: [10.45, 8.9],
    radius: 2.3,
    cameraPosition: [18.5, 7.3, 13.8],
    cameraTarget: [10.8, 1.7, 5.3],
  },
  {
    id: "slide",
    kind: "activity",
    label: "CLIMB SLIDE",
    position: ACTIVITY_POSITIONS.slide.interaction,
    radius: 1.9,
    cameraPosition: [-1.5, 7.4, 6.8],
    cameraTarget: [-9, 1.45, -3.1],
  },
  {
    id: "gym",
    kind: "activity",
    label: "ENTER GYM",
    position: ACTIVITY_POSITIONS.gym.interaction,
    radius: 1.85,
    cameraPosition: [10.8, 6.7, -0.8],
    cameraTarget: [3.1, 1.3, -11.6],
  },
];

function pointInPolygon(point: Point2D, polygon: readonly Point2D[]) {
  const [x, z] = point;
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [currentX, currentZ] = polygon[index];
    const [previousX, previousZ] = polygon[previous];
    const crosses =
      currentZ > z !== previousZ > z &&
      x < ((previousX - currentX) * (z - currentZ)) / (previousZ - currentZ) + currentX;

    if (crosses) inside = !inside;
  }

  return inside;
}

export function isWalkable(x: number, z: number) {
  if (!pointInPolygon([x, z], WORLD.islandOutline)) return false;

  return !WORLD.buildingColliders.some(
    (collider) =>
      x + WORLD.playerRadius > collider.minX &&
      x - WORLD.playerRadius < collider.maxX &&
      z + WORLD.playerRadius > collider.minZ &&
      z - WORLD.playerRadius < collider.maxZ,
  );
}

export function getLocationAt(x: number, z: number) {
  let closest = WORLD_LOCATIONS[WORLD_LOCATIONS.length - 1];
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const location of WORLD_LOCATIONS) {
    const distance = Math.hypot(x - location.position[0], z - location.position[1]);
    if (distance <= location.radius && distance < closestDistance) {
      closest = location;
      closestDistance = distance;
    }
  }

  return closest;
}

export function getNearbyInteraction(x: number, z: number) {
  let nearest: InteractionTarget | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const target of INTERACTION_TARGETS) {
    const distance = Math.hypot(x - target.position[0], z - target.position[1]);
    if (distance <= target.radius && distance < nearestDistance) {
      nearest = target;
      nearestDistance = distance;
    }
  }

  return nearest;
}

export function getInteractionTarget(id: ExperienceId | null) {
  return INTERACTION_TARGETS.find(
    (target) => target.kind === "experience" && target.id === id,
  ) ?? null;
}

export function isExperienceId(id: InteractionId): id is ExperienceId {
  return id === "work" || id === "studio" || id === "college";
}