import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PrimeNG } from 'primeng/config';
import { NgFor } from '@angular/common';
import { delay } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  imports: [NgFor, CommonModule, CardModule, ButtonModule],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  stringUrl = "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=";
  public images: string[] = [];
  imgSize: string[] = ['/small', '/medium', '/large'];
  accessButton = 'Accedi';
  profileButtonTag = 'Profilo';
  cocktailImgs: string[] = [];

  constructor(private http: HttpClient, private primeng: PrimeNG) { }

  ngOnInit(): void {
    this.primeng.ripple.set(true); // to initialize primeng
    this.cocktailImgs = this.pickAllDrinks();
  }

  changeButtonName() {
    // * se registrato mostra 'profilo', altrimenti mostra accedi/registrati.
    // if ()
  }


  pickAllDrinks(): string[] {
    for (let i = 0; i < 12; i++) {
      const number: number = 11000 + i;
      const id: string = number.toString();
      this.http.get<{ drinks: { strDrinkThumb: string }[] }>(this.stringUrl + id)
      .pipe(delay(2000))
      .subscribe( response => {
        if (response) {
          const drink = response.drinks[0];
          console.log('Data arrived!', drink);
          this.images.push(drink.strDrinkThumb + this.imgSize[0]);
          console.log('img is ', this.images);
        } else {
          console.error('Data has not arrived', response);
        }
      })
    }
    return this.images;
  }
}
