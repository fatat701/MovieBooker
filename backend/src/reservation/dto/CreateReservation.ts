import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservation {
  @ApiProperty()
  @IsNumber()
  movieId: number;

  @ApiProperty()
  @IsNotEmpty()
  movieTitle: string;

  @ApiProperty({ description: 'Format: YYYY-MM-DDTHH:mm:ssZ' })
  @IsDateString()
  startTime: string;
}
