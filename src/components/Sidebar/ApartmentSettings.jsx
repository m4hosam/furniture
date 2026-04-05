import React from 'react';

const MIN_SIZE = 100;   // cm
const MAX_SIZE = 5000;  // cm
const STEP     = 50;    // cm per click

/**
 * Apartment width/depth configuration panel.
 * Plain number inputs + stepper buttons for quick ±50 cm adjustments.
 */
export function ApartmentSettings({ apartment, onApartmentChange, onReset }) {

  const clamp = (val) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, val));

  const change = (field, val) =>
    onApartmentChange({ ...apartment, [field]: clamp(Number(val)) });

  const step = (field, dir) =>
    change(field, apartment[field] + dir * STEP);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Apartment Layout</h1>
          <p className="text-xs text-slate-400 mt-0.5">Total floor space (cm) — {MIN_SIZE}–{MAX_SIZE}</p>
        </div>
        <button
          id="btn-reset-layout"
          onClick={onReset}
          className="text-[10px] bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 px-2.5 py-1.5 rounded-lg border border-red-200 transition-all font-semibold"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Width */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="apt-width">
            Width
          </label>
          <div className="flex items-center gap-1">
            <button
              id="btn-width-dec"
              aria-label="Decrease width"
              onClick={() => step('width', -1)}
              disabled={apartment.width <= MIN_SIZE}
              className="w-7 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm disabled:opacity-30 transition-colors shrink-0"
            >−</button>
            <input
              id="apt-width"
              type="number"
              min={MIN_SIZE}
              max={MAX_SIZE}
              step={STEP}
              value={apartment.width}
              onChange={(e) => change('width', e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all text-center"
            />
            <button
              id="btn-width-inc"
              aria-label="Increase width"
              onClick={() => step('width', 1)}
              disabled={apartment.width >= MAX_SIZE}
              className="w-7 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm disabled:opacity-30 transition-colors shrink-0"
            >+</button>
          </div>
        </div>

        {/* Depth */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="apt-depth">
            Depth
          </label>
          <div className="flex items-center gap-1">
            <button
              id="btn-depth-dec"
              aria-label="Decrease depth"
              onClick={() => step('depth', -1)}
              disabled={apartment.depth <= MIN_SIZE}
              className="w-7 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm disabled:opacity-30 transition-colors shrink-0"
            >−</button>
            <input
              id="apt-depth"
              type="number"
              min={MIN_SIZE}
              max={MAX_SIZE}
              step={STEP}
              value={apartment.depth}
              onChange={(e) => change('depth', e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all text-center"
            />
            <button
              id="btn-depth-inc"
              aria-label="Increase depth"
              onClick={() => step('depth', 1)}
              disabled={apartment.depth >= MAX_SIZE}
              className="w-7 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm disabled:opacity-30 transition-colors shrink-0"
            >+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
