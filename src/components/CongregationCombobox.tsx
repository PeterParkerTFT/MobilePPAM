/**
 * CongregationCombobox - Selector de congregación con búsqueda
 * @description Combobox minimalista para seleccionar congregación
 * @architecture SOLID - Single Responsibility + Open/Closed
 */

import React, { useState, useRef, useEffect } from 'react';
import { Church, Search, Check, ChevronDown, X } from 'lucide-react';
import { Congregacion } from '../types/models';

interface CongregationComboboxProps {
  /** Congregaciones disponibles */
  congregaciones: Congregacion[];

  /** ID de congregación seleccionada */
  value: string;

  /** Callback cuando cambia la selección */
  onChange: (congregacionId: string) => void;

  /** Placeholder del input */
  placeholder?: string;

  /** Si el campo es requerido */
  required?: boolean;

  /** Si el campo está deshabilitado */
  disabled?: boolean;

  /** Mensaje de ayuda */
  helperText?: string;

  /** Clase CSS adicional */
  className?: string;
}

/**
 * Combobox de congregación con búsqueda en tiempo real
 * 
 * Features:
 * - Búsqueda por nombre, ciudad o estado
 * - Teclado accesible (Enter, Escape, Arrow keys)
 * - Click outside para cerrar
 * - Diseño minimalista corporativo
 */
export function CongregationCombobox({
  congregaciones,
  value,
  onChange,
  placeholder = 'Buscar congregación...',
  required = false,
  disabled = false,
  helperText,
  className = '',
}: CongregationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Congregación seleccionada
  const selectedCongregacion = congregaciones.find(c => c.id === value);

  // Filtrar congregaciones según búsqueda
  const filteredCongregaciones = congregaciones.filter(cong => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      cong.nombre.toLowerCase().includes(query) ||
      (cong.ciudad?.toLowerCase() || '').includes(query) ||
      (cong.estado?.toLowerCase() || '').includes(query)
    );
  });

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredCongregaciones[highlightedIndex]) {
          handleSelect(filteredCongregaciones[highlightedIndex].id);
        } else {
          setIsOpen(true);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev =>
            prev < filteredCongregaciones.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredCongregaciones.length - 1
          );
        }
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
    }
  };

  // Seleccionar congregación
  const handleSelect = (congregacionId: string) => {
    onChange(congregacionId);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(0);
  };

  // Limpiar selección
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  // Toggle dropdown
  const handleToggle = () => {
    if (disabled) return;

    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-light mb-2 text-[#333333] flex items-center gap-2">
        <Church className="w-4 h-4 text-[#594396]" strokeWidth={1.5} />
        Congregación {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input Container */}
      <div
        className={`
          relative border-b-2 transition-all cursor-pointer
          ${disabled
            ? 'bg-[#F7F7F7] border-[#E0E0E0] opacity-60 cursor-not-allowed'
            : isOpen
              ? 'bg-white border-[#594396]'
              : 'bg-[#F7F7F7] border-[#E0E0E0] hover:border-[#999999]'
          }
        `}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="congregacion-listbox"
        tabIndex={disabled ? -1 : 0}
      >
        <div className="flex items-center gap-2 px-4 py-3 min-h-[44px]">
          {/* Icono de búsqueda o iglesia */}
          {isOpen ? (
            <Search className="w-5 h-5 text-[#999999]" strokeWidth={1.5} />
          ) : (
            <Church className="w-5 h-5 text-[#594396]" strokeWidth={1.5} />
          )}

          {/* Input / Display */}
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder={placeholder}
              className="flex-1 outline-none bg-transparent text-[#333333] placeholder-[#999999]"
              disabled={disabled}
              aria-autocomplete="list"
              aria-controls="congregacion-listbox"
            />
          ) : (
            <div className="flex-1 text-[#333333]">
              {selectedCongregacion ? (
                <div>
                  <span className="font-medium">{selectedCongregacion.nombre}</span>
                  <span className="text-[#666666] text-sm ml-2">
                    {selectedCongregacion.ciudad}, {selectedCongregacion.estado}
                  </span>
                </div>
              ) : (
                <span className="text-[#999999]">{placeholder}</span>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-1">
            {selectedCongregacion && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-[#E0E0E0] rounded-full transition-colors"
                aria-label="Limpiar selección"
              >
                <X className="w-4 h-4 text-[#666666]" strokeWidth={2} />
              </button>
            )}

            <ChevronDown
              className={`w-5 h-5 text-[#666666] transition-transform ${isOpen ? 'rotate-180' : ''}`}
              strokeWidth={1.5}
            />
          </div>
        </div>
      </div>

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div
          id="congregacion-listbox"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-[#E0E0E0] rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredCongregaciones.length > 0 ? (
            <ul className="py-1">
              {filteredCongregaciones.map((cong, index) => {
                const isSelected = cong.id === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={cong.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(cong.id)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      px-4 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3
                      ${isHighlighted ? 'bg-[#F7F7F7]' : ''}
                      ${isSelected ? 'bg-[#594396]/10' : ''}
                      hover:bg-[#F7F7F7]
                    `}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Church
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: isSelected ? '#594396' : '#999999' }}
                        strokeWidth={1.5}
                      />

                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium truncate"
                          style={{ color: isSelected ? '#594396' : '#333333' }}
                        >
                          {cong.nombre}
                        </div>
                        <div className="text-xs text-[#666666] truncate">
                          {cong.ciudad}, {cong.estado}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check
                        className="w-5 h-5 text-[#594396] flex-shrink-0"
                        strokeWidth={2}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-[#999999]">
              <Church className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1.5} />
              <p className="text-sm">No se encontraron congregaciones</p>
              <p className="text-xs mt-1">Intenta con otra búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <p className="text-xs text-[#666666] mt-2 italic flex items-start gap-1">
          <span className="inline-block w-4 h-4 flex-shrink-0 mt-0.5">ℹ️</span>
          <span>{helperText}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Ejemplo de uso:
 * 
 * ```tsx
 * import { CongregationCombobox } from './components/CongregationCombobox';
 * import { congregaciones } from './data/congregaciones';
 * 
 * function MyForm() {
 *   const [selectedCong, setSelectedCong] = useState('');
 *   
 *   return (
 *     <CongregationCombobox
 *       congregaciones={congregaciones}
 *       value={selectedCong}
 *       onChange={setSelectedCong}
 *       required
 *       helperText="Su solicitud será enviada a los ancianos de esta congregación"
 *     />
 *   );
 * }
 * ```
 */
