import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFoodDto {
  @IsString() @MaxLength(120) name!: string;
  @IsNumber() @Min(0.01) per!: number; // base de referência (ex: 100)
  @IsString() @MaxLength(20) unit!: string;
  @IsNumber() @Min(0) calories!: number;
  @IsNumber() @Min(0) protein!: number;
  @IsNumber() @Min(0) carbs!: number;
  @IsNumber() @Min(0) fat!: number;
}

export class UpdateFoodDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsNumber() @Min(0.01) per?: number;
  @IsOptional() @IsString() @MaxLength(20) unit?: string;
  @IsOptional() @IsNumber() @Min(0) calories?: number;
  @IsOptional() @IsNumber() @Min(0) protein?: number;
  @IsOptional() @IsNumber() @Min(0) carbs?: number;
  @IsOptional() @IsNumber() @Min(0) fat?: number;
}
