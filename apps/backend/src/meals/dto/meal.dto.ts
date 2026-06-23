import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const MEAL_TYPES = [
  'pequeno-almoco',
  'almoco',
  'lanche',
  'jantar',
  'ceia',
  'outro',
];

export class AddMealDto {
  @IsIn(MEAL_TYPES) type!: string;
  @IsOptional() @IsString() @MaxLength(60) label?: string;
}

export class UpdateMealDto {
  @IsOptional() @IsIn(MEAL_TYPES) type?: string;
  @IsOptional() @IsString() @MaxLength(60) label?: string;
  @IsOptional() @IsBoolean() consumed?: boolean;
  @IsOptional() @IsInt() @Min(0) position?: number;
}

export class AddItemDto {
  @IsString() @MaxLength(120) name!: string;
  @IsNumber() @Min(0) quantity!: number;
  @IsString() @MaxLength(20) unit!: string;
  @IsNumber() @Min(0) calories!: number;
  @IsNumber() @Min(0) protein!: number;
  @IsNumber() @Min(0) carbs!: number;
  @IsNumber() @Min(0) fat!: number;
}

export class UpdateItemDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsNumber() @Min(0) quantity?: number;
  @IsOptional() @IsString() @MaxLength(20) unit?: string;
  @IsOptional() @IsNumber() @Min(0) calories?: number;
  @IsOptional() @IsNumber() @Min(0) protein?: number;
  @IsOptional() @IsNumber() @Min(0) carbs?: number;
  @IsOptional() @IsNumber() @Min(0) fat?: number;
}
