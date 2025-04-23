import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { MultiSelectModule } from 'primeng/multiselect';
import { Button } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputGroupModule } from 'primeng/inputgroup';
import { FormsModule, FormGroup, FormControl, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService, ProfileButtonComponent } from '../../../projects/shared/src/public-api';
import { NgFor, NgIf } from '@angular/common';

interface Filter {
  name: string;
}

@Component({
  selector: 'app-search',
  imports: [ProfileButtonComponent, FloatLabel, InputText, NgIf,
            IconField, InputIcon, FormsModule, ReactiveFormsModule,
            MultiSelectModule, NgFor, Button, InputGroupModule,
            ChipModule],
  standalone: true,
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {

  placeholders: { [key: string]: string } = {
    ingredients: 'Filter by ingredients',
    glass: 'Filter by glass',
    type: 'Filter by type of cocktail',
    alcoholic: 'Filter by alcoholic content'
  }

  searchBar!: FormGroup;
  filterGroup!: FormGroup;

  filterOptions: { [key: string]: Filter[] } = {
    ingredients: [].map(item => ({ name: item })),
    glass: [].map(item => ({ name: item })),
    type: [].map(item => ({ name: item })),
    alcoholic: [].map(item => ({ name: item }))
  };

  query: string = '';
  noResultsFound: boolean = false;
  categoriesUrl: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list';
  glassesUrl: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?g=list';
  ingredientsUrl: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list';
  alcoholicUrl: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?a=list';
  ingFilterUrl: string = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=';
  categoryFilterUrl: string = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=';
  glassFilterUrl: string = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?g=';
  alcohoolFilterUrl: string = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private http: HttpClient,
    private formBuilder: FormBuilder
  ) {
    this.searchBar = this.formBuilder.group({
      query: [''],
    });
    this.filterGroup = this.formBuilder.group({
      ingredients: [[]],
      glass: [[]],
      type: [[]],
      alcoholic: [[]]
    });

   }

  ngOnInit(): void {
    this.http.get<{ drinks: { strCategory: string }[] }>(`${this.categoriesUrl}`).subscribe((response) => {
      this.filterOptions['type'] = response.drinks.map(item => ({ name: item.strCategory}));
      console.log(this.filterOptions['type']);
    });
    this.http.get<{ drinks: {strGlass: string}[]}>(`${this.glassesUrl}`).subscribe((response) => {
      this.filterOptions['glass'] = response.drinks.map(item => ({name: item.strGlass}));
      console.log(this.filterOptions['glass']);
    });
    this.http.get<{ drinks: {strIngredient1: string}[] }>(`${this.ingredientsUrl}`).subscribe((response) => {
      this.filterOptions['ingredients'] = response.drinks.map(item => ({name: item.strIngredient1}));
      console.log(this.filterOptions['ingredients']);
    });
    this.http.get<{ drinks: {strAlcoholic: string}[] }>(`${this.alcoholicUrl}`).subscribe((response) => {
      this.filterOptions['alcoholic'] = response.drinks.map(item => ({name: item.strAlcoholic}));
      console.log(this.filterOptions['alcoholic']);
    });
  }

  // TODO: add the search query to the search bar
  // TODO: add the search query to the filter options and mix it with the search bar query
  // TODO: add the search button to the search bar

  getAllSelectedFilters(): string[] {
    const selectedFilters: { name: string }[] = Object.values(this.filterGroup.value).flat() as { name: string }[];
    return selectedFilters.map(filter => filter.name);
  }

  removeFilter(filter: string) {
    const formValues = this.filterGroup.value;

    for (const key of Object.keys(formValues)) {
      const list = formValues[key];
      if (Array.isArray(list)) {
        const updatedList = list.filter((item: any) => item.name !== filter);
        this.filterGroup.get(key)?.setValue(updatedList);
      }
    }
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  searchQuery() {
    const filters = this.getAllSelectedFilters();
    const query = this.searchBar.get('query')?.value;
    if (query === '' && filters.length === 0) {
      this.noResultsFound = true;
      console.error('No search query or filters provided');
      return;
    }
    this.ingredientFilter(this.filterGroup.get('ingredients')?.value);
    console.log('Search query:', query);
    console.log('Selected filters:', filters);
  }

  ingredientFilter(ingredientQuery: string[]) {
    console.log('Ingredient filter:', ingredientQuery);
    const query = this.ingFilterUrl + ingredientQuery.join(',');

  }

  typeOfDrinkFilter(typeOfDrinkQuery: string[]) {

  }

  alcoholFilter(alcoholQuery: string[]) {

  }

  glassFilter(glassQuery: string[]) {

  }

  // * this function will match all the responses from the api calls
  matchResults() {

  }
}
