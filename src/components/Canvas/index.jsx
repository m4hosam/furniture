import React, { useRef } from 'react';
import { CanvasGrid } from './CanvasGrid';
import { CanvasElement } from './CanvasElement';
import { useDrag } from '../../hooks/useDrag';

/**
 * The main SVG canvas.
 * Wires the drag engine, renders grid + all elements.
 */
export function Canvas({ apartment, elements, setElements, selectedId, setSelectedId }) {
  const svgRef = useRef(null);
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useDrag(elements, setElements, svgRef);

  const onElementPointerDown = (e, dragType, id) =>
    handlePointerDown(e, dragType, id, setSelectedId);

  const onVertexPointerDown = (e, dragType, id, vIndex) =>
    handlePointerDown(e, dragType, id, setSelectedId, vIndex);

  return (
    <div
      className="flex-1 relative bg-gradient-to-br from-slate-400 to-slate-500 p-2 sm:p-6 overflow-hidden flex items-center justify-center cursor-crosshair touch-none"
      onPointerDown={() => setSelectedId(null)}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${apartment.width} ${apartment.depth}`}
        className="shadow-2xl max-w-full max-h-full"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <CanvasGrid width={apartment.width} height={apartment.depth} />

        {elements.map((el) => (
          <CanvasElement
            key={el.id}
            el={el}
            isSelected={selectedId === el.id}
            onPointerDown={onElementPointerDown}
            onVertexPointerDown={onVertexPointerDown}
          />
        ))}
      </svg>
    </div>
  );
}
