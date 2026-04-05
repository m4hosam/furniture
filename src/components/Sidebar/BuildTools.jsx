import React from 'react';

const iconAdd = (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

/**
 * "Build Elements" toolbar — add rooms, furniture, doors, and windows.
 */
export function BuildTools({ onAddRect, onAddCustomRoom, onAddRuler }) {
  return (
    <div className="border-t border-slate-100 pt-5 flex flex-col gap-2">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Build Elements</h2>

      {/* Rooms */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="btn-add-rect-room"
          onClick={() => onAddRect('room')}
          className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs border border-slate-200 font-medium transition-all"
        >
          {iconAdd} Rect Room
        </button>
        <button
          id="btn-add-l-room"
          onClick={onAddCustomRoom}
          className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs border border-slate-200 font-medium transition-all"
        >
          {iconAdd} L-Shape Room
        </button>
      </div>

      {/* Furniture — primary CTA */}
      <button
        id="btn-add-furniture"
        onClick={() => onAddRect('furniture')}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
      >
        {iconAdd} Add Furniture
      </button>

      {/* Door & Window */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="btn-add-door"
          onClick={() => onAddRect('door')}
          className="flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 px-3 rounded-lg text-xs border border-amber-200 font-medium transition-all"
        >
          {iconAdd} Door
        </button>
        <button
          id="btn-add-window"
          onClick={() => onAddRect('window')}
          className="flex items-center justify-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 py-2 px-3 rounded-lg text-xs border border-sky-200 font-medium transition-all"
        >
          {iconAdd} Window
        </button>
      </div>

      <button
        id="btn-add-ruler"
        onClick={onAddRuler}
        className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 px-3 rounded-lg text-xs border border-red-200 font-medium transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3v18M18 3v18M6 8h12M6 16h12" />
        </svg>
        Measure Distance (Ruler)
      </button>
    </div>
  );
}
