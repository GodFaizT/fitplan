import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'A password deve ter pelo menos 8 caracteres' })
  @MaxLength(72, { message: 'A password é demasiado longa' })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;
}
