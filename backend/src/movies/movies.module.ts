import { Module } from '@nestjs/common';
import { MoviesService } from './MoviesService';
import { MoviesController } from './MoviesController';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [MoviesService],
  controllers: [MoviesController],
})
export class MoviesModule {}
