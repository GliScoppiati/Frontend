import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SearchInput {
  filterType: string;
  filterName: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private cocktailAPI: string = 'http://localhost:5000/cocktail/single/';
  private ingredientAPI = 'http://localhost:5000/cocktail/ingredients';
  private searchAPI: string = 'http://localhost:5000/search/cocktails';
  private searchExternalAPI: string = 'http://localhost:5000/imagefetcher/imagesearch/search?query=';
  private importFilterAPI = 'http://localhost:5000/search/cocktails/filters?filterType=';
  private randomCocktailAPI: string = 'http://localhost:5000/search/cocktails/random-images?count=';


  constructor(
    private http: HttpClient
  ) { }

  getRandomCocktails(count: number): Observable<any> {
    return this.http.get(`${this.randomCocktailAPI}${count}`);
  }

  getCocktailFilters(filterType: string): Observable<any> {
    return this.http.get<{ name: string }[]>(`${this.importFilterAPI}${filterType}`);
  }

  getCocktailIngredients(): Observable<any> {
    return this.http.get(`${this.ingredientAPI}`);
  }

  getSingleCocktail(id: string): Observable<any> {
    return this.http.get(`${this.cocktailAPI}${id}`);
  }

  fetchCocktailImage(query: string): Observable<any> {
    return this.http.get(`${this.searchExternalAPI}${query}`);
  }

  searchCocktails(filters: SearchInput[]): Observable<any> {
    return this.http.post(`${this.searchAPI}`, { filters: filters });
  }

  searchCocktailsForAdmin(filters: any[]): Observable<any> {
    console.log('filters', filters);
    return this.http.post(`${this.searchAPI}`, {filters: filters}, );
  }
}
