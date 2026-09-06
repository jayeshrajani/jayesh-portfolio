"use client";

import { useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

import { COLORS } from "@/data/theme";

type InteractiveDoorProps = {
  active: boolean;
  open: boolean;
  position: readonly [number, number, number];
  width?: number;
  height?: number;
  onInteract: () => void;
};

export function InteractiveDoor({
  active,
  open,
  position,
  width = 1.2,
  height = 2.2,
  onInteract,
}: InteractiveDoorProps) {
  const hinge = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const interactiveHover = active && hovered;

  useCursor(interactiveHover, "pointer", "auto");

  useFrame((_, delta) => {
    if (!hinge.current) return;
    const targetRotation = open ? -Math.PI * 0.48 : 0;
    hinge.current.rotation.y = THREE.MathUtils.damp(
      hinge.current.rotation.y,
      targetRotation,
      7,
      delta,
    );
  });

  return (
    <group position={position}>
      <group ref={hinge}>
        <mesh
          position={[width / 2, 0, 0]}
          castShadow
          onClick={(event) => {
            event.stopPropagation();
            if (active) onInteract();
          }}
          onPointerEnter={(event) => {
            event.stopPropagation();
            if (active) setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
        >
          <boxGeometry args={[width, height, 0.16]} />
          <meshStandardMaterial
            color={COLORS.accent}
            emissive={COLORS.accent}
            emissiveIntensity={interactiveHover ? 0.2 : active ? 0.06 : 0}
            roughness={0.7}
          />
        </mesh>
      </group>
    </group>
  );
}