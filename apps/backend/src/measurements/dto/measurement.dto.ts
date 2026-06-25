import { IsIn, IsNumber, Matches, Max, Min } from 'class-validator';

export const MEASUREMENT_TYPES = [
  'waist',
  'chest',
  'arm',
  'hip',
  'thigh',
  'shoulders',
  'calf',
  'neck',
] as const;

export class UpsertMeasurementDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data inválida (esperado YYYY-MM-DD)' })
  date!: string;

  @IsIn(MEASUREMENT_TYPES) type!: (typeof MEASUREMENT_TYPES)[number];

  @IsNumber() @Min(1) @Max(500) value!: number;
}
