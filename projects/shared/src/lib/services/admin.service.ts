import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  // * API URL

  // * import Database and get status
  private importDbAPI: string = 'http://localhost:5000/import/api/import/run';
  private statusImportAPI: string = 'http://localhost:5000/import/api/import/status/';

  // * import new ingredients from submissions
  private importNewIngredientsAPI: string = 'http://localhost:5000/submission/ingredients/import';

  // * import ingredients, cocktails and all
  private importIngredientsAPI: string = 'http://localhost:5000/cocktail/ingredients/import';
  private importCocktailsAPI: string = 'http://localhost:5000/cocktail/import';
  private importIngredientsMapAPI: string = 'http://localhost:5000/cocktail/ingredients-map/import';
  private importAllAPI: string = 'http://localhost:5000/cocktail/import/all';

  // * Reload databse
  private reloaSearchdDbAPI: string = 'http://localhost:5000/search/cocktails/reload';

  // * change Role
  private changeRoleAPI: string = 'http://localhost:5000/auth/api/admin/change-role';

  constructor(
    private http: HttpClient
  ) { }

  // * returns taskId
  importDb(): Observable<any> {
    return this.http.post(`${this.importDbAPI}`, {});
  }

  getImportDbStatus(taskId: string): Observable<any> {
    return this.http.get(`${this.statusImportAPI}${taskId}`);
  }

  // TODO: ask STE
  importNewIngredients(): Observable<any> {
    return this.http.post(`${this.importNewIngredientsAPI}`, {});
  }

  importIngredients(): Observable<any> {
    return this.http.post(`${this.importIngredientsAPI}`, {});
  }

  importCocktails(): Observable<any> {
    return this.http.post(`${this.importCocktailsAPI}`, {});
  }

  importIngredientsMap(): Observable<any> {
    return this.http.post(`${this.importIngredientsMapAPI}`, {});
  }

  importAll(): Observable<any> {
    return this.http.post(`${this.importAllAPI}`, {});
  }

  reloadSearchDb(): Observable<any> {
    return this.http.post(`${this.reloaSearchdDbAPI}`, {});
  }

  changeRole(userId: string, makeAdmin: boolean): Observable<any> {
    return this.http.post(`${this.changeRoleAPI}`, { targetUserId: userId, makeAdmin: makeAdmin });
  }
}
