import React from 'react';
import { getPredicacionType } from '../constants/predicacionTypes';
import { useThemeColors } from '../hooks/useThemeColors';

interface PredicacionBadgeProps {
  tipo: string;
  variant?: 'default' | 'large' | 'compact';
  showImage?: boolean;
}

export function PredicacionBadge({ tipo, variant = 'default', showImage = false }: PredicacionBadgeProps) {
  const colors = useThemeColors();
  const predicacionType = getPredicacionType(tipo);

  if (!predicacionType) {
    return (
      <span 
        className="text-xs px-2.5 py-1 rounded-full uppercase font-semibold"
        style={{ 
          backgroundColor: `rgba(${colors.interactive.primary}, 0.12)`,
          color: `rgb(${colors.interactive.primary})`
        }}
      >
        {tipo}
      </span>
    );
  }

  if (variant === 'large' && showImage && predicacionType.image) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div 
          className="w-20 h-20 rounded-2xl overflow-hidden shadow-md"
          style={{ 
            backgroundColor: `rgba(${predicacionType.color}, 0.1)`,
            border: `2px solid rgba(${predicacionType.color}, 0.3)`
          }}
        >
          <img 
            src={predicacionType.image} 
            alt={predicacionType.label}
            className="w-full h-full object-cover"
          />
        </div>
        <span 
          className="text-xs font-semibold text-center"
          style={{ color: `rgb(${predicacionType.color})` }}
        >
          {predicacionType.label}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{predicacionType.icon}</span>
        <span 
          className="text-xs font-semibold"
          style={{ color: `rgb(${predicacionType.color})` }}
        >
          {predicacionType.label}
        </span>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ 
        backgroundColor: `rgba(${predicacionType.color}, 0.12)`,
        border: `1px solid rgba(${predicacionType.color}, 0.3)`
      }}
    >
      {predicacionType.image && showImage ? (
        <div className="w-6 h-6 rounded-full overflow-hidden">
          <img 
            src={predicacionType.image} 
            alt={predicacionType.label}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <span className="text-sm">{predicacionType.icon}</span>
      )}
      <span 
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: `rgb(${predicacionType.color})` }}
      >
        {predicacionType.label}
      </span>
    </div>
  );
}
