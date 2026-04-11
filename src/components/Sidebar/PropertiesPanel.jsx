import React from 'react';
import { FURNITURE_COLORS } from '../../utils/geometry';

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-white';
const btnSecondary = 'flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs border border-slate-200 font-medium transition-all';
const btnDanger = 'flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-xs border border-red-200 font-medium transition-all';

const ROTATION_PRESETS = [0, 45, 90, 135, 180];

/**
 * Properties panel for the currently selected element.
 * Shows name, parent room, dimensions, rotation controls, and action buttons.
 */
export function PropertiesPanel({
  selectedEl,
  rooms,
  onUpdate,
  onRotate,
  onSetRotation,
  onClone,
  onDelete,
  onBringToFront,
  onSendToBack,
}) {
  const hasEl = Boolean(selectedEl);
  const rotation = selectedEl ? (selectedEl.rotation ?? 0) : 0;

  return (
    <div className={`border-t border-slate-100 pt-5 transition-opacity duration-200 ${hasEl ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Item Properties</h2>

      {hasEl ? (
        <div className="flex flex-col gap-3">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="prop-name">Label / Name</label>
            <input
              id="prop-name"
              type="text"
              value={selectedEl.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Parent Room */}
          {selectedEl.type !== 'room' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="prop-parent">Attach to Room</label>
              <select
                id="prop-parent"
                value={selectedEl.parentId || ''}
                onChange={(e) => onUpdate('parentId', e.target.value || null)}
                className={inputCls}
              >
                <option value="">None (Apartment Layout)</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Dimensions */}
          {selectedEl.shape === 'rect' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="prop-w">Width (cm)</label>
                <input
                  id="prop-w"
                  type="number"
                  value={selectedEl.w}
                  onChange={(e) => onUpdate('w', Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="prop-h">Depth (cm)</label>
                <input
                  id="prop-h"
                  type="number"
                  value={selectedEl.h}
                  onChange={(e) => onUpdate('h', Number(e.target.value))}
                  className={inputCls}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2.5 rounded-lg border border-blue-100 leading-relaxed">
                Edit wall lengths below, or drag the handles on the canvas to reshape.
              </div>
              {/* Editable polygon edge lengths */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wall Lengths</span>
                  <span className="text-xs text-slate-400">cm</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {selectedEl.points.map((p, i) => {
                    const points = selectedEl.points;
                    const nextIdx = (i + 1) % points.length;
                    const next = points[nextIdx];
                    const dx = next.x - p.x;
                    const dy = next.y - p.y;
                    const len = Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;

                    const commitLength = (rawVal) => {
                      const newLen = parseFloat(rawVal);
                      if (!newLen || newLen < 1 || Math.abs(newLen - len) < 0.05) return;
                      const currentLen = Math.sqrt(dx * dx + dy * dy);
                      if (currentLen === 0) return;
                      const scale = newLen / currentLen;
                      const newPoints = points.map((pt, idx) =>
                        idx === nextIdx
                          ? { x: p.x + dx * scale, y: p.y + dy * scale }
                          : pt
                      );
                      onUpdate('points', newPoints);
                    };

                    return (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                        <span className="text-xs text-slate-500 font-medium w-12 shrink-0">Wall {i + 1}</span>
                        <input
                          key={`wall-${selectedEl.id}-${i}-${len}`}
                          id={`prop-wall-${i}`}
                          type="number"
                          defaultValue={len}
                          min={1}
                          step={1}
                          onBlur={(e) => commitLength(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { commitLength(e.target.value); e.target.blur(); }
                            if (e.key === 'Escape') { e.target.value = len; e.target.blur(); }
                          }}
                          className="flex-1 min-w-0 px-2 py-1 text-xs font-bold text-blue-600 tabular-nums
                            border border-slate-200 rounded-md bg-white
                            focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none
                            transition-all hover:border-blue-300"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Furniture Colour & Opacity ─────────────────────────────── */}
          {selectedEl.type === 'furniture' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
                Colour &amp; Opacity
              </h3>

              {/* Colour Swatches */}
              <div className="grid grid-cols-5 gap-1.5">
                {FURNITURE_COLORS.map((c) => {
                  const isActive = (selectedEl.color ?? 'sky') === c.id;
                  return (
                    <button
                      key={c.id}
                      id={`btn-color-${c.id}`}
                      title={c.label}
                      onClick={() => onUpdate('color', c.id)}
                      className={`relative w-full aspect-square rounded-lg border-2 transition-all focus:outline-none ${
                        isActive
                          ? 'border-slate-800 scale-110 shadow-md'
                          : 'border-transparent hover:scale-105 hover:border-slate-400'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isActive && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Colour name label */}
              <p className="text-[11px] text-slate-500 text-center -mt-1">
                {FURNITURE_COLORS.find((c) => c.id === (selectedEl.color ?? 'sky'))?.label ?? 'Sky Blue'}
              </p>

              {/* Opacity Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-500" htmlFor="prop-opacity">Opacity</label>
                  <span className="text-xs font-bold text-slate-700 tabular-nums">
                    {Math.round((selectedEl.opacity ?? 0.9) * 100)}%
                  </span>
                </div>
                <input
                  id="prop-opacity"
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={selectedEl.opacity ?? 0.9}
                  onChange={(e) => onUpdate('opacity', parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-runnable-track]:rounded-full
                    [&::-webkit-slider-runnable-track]:h-2
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-slate-400
                    [&::-webkit-slider-thumb]:shadow-sm
                    [&::-webkit-slider-thumb]:-mt-1"
                  style={{
                    background: (() => {
                      const c = FURNITURE_COLORS.find((col) => col.id === (selectedEl.color ?? 'sky'));
                      const hex = c ? c.hex : '#3b82f6';
                      const pct = Math.round((selectedEl.opacity ?? 0.9) * 100);
                      return `linear-gradient(to right, ${hex} 0%, ${hex} ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`;
                    })()
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Rotation ─────────────────────────────────────────────────── */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-700 flex items-center gap-1.5" htmlFor="prop-rotation">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74M21 3v4h-4" />
                </svg>
                Rotation
              </label>
              <span className="text-xs text-emerald-600 font-semibold tabular-nums">{Math.round(rotation)}°</span>
            </div>

            {/* Degree input + quick ±1/±5 steppers */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-rot-minus5"
                title="−5°"
                onClick={() => onRotate(-5)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors shrink-0"
              >−5</button>
              <button
                id="btn-rot-minus1"
                title="−1°"
                onClick={() => onRotate(-1)}
                className="w-7 h-8 flex items-center justify-center rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors shrink-0"
              >−1</button>

              <input
                id="prop-rotation"
                type="number"
                min={0}
                max={360}
                step={1}
                value={Math.round(rotation)}
                onChange={(e) => onSetRotation(Number(e.target.value))}
                className="flex-1 min-w-0 px-2 py-1.5 text-sm font-bold text-center text-emerald-700 tabular-nums
                  border border-emerald-200 rounded-lg bg-white
                  focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />

              <button
                id="btn-rot-plus1"
                title="+1°"
                onClick={() => onRotate(1)}
                className="w-7 h-8 flex items-center justify-center rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors shrink-0"
              >+1</button>
              <button
                id="btn-rot-plus5"
                title="+5°"
                onClick={() => onRotate(5)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors shrink-0"
              >+5</button>
            </div>

            {/* Preset snaps */}
            <div className="flex gap-1.5 flex-wrap">
              {ROTATION_PRESETS.map((deg) => (
                <button
                  key={deg}
                  id={`btn-rot-preset-${deg}`}
                  onClick={() => onSetRotation(deg)}
                  className={`flex-1 min-w-0 py-1 rounded-lg text-[11px] font-semibold border transition-all
                    ${Math.round(rotation) === deg
                      ? 'bg-emerald-600 border-emerald-700 text-white'
                      : 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button id="btn-clone" onClick={onClone} className={btnSecondary} title="Duplicate Item (Ctrl+D)">
              ⎘ Duplicate Item
            </button>
            <button id="btn-delete" onClick={() => onDelete(selectedEl.id)} className={btnDanger} title="Delete Item (Del)">
              ✕ Delete Item
            </button>
            <button id="btn-bring-front" onClick={() => onBringToFront(selectedEl.id)} className={btnSecondary}>
              ↑ Bring to Front
            </button>
            <button id="btn-send-back" onClick={() => onSendToBack(selectedEl.id)} className={btnSecondary}>
              ↓ Send to Back
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic text-center py-3">Select an item on the canvas to edit.</p>
      )}
    </div>
  );
}
