import { useEffect } from 'react';

function removeAriaHiddenFromAll() {
  document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
    if (el.id === 'main-content') {
      el.removeAttribute('aria-hidden');
    }
  });
}

/**
 * Custom hook to fix aria-hidden being applied to focusable areas like <main>
 * after a Material UI Dialog is opened.
 * 
 * @param isOpen - boolean that indicates whether the dialog is open
 */
export function useAriaHiddenFixOnDialog(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        removeAriaHiddenFromAll();
      }, 100); // delay allows MUI to apply changes first
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);
}