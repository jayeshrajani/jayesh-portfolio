"use client";

import { ArrowRightIcon, DeviceRotateIcon } from "@phosphor-icons/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef } from "react";

import type { InteractionTarget } from "@/data/world";

type MobileControlsProps = {
  enabled: boolean;
  nearbyInteraction: InteractionTarget | null;
  onInteract: (id: InteractionTarget["id"]) => void;
  onMovementChange: (horizontal: number, vertical: number) => void;
};

const DEAD_ZONE = 0.12;

export function MobileControls({
  enabled,
  nearbyInteraction,
  onInteract,
  onMovementChange,
}: MobileControlsProps) {
  const joystick = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);

  const resetJoystick = () => {
    activePointer.current = null;
    onMovementChange(0, 0);
    joystick.current?.removeAttribute("data-active");
    if (knob.current) knob.current.style.transform = "translate3d(0, 0, 0)";
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystick.current || !knob.current) return;

    const bounds = joystick.current.getBoundingClientRect();
    const maximumTravel = bounds.width * 0.29;
    const offsetX = clientX - (bounds.left + bounds.width / 2);
    const offsetY = clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(offsetX, offsetY);
    const clampScale = distance > maximumTravel ? maximumTravel / distance : 1;
    const clampedX = offsetX * clampScale;
    const clampedY = offsetY * clampScale;
    const normalizedDistance = Math.min(1, distance / maximumTravel);
    const movementScale = normalizedDistance <= DEAD_ZONE
      ? 0
      : (normalizedDistance - DEAD_ZONE) / (1 - DEAD_ZONE);
    const directionX = distance > 0 ? offsetX / distance : 0;
    const directionY = distance > 0 ? offsetY / distance : 0;

    onMovementChange(directionX * movementScale, -directionY * movementScale);
    knob.current.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || activePointer.current !== null) return;
    event.preventDefault();
    activePointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.setAttribute("data-active", "true");
    updateJoystick(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointer.current) return;
    event.preventDefault();
    updateJoystick(event.clientX, event.clientY);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointer.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resetJoystick();
  };

  useEffect(() => {
    if (!enabled) {
      activePointer.current = null;
      onMovementChange(0, 0);
      joystick.current?.removeAttribute("data-active");
      if (knob.current) knob.current.style.transform = "translate3d(0, 0, 0)";
    }

    return () => onMovementChange(0, 0);
  }, [enabled, onMovementChange]);

  return (
    <div className="mobile-controls" data-enabled={enabled}>
      <div
        ref={joystick}
        className="mobile-joystick"
        role="group"
        aria-label="Movement joystick"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={resetJoystick}
      >
        <div ref={knob} className="mobile-joystick__knob" />
      </div>

      <button
        type="button"
        className="mobile-action"
        data-visible={Boolean(nearbyInteraction)}
        disabled={!enabled || !nearbyInteraction}
        aria-label={nearbyInteraction ? nearbyInteraction.label : "Open nearby location"}
        onClick={() => nearbyInteraction && onInteract(nearbyInteraction.id)}
      >
        <span>OPEN</span>
        <ArrowRightIcon aria-hidden="true" size={18} weight="bold" />
      </button>
    </div>
  );
}

export function MobileOrientationGate() {
  return (
    <section className="orientation-gate" role="dialog" aria-modal="true" aria-label="Landscape orientation required">
      <DeviceRotateIcon aria-hidden="true" size={48} weight="duotone" />
      <strong>ROTATE TO LANDSCAPE</strong>
      <span>The island is ready sideways.</span>
    </section>
  );
}