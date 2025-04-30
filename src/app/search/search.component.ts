import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Button } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { Dialog } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { FormsModule, FormGroup, FormControl, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, ProfileButtonComponent, LeftButtonsComponent } from '../../../projects/shared/src/public-api';
import { NgFor, NgIf } from '@angular/common';
import { debounceTime, distinctUntilChanged, forkJoin, map, Observable } from 'rxjs';

interface SearchResult {
  id: string;
  title: string;
  image: string;
  isFavorite: boolean;
}

interface Filter {
  name: string;
}

@Component({
  selector: 'app-search',
  imports: [ProfileButtonComponent, FloatLabel, InputText, NgIf,
    IconField, InputIcon, FormsModule, ReactiveFormsModule,
    MultiSelectModule, NgFor, Button, InputGroupModule,
    ChipModule, Dialog, CardModule, PaginatorModule, LeftButtonsComponent],
  standalone: true,
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {

  // * paginator code
  first: number = 0;
  rows: number = 10;

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    console.log('First:', this.first);
    this.rows = event.rows ?? 10;
    console.log('Rows:', this.rows);
    this.displayResults();
  }

  searchResults: SearchResult[] = [];
  paginatedResults: SearchResult[] = [];

  visible: boolean = true;
  dialogHeader: string = 'Cannot access to this page';

  placeholders: { [key: string]: string } = {
    ingredients: 'Filter by ingredients',
    glass: 'Filter by glass',
    type: 'Filter by type of cocktail',
    alcoholic: 'Filter by alcoholic content'
  }

  searchForm!: FormGroup;

  filterOptions: { [key: string]: Filter[] } = {
    ingredients: [].map(item => ({ name: item })),
    glass: [].map(item => ({ name: item })),
    type: [].map(item => ({ name: item })),
    alcoholic: [].map(item => ({ name: item }))
  };

  query: string = '';
  noResultsFound: boolean = false;
  history: string[][] = [];

  cListAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list';
  gListAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?g=list';
  iListAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list';
  aListAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?a=list';

  // ? new APi will be { API + filterType (ex: ingredients) + filterName (ex: gin) }

  ingFilterAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=';
  catFilterAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=';
  glaFilterAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?g=';
  alcFilterAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=';
  searchBarAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';

  randomAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.searchForm = this.formBuilder.group({
      query: [''],
      ingredients: [[]],
      glass: [[]],
      type: [[]],
      alcoholic: [[]]
    });

  }

  // TODO: add check for 18 years on category alcoholic

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['first'] === 'true') {
        console.log('First time loading the page');
        this.displayRandomCocktails();
      }
    })

    // * check for value changes in the searchForm
    this.lookForFilterChanges();

    // * API calls to get the filter options
    this.callAPiLists();
  }

  callAPiLists(): void {
    this.http.get<{ drinks: { strCategory: string }[] }>(`${this.cListAPI}`).subscribe((response) => {
      this.filterOptions['type'] = response.drinks.map(item => ({ name: item.strCategory }));
      console.log(this.filterOptions['type']);
    });
    this.http.get<{ drinks: { strGlass: string }[] }>(`${this.gListAPI}`).subscribe((response) => {
      this.filterOptions['glass'] = response.drinks.map(item => ({ name: item.strGlass }));
      console.log(this.filterOptions['glass']);
    });
    this.http.get<{ drinks: { strIngredient1: string }[] }>(`${this.iListAPI}`).subscribe((response) => {
      this.filterOptions['ingredients'] = response.drinks.map(item => ({ name: item.strIngredient1 }));
      console.log(this.filterOptions['ingredients']);
    });
    this.http.get<{ drinks: { strAlcoholic: string }[] }>(`${this.aListAPI}`).subscribe((response) => {
      this.filterOptions['alcoholic'] = response.drinks.map(item => ({ name: item.strAlcoholic }));
      console.log(this.filterOptions['alcoholic']);
    });
  }

  getAllSelectedFilters(): string[] {
    // * destructured the form values to get the query and the filters separated
    const { query, ...filters } = this.searchForm.value;
    const selectedFilters: { name: string }[] = Object.values(filters).flat() as { name: string }[];
    return selectedFilters.map(filter => filter.name);
  }

  removeFilter(filter: string) {
    const formValues = this.searchForm.value;

    for (const key of Object.keys(formValues)) {
      const list = formValues[key];
      if (Array.isArray(list)) {
        const updatedList = list.filter((item: any) => item.name !== filter);
        this.searchForm.get(key)?.setValue(updatedList);
      }
    }
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  userIsLogged(): boolean {
    return this.authService.isLoggedIn();
  }

  redirectHome() {
    this.router.navigate(['/home']);
  }

  updateHistory(query?: string, filters?: string[]) {
    if (query && filters) {
      filters.unshift(query);
      for (let i = 0; i < this.history.length; i++) {
        if (this.history[i].toString() == filters.toString())
          return;
      }
      this.history.unshift([filters.toString()]);
    } else if (query) {
      this.history.unshift([query]);
    } else if (filters) {
      for (let i = 0; i < this.history.length; i++) {
        if (this.history[i].toString() == filters.toString())
          return;
      }
      this.history.unshift(filters);
    }
    if (this.history.length > 10) {
      this.history.pop();
    }
    console.log('History:', this.history);
  }

  displayRandomCocktails() {
    const requests = Array.from({ length: 20 }, () =>
      this.http.get<{ drinks: { strDrink: string, strDrinkThumb: string, idDrink: string }[] }>(`${this.randomAPI}`)
    );

    forkJoin(requests).subscribe((responses) => {
      const uniqueResults = new Map<string, SearchResult>();

      responses.forEach(response => {
      response.drinks.forEach(drink => {
        if (!uniqueResults.has(drink.idDrink) && uniqueResults.size < 20) {
        uniqueResults.set(drink.idDrink, {
          id: drink.idDrink,
          title: drink.strDrink,
          image: drink.strDrinkThumb,
          isFavorite: false
        });
        }
      });
      });

      this.searchResults = Array.from(uniqueResults.values());
      this.displayResults();
    });
  }

  displayResults() {
    if (this.searchResults.length === 0) {
      // TODO: add a message if no results found
      this.noResultsFound = true;
      this.paginatedResults = [];
    } else {
      this.paginatedResults = this.searchResults.slice(this.first, this.first + this.rows);
      console.log('Paginated results:', this.paginatedResults);
    }
  }

  lookForFilterChanges(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(formValues => {
        const selectedFilters = this.getAllSelectedFilters();
        console.log('Selected formValues:', selectedFilters);
        this.updateHistory(this.searchForm.get('query')?.value, selectedFilters);

        const filterKeys = ['ingredients', 'glass', 'category', 'alcoholic', 'query'];
        const observables = [];

        // * this adds every filter search result to the observables array
        for (const key of filterKeys) {
          if (formValues[key] && formValues[key].length > 0) {
            if (key === 'query') {
              observables.push(this.firstResearch([{ name: this.searchForm.get('query')?.value }], key));
            } else {
              observables.push(this.firstResearch(formValues[key], key));
            }
          }
        }

        // * this will match all the filtered results and we'll have the final result
        console.log('Observables:', observables);
        if (observables.length > 0) {
          forkJoin(observables).subscribe(filterResults => {
            this.searchResults = this.matchResults(filterResults);
            console.log('Filter results:', this.searchResults);
            this.displayResults();
          });
        }
      });
  }

  // TODO: delete this when the new API is ready
  getRightAPI(filter: string): string {
    switch (filter) {
      case 'ingredients':
        return this.ingFilterAPI;
      case 'glass':
        return this.glaFilterAPI;
      case 'category':
        return this.catFilterAPI;
      case 'alcoholic':
        return this.alcFilterAPI;
      case 'query':
        return this.searchBarAPI;
      default:
        console.error('Invalid filter:', filter);
        return '';
    }
  }

  firstResearch(query: { name: string }[], filter: string): Observable<SearchResult[]> {
    // * requests is an observale of observables of what we get from the API
    const requests = query.map(q =>
      // TODO: change the API to the new one when ready
      this.http.get<{ drinks: { strDrink: string, strDrinkThumb: string, idDrink: string }[] }>(`${this.getRightAPI(filter)}${q.name}`)
    );

    return forkJoin(requests).pipe(
      map(responses => {
        let allResults = responses.map(response =>
          response.drinks?.map(drink => ({
            id: drink.idDrink,
            title: drink.strDrink,
            image: drink.strDrinkThumb,
            isFavorite: false
          })) || []
        );

        if (allResults.length > 1) {
          return this.matchResults(allResults);
        } else {
          return allResults[0];
        }
      })
    );
  }

  // * this function will match all the id's of the results
  matchResults(allResults: SearchResult[][]): SearchResult[] {
    if (allResults.length === 0)
      return [];

    return allResults.reduce((common, current) => {
      return common.filter(item =>
        current.some(other => other.id === item.id)
      );
    });
  }

  addToFavorite(cocktailId: string): void {
    // TODO: implement the add to favorite function
  }

  displayCardPage(id: string) {
    this.router.navigate(['/card'], { queryParams: { cocktailId: id} });
  }
}
