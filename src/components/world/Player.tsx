"use client";

/* eslint-disable react-hooks/immutability -- R3F frame state is mutable and never drives React rendering. */

import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import { useRef } from "react";
import * as THREE from "three";

import { COLORS } from "@/data/theme";
import {
  getLocationAt,
  getNearbyInteraction,
  isWalkable,
  WORLD,
  type InteractionTarget,
  type WorldLocation,
} from "@/data/world";
import { useMovementControls } from "@/hooks/useMovementControls";

type PlayerProps = {
  enabled: boolean;
  position: RefObject<THREE.Vector3>;
  reducedMotion: boolean;
  resumeThrowRequest?: number;
  onFirstMove: () => void;
  onLocationChange: (location: WorldLocation) => void;
  onNearbyInteractionChange: (target: InteractionTarget | null) => void;
  onResumeRelease?: (origin: { x: number; y: number }) => void;
  onStep: () => void;
};

const UP = new THREE.Vector3(0, 1, 0);
const WALK_CYCLE_DISTANCE = 2.2;
const WALK_PHASE_PER_UNIT = (Math.PI * 2) / WALK_CYCLE_DISTANCE;
const THROW_RELEASE_TIME = 0.98;
const THROW_DURATION = 1.58;

function smoothstep(value: number) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function dampAngle(current: number, target: number, amount: number) {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + difference * amount;
}

function lerpAngle(start: number, end: number, amount: number) {
  const difference = Math.atan2(Math.sin(end - start), Math.cos(end - start));
  return start + difference * amount;
}

export function Player({
  enabled,
  position,
  reducedMotion,
  resumeThrowRequest = 0,
  onFirstMove,
  onLocationChange,
  onNearbyInteractionChange,
  onResumeRelease,
  onStep,
}: PlayerProps) {
  const root = useRef<THREE.Group>(null);
  const model = useRef<THREE.Group>(null);
  const upperBody = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftLowerLeg = useRef<THREE.Group>(null);
  const rightLowerLeg = useRef<THREE.Group>(null);
  const leftFoot = useRef<THREE.Group>(null);
  const rightFoot = useRef<THREE.Group>(null);
  const resumePaper = useRef<THREE.Group>(null);
  const pressedKeys = useMovementControls();
  const hasMoved = useRef(false);
  const gaitPhase = useRef(0);
  const walkBlend = useRef(0);
  const lastStepIndex = useRef(0);
  const seenThrowRequest = useRef(resumeThrowRequest);
  const throwElapsed = useRef(THROW_DURATION);
  const throwReleased = useRef(true);
  const throwStartRotation = useRef(0);
  const throwFacingRotation = useRef(0);
  const throwWorldPosition = useRef(new THREE.Vector3());
  const currentLocationId = useRef<string>(getLocationAt(position.current.x, position.current.z).id);
  const nearbyInteractionId = useRef<string | null>(null);
  const direction = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const candidate = useRef(new THREE.Vector3());

  useFrame(({ camera, clock, size }, frameDelta) => {
    if (!root.current || !model.current) return;

    const delta = Math.min(frameDelta, 0.05);
    const keys = pressedKeys.current;
    const horizontal = Number(keys.has("KeyD") || keys.has("ArrowRight")) -
      Number(keys.has("KeyA") || keys.has("ArrowLeft"));
    const vertical = Number(keys.has("KeyW") || keys.has("ArrowUp")) -
      Number(keys.has("KeyS") || keys.has("ArrowDown"));
    const isTryingToMove = enabled && (horizontal !== 0 || vertical !== 0);
    const previousX = position.current.x;
    const previousZ = position.current.z;

    if (isTryingToMove) {
      camera.getWorldDirection(forward.current);
      forward.current.y = 0;
      forward.current.normalize();
      right.current.crossVectors(forward.current, UP).normalize();
      direction.current
        .copy(forward.current)
        .multiplyScalar(vertical)
        .addScaledVector(right.current, horizontal)
        .normalize();

      candidate.current.copy(position.current).addScaledVector(direction.current, WORLD.playerSpeed * delta);

      if (isWalkable(candidate.current.x, position.current.z)) {
        position.current.x = candidate.current.x;
      }
      if (isWalkable(position.current.x, candidate.current.z)) {
        position.current.z = candidate.current.z;
      }

      const targetRotation = Math.atan2(-direction.current.x, -direction.current.z);
      model.current.rotation.y = dampAngle(model.current.rotation.y, targetRotation, 1 - Math.exp(-14 * delta));

    }

    if (resumeThrowRequest !== seenThrowRequest.current) {
      seenThrowRequest.current = resumeThrowRequest;
      throwElapsed.current = 0;
      throwReleased.current = false;
      throwStartRotation.current = model.current.rotation.y;
      throwFacingRotation.current = Math.atan2(
        position.current.x - camera.position.x,
        position.current.z - camera.position.z,
      );
    }

    const throwTimeScale = reducedMotion ? 8 : 1;
    const isThrowing = throwElapsed.current < THROW_DURATION;
    if (isThrowing) {
      throwElapsed.current = Math.min(throwElapsed.current + delta * throwTimeScale, THROW_DURATION);

      const turnProgress = smoothstep(throwElapsed.current / 0.5);
      const returnProgress = smoothstep((throwElapsed.current - 1.18) / 0.4);
      const facingRotation = lerpAngle(
        throwStartRotation.current,
        throwFacingRotation.current,
        turnProgress,
      );
      model.current.rotation.y = lerpAngle(
        facingRotation,
        throwStartRotation.current,
        returnProgress,
      );
    }

    const distanceMoved = Math.hypot(
      position.current.x - previousX,
      position.current.z - previousZ,
    );
    const isWalking = distanceMoved > 0.0001;

    if (isWalking) {
      gaitPhase.current += distanceMoved * WALK_PHASE_PER_UNIT;

      if (!hasMoved.current) {
        hasMoved.current = true;
        onFirstMove();
      }

      const stepIndex = Math.floor(gaitPhase.current / Math.PI);
      if (stepIndex !== lastStepIndex.current) {
        lastStepIndex.current = stepIndex;
        onStep();
      }
    }

    root.current.position.copy(position.current);

    walkBlend.current = THREE.MathUtils.damp(
      walkBlend.current,
      isWalking ? 1 : 0,
      isWalking ? 11 : 8,
      delta,
    );

    const blend = walkBlend.current;
    const phase = gaitPhase.current;
    const leftStride = Math.sin(phase) * 0.82 * blend;
    const rightStride = Math.sin(phase + Math.PI) * 0.82 * blend;
    const leftKnee = Math.max(0, Math.sin(phase + 0.22)) * 0.92 * blend;
    const rightKnee = Math.max(0, Math.sin(phase + Math.PI + 0.22)) * 0.92 * blend;
    const idle = reducedMotion ? 0 : Math.sin(clock.getElapsedTime() * 1.7) * 0.012 * (1 - blend);
    const stepLift = reducedMotion ? 0 : Math.abs(Math.cos(phase)) * 0.075 * blend;
    const animationDamping = 1 - Math.exp(-18 * delta);

    model.current.position.y = THREE.MathUtils.damp(
      model.current.position.y,
      idle + stepLift,
      16,
      delta,
    );

    if (
      upperBody.current &&
      head.current &&
      leftArm.current &&
      rightArm.current &&
      leftLeg.current &&
      rightLeg.current &&
      leftLowerLeg.current &&
      rightLowerLeg.current &&
      leftFoot.current &&
      rightFoot.current
    ) {
      leftLeg.current.rotation.x = THREE.MathUtils.lerp(
        leftLeg.current.rotation.x,
        leftStride,
        animationDamping,
      );
      rightLeg.current.rotation.x = THREE.MathUtils.lerp(
        rightLeg.current.rotation.x,
        rightStride,
        animationDamping,
      );
      leftLowerLeg.current.rotation.x = THREE.MathUtils.lerp(
        leftLowerLeg.current.rotation.x,
        -leftKnee,
        animationDamping,
      );
      rightLowerLeg.current.rotation.x = THREE.MathUtils.lerp(
        rightLowerLeg.current.rotation.x,
        -rightKnee,
        animationDamping,
      );
      leftFoot.current.rotation.x = THREE.MathUtils.lerp(
        leftFoot.current.rotation.x,
        -(leftStride - leftKnee) * 0.86,
        animationDamping,
      );
      rightFoot.current.rotation.x = THREE.MathUtils.lerp(
        rightFoot.current.rotation.x,
        -(rightStride - rightKnee) * 0.86,
        animationDamping,
      );
      const throwWindup = smoothstep((throwElapsed.current - 0.2) / 0.46);
      const throwSwing = smoothstep((throwElapsed.current - 0.66) / 0.32);
      const throwRecovery = smoothstep((throwElapsed.current - 1.02) / 0.48);
      let throwArmRotation = THREE.MathUtils.lerp(0, -1.28, throwWindup);
      throwArmRotation = THREE.MathUtils.lerp(throwArmRotation, 1.42, throwSwing);
      throwArmRotation = THREE.MathUtils.lerp(throwArmRotation, 0, throwRecovery);
      let throwArmRoll = THREE.MathUtils.lerp(-0.05, 0.92, throwWindup);
      throwArmRoll = THREE.MathUtils.lerp(throwArmRoll, -1.08, throwSwing);
      throwArmRoll = THREE.MathUtils.lerp(throwArmRoll, -0.05, throwRecovery);
      const torsoCounterRotation = isThrowing ? -0.34 * (1 - throwRecovery) : Math.sin(phase) * -0.075 * blend;

      leftArm.current.rotation.x = THREE.MathUtils.lerp(
        leftArm.current.rotation.x,
        isThrowing ? -0.24 * (1 - throwRecovery) : -leftStride * 0.92,
        animationDamping,
      );
      rightArm.current.rotation.x = THREE.MathUtils.lerp(
        rightArm.current.rotation.x,
        isThrowing ? throwArmRotation : -rightStride * 0.92,
        animationDamping,
      );
      leftArm.current.rotation.z = THREE.MathUtils.lerp(
        leftArm.current.rotation.z,
        isThrowing ? 0.28 * (1 - throwRecovery) + 0.05 : 0.05,
        animationDamping,
      );
      rightArm.current.rotation.z = THREE.MathUtils.lerp(
        rightArm.current.rotation.z,
        isThrowing ? throwArmRoll : -0.05,
        animationDamping,
      );

      upperBody.current.rotation.x = THREE.MathUtils.lerp(
        upperBody.current.rotation.x,
        isThrowing ? -0.09 * (1 - throwRecovery) : -0.055 * blend,
        animationDamping,
      );
      upperBody.current.rotation.y = THREE.MathUtils.lerp(
        upperBody.current.rotation.y,
        torsoCounterRotation,
        animationDamping,
      );
      upperBody.current.rotation.z = THREE.MathUtils.lerp(
        upperBody.current.rotation.z,
        Math.sin(phase) * 0.035 * blend,
        animationDamping,
      );
      head.current.rotation.y = THREE.MathUtils.lerp(
        head.current.rotation.y,
        isThrowing ? 0.2 * (1 - throwRecovery) : -torsoCounterRotation * 0.62,
        animationDamping,
      );
    }

    if (resumePaper.current) {
      resumePaper.current.visible = isThrowing && !throwReleased.current;
    }

    if (
      isThrowing &&
      !throwReleased.current &&
      throwElapsed.current >= THROW_RELEASE_TIME &&
      resumePaper.current
    ) {
      resumePaper.current.getWorldPosition(throwWorldPosition.current);
      throwWorldPosition.current.project(camera);
      throwReleased.current = true;
      resumePaper.current.visible = false;
      onResumeRelease?.({
        x: THREE.MathUtils.clamp((throwWorldPosition.current.x * 0.5 + 0.5) * size.width, 0, size.width),
        y: THREE.MathUtils.clamp((-throwWorldPosition.current.y * 0.5 + 0.5) * size.height, 0, size.height),
      });
    }

    const location = getLocationAt(position.current.x, position.current.z);
    if (location.id !== currentLocationId.current) {
      currentLocationId.current = location.id;
      onLocationChange(location);
    }

    const nearbyInteraction = getNearbyInteraction(position.current.x, position.current.z);
    const nextInteractionId = nearbyInteraction?.id ?? null;
    if (nextInteractionId !== nearbyInteractionId.current) {
      nearbyInteractionId.current = nextInteractionId;
      onNearbyInteractionChange(nearbyInteraction);
    }
  });

  return (
    <group ref={root} position={position.current.toArray()}>
      <group ref={model}>
        <group ref={leftLeg} position={[-0.19, 0.75, 0]}>
          <mesh position={[0, -0.17, 0]} castShadow>
            <boxGeometry args={[0.27, 0.34, 0.3]} />
            <meshStandardMaterial color={COLORS.charcoal} roughness={0.9} />
          </mesh>
          <group ref={leftLowerLeg} position={[0, -0.34, 0]}>
            <mesh position={[0, -0.145, 0]} castShadow>
              <boxGeometry args={[0.25, 0.29, 0.28]} />
              <meshStandardMaterial color={COLORS.charcoal} roughness={0.9} />
            </mesh>
            <group ref={leftFoot} position={[0, -0.29, 0]}>
              <mesh position={[0, 0, -0.13]} castShadow>
                <boxGeometry args={[0.32, 0.14, 0.52]} />
                <meshStandardMaterial color={COLORS.offWhite} roughness={0.9} />
              </mesh>
            </group>
          </group>
        </group>
        <group ref={rightLeg} position={[0.19, 0.75, 0]}>
          <mesh position={[0, -0.17, 0]} castShadow>
            <boxGeometry args={[0.27, 0.34, 0.3]} />
            <meshStandardMaterial color={COLORS.charcoal} roughness={0.9} />
          </mesh>
          <group ref={rightLowerLeg} position={[0, -0.34, 0]}>
            <mesh position={[0, -0.145, 0]} castShadow>
              <boxGeometry args={[0.25, 0.29, 0.28]} />
              <meshStandardMaterial color={COLORS.charcoal} roughness={0.9} />
            </mesh>
            <group ref={rightFoot} position={[0, -0.29, 0]}>
              <mesh position={[0, 0, -0.13]} castShadow>
                <boxGeometry args={[0.32, 0.14, 0.52]} />
                <meshStandardMaterial color={COLORS.offWhite} roughness={0.9} />
              </mesh>
            </group>
          </group>
        </group>

        <group ref={upperBody}>
          <mesh position={[0, 1.16, 0]} castShadow>
            <boxGeometry args={[0.76, 0.82, 0.44]} />
            <meshStandardMaterial color={COLORS.accent} roughness={0.86} />
          </mesh>

          <group ref={leftArm} position={[-0.48, 1.45, 0]} rotation={[0, 0, 0.05]}>
            <mesh position={[0, -0.32, 0]} castShadow>
              <boxGeometry args={[0.22, 0.68, 0.24]} />
              <meshStandardMaterial color={COLORS.concreteLight} roughness={0.9} />
            </mesh>
          </group>
          <group ref={rightArm} position={[0.48, 1.45, 0]} rotation={[0, 0, -0.05]}>
            <mesh position={[0, -0.32, 0]} castShadow>
              <boxGeometry args={[0.22, 0.68, 0.24]} />
              <meshStandardMaterial color={COLORS.concreteLight} roughness={0.9} />
            </mesh>
            <group ref={resumePaper} position={[0, -0.7, -0.04]} rotation={[0, 0, -0.08]} visible={false}>
              <mesh castShadow>
                <boxGeometry args={[0.38, 0.5, 0.025]} />
                <meshStandardMaterial color={COLORS.offWhite} roughness={0.72} />
              </mesh>
              <mesh position={[0, 0.16, -0.016]}>
                <boxGeometry args={[0.27, 0.035, 0.008]} />
                <meshStandardMaterial color={COLORS.accent} roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.06, -0.016]}>
                <boxGeometry args={[0.25, 0.018, 0.008]} />
                <meshStandardMaterial color={COLORS.charcoal} roughness={0.8} />
              </mesh>
              <mesh position={[-0.045, 0.01, -0.016]}>
                <boxGeometry args={[0.16, 0.018, 0.008]} />
                <meshStandardMaterial color={COLORS.charcoal} roughness={0.8} />
              </mesh>
            </group>
          </group>

          <group ref={head} position={[0, 1.93, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.62, 0.62, 0.58]} />
              <meshStandardMaterial color="#b8896f" roughness={0.92} />
            </mesh>
            <mesh position={[0, 0.3, 0.02]} castShadow>
              <boxGeometry args={[0.66, 0.14, 0.6]} />
              <meshStandardMaterial color={COLORS.charcoal} roughness={0.95} />
            </mesh>
            <mesh position={[-0.16, 0.06, -0.3]}>
              <boxGeometry args={[0.07, 0.07, 0.035]} />
              <meshStandardMaterial color={COLORS.charcoal} />
            </mesh>
            <mesh position={[0.16, 0.06, -0.3]}>
              <boxGeometry args={[0.07, 0.07, 0.035]} />
              <meshStandardMaterial color={COLORS.charcoal} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}