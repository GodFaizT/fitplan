import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class SetLogDto {
  @IsString() @MaxLength(120) exerciseName!: string;
  @IsOptional() @IsString() @MaxLength(60) muscleGroup?: string;
  @IsInt() @Min(1) @Max(50) setNumber!: number;
  @IsOptional() @IsNumber() @Min(0) @Max(2000) weight?: number;
  @IsOptional() @IsInt() @Min(0) @Max(1000) reps?: number;
}

export class CreateSessionDto {
  @IsOptional() @IsString() planId?: string;
  @IsOptional() @IsString() @MaxLength(120) planName?: string;
  @IsOptional() @IsString() @MaxLength(120) dayLabel?: string;
  @IsOptional() @IsInt() @Min(0) @Max(86400) durationSec?: number;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetLogDto)
  sets!: SetLogDto[];
}
