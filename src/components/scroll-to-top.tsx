'use client';

import { useEffect } from 'react';

// This component ensures that the user is scrolled to the top of the page on mount.
export function ScrollToTop() {
  useEffect(() => {
    // A timeout is used to ensure this runs after the browser's own scroll restoration.
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
