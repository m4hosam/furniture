/** Generates a short random alphanumeric ID */
export const generateId = () => Math.random().toString(36).substr(2, 9);

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
 * Returns fill / stroke / strokeWidth style values for a given element type.
 * Centralises all visual-style decisions in one place.
 */
export const getElementStyle = (type) => {
  switch (type) {
    case 'room':
      return { fill: '#f8fafc', stroke: '#334155', strokeWidth: 8 };
    case 'furniture':
      return { fill: 'rgba(191, 219, 254, 0.9)', stroke: '#3b82f6', strokeWidth: 2 };
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
