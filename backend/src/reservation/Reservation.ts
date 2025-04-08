import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/User';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movieId: number;

  @Column()
  movieTitle: string;

  @Column()
  startTime: Date;


  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
user: User;



  @CreateDateColumn()
  createdAt: Date;
}
