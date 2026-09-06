"use client";

import { InteractiveDoor } from "@/components/world/InteractiveDoor";
import { LocationMarker } from "@/components/world/WorldSignage";
import { COLORS } from "@/data/theme";
import { LANDMARK_POSITIONS } from "@/data/world";

type CollegeLocationProps = {
  doorActive: boolean;
  doorOpen: boolean;
  onInteract: () => void;
};

export function CollegeLocation({
  doorActive,
  doorOpen,
  onInteract,
}: CollegeLocationProps) {
  return (
    <group position={[LANDMARK_POSITIONS.college[0], 0.5, LANDMARK_POSITIONS.college[1]]}>
      <mesh position={[0, 0.14, 0]} receiveShadow castShadow>
        <boxGeometry args={[9, 0.28, 5.8]} />
        <meshStandardMaterial color={COLORS.sand} roughness={0.96} />
      </mesh>

      <mesh position={[-2.9, 1.05, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 2.1, 5.1]} />
        <meshStandardMaterial color={COLORS.concreteLight} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.45, -0.55]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 2.9, 4.3]} />
        <meshStandardMaterial color={COLORS.concrete} roughness={0.9} />
      </mesh>
      <mesh position={[3.05, 2.05, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[2.35, 4.1, 5]} />
        <meshStandardMaterial color={COLORS.charcoal} roughness={0.82} />
      </mesh>

      <InteractiveDoor
        active={doorActive}
        open={doorOpen}
        position={[-0.55, 1.05, 2.22]}
        width={1.1}
        height={1.95}
        onInteract={onInteract}
      />

      <LocationMarker
        position={[0, 5.2, 0]}
        title="LEARNING LOOP"
        subtitle="EDUCATION + PROJECTS"
      />

      {[-3.55, -2.8, -2.05, 2.65, 3.35].map((x) => (
        <mesh key={x} position={[x, 1.25, 2.48]}>
          <boxGeometry args={[0.38, 0.75, 0.08]} />
          <meshStandardMaterial color={COLORS.glass} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}