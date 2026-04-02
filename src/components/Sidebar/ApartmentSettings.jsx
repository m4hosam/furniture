import React from 'react';

/**
 * Apartment width/depth configuration panel with a Reset All button.
 */
export function ApartmentSettings({ apartment, onApartmentChange, onReset }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Apartment Layout</h1>
          <p className="text-xs text-slate-400 mt-0.5">Total floor space (cm)</p>
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
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="apt-width">
            Width
          </label>
          <input
            id="apt-width"
            type="number"
            value={apartment.width}
            onChange={(e) => onApartmentChange({ ...apartment, width: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="apt-depth">
            Depth
          </label>
          <input
            id="apt-depth"
            type="number"
            value={apartment.depth}
            onChange={(e) => onApartmentChange({ ...apartment, depth: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
          />
        </div>
      </div>
    </div>
  );
}
