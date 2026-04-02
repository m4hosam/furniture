import React, { useRef, useState } from 'react';
import { CanvasGrid } from './CanvasGrid';
import { CanvasElement } from './CanvasElement';
import { CanvasRulers } from './CanvasRulers';
import { useDrag } from '../../hooks/useDrag';

/**
 * The main SVG canvas.
 * Wires the drag engine, renders grid + all elements + optional dimension rulers.
 */
export function Canvas({ apartment, elements, setElements, selectedId, setSelectedId }) {
  const svgRef = useRef(null);
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useDrag(elements, setElements, svgRef);
  const [showRulers, setShowRulers] = useState(true);

  const onElementPointerDown = (e, dragType, id) =>
    handlePointerDown(e, dragType, id, setSelectedId);

  const onVertexPointerDown = (e, dragType, id, vIndex) =>
    handlePointerDown(e, dragType, id, setSelectedId, vIndex);

  return (
    <div
      className="flex-1 relative bg-gradient-to-br from-slate-400 to-slate-500 p-2 sm:p-6 overflow-hidden flex items-center justify-center cursor-crosshair touch-none"
      onPointerDown={() => setSelectedId(null)}
    >
      {/* ── Ruler Toggle Button ─────────────────────────────────────────── */}
      <button
        id="btn-toggle-rulers"
        title={showRulers ? 'Hide dimensions' : 'Show dimensions'}
        onClick={(e) => { e.stopPropagation(); setShowRulers((v) => !v); }}
        className={`
          absolute top-4 right-4 z-10
          flex items-center gap-1.5
          px-3 py-1.5 rounded-lg text-xs font-semibold
          border shadow-md transition-all duration-200
          ${showRulers
            ? 'bg-blue-600 border-blue-700 text-white shadow-blue-600/30 hover:bg-blue-700'
            : 'bg-white/80 border-slate-300 text-slate-600 hover:bg-white'}
        `}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l18 0" /><path d="M3 15l18 0" />
          <path d="M9 3l0 18" /><path d="M15 3l0 3M15 9l0 3M15 15l0 3" />
        </svg>
        {showRulers ? 'Dimensions On' : 'Dimensions Off'}
      </button>

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

        {/* Rulers sit on top of elements but below vertex handles */}
        <CanvasRulers elements={elements} showRulers={showRulers} />
      </svg>
    </div>
  );
}
