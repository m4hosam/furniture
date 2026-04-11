/** Generates a short random alphanumeric ID */
export const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * 10 modern colour presets available for furniture items.
 * Each entry has a `label`, a `hex` base colour, and an `alpha` default opacity (0–1).
 */
export const FURNITURE_COLORS = [
  { id: 'sky',    label: 'Sky Blue',      hex: '#3b82f6', fill: 'rgba(191, 219, 254, 0.9)', stroke: '#3b82f6' },
  { id: 'indigo', label: 'Indigo',        hex: '#6366f1', fill: 'rgba(199, 210, 254, 0.9)', stroke: '#6366f1' },
  { id: 'violet', label: 'Violet',        hex: '#8b5cf6', fill: 'rgba(221, 214, 254, 0.9)', stroke: '#8b5cf6' },
  { id: 'rose',   label: 'Rose',          hex: '#f43f5e', fill: 'rgba(254, 205, 211, 0.9)', stroke: '#f43f5e' },
  { id: 'amber',  label: 'Amber',         hex: '#f59e0b', fill: 'rgba(253, 230, 138, 0.9)', stroke: '#f59e0b' },
  { id: 'lime',   label: 'Lime',          hex: '#84cc16', fill: 'rgba(217, 249, 157, 0.9)', stroke: '#84cc16' },
  { id: 'teal',   label: 'Teal',          hex: '#14b8a6', fill: 'rgba(153, 246, 228, 0.9)', stroke: '#14b8a6' },
  { id: 'slate',  label: 'Slate',         hex: '#64748b', fill: 'rgba(203, 213, 225, 0.9)', stroke: '#64748b' },
  { id: 'orange', label: 'Burnt Orange',  hex: '#ea580c', fill: 'rgba(254, 215, 170, 0.9)', stroke: '#ea580c' },
  { id: 'pink',   label: 'Blush Pink',    hex: '#ec4899', fill: 'rgba(251, 207, 232, 0.9)', stroke: '#ec4899' },
];

/**
 * Returns the approximate center {cx, cy} of a polygon
 * by calculating the midpoint of its bounding box.
 */
export const getPolygonCenter = (points) => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  points.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
};

/**
 * Returns the canvas-space center {cx, cy} of a room element.
 * Handles both rect and polygon shapes.
 */
export const getRoomCenter = (room) => {
  if (room.shape === 'rect') {
    return { cx: room.x + room.w / 2, cy: room.y + room.h / 2 };
  }
  // polygon — bounding-box centroid of points, offset by room's group origin
  const c = getPolygonCenter(room.points);
  return { cx: room.x + c.cx, cy: room.y + c.cy };
};

/**
 * Rotates a canvas-space point around a pivot by angleDeg degrees.
 * Returns the new {x, y}.
 */
export const rotatePointAroundCenter = (point, center, angleDeg) => {
  const rad = angleDeg * (Math.PI / 180);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.cx;
  const dy = point.y - center.cy;
  return {
    x: center.cx + dx * cos - dy * sin,
    y: center.cy + dx * sin + dy * cos,
  };
};

/**
 * Returns fill / stroke / strokeWidth style values for a given element.
 * Accepts the full element object so furniture items can apply per-element
 * color and opacity overrides stored in `el.color` and `el.opacity`.
 * Also accepts a plain type string for backward-compat (non-furniture callers).
 */
export const getElementStyle = (elOrType) => {
  const type = typeof elOrType === 'string' ? elOrType : elOrType.type;

  switch (type) {
    case 'room':
      return { fill: '#f8fafc', stroke: '#334155', strokeWidth: 8 };
    case 'furniture': {
      // If the element carries an explicit per-element colour, use it.
      if (typeof elOrType === 'object' && elOrType.color) {
        const preset = FURNITURE_COLORS.find((c) => c.id === elOrType.color);
        if (preset) {
          const opacity = elOrType.opacity ?? 0.9;
          // Build rgba fill from hex stroke colour
          const r = parseInt(preset.hex.slice(1, 3), 16);
          const g = parseInt(preset.hex.slice(3, 5), 16);
          const b = parseInt(preset.hex.slice(5, 7), 16);
          return {
            fill: `rgba(${r}, ${g}, ${b}, ${(opacity * 0.35).toFixed(2)})`,
            stroke: preset.hex,
            strokeWidth: 2,
          };
        }
      }
      const opacity = typeof elOrType === 'object' ? (elOrType.opacity ?? 0.9) : 0.9;
      return {
        fill: `rgba(191, 219, 254, ${(opacity * 0.9).toFixed(2)})`,
        stroke: '#3b82f6',
        strokeWidth: 2,
      };
    }
    case 'door':
      return { fill: '#d97706', stroke: '#78350f', strokeWidth: 2 };
    case 'window':
      return { fill: 'rgba(186, 230, 253, 0.8)', stroke: '#0284c7', strokeWidth: 2 };
    case 'ruler':
      return { fill: 'none', stroke: '#ef4444', strokeWidth: 2 };
    default:
      return { fill: '#ffffff', stroke: '#334155', strokeWidth: 2 };
  }
};
