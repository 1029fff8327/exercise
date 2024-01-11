import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ActivateAccountDto {
  @ApiProperty({
    example: 'your-activation-token',
    description: 'Activation token',
  })
  @IsString({ message: 'Should be a string' })
  readonly token: string;
}
