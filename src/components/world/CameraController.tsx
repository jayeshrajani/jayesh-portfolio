"use client";

import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import { useRef } from "react";
import * as THREE from "three";

import {
  WORLD,
  type CameraMode,
  type InteractionTarget,
} from "@/data/world";

type CameraControllerProps = {
  mode: CameraMode;
  focusTarget: InteractionTarget | null;
  playerPosition: RefObject<THREE.Vector3>;
  reducedMotion: boolean;
  onTransitionComplete: (mode: CameraMode) => void;
};

const INTRO_POSITION = new THREE.Vector3(28, 31, 35);
const INTRO_TARGET = new THREE.Vector3(-1, 0, -1.5);
const CAMERA_OFFSET = new THREE.Vector3(...WORLD.cameraOffset);
const PLAYER_TARGET_OFFSET = new THREE.Vector3(0, 1.1, 0);

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

export function CameraController({
  mode,
  focusTarget,
  playerPosition,
  reducedMotion,
  onTransitionComplete,
}: CameraControllerProps) {
  const activeMode = useRef<CameraMode>("INTRO");
  const transitionProgress = useRef(0);
  const transitionNotified = useRef(false);
  const transitionStartPosition = useRef(INTRO_POSITION.clone());
  const transitionStartTarget = useRef(INTRO_TARGET.clone());
  const desiredPosition = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const focusPosition = useRef(new THREE.Vector3());
  const focusLookAt = useRef(new THREE.Vector3());
  const currentTarget = useRef(INTRO_TARGET.clone());

  useFrame(({ camera }, frameDelta) => {
    const delta = Math.min(frameDelta, 0.05);
    desiredPosition.current.copy(playerPosition.current).add(CAMERA_OFFSET);
    desiredTarget.current.copy(playerPosition.current).add(PLAYER_TARGET_OFFSET);

    if (mode !== activeMode.current) {
      activeMode.current = mode;
      transitionProgress.current = 0;
      transitionNotified.current = false;
      transitionStartPosition.current.copy(camera.position);
      transitionStartTarget.current.copy(currentTarget.current);
    }

    if (mode === "FOLLOW") {
      const positionDamping = 1 - Math.exp(-4.4 * delta);
      const targetDamping = 1 - Math.exp(-6.2 * delta);
      camera.position.lerp(desiredPosition.current, positionDamping);
      currentTarget.current.lerp(desiredTarget.current, targetDamping);
      camera.lookAt(currentTarget.current);
      return;
    }

    if (mode === "EXPERIENCE") {
      if (focusTarget) {
        focusPosition.current.fromArray(focusTarget.cameraPosition);
        focusLookAt.current.fromArray(focusTarget.cameraTarget);
        camera.position.lerp(focusPosition.current, 1 - Math.exp(-5 * delta));
        currentTarget.current.lerp(focusLookAt.current, 1 - Math.exp(-6 * delta));
        camera.lookAt(currentTarget.current);
      }
      return;
    }

    const duration = mode === "INTRO" ? 2.8 : mode === "ENTER" ? 1.25 : 1.05;
    transitionProgress.current = reducedMotion
      ? 1
      : Math.min(transitionProgress.current + delta / duration, 1);
    const progress = smoothstep(transitionProgress.current);

    if (mode === "ENTER" && focusTarget) {
      focusPosition.current.fromArray(focusTarget.cameraPosition);
      focusLookAt.current.fromArray(focusTarget.cameraTarget);
    } else {
      focusPosition.current.copy(desiredPosition.current);
      focusLookAt.current.copy(desiredTarget.current);
    }

    camera.position.lerpVectors(
      transitionStartPosition.current,
      focusPosition.current,
      progress,
    );
    currentTarget.current.lerpVectors(
      transitionStartTarget.current,
      focusLookAt.current,
      progress,
    );
    camera.lookAt(currentTarget.current);

    if (transitionProgress.current >= 1 && !transitionNotified.current) {
      transitionNotified.current = true;
      onTransitionComplete(mode);
    }
  });

  return null;
}