import React from 'react';

/**
 * Formats a length value in cm for display.
 * Always shows the value with up to 1 decimal place, e.g. "320 cm" or "125.5 cm".
 */
function fmtCm(val) {
  const rounded = Math.round(val * 10) / 10;
  return `${rounded} cm`;
}

/**
 * A single dimension annotation for a rect wall.
 * Rendered as a leader line with tick marks at each end and a label in the middle.
 *
 * @param {number} x1, y1   - start of wall
 * @param {number} x2, y2   - end of wall
 * @param {number} offset   - perpendicular offset (negative = outward)
 * @param {string} label
 */
function DimLabel({ x1, y1, x2, y2, offset, label }) {
  // Midpoint of the wall
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // Direction perpendicular to the wall — used to offset the ruler line
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;

  // Normalised perpendicular (rotated 90° CCW)
  const nx = -dy / len;
  const ny = dx / len;

  // Ruler line end-points (offset from the wall)
  const rx1 = x1 + nx * offset;
  const ry1 = y1 + ny * offset;
  const rx2 = x2 + nx * offset;
  const ry2 = y2 + ny * offset;

  // Label position
  const lx = mx + nx * offset;
  const ly = my + ny * offset;

  // Rotation angle for the label (parallel to the wall)
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  // Keep text upright (never upside-down)
  if (angle > 90 || angle < -90) angle += 180;

  const TICK = 8; // tick mark half-length

  return (
    <g className="pointer-events-none select-none">
      {/* Ruler bar line */}
      <line x1={rx1} y1={ry1} x2={rx2} y2={ry2}
        stroke="#2563eb" strokeWidth={1.5} strokeDasharray="none" opacity={0.7} />

      {/* Tick at start */}
      <line
        x1={rx1 + nx * TICK} y1={ry1 + ny * TICK}
        x2={rx1 - nx * TICK} y2={ry1 - ny * TICK}
        stroke="#2563eb" strokeWidth={1.5} opacity={0.7}
      />
      {/* Tick at end */}
      <line
        x1={rx2 + nx * TICK} y1={ry2 + ny * TICK}
        x2={rx2 - nx * TICK} y2={ry2 - ny * TICK}
        stroke="#2563eb" strokeWidth={1.5} opacity={0.7}
      />

      {/* Label background pill (rotated with the wall) */}
      <g transform={`translate(${lx}, ${ly}) rotate(${angle})`}>
        <rect
          x={-label.length * 3.8}
          y={-9}
          width={label.length * 7.6}
          height={18}
          rx={4}
          fill="rgba(37,99,235,0.9)"
        />
        <text
          x={0} y={0}
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#ffffff"
          fontSize={11}
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          {label}
        </text>
      </g>
    </g>
  );
}

/**
 * Renders dimension rulers for a rectangular room element.
 * Draws rulers on all four sides outside the rect.
 */
function RectRulers({ el }) {
  const { x, y, w, h } = el;
  const OFF = 22; // how far from the wall the ruler sits

  return (
    <>
      {/* Top wall — width */}
      <DimLabel x1={x} y1={y} x2={x + w} y2={y} offset={-OFF} label={fmtCm(w)} />
      {/* Bottom wall — width */}
      <DimLabel x1={x} y1={y + h} x2={x + w} y2={y + h} offset={OFF} label={fmtCm(w)} />
      {/* Left wall — height */}
      <DimLabel x1={x} y1={y} x2={x} y2={y + h} offset={-OFF} label={fmtCm(h)} />
      {/* Right wall — height */}
      <DimLabel x1={x + w} y1={y} x2={x + w} y2={y + h} offset={OFF} label={fmtCm(h)} />
    </>
  );
}

/**
 * Renders dimension rulers for a polygon room element.
 * Draws a ruler label on each edge of the polygon.
 */
function PolygonRulers({ el }) {
  const { x: ox, y: oy, points } = el;
  const OFF = 20;

  return (
    <>
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        // Convert relative points to absolute SVG coordinates
        const ax1 = ox + p.x, ay1 = oy + p.y;
        const ax2 = ox + next.x, ay2 = oy + next.y;
        const edgeLen = Math.sqrt((ax2 - ax1) ** 2 + (ay2 - ay1) ** 2);
        if (edgeLen < 10) return null; // skip degenerate edges
        return (
          <DimLabel
            key={i}
            x1={ax1} y1={ay1}
            x2={ax2} y2={ay2}
            offset={OFF}
            label={fmtCm(edgeLen)}
          />
        );
      })}
    </>
  );
}

/**
 * CanvasRulers — renders wall dimension annotations for all room elements.
 * Receives `elements` array and a `showRulers` boolean toggle.
 */
export function CanvasRulers({ elements, showRulers }) {
  if (!showRulers) return null;

  const rooms = elements.filter((el) => el.type === 'room');

  return (
    <g id="canvas-rulers">
      {rooms.map((el) =>
        el.shape === 'rect'
          ? <RectRulers key={el.id} el={el} />
          : <PolygonRulers key={el.id} el={el} />
      )}
    </g>
  );
}
