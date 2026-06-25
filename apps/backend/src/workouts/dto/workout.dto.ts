import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @IsString() @MaxLength(80) name!: string;
}

export class UpdatePlanDto {
  @IsOptional() @IsString() @MaxLength(80) name?: string;
  @IsOptional() @IsBoolean() isShared?: boolean;
}

export class CreateDayDto {
  @IsString() @MaxLength(40) label!: string;
  @IsOptional() @IsString() @MaxLength(80) title?: string;
}

export class UpdateDayDto {
  @IsOptional() @IsString() @MaxLength(40) label?: string;
  @IsOptional() @IsString() @MaxLength(80) title?: string;
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  scheduledDays?: number[];
}

export class CreateExerciseDto {
  @IsOptional() @IsString() libraryId?: string;
  @IsString() @MaxLength(120) name!: string;
  @IsOptional() @IsString() @MaxLength(60) muscleGroup?: string;
  @IsInt() @Min(1) sets!: number;
  @IsString() @MaxLength(20) reps!: string;
  @IsInt() @Min(0) restSeconds!: number;
  @IsOptional() @IsNumber() @Min(0) weight?: number;
  @IsOptional() @IsString() @MaxLength(400) videoUrl?: string;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) imageUrls?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) instructions?: string[];
}

export class UpdateExerciseDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(60) muscleGroup?: string;
  @IsOptional() @IsInt() @Min(1) sets?: number;
  @IsOptional() @IsString() @MaxLength(20) reps?: string;
  @IsOptional() @IsInt() @Min(0) restSeconds?: number;
  @IsOptional() @IsNumber() @Min(0) weight?: number;
  @IsOptional() @IsString() @MaxLength(400) videoUrl?: string;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

export class ReorderDto {
  @IsArray() @ArrayNotEmpty() @IsString({ each: true }) ids!: string[];
}

export class JoinPlanDto {
  @IsString() @MaxLength(40) code!: string;
}
