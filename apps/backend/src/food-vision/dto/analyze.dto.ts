import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/** Pedido de análise de uma foto de refeição (data URL de imagem comprimida). */
export class AnalyzeFoodDto {
  @Matches(/^data:image\/(jpe?g|png|webp);base64,[A-Za-z0-9+/=]+$/, {
    message: 'Imagem inválida',
  })
  @MaxLength(8_000_000)
  dataUrl!: string;

  /** Pista opcional do utilizador (ex.: "frango com arroz"). */
  @IsOptional() @IsString() @MaxLength(200) hint?: string;
}
