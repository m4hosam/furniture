import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  // Global apartment/plot configuration
  const [apartment, setApartment] = useState({ width: 1000, depth: 800 });

  // Elements array handles Rooms, Furniture, Doors, Windows
  const [elements, setElements] = useState([
    { id: 'room_1', type: 'room', shape: 'rect', name: 'Living Room', x: 50, y: 50, w: 400, h: 300 },
    { id: 'room_2', type: 'room', shape: 'polygon', name: 'Custom Room', x: 500, y: 50, points: [{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 300 }, { x: 150, y: 300 }, { x: 150, y: 150 }, { x: 0, y: 150 }] },
    { id: 'door_1', type: 'door', shape: 'rect', name: 'Main Door', x: 50, y: 150, w: 10, h: 90 },
    { id: 'win_1', type: 'window', shape: 'rect', name: 'Window', x: 200, y: 50, w: 120, h: 10 },
    { id: 'furn_1', type: 'furniture', shape: 'rect', name: 'Sofa', x: 150, y: 150, w: 200, h: 90 }
  ]);

  const [selectedId, setSelectedId] = useState(null);
  const svgRef = useRef(null);
  const [dragInfo, setDragInfo] = useState(null);

  // Helper to generate IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --- Actions ---

  const addRectElement = (type) => {
    let w = 100, h = 100, x = apartment.width / 2 - 50, y = apartment.depth / 2 - 50;
    let name = 'New Item';

    if (type === 'room') { w = 300; h = 300; name = 'New Room'; }
    if (type === 'furniture') { w = 120; h = 60; name = 'Furniture'; }
    if (type === 'door') { w = 90; h = 10; name = 'Door'; x = 0; y = 0; }
    if (type === 'window') { w = 120; h = 10; name = 'Window'; x = 0; y = 0; }

    const newEl = { id: generateId(), type, shape: 'rect', name, x, y, w, h };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const addCustomRoom = () => {
    const newEl = {
      id: generateId(), type: 'room', shape: 'polygon', name: 'L-Shape Room',
      x: apartment.width / 2 - 150, y: apartment.depth / 2 - 150,
      points: [{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 300 }, { x: 150, y: 300 }, { x: 150, y: 150 }, { x: 0, y: 150 }]
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateSelected = (key, value) => {
    setElements(elements.map(el => el.id === selectedId ? { ...el, [key]: value } : el));
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const rotateSelected = () => {
    setElements(elements.map(el => {
      if (el.id === selectedId && el.shape === 'rect') {
        return { ...el, w: el.h, h: el.w }; // Swap width and height
      }
      return el;
    }));
  };

  const moveElementLayer = (index, direction) => {
    const newEls = [...elements];
    if (direction === 'up' && index < newEls.length - 1) {
      [newEls[index], newEls[index + 1]] = [newEls[index + 1], newEls[index]];
    } else if (direction === 'down' && index > 0) {
      [newEls[index], newEls[index - 1]] = [newEls[index - 1], newEls[index]];
    }
    setElements(newEls);
  };

  // --- SVG Drag & Drop Engine ---

  // Convert browser screen coordinates to exact SVG coordinates
  const getMouseCoords = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
  };

  const handlePointerDown = (e, dragType, id, vIndex = null) => {
    e.stopPropagation();
    setSelectedId(id);
    const coords = getMouseCoords(e);
    const el = elements.find(i => i.id === id);

    if (el) {
      e.target.setPointerCapture(e.pointerId);
      if (dragType === 'element') {
        setDragInfo({ dragType, id, startX: el.x, startY: el.y, startMouseX: coords.x, startMouseY: coords.y });
      } else if (dragType === 'vertex') {
        setDragInfo({ dragType, id, vIndex, startPx: el.points[vIndex].x, startPy: el.points[vIndex].y, startMouseX: coords.x, startMouseY: coords.y });
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!dragInfo) return;
    const coords = getMouseCoords(e);
    const dx = coords.x - dragInfo.startMouseX;
    const dy = coords.y - dragInfo.startMouseY;

    setElements(elements.map(el => {
      if (el.id === dragInfo.id) {
        if (dragInfo.dragType === 'element') {
          return { ...el, x: dragInfo.startX + dx, y: dragInfo.startY + dy };
        } else if (dragInfo.dragType === 'vertex' && el.shape === 'polygon') {
          const newPoints = [...el.points];
          newPoints[dragInfo.vIndex] = { x: dragInfo.startPx + dx, y: dragInfo.startPy + dy };
          return { ...el, points: newPoints };
        }
      }
      return el;
    }));
  };

  const handlePointerUp = (e) => {
    if (dragInfo) {
      e.target.releasePointerCapture(e.pointerId);
      setDragInfo(null);
    }
  };

  // --- Render Helpers ---
  const selectedEl = elements.find(el => el.id === selectedId);

  // Calculates a simple center point to place the label inside polygons
  const getPolygonCenter = (points) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(p => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    });
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">

      {/* SIDEBAR PANEL */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shadow-lg z-10 h-full">

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">

          {/* Apartment Settings */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">Apartment Layout</h1>
            <p className="text-xs text-slate-500 mb-3">Define your total floor space (cm)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Width</label>
                <input type="number" value={apartment.width} onChange={(e) => setApartment({ ...apartment, width: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Depth</label>
                <input type="number" value={apartment.depth} onChange={(e) => setApartment({ ...apartment, depth: Number(e.target.value) })} className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none text-sm" />
              </div>
            </div>
          </div>

          {/* Add Elements Tools */}
          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-sm font-bold text-slate-700 mb-3">Build Elements</h2>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={() => addRectElement('room')} className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded text-xs border border-slate-200 font-medium transition-colors">
                + Rect Room
              </button>
              <button onClick={addCustomRoom} className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded text-xs border border-slate-200 font-medium transition-colors">
                + L-Shape Room
              </button>
            </div>
            <button onClick={() => addRectElement('furniture')} className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm font-medium transition-colors mb-2 shadow-sm">
              + Add Furniture
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addRectElement('door')} className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded text-xs border border-slate-200 font-medium transition-colors">
                + Add Door
              </button>
              <button onClick={() => addRectElement('window')} className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded text-xs border border-slate-200 font-medium transition-colors">
                + Add Window
              </button>
            </div>
          </div>

          {/* Selected Item Properties */}
          <div className={`border-t border-slate-100 pt-5 transition-opacity duration-300 ${selectedEl ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <h2 className="text-sm font-bold text-slate-700 mb-3">Item Properties</h2>
            {selectedEl ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Label / Name</label>
                  <input type="text" value={selectedEl.name} onChange={(e) => updateSelected('name', e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none text-sm" />
                </div>

                {selectedEl.shape === 'rect' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Width (cm)</label>
                      <input type="number" value={selectedEl.w} onChange={(e) => updateSelected('w', Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Depth (cm)</label>
                      <input type="number" value={selectedEl.h} onChange={(e) => updateSelected('h', Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                    Custom shape selected. Drag the circular handles on the canvas to edit dimensions.
                  </div>
                )}

                <div className="flex gap-2 mt-1">
                  {selectedEl.shape === 'rect' && (
                    <button onClick={rotateSelected} className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded text-xs transition-colors border border-slate-200">
                      Rotate 90°
                    </button>
                  )}
                  <button onClick={() => deleteElement(selectedEl.id)} className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded text-xs transition-colors border border-red-200">
                    Delete Item
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-2 text-center">Select an item to edit.</div>
            )}
          </div>

          {/* Layers / Elements Menu */}
          <div className="border-t border-slate-100 pt-5 pb-5">
            <h2 className="text-sm font-bold text-slate-700 mb-3">Layers & Elements</h2>
            <div className="flex flex-col gap-1">
              {[...elements].reverse().map((el, revIdx) => {
                const index = elements.length - 1 - revIdx;
                const isSelected = selectedId === el.id;
                return (
                  <div
                    key={el.id}
                    onClick={() => setSelectedId(el.id)}
                    className={`flex items-center justify-between p-2 rounded text-sm cursor-pointer border ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {/* Simple type indicators */}
                      <span className={`w-3 h-3 rounded-full shrink-0 ${el.type === 'room' ? 'bg-slate-800' : el.type === 'door' ? 'bg-amber-500' : el.type === 'window' ? 'bg-sky-300' : 'bg-blue-500'}`}></span>
                      <span className="truncate font-medium text-xs">{el.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); moveElementLayer(index, 'up'); }} className="p-1 text-slate-400 hover:text-slate-800 bg-slate-100 rounded" title="Move Layer Up">↑</button>
                      <button onClick={(e) => { e.stopPropagation(); moveElementLayer(index, 'down'); }} className="p-1 text-slate-400 hover:text-slate-800 bg-slate-100 rounded" title="Move Layer Down">↓</button>
                      <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="p-1 text-red-400 hover:text-red-600 bg-red-50 rounded" title="Delete">×</button>
                    </div>
                  </div>
                );
              })}
              {elements.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No elements on canvas.</p>}
            </div>
          </div>

        </div>
      </div>

      {/* MAIN CANVAS AREA (SVG) */}
      <div
        className="flex-1 relative bg-slate-300 p-2 sm:p-6 overflow-hidden flex items-center justify-center cursor-crosshair touch-none"
        onPointerDown={() => setSelectedId(null)} // Click background to deselect
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${apartment.width} ${apartment.depth}`}
          className="bg-white shadow-2xl max-w-full max-h-full"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            {/* Grid Pattern (50cm blocks) */}
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="none" stroke="#f1f5f9" strokeWidth="2" />
            </pattern>
          </defs>

          {/* Background Area */}
          <rect width={apartment.width} height={apartment.depth} fill="url(#grid)" />

          {/* Render all elements using array order for Z-Index */}
          {elements.map((el) => {
            const isSelected = selectedId === el.id;

            // Visual Styles Mapping
            let fill = "#ffffff", stroke = "#334155", strokeWidth = 2;
            if (el.type === 'room') { strokeWidth = 8; fill = "#f8fafc"; }
            else if (el.type === 'furniture') { fill = "rgba(191, 219, 254, 0.9)"; stroke = "#3b82f6"; } // blue-200
            else if (el.type === 'door') { fill = "#d97706"; stroke = "#78350f"; } // amber-600
            else if (el.type === 'window') { fill = "rgba(186, 230, 253, 0.8)"; stroke = "#0284c7"; } // sky-200

            const interactionProps = {
              onPointerDown: (e) => handlePointerDown(e, 'element', el.id),
              className: "cursor-move",
              style: { touchAction: 'none' }
            };

            return (
              <g key={el.id} transform={`translate(${el.x}, ${el.y})`}>

                {/* Rectangular Shapes */}
                {el.shape === 'rect' && (
                  <>
                    <rect
                      width={el.w} height={el.h}
                      fill={fill} stroke={isSelected ? "#2563eb" : stroke}
                      strokeWidth={isSelected ? strokeWidth + 2 : strokeWidth}
                      strokeDasharray={isSelected && el.type !== 'room' ? "5,5" : "none"}
                      {...interactionProps}
                    />
                    {(el.w > 40 && el.h > 40) && (
                      <text x={el.w / 2} y={el.h / 2} dominantBaseline="middle" textAnchor="middle" fill="#334155" fontSize="16" fontWeight="bold" className="pointer-events-none select-none">
                        {el.name}
                      </text>
                    )}
                  </>
                )}

                {/* Polygonal Custom Shapes */}
                {el.shape === 'polygon' && (
                  <>
                    <polygon
                      points={el.points.map(p => `${p.x},${p.y}`).join(' ')}
                      fill={fill} stroke={isSelected ? "#2563eb" : stroke}
                      strokeWidth={isSelected ? strokeWidth + 2 : strokeWidth}
                      strokeLinejoin="round"
                      {...interactionProps}
                    />
                    {/* Render Text in approx center */}
                    <text
                      x={getPolygonCenter(el.points).cx} y={getPolygonCenter(el.points).cy}
                      dominantBaseline="middle" textAnchor="middle" fill="#334155" fontSize="16" fontWeight="bold" className="pointer-events-none select-none"
                    >
                      {el.name}
                    </text>

                    {/* Render Draggable Vertices if Selected */}
                    {isSelected && el.points.map((p, i) => (
                      <circle
                        key={i} cx={p.x} cy={p.y} r="12"
                        fill="#ffffff" stroke="#2563eb" strokeWidth="4"
                        className="cursor-crosshair hover:fill-blue-100"
                        onPointerDown={(e) => handlePointerDown(e, 'vertex', el.id, i)}
                      />
                    ))}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}