"use client";

import { InteractiveDoor } from "@/components/world/InteractiveDoor";
import { LocationMarker } from "@/components/world/WorldSignage";
import { COLORS } from "@/data/theme";
import { ACTIVITY_POSITIONS, LANDMARK_POSITIONS } from "@/data/world";

const FRAME_POSTS = [
  [-1.8, -2.1],
  [1.8, -2.1],
  [-1.8, 2.1],
  [1.8, 2.1],
] as const;

const GYM_BENCH_X = ACTIVITY_POSITIONS.gym.workout[0] - LANDMARK_POSITIONS.studio[0];
const GYM_BENCH_Z = ACTIVITY_POSITIONS.gym.workout[2] - LANDMARK_POSITIONS.studio[1];

function Plate({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <mesh position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.34, 0.34, 0.16, 12]} />
      <meshStandardMaterial color={COLORS.accent} roughness={0.76} flatShading />
    </mesh>
  );
}

type StudioGymLocationProps = {
  doorActive: boolean;
  doorOpen: boolean;
  onInteract: () => void;
};

export function StudioGymLocation({
  doorActive,
  doorOpen,
  onInteract,
}: StudioGymLocationProps) {
  return (
    <group position={[LANDMARK_POSITIONS.studio[0], 0.5, LANDMARK_POSITIONS.studio[1]]}>
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.5, 0.3, 6.5]} />
        <meshStandardMaterial color={COLORS.rock} roughness={0.95} />
      </mesh>

      <group position={[-2.25, 0.3, -0.15]}>
        <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.45, 2.1, 5.45]} />
          <meshStandardMaterial color={COLORS.charcoal} roughness={0.84} />
        </mesh>

        {[-1.35, 0, 1.35].map((x, index) => (
          <mesh
            key={x}
            position={[x, 2.28 + (index % 2) * 0.12, 0]}
            rotation={[0, 0, index % 2 === 0 ? 0.22 : -0.22]}
            castShadow
          >
            <boxGeometry args={[1.72, 0.18, 5.65]} />
            <meshStandardMaterial color={COLORS.concreteLight} roughness={0.88} />
          </mesh>
        ))}

      </group>

      <InteractiveDoor
        active={doorActive}
        open={doorOpen}
        position={[-2.275, 1.38, 2.61]}
        width={1.05}
        height={1.95}
        onInteract={onInteract}
      />

      <LocationMarker
        position={[0, 4.25, 0]}
        title="STUDIO / GYM"
        subtitle="CONTENT + TRAINING"
      />

      <group position={[2.5, 0.3, -0.05]}>
        {FRAME_POSTS.map(([x, z]) => (
          <mesh key={`${x}-${z}`} position={[x, 1.35, z]} castShadow>
            <boxGeometry args={[0.18, 2.7, 0.18]} />
            <meshStandardMaterial color={COLORS.concreteLight} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 2.68, -2.1]} castShadow>
          <boxGeometry args={[3.78, 0.18, 0.18]} />
          <meshStandardMaterial color={COLORS.concreteLight} roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.68, 2.1]} castShadow>
          <boxGeometry args={[3.78, 0.18, 0.18]} />
          <meshStandardMaterial color={COLORS.concreteLight} roughness={0.7} />
        </mesh>

        <group position={[0, 0.18, 0.2]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 2.5, 10]} />
            <meshStandardMaterial color={COLORS.charcoal} roughness={0.6} />
          </mesh>
          {[-1.45, 1.45].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.16, 12]} />
              <meshStandardMaterial color={COLORS.accent} roughness={0.72} />
            </mesh>
          ))}
        </group>
      </group>

      <group position={[GYM_BENCH_X, 0, GYM_BENCH_Z]}>
        <mesh position={[0, 0.11, -0.85]} receiveShadow>
          <boxGeometry args={[4.6, 0.12, 3.6]} />
          <meshStandardMaterial color={COLORS.charcoal} roughness={0.96} />
        </mesh>

        <mesh position={[0, 0.53, -1.08]} castShadow receiveShadow>
          <boxGeometry args={[0.98, 0.2, 2.05]} />
          <meshStandardMaterial color={COLORS.accent} roughness={0.82} />
        </mesh>

        {[-0.36, 0.36].map((offsetX) => (
          <mesh key={offsetX} position={[offsetX, 0.29, -1.08]} castShadow>
            <boxGeometry args={[0.13, 0.52, 1.5]} />
            <meshStandardMaterial color={COLORS.concreteLight} roughness={0.72} />
          </mesh>
        ))}

        {[-1.05, 1.05].map((offsetX) => (
          <group key={offsetX}>
            <mesh position={[offsetX, 1.04, -1.62]} castShadow>
              <boxGeometry args={[0.16, 1.92, 0.16]} />
              <meshStandardMaterial color={COLORS.concreteLight} roughness={0.7} />
            </mesh>
            <mesh position={[offsetX, 0.14, -1.32]} castShadow>
              <boxGeometry args={[0.55, 0.12, 0.86]} />
              <meshStandardMaterial color={COLORS.concreteLight} roughness={0.7} />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 1.78, -1.48]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 2.8, 10]} />
          <meshStandardMaterial color={COLORS.offWhite} metalness={0.35} roughness={0.42} />
        </mesh>
        <Plate x={-1.5} y={1.78} z={-1.48} />
        <Plate x={1.5} y={1.78} z={-1.48} />

        <mesh position={[0, 0.39, 0.48]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.065, 0.065, 2.75, 10]} />
          <meshStandardMaterial color={COLORS.offWhite} metalness={0.35} roughness={0.42} />
        </mesh>
        <Plate x={-1.48} y={0.39} z={0.48} />
        <Plate x={1.48} y={0.39} z={0.48} />
      </group>
    </group>
  );
}