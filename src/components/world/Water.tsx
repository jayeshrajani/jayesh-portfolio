"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { COLORS } from "@/data/theme";

type WaterProps = {
  reducedMotion: boolean;
};

export function Water({ reducedMotion }: WaterProps) {
  const water = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>>(null);
  const basePositions = useRef<Float32Array | null>(null);

  useFrame(({ clock }) => {
    if (reducedMotion || !water.current) return;

    const position = water.current.geometry.attributes.position as THREE.BufferAttribute;
    if (!basePositions.current) {
      basePositions.current = Float32Array.from(position.array as ArrayLike<number>);
    }

    const base = basePositions.current;
    const time = clock.getElapsedTime();

    for (let index = 0; index < position.count; index += 1) {
      const x = base[index * 3];
      const y = base[index * 3 + 1];
      const wave =
        Math.sin(x * 0.2 + time * 0.55) * 0.055 +
        Math.cos(y * 0.15 - time * 0.4) * 0.04;
      position.setZ(index, wave);
    }

    position.needsUpdate = true;
  });

  return (
    <mesh
      ref={water}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.02, 0]}
      receiveShadow
    >
      <planeGeometry args={[130, 130, 48, 48]} />
      <meshStandardMaterial
        color={COLORS.water}
        roughness={0.34}
        metalness={0.08}
        transparent
        opacity={0.94}
      />
    </mesh>
  );
}