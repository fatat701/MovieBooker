import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservation {
  @ApiProperty()
  @IsNumber()
  movieId: number;

  @ApiProperty()
  @IsNotEmpty()
  movieTitle: string;

  @ApiProperty({
    example: '2025-04-10 14:00',
    description: 'Format attendu : YYYY-MM-DD HH:mm (heure locale)',
  })
  startTime: string;
  


  
}
