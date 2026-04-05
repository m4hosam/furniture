import { useState, useEffect } from 'react';
import { generateId } from '../utils/geometry';

const STORAGE_KEY = 'apartmentElements';

const DEFAULT_ELEMENTS = [
  { id: 'room_1', type: 'room', shape: 'rect', name: 'Living Room', x: 50, y: 50, w: 400, h: 300, rotation: 0, parentId: null },
  {
    id: 'room_2', type: 'room', shape: 'polygon', name: 'Custom Room',
    x: 500, y: 50,
    points: [
      { x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 300 },
      { x: 150, y: 300 }, { x: 150, y: 150 }, { x: 0, y: 150 },
    ],
    rotation: 0, parentId: null,
  },
  { id: 'door_1', type: 'door', shape: 'rect', name: 'Main Door', x: 50, y: 150, w: 10, h: 90, rotation: 0, parentId: 'room_1' },
  { id: 'win_1', type: 'window', shape: 'rect', name: 'Window', x: 200, y: 50, w: 120, h: 10, rotation: 0, parentId: 'room_1' },
  { id: 'furn_1', type: 'furniture', shape: 'rect', name: 'Sofa', x: 150, y: 150, w: 200, h: 90, rotation: 0, parentId: 'room_1' },
];

/**
 * Manages all canvas elements with full CRUD, layer ordering, and local-storage persistence.
 */
export function useElements() {
  const [elements, setElements] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_ELEMENTS;
  });

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
  }, [elements]);

  // ── ADD ──────────────────────────────────────────────────────────────────────

  const addRectElement = (type, apartmentWidth, apartmentDepth) => {
    const cx = apartmentWidth / 2;
    const cy = apartmentDepth / 2;
    const defaults = {
      room:      { w: 300, h: 300, name: 'New Room',  x: cx - 150, y: cy - 150 },
      furniture: { w: 120, h: 60,  name: 'Furniture', x: cx - 60,  y: cy - 30  },
      door:      { w: 90,  h: 10,  name: 'Door',      x: 0,        y: 0        },
      window:    { w: 120, h: 10,  name: 'Window',    x: 0,        y: 0        },
    };
    const { w, h, name, x, y } = defaults[type] ?? { w: 100, h: 100, name: 'New Item', x: cx - 50, y: cy - 50 };
    const newEl = { id: generateId(), type, shape: 'rect', name, x, y, w, h, rotation: 0, parentId: null };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const addCustomRoom = (apartmentWidth, apartmentDepth) => {
    const newEl = {
      id: generateId(), type: 'room', shape: 'polygon', name: 'L-Shape Room',
      x: apartmentWidth / 2 - 150, y: apartmentDepth / 2 - 150,
      points: [
        { x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 300 },
        { x: 150, y: 300 }, { x: 150, y: 150 }, { x: 0, y: 150 },
      ],
      rotation: 0, parentId: null,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  // ── UPDATE ───────────────────────────────────────────────────────────────────

  const updateSelected = (key, value) => {
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, [key]: value } : el))
    );
  };

  /**
   * Rotate selected element by `delta` degrees (default 90).
   * Also works as the quick 90° button when called with no argument.
   */
  const rotateSelected = (delta = 90) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId
          ? { ...el, rotation: +(((( el.rotation ?? 0) + delta) % 360 + 360) % 360).toFixed(1) }
          : el
      )
    );
  };

  /** Set the rotation of the selected element to an exact degree value. */
  const setSelectedRotation = (deg) => {
    const normalised = +((((Number(deg)) % 360) + 360) % 360).toFixed(1);
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId ? { ...el, rotation: normalised } : el
      )
    );
  };

  // ── DELETE ───────────────────────────────────────────────────────────────────

  const deleteElement = (id) => {
    setElements((prev) =>
      prev
        .map((el) => (el.parentId === id ? { ...el, parentId: null } : el))
        .filter((el) => el.id !== id)
    );
    if (selectedId === id) setSelectedId(null);
  };

  // ── LAYER ORDER ──────────────────────────────────────────────────────────────

  const moveElementLayer = (index, direction) => {
    setElements((prev) => {
      const next = [...prev];
      if (direction === 'up' && index < next.length - 1) {
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
      } else if (direction === 'down' && index > 0) {
        [next[index], next[index - 1]] = [next[index - 1], next[index]];
      }
      return next;
    });
  };

  const bringToFront = (id) => {
    setElements((prev) => {
      const item = prev.find((el) => el.id === id);
      return item ? [...prev.filter((el) => el.id !== id), item] : prev;
    });
  };

  const sendToBack = (id) => {
    setElements((prev) => {
      const item = prev.find((el) => el.id === id);
      return item ? [item, ...prev.filter((el) => el.id !== id)] : prev;
    });
  };

  const selectedEl = elements.find((el) => el.id === selectedId) ?? null;
  const rooms = elements.filter((el) => el.type === 'room');

  return {
    elements, setElements,
    selectedId, setSelectedId, selectedEl,
    rooms,
    addRectElement, addCustomRoom,
    updateSelected, rotateSelected, setSelectedRotation,
    deleteElement,
    moveElementLayer, bringToFront, sendToBack,
  };
}
