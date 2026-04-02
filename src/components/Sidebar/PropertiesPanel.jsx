import React from 'react';

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-white';
const btnSecondary = 'flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs border border-slate-200 font-medium transition-all';
const btnDanger = 'flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-xs border border-red-200 font-medium transition-all';

/**
 * Properties panel for the currently selected element.
 * Shows name, parent room, dimensions, and action buttons.
 */
export function PropertiesPanel({
  selectedEl,
  rooms,
  onUpdate,
  onRotate,
  onDelete,
  onBringToFront,
  onSendToBack,
}) {
  const hasEl = Boolean(selectedEl);

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
            <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2.5 rounded-lg border border-blue-100 leading-relaxed">
              Custom shape — drag the circular handles on the canvas to edit vertices.
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            {selectedEl.shape === 'rect' && (
              <button id="btn-rotate" onClick={onRotate} className={btnSecondary}>
                ↻ Rotate 90°
              </button>
            )}
            <button
              id="btn-delete"
              onClick={() => onDelete(selectedEl.id)}
              className={`${selectedEl.shape === 'rect' ? '' : 'col-span-2'} ${btnDanger}`}
            >
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
