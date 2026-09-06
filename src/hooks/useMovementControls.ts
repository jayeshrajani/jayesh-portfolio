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

export type MovementVector = {
  horizontal: number;
  vertical: number;
};

export function useMovementControls() {
  const pressedKeys = useRef(new Set<string>());
  const hopRequest = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !event.repeat) {
        const target = event.target;
        const isInteractive = target instanceof Element && Boolean(
          target.closest("a, button, input, select, textarea, [contenteditable='true']"),
        );
        if (!isInteractive) {
          event.preventDefault();
          hopRequest.current += 1;
        }
        return;
      }

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

  return { pressedKeys, hopRequest };
}