import { LocationMarker } from "@/components/world/WorldSignage";
import { COLORS } from "@/data/theme";
import { ACTIVITY_POSITIONS } from "@/data/world";

const SLIDE_ANGLE = -0.47;

export function PlaygroundSlide() {
  const [slideX] = ACTIVITY_POSITIONS.slide.ladderBottom;

  return (
    <group>
      <mesh position={[slideX, 1.67, -3.95]} rotation={[SLIDE_ANGLE, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.14, 4.3]} />
        <meshStandardMaterial color={COLORS.accent} roughness={0.72} />
      </mesh>

      {[-0.72, 0.72].map((offsetX) => (
        <mesh
          key={offsetX}
          position={[slideX + offsetX, 1.84, -3.95]}
          rotation={[SLIDE_ANGLE, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.12, 0.3, 4.35]} />
          <meshStandardMaterial color={COLORS.offWhite} roughness={0.78} />
        </mesh>
      ))}

      <mesh position={[slideX, 2.7, -1.72]} castShadow receiveShadow>
        <boxGeometry args={[1.72, 0.18, 1.15]} />
        <meshStandardMaterial color={COLORS.woodLight} roughness={0.86} />
      </mesh>

      {[-0.67, 0.67].map((offsetX) => (
        <mesh
          key={offsetX}
          position={[slideX + offsetX, 1.55, -1.03]}
          rotation={[0.16, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.13, 2.65, 0.13]} />
          <meshStandardMaterial color={COLORS.charcoal} roughness={0.7} />
        </mesh>
      ))}

      {[0.66, 1.12, 1.58, 2.04, 2.5].map((height, index) => (
        <mesh
          key={height}
          position={[slideX, height, -0.91 - index * 0.075]}
          castShadow
        >
          <boxGeometry args={[1.42, 0.1, 0.13]} />
          <meshStandardMaterial color={COLORS.concreteLight} roughness={0.72} />
        </mesh>
      ))}

      {[-0.65, 0.65].map((offsetX) => (
        <mesh key={offsetX} position={[slideX + offsetX, 1.42, -1.75]} castShadow>
          <boxGeometry args={[0.15, 2.5, 0.15]} />
          <meshStandardMaterial color={COLORS.charcoal} roughness={0.75} />
        </mesh>
      ))}

      <mesh position={[slideX, 0.61, -6.02]} receiveShadow>
        <boxGeometry args={[2.2, 0.12, 1.35]} />
        <meshStandardMaterial color={COLORS.sand} roughness={1} />
      </mesh>

      <LocationMarker
        position={[slideX - 2.25, 3.85, -2.75]}
        title="SLIDE"
        subtitle="ENTER TO CLIMB"
      />
    </group>
  );
}