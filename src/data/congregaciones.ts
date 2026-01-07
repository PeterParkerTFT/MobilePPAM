// Lista de congregaciones disponibles en el sistema
export interface Congregacion {
  id: string;
  nombre: string;
  ciudad: string;
  estado: string;
  circuito: number; // Circuito al que pertenece la congregación (1-20)
  adminIds?: string[]; // IDs de los ancianos/admins de esta congregación
}

export const congregaciones: Congregacion[] = [
  {
    id: 'cong-001',
    nombre: 'Villa Guerrero',
    ciudad: 'Villa Guerrero',
    estado: 'Estado de México',
    circuito: 15,
    adminIds: [] // Se llenará con IDs reales de admins
  },
  {
    id: 'cong-002',
    nombre: 'Lomas de Polanco',
    ciudad: 'Polanco',
    estado: 'Estado de México',
    circuito: 8,
    adminIds: []
  },
  {
    id: 'cong-003',
    nombre: 'Arboledas del Sur',
    ciudad: 'Arboledas',
    estado: 'Estado de México',
    circuito: 12,
    adminIds: []
  },
  {
    id: 'cong-004',
    nombre: 'La Calma',
    ciudad: 'Zapopan',
    estado: 'Jalisco',
    circuito: 3,
    adminIds: []
  },
  {
    id: 'cong-005',
    nombre: 'Centro Guadalajara',
    ciudad: 'Guadalajara',
    estado: 'Jalisco',
    circuito: 1,
    adminIds: []
  },
  {
    id: 'cong-006',
    nombre: 'Tlalnepantla Norte',
    ciudad: 'Tlalnepantla',
    estado: 'Estado de México',
    circuito: 5,
    adminIds: []
  },
  {
    id: 'cong-007',
    nombre: 'Satélite',
    ciudad: 'Naucalpan',
    estado: 'Estado de México',
    circuito: 7,
    adminIds: []
  },
  {
    id: 'cong-008',
    nombre: 'Cuautitlán Izcalli',
    ciudad: 'Cuautitlán Izcalli',
    estado: 'Estado de México',
    circuito: 10,
    adminIds: []
  }
];

// Función helper para obtener una congregación por ID
export const getCongregacionById = (id: string): Congregacion | undefined => {
  return congregaciones.find(c => c.id === id);
};

// Función helper para obtener el nombre de una congregación
export const getCongregacionNombre = (id: string): string => {
  const congregacion = getCongregacionById(id);
  return congregacion ? congregacion.nombre : 'Congregación no encontrada';
};