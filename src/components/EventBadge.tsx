import React from 'react';
import { getEventType } from '../constants/eventTypes';
import { useThemeColors } from '../hooks/useThemeColors';

interface EventBadgeProps {
  tipo: string;
  variant?: 'default' | 'large' | 'compact';
  showImage?: boolean;
}

export function EventBadge({ tipo, variant = 'default', showImage = false }: EventBadgeProps) {
  const colors = useThemeColors();
  const eventType = getEventType(tipo);

  if (!eventType) {
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

  if (variant === 'large' && showImage && eventType.image) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div 
          className="w-20 h-20 rounded-2xl overflow-hidden shadow-md"
          style={{ 
            backgroundColor: `rgba(${eventType.color}, 0.1)`,
            border: `2px solid rgba(${eventType.color}, 0.3)`
          }}
        >
          <img 
            src={eventType.image} 
            alt={eventType.label}
            className="w-full h-full object-cover"
          />
        </div>
        <span 
          className="text-xs font-semibold text-center"
          style={{ color: `rgb(${eventType.color})` }}
        >
          {eventType.label}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5">
        {eventType.image && showImage ? (
          <div className="w-5 h-5 rounded-full overflow-hidden">
            <img 
              src={eventType.image} 
              alt={eventType.label}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <span className="text-sm">{eventType.icon}</span>
        )}
        <span 
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: `rgb(${eventType.color})` }}
        >
          {eventType.label}
        </span>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ 
        backgroundColor: `rgba(${eventType.color}, 0.12)`,
        border: `1px solid rgba(${eventType.color}, 0.3)`
      }}
    >
      {eventType.image && showImage ? (
        <div className="w-6 h-6 rounded-full overflow-hidden">
          <img 
            src={eventType.image} 
            alt={eventType.label}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <span className="text-sm">{eventType.icon}</span>
      )}
      <span 
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: `rgb(${eventType.color})` }}
      >
        {eventType.label}
      </span>
    </div>
  );
}
