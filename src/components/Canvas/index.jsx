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
 * - Ctrl+Scroll / Ctrl+± / zoom buttons → zoom
 * - Middle-mouse drag OR Space+drag       → pan
 * - Zoom + Pan are combined as:
 *     transform: translate(pan.x, pan.y) scale(zoom)  (on the SVG element)
 *   Because translate is applied after scaling, it is always in screen-pixels
 *   regardless of zoom level — 1px mouse move = 1px canvas pan.
 *   getScreenCTM().inverse() in useDrag already accounts for this full transform.
 */
export function Canvas({ apartment, elements, setElements, selectedId, setSelectedId }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { handlePointerDown, handlePointerMove, handlePointerUp, axisLock, dragInfo, liveRotation } = useDrag(elements, setElements, svgRef);
  const [showRulers, setShowRulers] = useState(true);
  const [zoom, setZoom] = useState(1);

  // ── Pan state ─────────────────────────────────────────────────────────────
  const [pan, setPan] = useState({ x: 0, y: 0 });
  // Mirror of pan for use inside imperative event handlers (avoids stale closure)
  const panRef = useRef({ x: 0, y: 0 });
  // Active pan gesture info: { startMouseX, startMouseY, startPanX, startPanY }
  const panGestureRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  // Space bar held for Space+drag pan
  const spaceHeldRef = useRef(false);

  const applyPan = (newPan) => {
    panRef.current = newPan;
    setPan(newPan);
  };

  const resetView = () => {
    setZoom(1);
    applyPan({ x: 0, y: 0 });
  };

  // ── Element interaction wiring ────────────────────────────────────────────
  const onElementPointerDown = (e, dragType, id) =>
    handlePointerDown(e, dragType, id, setSelectedId);

  const onVertexPointerDown = (e, dragType, id, vIndex) =>
    handlePointerDown(e, dragType, id, setSelectedId, vIndex);

  const onRotateHandlePointerDown = (e, dragType, id) =>
    handlePointerDown(e, dragType, id, setSelectedId);

  // ── Start pan (middle-mouse or space+left) ────────────────────────────────
  const startPan = useCallback((clientX, clientY) => {
    panGestureRef.current = {
      startMouseX: clientX,
      startMouseY: clientY,
      startPanX: panRef.current.x,
      startPanY: panRef.current.y,
    };
    setIsPanning(true);
  }, []);

  const updatePan = useCallback((clientX, clientY) => {
    if (!panGestureRef.current) return;
    const { startMouseX, startMouseY, startPanX, startPanY } = panGestureRef.current;
    applyPan({
      x: startPanX + (clientX - startMouseX),
      y: startPanY + (clientY - startMouseY),
    });
  }, []);

  const endPan = useCallback(() => {
    if (panGestureRef.current) {
      panGestureRef.current = null;
      setIsPanning(false);
    }
  }, []);

  // ── Attach imperative listeners on the container ──────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Prevent browser's own middle-click scroll / autoscroll
    const onMouseDown = (e) => {
      if (e.button === 1) {         // middle mouse
        e.preventDefault();
        startPan(e.clientX, e.clientY);
      } else if (e.button === 0 && spaceHeldRef.current) {  // space+left
        e.preventDefault();
        startPan(e.clientX, e.clientY);
      }
    };

    const onMouseMove = (e) => {
      if (panGestureRef.current) {
        e.preventDefault();
        updatePan(e.clientX, e.clientY);
      }
    };

    const onMouseUp = (e) => {
      if (e.button === 1 || e.button === 0) endPan();
    };

    const onAuxClick = (e) => {
      // Prevent default middle-click "open link in tab" behaviour
      if (e.button === 1) e.preventDefault();
    };

    // Ctrl+Scroll zoom (passive:false to allow preventDefault)
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((prev) => {
        const delta = -e.deltaY * ZOOM_STEP * 0.05;
        return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta));
      });
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', endPan);
    el.addEventListener('auxclick', onAuxClick);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', endPan);
      el.removeEventListener('auxclick', onAuxClick);
      el.removeEventListener('wheel', onWheel);
    };
  }, [startPan, updatePan, endPan]);

  // ── Space bar: hold to pan with left drag ─────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        spaceHeldRef.current = true;
      }

      // Zoom keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoom((prev) => Math.min(MAX_ZOOM, +(prev + ZOOM_STEP).toFixed(2)));
        } else if (e.key === '-') {
          e.preventDefault();
          setZoom((prev) => Math.max(MIN_ZOOM, +(prev - ZOOM_STEP).toFixed(2)));
        } else if (e.key === '0') {
          e.preventDefault();
          resetView();
        }
      }
    };
    const onKeyUp = (e) => {
      if (e.key === ' ') {
        spaceHeldRef.current = false;
        endPan();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [endPan]);

  // ── Cursor style on the container ─────────────────────────────────────────
  const containerCursor = isPanning ? 'cursor-grabbing' : 'cursor-crosshair';

  const zoomPct = Math.round(zoom * 100);

  return (
    <div
      ref={containerRef}
      className={`flex-1 relative bg-gradient-to-br from-slate-400 to-slate-500 p-2 sm:p-6 overflow-hidden flex items-center justify-center touch-none ${containerCursor}`}
      onPointerDown={(e) => {
        // Only deselect on left-click that isn't a pan gesture
        if (e.button === 0 && !isPanning && !spaceHeldRef.current) setSelectedId(null);
      }}
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

      {/* ── Pan hint badge (shown when panning) ─────────────────────────── */}
      <div
        id="pan-badge"
        className={`
          absolute top-4 left-1/2 -translate-x-1/2 z-20
          flex items-center gap-2 px-4 py-2 rounded-xl
          text-sm font-bold shadow-xl border
          pointer-events-none select-none
          transition-all duration-100
          ${isPanning && !axisLock
            ? 'opacity-100 scale-100 bg-slate-700 border-slate-800 text-white shadow-slate-700/40'
            : 'opacity-0 scale-90 bg-white border-slate-200 text-slate-700'}
        `}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M12 12h.01" />
        </svg>
        Panning
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
          title="Reset zoom & pan (Ctrl 0)"
          onClick={resetView}
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

      {/* ── SVG (pan + zoom applied via CSS transform) ────────────────────── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${apartment.width} ${apartment.depth}`}
        className="shadow-2xl max-w-full max-h-full"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          // translate is in screen-pixels (applied after scale), so 1px drag = 1px pan always
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          // No transition during pan (feels instant); short ease during zoom
          transition: isPanning ? 'none' : 'transform 0.05s ease-out',
          // Grab cursor when space is pressed (before clicking)
          cursor: isPanning ? 'grabbing' : spaceHeldRef.current ? 'grab' : undefined,
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
