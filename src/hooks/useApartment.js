import { useState, useEffect } from 'react';

const DEFAULT_APARTMENT = { width: 1000, depth: 800 };
const STORAGE_KEY = 'apartmentConfig';

/**
 * Manages the apartment/plot dimensions with local-storage persistence.
 */
export function useApartment() {
  const [apartment, setApartment] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_APARTMENT;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apartment));
  }, [apartment]);

  return { apartment, setApartment };
}
