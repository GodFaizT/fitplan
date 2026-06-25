import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const MEAL_TYPES = [
  'pequeno-almoco',
  'almoco',
  'lanche',
  'jantar',
  'ceia',
  'outro',
];

export class TemplateItemDto {
  @IsString() @MaxLength(120) name!: string;
  @IsNumber() @Min(0) quantity!: number;
  @IsString() @MaxLength(20) unit!: string;
  @IsNumber() @Min(0) calories!: number;
  @IsNumber() @Min(0) protein!: number;
  @IsNumber() @Min(0) carbs!: number;
  @IsNumber() @Min(0) fat!: number;
}

export class CreateTemplateDto {
  @IsString() @MaxLength(80) name!: string;

  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TemplateItemDto)
  items!: TemplateItemDto[];
}

export class ApplyTemplateDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data inválida (esperado YYYY-MM-DD)' })
  date!: string;

  @IsOptional() @IsIn(MEAL_TYPES) type?: string;
  @IsOptional() @IsString() @MaxLength(60) label?: string;
}
