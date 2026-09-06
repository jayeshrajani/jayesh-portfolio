"use client";

import { InteractiveDoor } from "@/components/world/InteractiveDoor";
import { LocationMarker } from "@/components/world/WorldSignage";
import { COLORS } from "@/data/theme";
import { LANDMARK_POSITIONS } from "@/data/world";

type WorkLocationProps = {
  doorActive: boolean;
  doorOpen: boolean;
  onInteract: () => void;
};

export function WorkLocation({ doorActive, doorOpen, onInteract }: WorkLocationProps) {
  return (
    <group position={[LANDMARK_POSITIONS.work[0], 0.5, LANDMARK_POSITIONS.work[1]]}>
      <mesh position={[0, 0.18, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.8, 0.36, 5.9]} />
        <meshStandardMaterial color={COLORS.concrete} roughness={0.92} />
      </mesh>

      <mesh position={[-0.4, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.9, 2.65, 4.55]} />
        <meshPhysicalMaterial
          color={COLORS.glass}
          roughness={0.22}
          metalness={0.05}
          transparent
          opacity={0.72}
        />
      </mesh>

      <mesh position={[3.35, 1.9, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.75, 3.8, 3.75]} />
        <meshStandardMaterial color={COLORS.charcoal} roughness={0.8} />
      </mesh>

      <mesh position={[-0.45, 3.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.25, 0.48, 5.25]} />
        <meshStandardMaterial color={COLORS.concreteLight} roughness={0.86} />
      </mesh>

      <mesh position={[-0.45, 3.34, 2.48]} castShadow>
        <boxGeometry args={[9.25, 0.13, 0.15]} />
        <meshStandardMaterial color={COLORS.accent} roughness={0.72} />
      </mesh>

      <mesh position={[-1.45, 3.82, -0.25]} castShadow receiveShadow>
        <boxGeometry args={[5.8, 1.05, 3.2]} />
        <meshStandardMaterial color={COLORS.charcoal} roughness={0.75} />
      </mesh>

      <InteractiveDoor
        active={doorActive}
        open={doorOpen}
        position={[-1.525, 1.45, 2.32]}
        width={1.25}
        height={2.3}
        onInteract={onInteract}
      />

      <LocationMarker
        emphasized
        position={[-0.45, 4.85, 1.6]}
        title="WORK"
        subtitle="ENGINEERING + AI"
      />

      <mesh position={[3.35, 4.85, -0.4]} castShadow>
        <boxGeometry args={[0.18, 2.15, 0.18]} />
        <meshStandardMaterial color={COLORS.charcoal} roughness={0.65} />
      </mesh>
      <mesh position={[3.78, 5.45, -0.38]} castShadow>
        <boxGeometry args={[0.86, 0.52, 0.08]} />
        <meshStandardMaterial color={COLORS.accent} roughness={0.72} />
      </mesh>
    </group>
  );
}