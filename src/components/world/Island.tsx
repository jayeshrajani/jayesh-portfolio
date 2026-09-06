"use client";

import { useMemo } from "react";
import * as THREE from "three";

import { COLORS } from "@/data/theme";
import { LANDMARK_POSITIONS, WORLD, type ExperienceId } from "@/data/world";
import { CollegeLocation } from "@/components/world/locations/CollegeLocation";
import { StudioGymLocation } from "@/components/world/locations/StudioGymLocation";
import { WorkLocation } from "@/components/world/locations/WorkLocation";

type PathProps = {
  points: readonly (readonly [number, number])[];
};

const PATHS = [
  [
    [0, 10.5],
    [-3, 10.3],
    [-5.8, 9.8],
    [LANDMARK_POSITIONS.work[0] + 0.1, LANDMARK_POSITIONS.work[1] + 3.65],
  ],
  [
    [0, 10.5],
    [5.2, 9.8],
    [8.2, 9.1],
    [LANDMARK_POSITIONS.college[0] - 0.3, LANDMARK_POSITIONS.college[1] + 3.6],
  ],
  [
    [0, 10.5],
    [-1.8, 5.5],
    [-2.3, 0],
    [-1.2, -8.2],
    [LANDMARK_POSITIONS.studio[0] - 2.25, LANDMARK_POSITIONS.studio[1] + 3.85],
  ],
] as const;

const TREES = [
  [-16, -4, 1.1],
  [-14.5, 7.8, 0.9],
  [-10.5, 12.4, 1.15],
  [-5.8, 14.5, 0.85],
  [7.4, 13.6, 1.05],
  [16.8, -3, 0.95],
  [13.8, -10.5, 1.1],
  [7.8, -14, 0.86],
  [-7.5, -14.2, 0.92],
] as const;

const ROCKS = [
  [-18.2, 3.5, 0.9, 0.3],
  [-13.8, -12.6, 1.2, -0.6],
  [-2.8, 15.2, 0.8, 0.8],
  [10.6, 14.1, 1.1, -0.2],
  [18.1, 6.2, 0.75, 0.4],
  [15.2, -11.5, 1.15, -0.8],
] as const;

function Path({ points }: PathProps) {
  return points.slice(0, -1).map(([startX, startZ], index) => {
    const [endX, endZ] = points[index + 1];
    const deltaX = endX - startX;
    const deltaZ = endZ - startZ;
    const length = Math.hypot(deltaX, deltaZ);

    return (
      <mesh
        key={`${startX}-${startZ}-${endX}-${endZ}`}
        position={[(startX + endX) / 2, 0.65, (startZ + endZ) / 2]}
        rotation={[0, Math.atan2(deltaX, deltaZ), 0]}
        receiveShadow
      >
        <boxGeometry args={[1.45, 0.08, length + 0.35]} />
        <meshStandardMaterial color={COLORS.path} roughness={1} />
      </mesh>
    );
  });
}

function Tree({ x, z, scale }: { x: number; z: number; scale: number }) {
  return (
    <group position={[x, 0.42, z]} scale={scale}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.23, 1.5, 7]} />
        <meshStandardMaterial color={COLORS.earth} roughness={1} />
      </mesh>
      <mesh position={[0, 1.85, 0]} scale={[0.88, 1.18, 0.88]} castShadow>
        <icosahedronGeometry args={[0.92, 0]} />
        <meshStandardMaterial color={COLORS.grassDark} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0.48, 1.62, 0.12]} scale={0.58} castShadow>
        <icosahedronGeometry args={[0.82, 0]} />
        <meshStandardMaterial color={COLORS.grass} roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

type IslandProps = {
  nearbyInteractionId: ExperienceId | null;
  openLocationId: ExperienceId | null;
  onInteract: (id: ExperienceId) => void;
};

export function Island({ nearbyInteractionId, openLocationId, onInteract }: IslandProps) {
  const islandShape = useMemo(() => {
    const shape = new THREE.Shape();
    WORLD.islandOutline.forEach(([x, z], index) => {
      if (index === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    });
    shape.closePath();
    return shape;
  }, []);

  return (
    <group>
      <mesh
        position={[0, -0.5, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1.07, 1.07, 1]}
        receiveShadow
      >
        <extrudeGeometry
          args={[
            islandShape,
            { depth: 0.7, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.28, bevelThickness: 0.2 },
          ]}
        />
        <meshStandardMaterial color={COLORS.rock} roughness={1} flatShading />
      </mesh>

      <mesh
        position={[0, 0.12, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1.035, 1.035, 1]}
        receiveShadow
      >
        <extrudeGeometry
          args={[
            islandShape,
            { depth: 0.7, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.18, bevelThickness: 0.12 },
          ]}
        />
        <meshStandardMaterial color={COLORS.sand} roughness={1} flatShading />
      </mesh>

      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <extrudeGeometry
          args={[
            islandShape,
            { depth: 1.05, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.28, bevelThickness: 0.18 },
          ]}
        />
        <meshStandardMaterial attach="material-0" color={COLORS.grass} roughness={0.98} flatShading />
        <meshStandardMaterial attach="material-1" color={COLORS.earth} roughness={1} flatShading />
      </mesh>

      {PATHS.map((path, index) => (
        <Path key={index} points={path} />
      ))}

      {TREES.map(([x, z, scale]) => (
        <Tree key={`${x}-${z}`} x={x} z={z} scale={scale} />
      ))}

      {ROCKS.map(([x, z, scale, rotation]) => (
        <mesh
          key={`${x}-${z}`}
          position={[x, 0.68, z]}
          rotation={[0.1, rotation, -0.08]}
          scale={[scale, scale * 0.72, scale * 0.9]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[0.75, 0]} />
          <meshStandardMaterial color={COLORS.rock} roughness={1} flatShading />
        </mesh>
      ))}

      <WorkLocation
        doorActive={nearbyInteractionId === "work"}
        doorOpen={openLocationId === "work"}
        onInteract={() => onInteract("work")}
      />
      <StudioGymLocation
        doorActive={nearbyInteractionId === "studio"}
        doorOpen={openLocationId === "studio"}
        onInteract={() => onInteract("studio")}
      />
      <CollegeLocation
        doorActive={nearbyInteractionId === "college"}
        doorOpen={openLocationId === "college"}
        onInteract={() => onInteract("college")}
      />

    </group>
  );
}