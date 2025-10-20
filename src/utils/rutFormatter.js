/**
 * Formatea un RUT al formato visual: 11.111.111-1
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado
 */
export function formatRut(rut) {
  // Eliminar todo lo que no sea número o K
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  
  if (cleanRut.length < 2) {
    return cleanRut;
  }
  
  // Separar número y dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  // Formatear con puntos
  const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedNumber}-${dv}`;
}

/**
 * Normaliza un RUT al formato de BD: 111111111 (sin puntos ni guión)
 * @param {string} rut - RUT formateado o sin formato
 * @returns {string} RUT normalizado
 */
export function normalizeRut(rut) {
  return rut.replace(/[.\-]/g, '').toUpperCase();
}

// Nuevo: normaliza a 11111111-1 (sin puntos, con guión)
export function normalizeRutWithDash(rut) {
  const clean = rut.replace(/[.\-]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${body}-${dv}`;
}

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {boolean} true si es válido
 */
export function validateRut(rut) {
  const cleanRut = normalizeRut(rut);
  
  if (cleanRut.length < 8 || cleanRut.length > 9) {
    return false;
  }
  
  const rutNumber = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  // Validar que el cuerpo sea solo números
  if (!/^\d+$/.test(rutNumber)) {
    return false;
  }
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const calculatedDv = 11 - (sum % 11);
  let expectedDv;
  
  if (calculatedDv === 11) {
    expectedDv = '0';
  } else if (calculatedDv === 10) {
    expectedDv = 'K';
  } else {
    expectedDv = calculatedDv.toString();
  }
  
  return dv === expectedDv;
}