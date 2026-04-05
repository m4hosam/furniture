import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CanvasGrid } from './CanvasGrid';
import { CanvasElement } from './CanvasElement';
import { CanvasRulers } from './CanvasRulers';
import { useDrag } from '../../hooks/useDrag';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

/**
 * The main SVG canvas.
 * Wires the drag engine, renders grid + all elements + optional dimension rulers.
 * Supports Ctrl+Scroll zoom (CSS transform on the SVG wrapper).
 */
export function Canvas({ apartment, elements, setElements, selectedId, setSelectedId }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { handlePointerDown, handlePointerMove, handlePointerUp, axisLock, dragInfo, liveRotation } = useDrag(elements, setElements, svgRef);
  const [showRulers, setShowRulers] = useState(true);
  const [zoom, setZoom] = useState(1);

  const onElementPointerDown = (e, dragType, id) =>
    handlePointerDown(e, dragType, id, setSelectedId);

  const onVertexPointerDown = (e, dragType, id, vIndex) =>
    handlePointerDown(e, dragType, id, setSelectedId, vIndex);

  const onRotateHandlePointerDown = (e, dragType, id) =>
    handlePointerDown(e, dragType, id, setSelectedId);

  // ── Ctrl+Scroll zoom ──────────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    e.stopPropagation();

    setZoom((prev) => {
      const delta = -e.deltaY * ZOOM_STEP * 0.05;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta));
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // passive:false so we can call preventDefault() inside the handler
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Zoom keyboard shortcuts ────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoom((prev) => Math.min(MAX_ZOOM, +(prev + ZOOM_STEP).toFixed(2)));
        } else if (e.key === '-') {
          e.preventDefault();
          setZoom((prev) => Math.max(MIN_ZOOM, +(prev - ZOOM_STEP).toFixed(2)));
        } else if (e.key === '0') {
          e.preventDefault();
          setZoom(1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const zoomPct = Math.round(zoom * 100);

  return (
    <div
      ref={containerRef}
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

      {/* ── Axis Lock Badge ─────────────────────────────────────────────── */}
      <div
        id="axis-lock-badge"
        className={`
          absolute top-4 left-1/2 -translate-x-1/2 z-20
          flex items-center gap-2 px-4 py-2 rounded-xl
          text-sm font-bold shadow-xl border
          pointer-events-none select-none
          transition-all duration-150
          ${axisLock
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-90'}
          ${axisLock === 'h'
            ? 'bg-amber-500 border-amber-600 text-white shadow-amber-500/40'
            : axisLock === 'v'
            ? 'bg-violet-600 border-violet-700 text-white shadow-violet-600/40'
            : 'bg-white border-slate-200 text-slate-700'}
        `}
      >
        {axisLock === 'h' && (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M15 8l4 4-4 4" />
            </svg>
            Horizontal — locked
          </>
        )}
        {axisLock === 'v' && (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M8 15l4 4 4-4" />
            </svg>
            Vertical — locked
          </>
        )}
      </div>

      {/* ── Rotation Badge ───────────────────────────────────────────────── */}
      <div
        id="rotation-badge"
        className={`
          absolute bottom-16 right-4 z-20
          flex items-center gap-2 px-3 py-1.5 rounded-xl
          text-sm font-bold shadow-xl border
          pointer-events-none select-none
          transition-all duration-100
          ${liveRotation !== null
            ? 'opacity-100 scale-100 bg-orange-500 border-orange-600 text-white shadow-orange-500/40'
            : 'opacity-0 scale-90 bg-white border-slate-200 text-slate-700'}
        `}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74M21 3v4h-4" />
        </svg>
        {liveRotation !== null ? `${Math.round(liveRotation)}°` : ''}
      </div>

      {/* ── Zoom Controls ───────────────────────────────────────────────── */}
      <div
        className="absolute bottom-4 right-4 z-10 flex items-center gap-1 bg-white/90 border border-slate-200 rounded-xl shadow-lg px-1 py-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-zoom-out"
          title="Zoom out (Ctrl −)"
          onClick={() => setZoom((prev) => Math.max(MIN_ZOOM, +(prev - ZOOM_STEP).toFixed(2)))}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-bold text-base leading-none"
        >−</button>

        <button
          id="btn-zoom-reset"
          title="Reset zoom (Ctrl 0)"
          onClick={() => setZoom(1)}
          className="min-w-[3.5rem] h-7 flex items-center justify-center rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors tabular-nums"
        >
          {zoomPct}%
        </button>

        <button
          id="btn-zoom-in"
          title="Zoom in (Ctrl +)"
          onClick={() => setZoom((prev) => Math.min(MAX_ZOOM, +(prev + ZOOM_STEP).toFixed(2)))}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-bold text-base leading-none"
        >+</button>
      </div>

      {/* ── SVG (zoom applied via CSS transform) ────────────────────────── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${apartment.width} ${apartment.depth}`}
        className="shadow-2xl max-w-full max-h-full"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.05s ease-out',
        }}
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
            onRotateHandlePointerDown={onRotateHandlePointerDown}
            activeVertexIndex={dragInfo?.dragType === 'vertex' && dragInfo?.id === el.id ? dragInfo.vIndex : null}
            axisLock={dragInfo?.id === el.id ? axisLock : null}
            isRotating={dragInfo?.dragType === 'rotate' && dragInfo?.id === el.id}
          />
        ))}

        {/* Rulers sit on top of elements but below vertex handles */}
        <CanvasRulers elements={elements} showRulers={showRulers} />
      </svg>
    </div>
  );
}
