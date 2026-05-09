import React, { useMemo } from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12" }) => {
  // Generate unique IDs to prevent SVG defs collisions when multiple logos are rendered in the DOM
  const uniqueId = useMemo(() => Math.random().toString(36).substring(2, 9), []);
  const gradId = `logo-grad-${uniqueId}`;
  const maskId = `leaf-cut-${uniqueId}`;

  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ade80"/> {/* Bright green top-left */}
          <stop offset="1" stopColor="#065f46"/> {/* Dark emerald bottom-right */}
        </linearGradient>
        <mask id={maskId}>
          <rect width="100" height="100" fill="white" />
          {/* The diagonal cut line from bottom-left to center */}
          <path d="M 14 86 L 54 46" stroke="black" strokeWidth="7" strokeLinecap="round" />
        </mask>
      </defs>
      
      {/* Background Gradient */}
      <rect width="100" height="100" rx="24" fill={`url(#${gradId})`}/>
      
      {/* Leaf Shape with Mask */}
      <path 
        d="M 82 18 C 30 18 18 30 18 82 C 70 82 82 70 82 18 Z" 
        fill="white" 
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};
