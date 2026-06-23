/**
 * Conversões de unidades métricas <-> imperiais (PROJECT.md 4.1, critério de
 * aceitação "suporta unidades métricas e imperiais"). Os cálculos de nutrição
 * usam sempre métrico internamente; estas funções convertem para apresentação.
 */

const KG_PER_LB = 0.45359237;
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH;
}

export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

/** Converte cm para pés + polegadas (ex: 180 cm -> { feet: 5, inches: 11 }). */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cmToInches(cm);
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  const inches = Math.round(totalInches - feet * INCHES_PER_FOOT);
  // arredondamento pode dar 12 polegadas — normalizar
  if (inches === INCHES_PER_FOOT) {
    return { feet: feet + 1, inches: 0 };
  }
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return inchesToCm(feet * INCHES_PER_FOOT + inches);
}
