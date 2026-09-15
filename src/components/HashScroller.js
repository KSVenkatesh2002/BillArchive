"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function HashScroller() {
  const pathname = usePathname();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        // Use setTimeout to ensure DOM is fully rendered before scrolling
        setTimeout(() => {
          const id = hash.replace('#', '');
          const element = document.getElementById(id);
          if (element) {
            // Offset for the sticky header
            const headerOffset = 90; 
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    };

    // Run on mount and path change
    handleHash();

    // Listen to hash changes
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [pathname]);

  return null;
}
