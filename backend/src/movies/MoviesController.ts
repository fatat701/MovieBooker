import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MoviesService } from './MoviesService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Films')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('movies')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Get('now-playing')
  @ApiOperation({ summary: 'Films en salle actuellement (paginés, triables)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page des résultats' })
  @ApiQuery({ name: 'sort', required: false, example: 'asc', description: 'Tri alphabétique asc ou desc' })
  getNowPlaying(
    @Query('page') page = 1,
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    return this.moviesService.getNowPlaying(+page, sort);
  }
  @Get('search')
  @ApiOperation({ summary: 'Recherche de films par titre' })
  @ApiQuery({ name: 'tittle', required: true })
  @ApiQuery({ name: 'page', required: false })
  search(@Query('tittle') tittle: string, @Query('page') page = 1) {
    return this.moviesService.searchMovies(tittle, +page);
  }
}
