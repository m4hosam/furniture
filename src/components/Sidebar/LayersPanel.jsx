import React from 'react';

const TYPE_DOT = {
  room:      'bg-slate-700',
  furniture: 'bg-blue-500',
  door:      'bg-amber-500',
  window:    'bg-sky-400',
  ruler:     'bg-red-500',
};

const TYPE_LABEL = {
  room:      { text: 'Room',      cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  furniture: { text: 'Furniture', cls: 'bg-blue-50  text-blue-600  border-blue-100'  },
  door:      { text: 'Door',      cls: 'bg-amber-50 text-amber-600 border-amber-100' },
  window:    { text: 'Window',    cls: 'bg-sky-50   text-sky-600   border-sky-100'   },
  ruler:     { text: 'Ruler',     cls: 'bg-red-50   text-red-500   border-red-100'   },
};

/**
 * Layers & Elements panel — lists all elements in reverse draw order
 * and exposes layer move / delete controls.
 */
export function LayersPanel({ elements, selectedId, onSelect, onMoveLayer, onDelete }) {
  return (
    <div className="border-t border-slate-100 pt-5 pb-5">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Layers &amp; Elements
        <span className="ml-2 text-slate-300 font-normal normal-case">{elements.length} item{elements.length !== 1 ? 's' : ''}</span>
      </h2>

      <div className="flex flex-col gap-1">
        {[...elements].reverse().map((el, revIdx) => {
          const index = elements.length - 1 - revIdx;
          const isSelected = selectedId === el.id;
          const parent = el.parentId ? elements.find((p) => p.id === el.parentId) : null;
          const tl = TYPE_LABEL[el.type] ?? { text: el.type, cls: 'bg-slate-100 text-slate-600 border-slate-200' };

          return (
            <div
              key={el.id}
              onClick={() => onSelect(el.id)}
              className={`
                flex items-center justify-between px-2.5 py-2 rounded-lg text-sm cursor-pointer border transition-all
                ${el.parentId ? 'ml-4 border-l-[3px] border-l-blue-400' : ''}
                ${isSelected
                  ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
              `}
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${TYPE_DOT[el.type] ?? 'bg-slate-400'}`} />
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium text-xs leading-tight">{el.name}</span>
                  {parent && (
                    <span className="text-[10px] text-slate-400 leading-tight truncate">in {parent.name}</span>
                  )}
                </div>
                <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${tl.cls}`}>
                  {tl.text}
                </span>
              </div>

              <div className="flex gap-1 shrink-0 ml-2">
                <button
                  title="Move layer up"
                  onClick={(e) => { e.stopPropagation(); onMoveLayer(index, 'up'); }}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                >↑</button>
                <button
                  title="Move layer down"
                  onClick={(e) => { e.stopPropagation(); onMoveLayer(index, 'down'); }}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                >↓</button>
                <button
                  title="Delete"
                  onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >×</button>
              </div>
            </div>
          );
        })}

        {elements.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4 italic">No elements on canvas.</p>
        )}
      </div>
    </div>
  );
}
