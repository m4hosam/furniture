import { useState } from 'react';

/**
 * Encapsulates the SVG pointer drag engine.
 * Handles element moves (including child elements) and polygon vertex drags.
 *
 * Shift-drag on a vertex → constrain to horizontal (H) or vertical (V) axis,
 * determined by the dominant direction of the drag so far.
 *
 * @param {Array}    elements    - Current elements array (read-only, for lookups)
 * @param {Function} setElements - State setter from useElements
 * @param {Object}   svgRef      - React ref pointing at the <svg> element
 */
export function useDrag(elements, setElements, svgRef) {
  const [dragInfo, setDragInfo] = useState(null);
  // null | 'h' | 'v'
  const [axisLock, setAxisLock] = useState(null);

  /**
   * Converts browser screen coordinates to SVG user-space coordinates.
   */
  const getMouseCoords = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
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
      } else if (dragType === 'vertex') {
        setDragInfo({
          dragType, id, vIndex,
          startPx: el.points[vIndex].x,
          startPy: el.points[vIndex].y,
          startMouseX: coords.x, startMouseY: coords.y,
        });
        setAxisLock(null);
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
      // Determine dominant axis from total displacement
      if (Math.abs(dx) >= Math.abs(dy)) {
        currentAxisLock = 'h';
        dy = 0;
      } else {
        currentAxisLock = 'v';
        dx = 0;
      }
      setAxisLock(currentAxisLock);
    } else {
      setAxisLock(null);
    }

    setElements((prev) =>
      prev.map((el) => {
        if (el.id === dragInfo.id) {
          if (dragInfo.dragType === 'element') {
            return { ...el, x: dragInfo.startX + dx, y: dragInfo.startY + dy };
          } else if (dragInfo.dragType === 'vertex' && el.shape === 'polygon') {
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
    }
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    /** 'h' = horizontal lock, 'v' = vertical lock, null = free */
    axisLock,
    dragInfo,
  };
}
