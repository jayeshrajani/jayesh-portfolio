"use client";

/* eslint-disable react-hooks/immutability -- R3F frame state is mutable and never drives React rendering. */

import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import { useRef } from "react";
import * as THREE from "three";

import { COLORS } from "@/data/theme";
import {
  ACTIVITY_POSITIONS,
  getLocationAt,
  getNearbyInteraction,
  isWalkable,
  WORLD,
  type InteractionTarget,
  type PlayerActivityAction,
  type PlayerActivityRequest,
  type WorkoutExercise,
  type WorkoutRequest,
  type WorldLocation,
} from "@/data/world";
import { useMovementControls, type MovementVector } from "@/hooks/useMovementControls";

type PlayerProps = {
  activityRequest: PlayerActivityRequest | null;
  enabled: boolean;
  position: RefObject<THREE.Vector3>;
  reducedMotion: boolean;
  resumeThrowRequest?: number;
  touchMovement: RefObject<MovementVector>;
  workoutRequest: WorkoutRequest | null;
  onActivityComplete: (action: PlayerActivityAction) => void;
  onFirstMove: () => void;
  onLocationChange: (location: WorldLocation) => void;
  onNearbyInteractionChange: (target: InteractionTarget | null) => void;
  onResumeRelease?: (origin: { x: number; y: number }) => void;
  onStep: () => void;
  onWorkoutRepComplete: (request: WorkoutRequest) => void;
};

const UP = new THREE.Vector3(0, 1, 0);
const WALK_CYCLE_DISTANCE = 2.2;
const WALK_PHASE_PER_UNIT = (Math.PI * 2) / WALK_CYCLE_DISTANCE;
const HOP_DURATION = 0.58;
const HOP_HEIGHT = 0.92;
const SLIDE_DURATION = 4.35;
const GYM_TRANSITION_DURATION = 1.35;
const EXERCISE_DURATIONS = {
  squat: 1.5,
  deadlift: 1.75,
  bench: 2.05,
} as const satisfies Record<WorkoutExercise, number>;
const THROW_RELEASE_TIME = 0.98;
const THROW_DURATION = 1.58;
const SLIDE_BOTTOM = new THREE.Vector3(...ACTIVITY_POSITIONS.slide.ladderBottom);
const SLIDE_TOP = new THREE.Vector3(...ACTIVITY_POSITIONS.slide.ladderTop);
const SLIDE_EXIT = new THREE.Vector3(...ACTIVITY_POSITIONS.slide.slideExit);
const GYM_WORKOUT = new THREE.Vector3(...ACTIVITY_POSITIONS.gym.workout);
const GYM_BAR_RACK = new THREE.Vector3(...ACTIVITY_POSITIONS.gym.barRack);
const GYM_EXIT = new THREE.Vector3(...ACTIVITY_POSITIONS.gym.exit);

function smoothstep(value: number) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function segmentProgress(value: number, start: number, end: number) {
  return THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
}

function smoothPulse(value: number) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return 0.5 - Math.cos(clamped * Math.PI * 2) * 0.5;
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
  activityRequest,
  enabled,
  position,
  reducedMotion,
  resumeThrowRequest = 0,
  touchMovement,
  workoutRequest,
  onActivityComplete,
  onFirstMove,
  onLocationChange,
  onNearbyInteractionChange,
  onResumeRelease,
  onStep,
  onWorkoutRepComplete,
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
  const leftHand = useRef<THREE.Group>(null);
  const rightHand = useRef<THREE.Group>(null);
  const workoutBar = useRef<THREE.Group>(null);
  const resumePaper = useRef<THREE.Group>(null);
  const { pressedKeys, hopRequest } = useMovementControls();
  const hasMoved = useRef(false);
  const gaitPhase = useRef(0);
  const walkBlend = useRef(0);
  const lastStepIndex = useRef(0);
  const seenThrowRequest = useRef(resumeThrowRequest);
  const seenHopRequest = useRef(hopRequest.current);
  const hopElapsed = useRef(HOP_DURATION);
  const seenActivityRequest = useRef(activityRequest?.requestId ?? 0);
  const activeActivityAction = useRef<PlayerActivityAction | null>(null);
  const activityElapsed = useRef(0);
  const activityStartPosition = useRef(position.current.clone());
  const seenWorkoutRequest = useRef(workoutRequest?.requestId ?? 0);
  const activeWorkoutRequest = useRef<WorkoutRequest | null>(null);
  const workoutElapsed = useRef(0);
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
  const leftGripPosition = useRef(new THREE.Vector3());
  const rightGripPosition = useRef(new THREE.Vector3());

  useFrame(({ camera, clock, size }, frameDelta) => {
    if (!root.current || !model.current) return;

    const delta = Math.min(frameDelta, 0.05);
    const keys = pressedKeys.current;
    const previousX = position.current.x;
    const previousZ = position.current.z;

    if (
      activityRequest &&
      activityRequest.requestId !== seenActivityRequest.current
    ) {
      seenActivityRequest.current = activityRequest.requestId;
      activeActivityAction.current = activityRequest.action;
      activityElapsed.current = 0;
      activityStartPosition.current.copy(position.current);
      activeWorkoutRequest.current = null;
      hopElapsed.current = HOP_DURATION;
    }

    const activityForFrame = activeActivityAction.current;

    if (
      workoutRequest &&
      !activityForFrame &&
      workoutRequest.requestId !== seenWorkoutRequest.current
    ) {
      seenWorkoutRequest.current = workoutRequest.requestId;
      activeWorkoutRequest.current = workoutRequest;
      workoutElapsed.current = 0;
      hopElapsed.current = HOP_DURATION;
    }

    const workoutForFrame = activeWorkoutRequest.current;
    let activityProgress = 0;
    let workoutProgress = 0;

    if (activityForFrame) {
      const duration = activityForFrame === "slide"
        ? SLIDE_DURATION
        : GYM_TRANSITION_DURATION;
      activityElapsed.current = Math.min(
        activityElapsed.current + delta * (reducedMotion ? 2.4 : 1),
        duration,
      );
      activityProgress = activityElapsed.current / duration;

      if (activityForFrame === "slide") {
        if (activityProgress < 0.15) {
          position.current.lerpVectors(
            activityStartPosition.current,
            SLIDE_BOTTOM,
            smoothstep(activityProgress / 0.15),
          );
        } else if (activityProgress < 0.56) {
          position.current.lerpVectors(
            SLIDE_BOTTOM,
            SLIDE_TOP,
            smoothstep(segmentProgress(activityProgress, 0.15, 0.56)),
          );
        } else if (activityProgress < 0.64) {
          position.current.copy(SLIDE_TOP);
        } else if (activityProgress < 0.92) {
          const slideProgress = smoothstep(segmentProgress(activityProgress, 0.64, 0.92));
          position.current.lerpVectors(SLIDE_TOP, SLIDE_EXIT, slideProgress);
          position.current.y += Math.sin(slideProgress * Math.PI) * 0.12;
        } else {
          position.current.copy(SLIDE_EXIT);
        }
        model.current.rotation.y = dampAngle(
          model.current.rotation.y,
          0,
          1 - Math.exp(-14 * delta),
        );
      } else {
        const destination = activityForFrame === "gym-enter" ? GYM_WORKOUT : GYM_EXIT;
        position.current.lerpVectors(
          activityStartPosition.current,
          destination,
          smoothstep(activityProgress),
        );
        model.current.rotation.y = dampAngle(
          model.current.rotation.y,
          activityForFrame === "gym-enter" ? 0 : Math.PI,
          1 - Math.exp(-12 * delta),
        );
      }

      if (activityProgress >= 1) {
        activeActivityAction.current = null;
        onActivityComplete(activityForFrame);
      }
    }

    if (workoutForFrame && !activityForFrame) {
      const duration = EXERCISE_DURATIONS[workoutForFrame.exercise];
      workoutElapsed.current = Math.min(
        workoutElapsed.current + delta * (reducedMotion ? 1.8 : 1),
        duration,
      );
      workoutProgress = workoutElapsed.current / duration;
      position.current.copy(GYM_WORKOUT);
      model.current.rotation.y = dampAngle(
        model.current.rotation.y,
        0,
        1 - Math.exp(-14 * delta),
      );

      if (workoutProgress >= 1) {
        activeWorkoutRequest.current = null;
        onWorkoutRepComplete(workoutForFrame);
      }
    }

    if (hopRequest.current !== seenHopRequest.current) {
      seenHopRequest.current = hopRequest.current;
      if (
        enabled &&
        !activityForFrame &&
        !workoutForFrame &&
        hopElapsed.current >= HOP_DURATION
      ) {
        hopElapsed.current = 0;
      }
    }

    const isHopping = hopElapsed.current < HOP_DURATION;
    if (isHopping) {
      hopElapsed.current = Math.min(hopElapsed.current + delta, HOP_DURATION);
    }
    const hopProgress = hopElapsed.current / HOP_DURATION;
    const hopPose = isHopping ? Math.sin(hopProgress * Math.PI) : 0;
    if (!activityForFrame && !workoutForFrame) {
      position.current.y = WORLD.playerSpawn[1] + hopPose * HOP_HEIGHT;
    }

    const horizontal = THREE.MathUtils.clamp(
      Number(keys.has("KeyD") || keys.has("ArrowRight")) -
        Number(keys.has("KeyA") || keys.has("ArrowLeft")) +
        touchMovement.current.horizontal,
      -1,
      1,
    );
    const vertical = THREE.MathUtils.clamp(
      Number(keys.has("KeyW") || keys.has("ArrowUp")) -
        Number(keys.has("KeyS") || keys.has("ArrowDown")) +
        touchMovement.current.vertical,
      -1,
      1,
    );
    const movementAmount = Math.min(1, Math.hypot(horizontal, vertical));
    const isTryingToMove =
      enabled &&
      !activityForFrame &&
      !workoutForFrame &&
      (horizontal !== 0 || vertical !== 0);

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

      candidate.current
        .copy(position.current)
        .addScaledVector(direction.current, WORLD.playerSpeed * movementAmount * delta);

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
    const isWalking =
      distanceMoved > 0.0001 &&
      activityForFrame !== "slide" &&
      !workoutForFrame;

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
    const stepLift = reducedMotion || isHopping ? 0 : Math.abs(Math.cos(phase)) * 0.075 * blend;
    const animationDamping = 1 - Math.exp(-18 * delta);
    const throwWindup = smoothstep((throwElapsed.current - 0.2) / 0.46);
    const throwSwing = smoothstep((throwElapsed.current - 0.66) / 0.32);
    const throwRecovery = smoothstep((throwElapsed.current - 1.02) / 0.48);
    let throwArmRotation = THREE.MathUtils.lerp(0, -1.28, throwWindup);
    throwArmRotation = THREE.MathUtils.lerp(throwArmRotation, 1.42, throwSwing);
    throwArmRotation = THREE.MathUtils.lerp(throwArmRotation, 0, throwRecovery);
    let throwArmRoll = THREE.MathUtils.lerp(-0.05, 0.92, throwWindup);
    throwArmRoll = THREE.MathUtils.lerp(throwArmRoll, -1.08, throwSwing);
    throwArmRoll = THREE.MathUtils.lerp(throwArmRoll, -0.05, throwRecovery);
    const torsoCounterRotation = isThrowing
      ? -0.34 * (1 - throwRecovery)
      : Math.sin(phase) * -0.075 * blend;

    const modelXTarget = 0;
    let modelYTarget = idle + stepLift;
    let modelZTarget = 0;
    let modelPitchTarget = 0;
    const modelRollTarget = 0;
    let leftLegTarget = isHopping ? -0.38 * hopPose : leftStride;
    let rightLegTarget = isHopping ? -0.38 * hopPose : rightStride;
    let leftKneeTarget = isHopping ? 0.72 * hopPose : -leftKnee;
    let rightKneeTarget = isHopping ? 0.72 * hopPose : -rightKnee;
    let leftFootTarget = -(leftStride - leftKnee) * 0.86;
    let rightFootTarget = -(rightStride - rightKnee) * 0.86;
    let leftArmXTarget = isThrowing
      ? -0.24 * (1 - throwRecovery)
      : isHopping
        ? -0.55 * hopPose
        : -leftStride * 0.92;
    let rightArmXTarget = isThrowing
      ? throwArmRotation
      : isHopping
        ? -0.55 * hopPose
        : -rightStride * 0.92;
    let leftArmZTarget = isThrowing ? 0.28 * (1 - throwRecovery) + 0.05 : 0.05;
    let rightArmZTarget = isThrowing ? throwArmRoll : -0.05;
    let upperBodyXTarget = isThrowing ? -0.09 * (1 - throwRecovery) : -0.055 * blend;
    let upperBodyYTarget = torsoCounterRotation;
    let upperBodyZTarget = Math.sin(phase) * 0.035 * blend;
    let headYTarget = isThrowing ? 0.2 * (1 - throwRecovery) : -torsoCounterRotation * 0.62;

    if (activityForFrame === "slide") {
      const climbProgress = segmentProgress(activityProgress, 0.15, 0.56);
      const climbEnvelope = smoothstep(segmentProgress(activityProgress, 0.12, 0.2)) *
        (1 - smoothstep(segmentProgress(activityProgress, 0.52, 0.62)));
      const slideEnvelope = smoothstep(segmentProgress(activityProgress, 0.55, 0.66)) *
        (1 - smoothstep(segmentProgress(activityProgress, 0.91, 1)));
      const climbCycle = Math.sin(climbProgress * Math.PI * 8);

      modelYTarget = 0.06 * slideEnvelope;
      modelPitchTarget = -0.16 * slideEnvelope;
      leftLegTarget = climbCycle * 0.5 * climbEnvelope - 1.02 * slideEnvelope;
      rightLegTarget = -climbCycle * 0.5 * climbEnvelope - 1.02 * slideEnvelope;
      leftKneeTarget = -climbCycle * 0.38 * climbEnvelope + 0.72 * slideEnvelope;
      rightKneeTarget = climbCycle * 0.38 * climbEnvelope + 0.72 * slideEnvelope;
      leftFootTarget = 0.16 * slideEnvelope;
      rightFootTarget = 0.16 * slideEnvelope;
      leftArmXTarget = -climbCycle * 0.72 * climbEnvelope - 0.3 * slideEnvelope;
      rightArmXTarget = climbCycle * 0.72 * climbEnvelope - 0.3 * slideEnvelope;
      leftArmZTarget = 0.05 + 0.12 * slideEnvelope;
      rightArmZTarget = -0.05 - 0.12 * slideEnvelope;
      upperBodyXTarget = -0.16 * slideEnvelope - 0.08 * climbEnvelope;
      upperBodyYTarget = 0;
      upperBodyZTarget = 0;
      headYTarget = 0;
    } else if (workoutForFrame) {
      const exerciseEnvelope = smoothstep(segmentProgress(workoutProgress, 0, 0.12)) *
        (1 - smoothstep(segmentProgress(workoutProgress, 0.88, 1)));

      upperBodyYTarget = 0;
      upperBodyZTarget = 0;
      headYTarget = 0;

      if (workoutForFrame.exercise === "squat") {
        const squatDepth = smoothPulse(workoutProgress);

        modelYTarget = -0.38 * squatDepth;
        leftLegTarget = -0.72 * squatDepth;
        rightLegTarget = -0.72 * squatDepth;
        leftKneeTarget = 1.05 * squatDepth;
        rightKneeTarget = 1.05 * squatDepth;
        leftFootTarget = -0.24 * squatDepth;
        rightFootTarget = -0.24 * squatDepth;
        leftArmXTarget = -0.92 * squatDepth;
        rightArmXTarget = -0.92 * squatDepth;
        leftArmZTarget = 0.24 * squatDepth + 0.05;
        rightArmZTarget = -0.24 * squatDepth - 0.05;
        upperBodyXTarget = -0.12 * squatDepth;
      } else if (workoutForFrame.exercise === "deadlift") {
        const floorTransfer = smoothstep(segmentProgress(workoutProgress, 0.18, 0.34)) *
          (1 - smoothstep(segmentProgress(workoutProgress, 0.72, 0.88)));
        const liftAmount = smoothstep(segmentProgress(workoutProgress, 0.36, 0.52)) *
          (1 - smoothstep(segmentProgress(workoutProgress, 0.58, 0.72)));
        const deadliftDepth = floorTransfer * (1 - liftAmount);
        const rackArmRotation = -1.36;
        const floorArmRotation = 0.5;
        const transferredArmRotation = THREE.MathUtils.lerp(
          rackArmRotation,
          floorArmRotation,
          floorTransfer,
        );
        const rackTorsoRotation = -0.8;
        const floorTorsoRotation = -0.85;
        const transferredTorsoRotation = THREE.MathUtils.lerp(
          rackTorsoRotation,
          floorTorsoRotation,
          floorTransfer,
        );

        modelZTarget = THREE.MathUtils.lerp(-0.76, -0.3, floorTransfer) * exerciseEnvelope;
        leftLegTarget = -0.3 * deadliftDepth;
        rightLegTarget = -0.3 * deadliftDepth;
        leftKneeTarget = 0.46 * deadliftDepth;
        rightKneeTarget = 0.46 * deadliftDepth;
        leftArmXTarget = THREE.MathUtils.lerp(
          transferredArmRotation,
          0,
          liftAmount,
        ) * exerciseEnvelope;
        rightArmXTarget = leftArmXTarget;
        upperBodyXTarget = THREE.MathUtils.lerp(
          transferredTorsoRotation,
          0,
          liftAmount,
        ) * exerciseEnvelope;
      } else {
        const benchBlend = smoothstep(segmentProgress(workoutProgress, 0.02, 0.2)) *
          (1 - smoothstep(segmentProgress(workoutProgress, 0.8, 1)));
        const lowerAmount = smoothstep(segmentProgress(workoutProgress, 0.22, 0.4)) *
          (1 - smoothstep(segmentProgress(workoutProgress, 0.58, 0.78)));

        modelYTarget = THREE.MathUtils.lerp(modelYTarget, 0.72, benchBlend);
        modelZTarget = -0.12 * benchBlend;
        modelPitchTarget = -1.5 * benchBlend;
        leftLegTarget = -0.08 * benchBlend;
        rightLegTarget = -0.08 * benchBlend;
        leftKneeTarget = 0.12 * benchBlend;
        rightKneeTarget = 0.12 * benchBlend;
        leftArmXTarget = THREE.MathUtils.lerp(-1.12, 0, lowerAmount) * benchBlend;
        rightArmXTarget = leftArmXTarget;
        leftArmZTarget = 0.08 + 0.18 * benchBlend;
        rightArmZTarget = -0.08 - 0.18 * benchBlend;
        upperBodyXTarget = 0;
      }
    }

    model.current.position.x = THREE.MathUtils.damp(
      model.current.position.x,
      modelXTarget,
      16,
      delta,
    );
    model.current.position.y = THREE.MathUtils.damp(
      model.current.position.y,
      modelYTarget,
      16,
      delta,
    );
    model.current.position.z = THREE.MathUtils.damp(
      model.current.position.z,
      modelZTarget,
      16,
      delta,
    );
    model.current.rotation.x = THREE.MathUtils.damp(
      model.current.rotation.x,
      modelPitchTarget,
      15,
      delta,
    );
    model.current.rotation.z = THREE.MathUtils.damp(
      model.current.rotation.z,
      modelRollTarget,
      15,
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
        leftLegTarget,
        animationDamping,
      );
      rightLeg.current.rotation.x = THREE.MathUtils.lerp(
        rightLeg.current.rotation.x,
        rightLegTarget,
        animationDamping,
      );
      leftLowerLeg.current.rotation.x = THREE.MathUtils.lerp(
        leftLowerLeg.current.rotation.x,
        leftKneeTarget,
        animationDamping,
      );
      rightLowerLeg.current.rotation.x = THREE.MathUtils.lerp(
        rightLowerLeg.current.rotation.x,
        rightKneeTarget,
        animationDamping,
      );
      leftFoot.current.rotation.x = THREE.MathUtils.lerp(
        leftFoot.current.rotation.x,
        leftFootTarget,
        animationDamping,
      );
      rightFoot.current.rotation.x = THREE.MathUtils.lerp(
        rightFoot.current.rotation.x,
        rightFootTarget,
        animationDamping,
      );

      leftArm.current.rotation.x = THREE.MathUtils.lerp(
        leftArm.current.rotation.x,
        leftArmXTarget,
        animationDamping,
      );
      rightArm.current.rotation.x = THREE.MathUtils.lerp(
        rightArm.current.rotation.x,
        rightArmXTarget,
        animationDamping,
      );
      leftArm.current.rotation.z = THREE.MathUtils.lerp(
        leftArm.current.rotation.z,
        leftArmZTarget,
        animationDamping,
      );
      rightArm.current.rotation.z = THREE.MathUtils.lerp(
        rightArm.current.rotation.z,
        rightArmZTarget,
        animationDamping,
      );

      upperBody.current.rotation.x = THREE.MathUtils.lerp(
        upperBody.current.rotation.x,
        upperBodyXTarget,
        animationDamping,
      );
      upperBody.current.rotation.y = THREE.MathUtils.lerp(
        upperBody.current.rotation.y,
        upperBodyYTarget,
        animationDamping,
      );
      upperBody.current.rotation.z = THREE.MathUtils.lerp(
        upperBody.current.rotation.z,
        upperBodyZTarget,
        animationDamping,
      );
      head.current.rotation.y = THREE.MathUtils.lerp(
        head.current.rotation.y,
        headYTarget,
        animationDamping,
      );
    }

    if (workoutBar.current) {
      const grippingBar = workoutForFrame?.exercise === "deadlift"
        ? workoutProgress >= 0.18 && workoutProgress <= 0.88
        : workoutForFrame?.exercise === "bench"
          ? workoutProgress >= 0.2 && workoutProgress <= 0.8
          : false;

      if (grippingBar && leftHand.current && rightHand.current) {
        root.current.updateWorldMatrix(true, true);
        leftHand.current.getWorldPosition(leftGripPosition.current);
        rightHand.current.getWorldPosition(rightGripPosition.current);
        workoutBar.current.position
          .copy(leftGripPosition.current)
          .add(rightGripPosition.current)
          .multiplyScalar(0.5);
      } else {
        workoutBar.current.position.copy(GYM_BAR_RACK);
      }
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
    <>
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
            <group ref={leftHand} position={[0, -0.66, 0]} />
          </group>
          <group ref={rightArm} position={[0.48, 1.45, 0]} rotation={[0, 0, -0.05]}>
            <mesh position={[0, -0.32, 0]} castShadow>
              <boxGeometry args={[0.22, 0.68, 0.24]} />
              <meshStandardMaterial color={COLORS.concreteLight} roughness={0.9} />
            </mesh>
            <group ref={rightHand} position={[0, -0.66, 0]} />
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
      <group ref={workoutBar} position={GYM_BAR_RACK.toArray()}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.8, 10]} />
          <meshStandardMaterial color={COLORS.offWhite} metalness={0.35} roughness={0.42} />
        </mesh>
        {[-1.3, 1.3].map((offsetX) => (
          <mesh
            key={offsetX}
            position={[offsetX, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.3, 0.3, 0.14, 12]} />
            <meshStandardMaterial color={COLORS.accent} roughness={0.76} flatShading />
          </mesh>
        ))}
      </group>
    </>
  );
}