import { describe, expect, it } from 'vitest';
import {
  cmToFeetInches,
  feetInchesToCm,
  kgToLb,
  lbToKg,
} from './units';

describe('conversões de peso', () => {
  it('kg <-> lb', () => {
    expect(kgToLb(100)).toBeCloseTo(220.462, 2);
    expect(lbToKg(220.462)).toBeCloseTo(100, 2);
  });
});

describe('conversões de altura', () => {
  it('cm -> pés/polegadas', () => {
    expect(cmToFeetInches(180)).toEqual({ feet: 5, inches: 11 });
    expect(cmToFeetInches(183)).toEqual({ feet: 6, inches: 0 });
  });

  it('normaliza 12 polegadas para o pé seguinte', () => {
    // 181.86 cm ≈ 71.6 in -> arredonda para 12 in -> 6'0"
    expect(cmToFeetInches(181.86)).toEqual({ feet: 6, inches: 0 });
  });

  it('pés/polegadas -> cm', () => {
    expect(feetInchesToCm(5, 11)).toBeCloseTo(180.34, 2);
  });
});
