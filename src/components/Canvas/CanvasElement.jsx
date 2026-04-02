import React from 'react';
import { getElementStyle, getPolygonCenter } from '../../utils/geometry';

/**
 * Renders a single canvas element — either a rect or a polygon.
 * Handles selection highlight, label text, and vertex drag handles for polygons.
 */
export function CanvasElement({ el, isSelected, onPointerDown, onVertexPointerDown }) {
  const { fill, stroke, strokeWidth } = getElementStyle(el.type);

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

  return (
    <g transform={`translate(${el.x}, ${el.y})`}>

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
          {isSelected && el.points.map((p, i) => (
            <circle
              key={i} cx={p.x} cy={p.y} r={11}
              fill="#ffffff" stroke="#2563eb" strokeWidth={3}
              className="cursor-crosshair"
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => onVertexPointerDown(e, 'vertex', el.id, i)}
            />
          ))}
        </>
      )}
    </g>
  );
}
