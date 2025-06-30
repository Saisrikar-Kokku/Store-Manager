import React from 'react';

// This component is hidden by default. To show it, set the 'data-global-loading' attribute to 'true' on the body.
export default function GlobalLoadingOverlay() {
  if (typeof window !== 'undefined' && document.body.getAttribute('data-global-loading') !== 'true') {
    return null;
  }
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 pointer-events-auto">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
    </div>
  );
} 