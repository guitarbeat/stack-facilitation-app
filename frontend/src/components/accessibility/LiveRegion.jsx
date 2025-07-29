import { useEffect, useRef } from 'react';

/**
 * LiveRegion component for announcing dynamic content changes to screen readers
 * Implements WCAG 2.2 guidelines for live regions
 */
function LiveRegion({ 
  message, 
  level = 'polite', 
  clearAfter = 5000,
  className = 'sr-only' 
}) {
  const regionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set the message
      regionRef.current.textContent = message;

      // Clear the message after specified time to prevent repetition
      if (clearAfter > 0) {
        timeoutRef.current = setTimeout(() => {
          if (regionRef.current) {
            regionRef.current.textContent = '';
          }
        }, clearAfter);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  return (
    <div
      ref={regionRef}
      aria-live={level}
      aria-atomic="true"
      className={className}
      role={level === 'assertive' ? 'alert' : 'status'}
    />
  );
}

export default LiveRegion;

