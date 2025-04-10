import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/AuthModule';
import { User } from './user/User';
import { MoviesModule } from './movies/movies.module';
import { ReservationModule } from './reservation/ReservationModule';
import { Reservation } from './reservation/Reservation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST')!,
        port: parseInt(config.get<string>('DB_PORT')!, 10),
        username: config.get<string>('DB_USERNAME')!,
        password: config.get<string>('DB_PASSWORD')!,
        database: config.get<string>('DB_NAME')!,
        entities: [User, Reservation],
        synchronize: true, 
      }),
    }),

   
    AuthModule,
    MoviesModule,
    ReservationModule,
  ],
})
export class AppModule {}
