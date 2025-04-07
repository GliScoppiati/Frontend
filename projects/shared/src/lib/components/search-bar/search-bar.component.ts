import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { FormsModule } from '@angular/forms';
import { SearchBarService } from '../../services/search-bar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-search-bar',
  imports: [ButtonModule, CommonModule, InputTextModule, InputIcon, IconField, FormsModule, FloatLabel],
  standalone: true,
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  noResultsFound: boolean = false;
  query: string = '';

  constructor(private searchService: SearchBarService, private router: Router) {}

  search(query : string): void {
    if (!query.trim()) return;

    this.searchService.searchEngine(query).subscribe((response) => {
      if (response && response.drinks) {
        console.log('Search results:', response.drinks);
      } else {
        console.error('No drinks found for the query:', query);
        this.noResultsFound = true;
      }
    })

    if (this.router.url != '/search') {
      console.log('dio boiaaaaaaaaaaaa');
      this.router.navigate(['/search'], { queryParams: { query: query, noResultsFound: this.noResultsFound } });
    }
  }
}
