import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: 'A nova password deve ter pelo menos 8 caracteres' })
  @MaxLength(72)
  newPassword!: string;
}
