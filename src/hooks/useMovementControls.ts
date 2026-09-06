"use client";

import { useEffect, useRef } from "react";

const MOVEMENT_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
]);

export function useMovementControls() {
  const pressedKeys = useRef(new Set<string>());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!MOVEMENT_KEYS.has(event.code)) return;
      event.preventDefault();
      pressedKeys.current.add(event.code);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!MOVEMENT_KEYS.has(event.code)) return;
      event.preventDefault();
      pressedKeys.current.delete(event.code);
    };

    const clearKeys = () => pressedKeys.current.clear();
    const handleVisibilityChange = () => {
      if (document.hidden) clearKeys();
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });
    window.addEventListener("blur", clearKeys);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return pressedKeys;
}