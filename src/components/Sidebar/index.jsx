import React from 'react';
import { FileSync } from './FileSync';
import { ApartmentSettings } from './ApartmentSettings';
import { BuildTools } from './BuildTools';
import { PropertiesPanel } from './PropertiesPanel';
import { LayersPanel } from './LayersPanel';

/**
 * Full left sidebar — composes all sub-panels and passes props through.
 */
export function Sidebar({
  // File IO
  fileInputRef, onExport, onImport, onTriggerImport, onReset,
  // Apartment
  apartment, onApartmentChange,
  // Elements
  elements, selectedId, selectedEl, rooms,
  onSelect,
  onAddRect, onAddCustomRoom, onAddRuler,
  onUpdate, onRotate, onSetRotation, onClone, onDelete,
  onBringToFront, onSendToBack,
  onMoveLayer,
}) {
  return (
    <aside className="w-full md:w-72 lg:w-80 bg-white border-r border-slate-100 flex flex-col shadow-xl z-10 h-full">

      {/* Branded header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-inner">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div>
          <h1 className="text-white text-sm font-bold leading-tight">Floor Planner</h1>
          <p className="text-slate-400 text-[10px] leading-tight">Apartment Layout Editor</p>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 sidebar-scroll">

        <FileSync
          fileInputRef={fileInputRef}
          onExport={onExport}
          onImport={onImport}
          onTriggerImport={onTriggerImport}
        />

        <ApartmentSettings
          apartment={apartment}
          onApartmentChange={onApartmentChange}
          onReset={onReset}
        />

        <BuildTools
          onAddRect={onAddRect}
          onAddCustomRoom={onAddCustomRoom}
          onAddRuler={onAddRuler}
        />

        <PropertiesPanel
          selectedEl={selectedEl}
          rooms={rooms}
          onUpdate={onUpdate}
          onRotate={onRotate}
          onSetRotation={onSetRotation}
          onClone={onClone}
          onDelete={onDelete}
          onBringToFront={onBringToFront}
          onSendToBack={onSendToBack}
        />

        <LayersPanel
          elements={elements}
          selectedId={selectedId}
          onSelect={onSelect}
          onMoveLayer={onMoveLayer}
          onDelete={onDelete}
        />
      </div>
    </aside>
  );
}
