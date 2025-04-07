import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchBarComponent } from '../../../projects/shared/src/public-api';

@Component({
  selector: 'app-search',
  imports: [SearchBarComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  searchQuery: string = '';
  noResultsFound: boolean = false;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['query'] || '';
      this.noResultsFound = params['noResultsFound'] === 'true';
      console.log('Search query:', this.searchQuery);
    });
  }

  fruitFilter(fruitQuery: string) {

  }

  vegetableFilter(vegQuery: string) {

  }

  alcoholFilter(alcoholQuery: string) {
    
  }
}
