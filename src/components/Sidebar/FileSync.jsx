import React from 'react';

/**
 * File & Sync panel — export/import JSON buttons and hidden file input.
 */
export function FileSync({ onExport, onImport, fileInputRef, onTriggerImport }) {
  return (
    <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">File &amp; Sync</h2>
      <div className="grid grid-cols-2 gap-2">
        <button
          id="btn-export-json"
          onClick={onExport}
          className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 p-2 rounded-lg text-xs border border-slate-200 font-medium transition-all shadow-sm hover:shadow"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
        <button
          id="btn-import-json"
          onClick={onTriggerImport}
          className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 p-2 rounded-lg text-xs border border-slate-200 font-medium transition-all shadow-sm hover:shadow"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
          </svg>
          Import
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImport}
          accept=".json"
          className="hidden"
        />
      </div>
    </div>
  );
}
