import React from 'react';
import { getElementStyle, getPolygonCenter } from '../../utils/geometry';

/** Distance from the element's bounding-box edge to the rotation handle (SVG units) */
const HANDLE_OFFSET = 32;
const HANDLE_R = 10;

/**
 * Renders a single canvas element — either a rect or a polygon.
 * Applies a CSS/SVG rotation transform around the element's centre.
 * Shows a rotation handle (arc icon + line) when the element is selected.
 *
 * Props:
 *   activeVertexIndex  — index of the vertex currently being dragged (null = none)
 *   axisLock           — 'h' | 'v' | null — constraint axis during Shift vertex drag
 *   isRotating         — true while a rotate drag is in progress for this element
 */
export function CanvasElement({
  el,
  isSelected,
  onPointerDown,
  onVertexPointerDown,
  onRotateHandlePointerDown,
  activeVertexIndex,
  axisLock,
  isRotating,
}) {
  const { fill, stroke, strokeWidth } = getElementStyle(el);
  const rotation = el.rotation ?? 0;

  // Centre of this element (LOCAL coords for the rotation pivot)
  let cx, cy;
  if (el.shape === 'rect') {
    cx = el.w / 2;
    cy = el.h / 2;
  } else {
    const c = getPolygonCenter(el.points);
    cx = c.cx;
    cy = c.cy;
  }

  // The rotation handle sits directly above/top-centre at HANDLE_OFFSET above the bbox top
  const handleX = cx;
  const handleY = el.shape === 'rect' ? -HANDLE_OFFSET : (Math.min(...el.points.map((p) => p.y)) - HANDLE_OFFSET);

  const interactionProps = {
    onPointerDown: (e) => onPointerDown(e, 'element', el.id),
    className: 'cursor-move',
    style: { touchAction: 'none' },
  };

  const activeFill = isSelected && el.type !== 'room'
    ? fill.replace('0.9', '1').replace('0.8', '1')
    : fill;

  const activeStroke = isSelected ? '#2563eb' : stroke;
  const activeStrokeWidth = isSelected ? strokeWidth + 2 : strokeWidth;

  // Axis-lock colours for the active vertex handle
  const lockColor = axisLock === 'h' ? '#f59e0b' : axisLock === 'v' ? '#7c3aed' : '#2563eb';
  // Rotation handle colour
  const rotHandleColor = isRotating ? '#f97316' : '#10b981';

  return (
    <g transform={`translate(${el.x}, ${el.y}) rotate(${rotation}, ${cx}, ${cy})`}>

      {/* ── Rectangular element ─────────────────────────────────────────── */}
      {el.shape === 'rect' && (
        <>
          {isSelected && (
            <rect
              width={el.w} height={el.h}
              fill="none"
              stroke="#2563eb"
              strokeWidth={activeStrokeWidth + 4}
              strokeOpacity={0.2}
              rx={el.type === 'room' ? 0 : 4}
            />
          )}
          <rect
            width={el.w} height={el.h}
            fill={activeFill}
            stroke={activeStroke}
            strokeWidth={activeStrokeWidth}
            strokeDasharray={isSelected && el.type !== 'room' ? '6 4' : 'none'}
            rx={el.type === 'room' ? 0 : 3}
            {...interactionProps}
          />
          {el.w > 40 && el.h > 24 && (
            <text
              x={el.w / 2} y={el.h / 2}
              dominantBaseline="middle" textAnchor="middle"
              fill={el.type === 'door' ? '#ffffff' : '#1e293b'}
              fontSize={el.type === 'door' || el.type === 'window' ? 10 : 14}
              fontWeight="600"
              fontFamily="Inter, sans-serif"
              className="pointer-events-none select-none"
            >
              {el.name}
            </text>
          )}
        </>
      )}

      {/* ── Polygon element ──────────────────────────────────────────────── */}
      {el.shape === 'polygon' && (
        <>
          {isSelected && (
            <polygon
              points={el.points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#2563eb"
              strokeWidth={activeStrokeWidth + 4}
              strokeOpacity={0.2}
              strokeLinejoin="round"
            />
          )}
          <polygon
            points={el.points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={activeFill}
            stroke={activeStroke}
            strokeWidth={activeStrokeWidth}
            strokeLinejoin="round"
            {...interactionProps}
          />
          <text
            x={getPolygonCenter(el.points).cx}
            y={getPolygonCenter(el.points).cy}
            dominantBaseline="middle" textAnchor="middle"
            fill="#1e293b" fontSize="14" fontWeight="600"
            fontFamily="Inter, sans-serif"
            className="pointer-events-none select-none"
          >
            {el.name}
          </text>

          {/* Draggable vertex handles (visible only when selected) */}
          {isSelected && el.points.map((p, i) => {
            const isActive = i === activeVertexIndex;
            const vColor = isActive && axisLock ? lockColor : '#2563eb';
            const vR = isActive && axisLock ? 13 : 11;

            return (
              <g key={i}>
                {isActive && axisLock && (
                  <circle
                    cx={p.x} cy={p.y} r={vR + 5}
                    fill="none"
                    stroke={vColor}
                    strokeWidth={2}
                    strokeOpacity={0.35}
                    className="pointer-events-none"
                  />
                )}
                <circle
                  cx={p.x} cy={p.y} r={vR}
                  fill={isActive && axisLock ? vColor : '#ffffff'}
                  stroke={vColor}
                  strokeWidth={isActive && axisLock ? 0 : 3}
                  className="cursor-crosshair"
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => onVertexPointerDown(e, 'vertex', el.id, i)}
                />
                {isActive && axisLock && (
                  <text
                    x={p.x} y={p.y}
                    dominantBaseline="middle" textAnchor="middle"
                    fill="#ffffff"
                    fontSize={10}
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                    className="pointer-events-none select-none"
                  >
                    {axisLock === 'h' ? 'H' : 'V'}
                  </text>
                )}
              </g>
            );
          })}
        </>
      )}

      {/* ── Line element (Ruler) ─────────────────────────────────────────── */}
      {el.shape === 'line' && (
        <>
          <line
            x1={el.points[0].x} y1={el.points[0].y}
            x2={el.points[1].x} y2={el.points[1].y}
            stroke={activeStroke}
            strokeWidth={activeStrokeWidth}
            strokeDasharray="6 4"
            {...interactionProps}
          />
          <line
            x1={el.points[0].x} y1={el.points[0].y}
            x2={el.points[1].x} y2={el.points[1].y}
            stroke="transparent"
            strokeWidth={15}
            {...interactionProps}
          />
          <rect
            x={getPolygonCenter(el.points).cx - 30}
            y={getPolygonCenter(el.points).cy - 10}
            width={60} height={20}
            fill="#ffffff"
            rx={4}
            className="pointer-events-none"
            opacity={0.8}
          />
          <text
            x={getPolygonCenter(el.points).cx}
            y={getPolygonCenter(el.points).cy}
            dominantBaseline="middle" textAnchor="middle"
            fill={activeStroke} fontSize="12" fontWeight="700"
            fontFamily="Inter, sans-serif"
            className="pointer-events-none select-none"
          >
            {Math.hypot(el.points[1].x - el.points[0].x, el.points[1].y - el.points[0].y).toFixed(1)} cm
          </text>

          {/* Draggable vertex handles (visible only when selected) */}
          {isSelected && el.points.map((p, i) => {
            const isActive = i === activeVertexIndex;
            const vColor = isActive && axisLock ? lockColor : '#2563eb';
            const vR = isActive && axisLock ? 13 : 11;

            return (
              <g key={i}>
                {isActive && axisLock && (
                  <circle
                    cx={p.x} cy={p.y} r={vR + 5}
                    fill="none"
                    stroke={vColor}
                    strokeWidth={2}
                    strokeOpacity={0.35}
                    className="pointer-events-none"
                  />
                )}
                <circle
                  cx={p.x} cy={p.y} r={vR}
                  fill={isActive && axisLock ? vColor : '#ffffff'}
                  stroke={vColor}
                  strokeWidth={isActive && axisLock ? 0 : 3}
                  className="cursor-crosshair"
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => onVertexPointerDown(e, 'vertex', el.id, i)}
                />
                {isActive && axisLock && (
                  <text
                    x={p.x} y={p.y}
                    dominantBaseline="middle" textAnchor="middle"
                    fill="#ffffff"
                    fontSize={10}
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                    className="pointer-events-none select-none"
                  >
                    {axisLock === 'h' ? 'H' : 'V'}
                  </text>
                )}
              </g>
            );
          })}
        </>
      )}

      {/* ── Rotation handle (shown when selected) ────────────────────────── */}
      {isSelected && (
        <g className="pointer-events-none">
          {/* Stem line from bbox-top-centre to the handle */}
          <line
            x1={cx} y1={el.shape === 'rect' ? 0 : Math.min(...el.points.map((p) => p.y))}
            x2={handleX} y2={handleY}
            stroke={rotHandleColor}
            strokeWidth={2}
            strokeDasharray="4 3"
            opacity={0.8}
          />
        </g>
      )}
      {isSelected && (
        <g
          style={{ touchAction: 'none', cursor: 'grab' }}
          onPointerDown={(e) => onRotateHandlePointerDown(e, 'rotate', el.id)}
        >
          {/* Outer glow when rotating */}
          {isRotating && (
            <circle
              cx={handleX} cy={handleY} r={HANDLE_R + 6}
              fill="none"
              stroke={rotHandleColor}
              strokeWidth={2}
              strokeOpacity={0.3}
            />
          )}
          {/* Handle background */}
          <circle
            cx={handleX} cy={handleY} r={HANDLE_R}
            fill={isRotating ? rotHandleColor : '#ffffff'}
            stroke={rotHandleColor}
            strokeWidth={2.5}
          />
          {/* Rotation arc icon */}
          <path
            d="M-5,-3 A6,6 0 1,1 5,-3"
            transform={`translate(${handleX}, ${handleY})`}
            fill="none"
            stroke={isRotating ? '#ffffff' : rotHandleColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <polygon
            points={`${handleX + 5},${handleY - 3} ${handleX + 5},${handleY + 2} ${handleX + 9},${handleY - 1}`}
            fill={isRotating ? '#ffffff' : rotHandleColor}
          />
        </g>
      )}
    </g>
  );
}
