import { useState } from 'react';

/**
 * Encapsulates the SVG pointer drag engine.
 * Handles element moves (including child elements), polygon vertex drags,
 * and free-rotation via a rotation handle above each selected element.
 *
 * Shift during vertex drag  → axis constrain (H / V)
 * Shift during rotate drag  → snap to 15° increments
 *
 * @param {Array}    elements    - Current elements array (read-only, for lookups)
 * @param {Function} setElements - State setter from useElements
 * @param {Object}   svgRef      - React ref pointing at the <svg> element
 */
export function useDrag(elements, setElements, svgRef) {
  const [dragInfo, setDragInfo] = useState(null);
  // null | 'h' | 'v'
  const [axisLock, setAxisLock] = useState(null);
  // current live rotation angle while dragging (degrees)
  const [liveRotation, setLiveRotation] = useState(null);

  /** Converts browser screen coordinates to SVG user-space coordinates. */
  const getMouseCoords = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
  };

  /** Returns the centre point of an element in its LOCAL (pre-translate) space. */
  const getElementCenter = (el) => {
    if (el.shape === 'rect') {
      return { cx: el.x + el.w / 2, cy: el.y + el.h / 2 };
    }
    // polygon — use bounding-box centroid
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of el.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    return {
      cx: el.x + (minX + maxX) / 2,
      cy: el.y + (minY + maxY) / 2,
    };
  };

  const handlePointerDown = (e, dragType, id, setSelectedId, vIndex = null) => {
    e.stopPropagation();
    setSelectedId(id);
    const coords = getMouseCoords(e);
    const el = elements.find((i) => i.id === id);

    if (el) {
      e.target.setPointerCapture(e.pointerId);

      if (dragType === 'element') {
        const children = elements
          .filter((c) => c.parentId === id)
          .map((c) => ({ id: c.id, startX: c.x, startY: c.y }));
        setDragInfo({
          dragType, id,
          startX: el.x, startY: el.y,
          startMouseX: coords.x, startMouseY: coords.y,
          children,
        });
        setAxisLock(null);
        setLiveRotation(null);

      } else if (dragType === 'vertex') {
        setDragInfo({
          dragType, id, vIndex,
          startPx: el.points[vIndex].x,
          startPy: el.points[vIndex].y,
          startMouseX: coords.x, startMouseY: coords.y,
        });
        setAxisLock(null);
        setLiveRotation(null);

      } else if (dragType === 'rotate') {
        const { cx, cy } = getElementCenter(el);
        const startAngle = Math.atan2(coords.y - cy, coords.x - cx) * (180 / Math.PI);
        const startRotation = el.rotation ?? 0;
        setDragInfo({
          dragType, id,
          cx, cy,
          startAngle,
          startRotation,
        });
        setAxisLock(null);
        setLiveRotation(startRotation);
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!dragInfo) return;
    const coords = getMouseCoords(e);
    let dx = coords.x - dragInfo.startMouseX;
    let dy = coords.y - dragInfo.startMouseY;

    // ── Shift-axis constraint (vertex drag only) ──────────────────────────
    let currentAxisLock = null;
    if (dragInfo.dragType === 'vertex' && e.shiftKey) {
      if (Math.abs(dx) >= Math.abs(dy)) {
        currentAxisLock = 'h';
        dy = 0;
      } else {
        currentAxisLock = 'v';
        dx = 0;
      }
      setAxisLock(currentAxisLock);
    } else if (dragInfo.dragType !== 'rotate') {
      setAxisLock(null);
    }

    // ── Rotate drag ───────────────────────────────────────────────────────
    if (dragInfo.dragType === 'rotate') {
      const { cx, cy, startAngle, startRotation } = dragInfo;
      const currentAngle = Math.atan2(coords.y - cy, coords.x - cx) * (180 / Math.PI);
      let delta = currentAngle - startAngle;
      let newRotation = startRotation + delta;

      // Shift → snap to 15° increments
      if (e.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15;
      }

      // Normalise to [0, 360)
      newRotation = ((newRotation % 360) + 360) % 360;
      setLiveRotation(newRotation);

      setElements((prev) =>
        prev.map((el) =>
          el.id === dragInfo.id ? { ...el, rotation: +newRotation.toFixed(1) } : el
        )
      );
      return;
    }

    setElements((prev) =>
      prev.map((el) => {
        if (el.id === dragInfo.id) {
          if (dragInfo.dragType === 'element') {
            return { ...el, x: dragInfo.startX + dx, y: dragInfo.startY + dy };
          } else if (dragInfo.dragType === 'vertex' && (el.shape === 'polygon' || el.shape === 'line')) {
            const newPoints = [...el.points];
            newPoints[dragInfo.vIndex] = {
              x: dragInfo.startPx + dx,
              y: dragInfo.startPy + dy,
            };
            return { ...el, points: newPoints };
          }
        }
        if (dragInfo.dragType === 'element' && dragInfo.children) {
          const childInfo = dragInfo.children.find((c) => c.id === el.id);
          if (childInfo) {
            return { ...el, x: childInfo.startX + dx, y: childInfo.startY + dy };
          }
        }
        return el;
      })
    );
  };

  const handlePointerUp = (e) => {
    if (dragInfo) {
      e.target.releasePointerCapture(e.pointerId);
      setDragInfo(null);
      setAxisLock(null);
      setLiveRotation(null);
    }
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    /** 'h' = horizontal lock, 'v' = vertical lock, null = free */
    axisLock,
    dragInfo,
    /** Live degrees while rotating, null otherwise */
    liveRotation,
  };
}
