import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const SEXES = ['male', 'female'];
const ACTIVITY = ['sedentary', 'light', 'moderate', 'very', 'extra'];
const GOALS = ['lose', 'maintain', 'gain'];
const INTENSITY = ['light', 'moderate', 'aggressive'];
const UNITS = ['metric', 'imperial'];
const THEMES = ['dark', 'light'];

/** Atualização do perfil (dados pessoais + preferências). Tudo opcional. */
export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(80) name?: string;
  @IsOptional() @IsIn(SEXES) sex?: string;
  @IsOptional() @IsInt() @Min(10) @Max(120) age?: number;
  @IsOptional() @IsNumber() @Min(20) @Max(400) weightKg?: number;
  @IsOptional() @IsNumber() @Min(80) @Max(260) heightCm?: number;
  @IsOptional() @IsNumber() @Min(20) @Max(400) targetWeightKg?: number;
  @IsOptional() @IsIn(ACTIVITY) activityLevel?: string;
  @IsOptional() @IsIn(GOALS) goal?: string;
  @IsOptional() @IsIn(INTENSITY) goalIntensity?: string;
  @IsOptional() @IsIn(UNITS) units?: string;
  @IsOptional() @IsString() @MaxLength(20) accentColor?: string;
  @IsOptional() @IsIn(THEMES) theme?: string;
}
