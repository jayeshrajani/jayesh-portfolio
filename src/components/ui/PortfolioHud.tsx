"use client";

import { ArrowRightIcon, SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";

import type { CameraMode, InteractionTarget, WorldLocation } from "@/data/world";

type PortfolioHudProps = {
  arrivalComplete: boolean;
  cameraMode: CameraMode;
  currentLocation: WorldLocation;
  hasMoved: boolean;
  nearbyInteraction: InteractionTarget | null;
  onInteract: (id: InteractionTarget["id"]) => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
  worldReady: boolean;
};

export function PortfolioHud({
  arrivalComplete,
  cameraMode,
  currentLocation,
  hasMoved,
  nearbyInteraction,
  onInteract,
  onToggleSound,
  soundEnabled,
  worldReady,
}: PortfolioHudProps) {
  return (
    <div className="hud" data-visible={worldReady}>
      <header className="hud__brand" aria-label="Jayesh portfolio">
        <strong>JAYESH</strong>
        <span>SOFTWARE ENGINEER</span>
      </header>

      <div className="hud__location" role="status" aria-live="polite">
        <span>LOCATION</span>
        <strong>{currentLocation.label}</strong>
      </div>

      <button
        className="sound-toggle"
        type="button"
        aria-label={soundEnabled ? "Mute ambient sound" : "Enable ambient sound"}
        aria-pressed={soundEnabled}
        title={soundEnabled ? "Mute sound" : "Enable sound"}
        onClick={onToggleSound}
      >
        {soundEnabled ? (
          <SpeakerHighIcon aria-hidden="true" size={18} weight="bold" />
        ) : (
          <SpeakerSlashIcon aria-hidden="true" size={18} weight="bold" />
        )}
      </button>

      <section
        className="arrival-title"
        data-visible={arrivalComplete && !hasMoved}
        aria-hidden={!arrivalComplete || hasMoved}
      >
        <h1>JAYESH</h1>
        <p>SOFTWARE ENGINEER</p>
        <span>AI / SYSTEMS / CREATIVE TECHNOLOGY</span>
      </section>

      <button
        type="button"
        className="interaction-prompt"
        data-visible={cameraMode === "FOLLOW" && Boolean(nearbyInteraction)}
        disabled={!nearbyInteraction || cameraMode !== "FOLLOW"}
        onClick={() => nearbyInteraction && onInteract(nearbyInteraction.id)}
      >
        <span>ENTER / CLICK</span>
        <strong>{nearbyInteraction?.label}</strong>
        <ArrowRightIcon aria-hidden="true" size={14} weight="bold" />
      </button>

      <div
        className="controls-hint"
        data-muted={hasMoved || cameraMode !== "FOLLOW" || Boolean(nearbyInteraction)}
        data-covered={Boolean(nearbyInteraction)}
      >
        <span className="controls-hint__keys">WASD / ARROWS</span>
        <span>MOVE</span>
        <span className="controls-hint__divider" aria-hidden="true" />
        <span className="controls-hint__keys">ENTER / CLICK</span>
        <span>OPEN</span>
      </div>
    </div>
  );
}