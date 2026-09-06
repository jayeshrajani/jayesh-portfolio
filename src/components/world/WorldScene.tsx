"use client";

import { ContactShadows } from "@react-three/drei";
import type { RefObject } from "react";
import * as THREE from "three";

import { CameraController } from "@/components/world/CameraController";
import { Island } from "@/components/world/Island";
import { Player } from "@/components/world/Player";
import { Water } from "@/components/world/Water";
import { COLORS } from "@/data/theme";
import type {
  CameraMode,
  ExperienceId,
  InteractionTarget,
  WorldLocation,
} from "@/data/world";

type WorldSceneProps = {
  cameraMode: CameraMode;
  controlsEnabled: boolean;
  focusTarget: InteractionTarget | null;
  nearbyInteractionId: ExperienceId | null;
  openLocationId: ExperienceId | null;
  playerPosition: RefObject<THREE.Vector3>;
  reducedMotion: boolean;
  resumeThrowRequest: number;
  onInteract: (id: ExperienceId) => void;
  onFirstMove: () => void;
  onLocationChange: (location: WorldLocation) => void;
  onNearbyInteractionChange: (target: InteractionTarget | null) => void;
  onResumeRelease: (origin: { x: number; y: number }) => void;
  onStep: () => void;
  onTransitionComplete: (mode: CameraMode) => void;
};

export function WorldScene({
  cameraMode,
  controlsEnabled,
  focusTarget,
  nearbyInteractionId,
  openLocationId,
  playerPosition,
  reducedMotion,
  resumeThrowRequest,
  onInteract,
  onFirstMove,
  onLocationChange,
  onNearbyInteractionChange,
  onResumeRelease,
  onStep,
  onTransitionComplete,
}: WorldSceneProps) {
  return (
    <>
      <color attach="background" args={[COLORS.sky]} />
      <fog attach="fog" args={[COLORS.fog, 42, 88]} />

      <ambientLight intensity={0.58} color="#dce4df" />
      <hemisphereLight args={["#d6e2df", "#36423d", 1.25]} />
      <directionalLight
        position={[-16, 24, 13]}
        intensity={2.25}
        color="#f2d9b0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
      />

      <Water reducedMotion={reducedMotion} />
      <Island
        nearbyInteractionId={nearbyInteractionId}
        openLocationId={openLocationId}
        onInteract={onInteract}
      />
      <Player
        enabled={controlsEnabled}
        position={playerPosition}
        reducedMotion={reducedMotion}
        resumeThrowRequest={resumeThrowRequest}
        onFirstMove={onFirstMove}
        onLocationChange={onLocationChange}
        onNearbyInteractionChange={onNearbyInteractionChange}
        onResumeRelease={onResumeRelease}
        onStep={onStep}
      />
      <ContactShadows
        position={[0, 0.43, 0]}
        scale={48}
        opacity={0.28}
        blur={2.6}
        far={8}
        resolution={1024}
        color="#203536"
        frames={1}
      />
      <CameraController
        mode={cameraMode}
        focusTarget={focusTarget}
        playerPosition={playerPosition}
        reducedMotion={reducedMotion}
        onTransitionComplete={onTransitionComplete}
      />
    </>
  );
}