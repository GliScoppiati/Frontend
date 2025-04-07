import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PrimeNG } from 'primeng/config';
import { NgFor } from '@angular/common';
import { delay } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SearchBarComponent } from '../../../projects/shared/src/public-api';
import { SearchBarService } from '../../../projects/shared/src/public-api';

@Component({
  selector: 'app-home',
  imports: [NgFor, CommonModule, CardModule, ButtonModule, SearchBarComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  stringUrl = "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=";
  public images: Set<string> = new Set();
  imgSize: string[] = ['/small', '/medium', '/large'];
  accessButton = 'Accedi';
  profileButtonTag = 'Profilo';
  cocktailImgs: Set<string> = new Set();

  constructor(private http: HttpClient,
              private primeng: PrimeNG,
              private searchService: SearchBarService) { }

  ngOnInit(): void {
    this.primeng.ripple.set(true); // to initialize primeng
    this.cocktailImgs = this.pickAllDrinks();
  }

  changeButtonName() {
    // * se registrato mostra 'profilo', altrimenti mostra accedi/registrati.
    // if ()
  }

  // ! this is temporary since we don't have a backend yet
  // TODO: Add a delay to change the display of the images and the h2 every 5 seconds
  pickAllDrinks(): Set<string> {
    for (let i = 0; i < 15; i++) {
      const number: number = 11000 + i;
      const id: string = number.toString();
      // TODO: Add api call to the backend
      this.http.get<{ drinks: { strDrinkThumb: string }[] }>(this.stringUrl + id)
      .pipe(delay(2000))
      .subscribe( response => {
        if (response) {
          const drink = response.drinks[0];
          console.log('Data arrived!', drink);
          this.images.add(drink.strDrinkThumb + this.imgSize[0]);
          console.log('img is ', this.images);
        } else {
          console.error('Data has not arrived', response);
        }
      })
    }
    return this.images;
  }

}
