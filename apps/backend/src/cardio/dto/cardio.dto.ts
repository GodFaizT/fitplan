import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const CARDIO_TYPES = [
  'run',
  'walk',
  'bike',
  'swim',
  'row',
  'elliptical',
  'hike',
  'other',
] as const;

/** Registo de uma sessão de cardio. Distância e calorias são opcionais. */
export class CreateCardioDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data inválida (esperado YYYY-MM-DD)' })
  date!: string;

  @IsIn(CARDIO_TYPES) type!: (typeof CARDIO_TYPES)[number];

  @IsInt() @Min(1) @Max(1440) durationMin!: number;

  @IsOptional() @IsNumber() @Min(0) @Max(1000) distanceKm?: number;

  @IsOptional() @IsInt() @Min(0) @Max(20000) calories?: number;

  @IsOptional() @IsString() @MaxLength(200) note?: string;
}
