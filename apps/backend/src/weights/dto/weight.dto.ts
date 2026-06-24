import { IsNumber, Matches, Max, Min } from 'class-validator';

export class UpsertWeightDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data inválida (esperado YYYY-MM-DD)' })
  date!: string;

  @IsNumber() @Min(20) @Max(400) weightKg!: number;
}
