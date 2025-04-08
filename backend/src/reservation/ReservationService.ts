import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './Reservation';
import { Repository } from 'typeorm';
import { CreateReservation } from './dto/CreateReservation';
import { User } from '../user/User';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
  ) {}

  async create(createDto: CreateReservation, user: User) {
    console.log('createDto:', createDto);
    console.log('user:', user);
  
    const start = new Date(createDto.startTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2h plus tard
  
    const overlap = await this.reservationRepo
      .createQueryBuilder('r')
      .where('r.user = :userId', { userId: user.id })
      .andWhere('r.startTime BETWEEN :from AND :to', {
        from: new Date(start.getTime() - 2 * 60 * 60 * 1000),
        to: new Date(start.getTime() + 2 * 60 * 60 * 1000),
      })
      .getOne();
  
    if (overlap) {
      throw new BadRequestException("Tu as déjà une réservation dans ce créneau de 2h.");
    }
  
    const reservation = this.reservationRepo.create({
      ...createDto,
      startTime: start,
      user,
    });
  
    return this.reservationRepo.save(reservation);
  }
  

  findMine(user: User) {
    return this.reservationRepo.find({
      where: { user },
      order: { startTime: 'ASC' },
      select: ['id', 'movieTitle', 'startTime'], // 👈 juste ce qui t'intéresse
    });
  }
  
  async cancel(id: number, user: User) {
    const reservation = await this.reservationRepo.findOne({ where: { id }, relations: ['user'] });

    if (!reservation) throw new NotFoundException('Réservation non trouvée');
    if (reservation.user.id !== user.id) throw new BadRequestException("Tu ne peux annuler que tes propres réservations");

    return this.reservationRepo.remove(reservation);
  }
}
