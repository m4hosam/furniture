/**
 * Renders the SVG grid pattern definition and the background rectangle.
 * Grid lines are drawn every 50 user units (cm).
 */
export function CanvasGrid({ width, height }) {
  return (
    <>
      <defs>
        <pattern id="grid-minor" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="none" stroke="#e2e8f0" strokeWidth="1" />
        </pattern>
        <pattern id="grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
          <rect width="200" height="200" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
        </pattern>
      </defs>

      {/* White canvas base */}
      <rect width={width} height={height} fill="#ffffff" />
      {/* Fine grid (50cm) */}
      <rect width={width} height={height} fill="url(#grid-minor)" />
      {/* Coarse grid (200cm) */}
      <rect width={width} height={height} fill="url(#grid-major)" />
    </>
  );
}
