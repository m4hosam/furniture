import React, { useEffect } from 'react';
import { useApartment } from './hooks/useApartment';
import { useElements } from './hooks/useElements';
import { useFileIO } from './hooks/useFileIO';
import { Sidebar } from './components/Sidebar/index';
import { Canvas } from './components/Canvas/index';

/**
 * App — thin orchestrator.
 * All logic lives in custom hooks; all UI lives in components.
 */
export default function App() {
  const { apartment, setApartment } = useApartment();

  const {
    elements, setElements,
    selectedId, setSelectedId, selectedEl, rooms,
    addRectElement, addCustomRoom,
    updateSelected, rotateSelected,
    deleteElement, moveElementLayer, bringToFront, sendToBack,
  } = useElements();

  const { fileInputRef, exportToJson, importFromJson, triggerFileInput, resetLayout } =
    useFileIO({ apartment, elements, setApartment, setElements, setSelectedId });

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip when user is typing in an input/textarea/select
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        deleteElement(selectedId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteElement]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden">
      <Sidebar
        // File IO
        fileInputRef={fileInputRef}
        onExport={exportToJson}
        onImport={importFromJson}
        onTriggerImport={triggerFileInput}
        onReset={resetLayout}
        // Apartment
        apartment={apartment}
        onApartmentChange={setApartment}
        // Elements
        elements={elements}
        selectedId={selectedId}
        selectedEl={selectedEl}
        rooms={rooms}
        onSelect={setSelectedId}
        onAddRect={(type) => addRectElement(type, apartment.width, apartment.depth)}
        onAddCustomRoom={() => addCustomRoom(apartment.width, apartment.depth)}
        onUpdate={updateSelected}
        onRotate={rotateSelected}
        onDelete={deleteElement}
        onBringToFront={bringToFront}
        onSendToBack={sendToBack}
        onMoveLayer={moveElementLayer}
      />
      <Canvas
        apartment={apartment}
        elements={elements}
        setElements={setElements}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />
    </div>
  );
}