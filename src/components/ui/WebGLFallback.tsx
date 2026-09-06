export function WebGLFallback() {
  return (
    <div className="webgl-fallback" role="alert">
      <p>3D EXPERIENCE UNAVAILABLE</p>
      <h1>The island could not be rendered.</h1>
      <span>Enable hardware acceleration or try a current desktop browser.</span>
    </div>
  );
}