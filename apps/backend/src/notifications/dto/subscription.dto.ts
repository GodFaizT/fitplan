import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

class SubscriptionKeysDto {
  @IsString() p256dh!: string;
  @IsString() auth!: string;
}

export class SubscriptionDto {
  @IsString() endpoint!: string;

  @ValidateNested()
  @Type(() => SubscriptionKeysDto)
  keys!: SubscriptionKeysDto;
}

export class UnsubscribeDto {
  @IsString() endpoint!: string;
}
