"use client";

type LoadingScreenProps = {
  ready: boolean;
};

export function LoadingScreen({ ready }: LoadingScreenProps) {
  return (
    <div
      className="loading-screen"
      data-ready={ready}
      aria-hidden={ready}
      aria-live="polite"
    >
      <div className="loading-screen__content">
        <p className="loading-screen__command">INITIALIZING JAYESH.EXE</p>
        <div className="loading-screen__track" aria-hidden="true">
          <span className="loading-screen__progress" />
        </div>
        <p className="loading-screen__status">
          {ready ? "WORLD READY" : "SHAPING COASTLINE"}
        </p>
      </div>
    </div>
  );
}