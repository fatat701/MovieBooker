import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MoviesService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private http: HttpService,
    private config: ConfigService
  ) {
    this.baseUrl = this.config.get('TMDB_BASE_URL')!;
    this.apiKey = this.config.get('TMDB_API_KEY')!;
  }

  async getNowPlaying(page = 1, sort?: 'asc' | 'desc') {
    const url = `${this.baseUrl}/movie/now_playing?api_key=${this.apiKey}&language=fr-FR&page=${page}`;
    try {
      const response = await firstValueFrom(this.http.get(url));
      let movies = response.data.results;

      if (sort === 'asc') {
        movies = movies.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'desc') {
        movies = movies.sort((a, b) => b.title.localeCompare(a.title));
      }

      return { ...response.data, results: movies };
    } catch (err) {
      throw new HttpException('Erreur TMDB: ' + err.message, 500);
    }
  }


  async searchMovies(query: string, page = 1) {
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=fr-FR&query=${query}&page=${page}`;
    try {
      const response = await firstValueFrom(this.http.get(url));
      return response.data;
    } catch (err) {
      throw new HttpException('Erreur recherche TMDB: ' + err.message, 500);
    }
  }
}
