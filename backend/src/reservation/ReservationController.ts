import { Controller, Post, Get, Delete, Param, Body, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReservationService } from './ReservationService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReservation } from './dto/CreateReservation';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Réservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Post()
  @ApiOperation({ summary: 'Réserver un film à une heure précise' })
  reserve(@Body() dto: CreateReservation, @Req() req) {
    return this.reservationService.create(dto, req.user);
  }


  @Get('mine')
  @ApiOperation({ summary: 'Afficher mes réservations' })
  findMine(@Req() req) {
    return this.reservationService.findMine(req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Annuler une réservation' })
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reservationService.cancel(id, req.user);
  }
}
