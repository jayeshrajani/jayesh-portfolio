"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import * as THREE from "three";

import { ExperienceOverlay } from "@/components/experiences/ExperienceOverlay";
import type {
  ResumeThrowOrigin,
  ResumeViewerPhase,
} from "@/components/experiences/WorkExperience";
import { PortfolioHud } from "@/components/ui/PortfolioHud";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { WebGLFallback } from "@/components/ui/WebGLFallback";
import { WorldScene } from "@/components/world/WorldScene";
import {
  getInteractionTarget,
  getLocationAt,
  WORLD,
  type CameraMode,
  type ExperienceId,
  type InteractionTarget,
  type WorldLocation,
} from "@/data/world";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";

export function PortfolioExperience() {
  const playerPosition = useRef(new THREE.Vector3(...WORLD.playerSpawn));
  const [worldReady, setWorldReady] = useState(false);
  const [arrivalComplete, setArrivalComplete] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>("INTRO");
  const [nearbyInteraction, setNearbyInteraction] = useState<InteractionTarget | null>(null);
  const [openLocationId, setOpenLocationId] = useState<ExperienceId | null>(null);
  const [resumeViewerPhase, setResumeViewerPhase] = useState<ResumeViewerPhase>("closed");
  const [resumeThrowOrigin, setResumeThrowOrigin] = useState<ResumeThrowOrigin>({ x: 0, y: 0 });
  const [resumeThrowRequest, setResumeThrowRequest] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<WorldLocation>(() =>
    getLocationAt(WORLD.playerSpawn[0], WORLD.playerSpawn[2]),
  );
  const reducedMotion = useReducedMotionPreference();
  const audio = useAmbientAudio();

  const handleInteract = (id: ExperienceId) => {
    if (cameraMode !== "FOLLOW" || nearbyInteraction?.id !== id) return;
    audio.playDoor();
    audio.playEnter();
    setOpenLocationId(id);
    setCameraMode("ENTER");
  };

  const handleInteractionKey = useEffectEvent((event: KeyboardEvent) => {
    const isEnterKey = event.code === "Enter" || event.code === "NumpadEnter";
    if (!isEnterKey || event.repeat || cameraMode !== "FOLLOW" || !nearbyInteraction) return;

    event.preventDefault();
    handleInteract(nearbyInteraction.id);
  });

  useEffect(() => {
    window.addEventListener("keydown", handleInteractionKey);
    return () => window.removeEventListener("keydown", handleInteractionKey);
  }, []);

  const handleTransitionComplete = (completedMode: CameraMode) => {
    if (completedMode === "INTRO") {
      setArrivalComplete(true);
      setCameraMode("FOLLOW");
    } else if (completedMode === "ENTER") {
      audio.playReveal();
      setCameraMode("EXPERIENCE");
    } else if (completedMode === "EXIT") {
      setOpenLocationId(null);
      setCameraMode("FOLLOW");
    }
  };

  const handleExitExperience = () => {
    if (cameraMode !== "EXPERIENCE") return;
    audio.playExit();
    setResumeViewerPhase("closed");
    setCameraMode("EXIT");
  };

  const handleResumeThrow = () => {
    if (
      cameraMode !== "EXPERIENCE" ||
      openLocationId !== "work" ||
      resumeViewerPhase !== "closed"
    ) return;

    setResumeViewerPhase("preparing");
    setResumeThrowRequest((request) => request + 1);
  };

  const handleResumeRelease = (origin: ResumeThrowOrigin) => {
    setResumeThrowOrigin(origin);
    setResumeViewerPhase((phase) => phase === "preparing" ? "launching" : phase);
  };

  const handleResumeLanded = () => {
    setResumeViewerPhase((phase) => phase === "launching" ? "open" : phase);
  };

  const handleLocationChange = (location: WorldLocation) => {
    audio.playLocation();
    setCurrentLocation(location);
  };

  const handleNearbyInteractionChange = (target: InteractionTarget | null) => {
    if (target) audio.playProximity();
    setNearbyInteraction(target);
  };

  return (
    <main className="world-shell">
      <Canvas
        className="world-canvas"
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.65]}
        camera={{ position: [28, 31, 35], fov: 38, near: 0.1, far: 180 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        fallback={<WebGLFallback />}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.95;
          setWorldReady(true);
        }}
        aria-label="A playable miniature coastal island portfolio"
      >
        <WorldScene
          cameraMode={cameraMode}
          controlsEnabled={cameraMode === "FOLLOW"}
          focusTarget={getInteractionTarget(openLocationId)}
          nearbyInteractionId={nearbyInteraction?.id ?? null}
          openLocationId={openLocationId}
          playerPosition={playerPosition}
          reducedMotion={reducedMotion}
          resumeThrowRequest={resumeThrowRequest}
          onInteract={handleInteract}
          onFirstMove={() => setHasMoved(true)}
          onLocationChange={handleLocationChange}
          onNearbyInteractionChange={handleNearbyInteractionChange}
          onResumeRelease={handleResumeRelease}
          onStep={audio.playFootstep}
          onTransitionComplete={handleTransitionComplete}
        />
      </Canvas>

      <PortfolioHud
        arrivalComplete={arrivalComplete}
        cameraMode={cameraMode}
        currentLocation={currentLocation}
        hasMoved={hasMoved}
        nearbyInteraction={nearbyInteraction}
        onInteract={handleInteract}
        onToggleSound={() => void audio.toggle()}
        soundEnabled={audio.enabled}
        worldReady={worldReady}
      />
      <ExperienceOverlay
        activeExperience={cameraMode === "EXPERIENCE" ? openLocationId : null}
        resumeViewerPhase={resumeViewerPhase}
        resumeThrowOrigin={resumeThrowOrigin}
        onExit={handleExitExperience}
        onResumeThrow={handleResumeThrow}
        onResumeLanded={handleResumeLanded}
        onResumeClose={() => setResumeViewerPhase("closed")}
      />
      <LoadingScreen ready={worldReady} />

      <noscript>
        <div className="webgl-fallback">
          <p>JAVASCRIPT REQUIRED</p>
          <h1>This portfolio is a playable 3D experience.</h1>
        </div>
      </noscript>
    </main>
  );
}