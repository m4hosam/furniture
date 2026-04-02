import { useRef } from 'react';

/**
 * Handles JSON export/import and layout reset.
 *
 * @param {Object}   apartment   - Current apartment config
 * @param {Array}    elements    - Current elements array
 * @param {Function} setApartment
 * @param {Function} setElements
 * @param {Function} setSelectedId
 */
export function useFileIO({ apartment, elements, setApartment, setElements, setSelectedId }) {
  const fileInputRef = useRef(null);

  const exportToJson = () => {
    const json = JSON.stringify({ apartment, elements }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apartment_layout.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFromJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.apartment && parsed.elements) {
          setApartment(parsed.apartment);
          setElements(parsed.elements);
          setSelectedId(null);
        } else {
          alert('Invalid file format. Please upload a valid layout JSON.');
        }
      } catch {
        alert('Error parsing JSON file. The file might be corrupted.');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const resetLayout = () => {
    if (window.confirm('Are you sure you want to reset the layout? This will delete all your current changes.')) {
      localStorage.removeItem('apartmentConfig');
      localStorage.removeItem('apartmentElements');
      window.location.reload();
    }
  };

  return { fileInputRef, exportToJson, importFromJson, triggerFileInput, resetLayout };
}
