import { IsInt, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateProgressPhotoDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date deve ser YYYY-MM-DD' })
  date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;

  /** Data URL: data:image/jpeg;base64,…  (imagem já comprimida no cliente). */
  @IsString()
  @MaxLength(8_000_000)
  dataUrl!: string;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;
}
