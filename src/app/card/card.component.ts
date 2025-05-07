import { NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Image } from 'primeng/image';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { Toast } from 'primeng/toast';
import { CarouselModule } from 'primeng/carousel';
import { AuthService, LeftButtonsComponent, ProfileButtonComponent, HistoryService } from 'shared';

interface Cocktail {
  id: string;
  name: string;
  image: string;
  instructions: { [lang: string]: string };
  ingredientsAndMeasures: { ing: string[], measure: string[] };
  category: string;
  glass: string;
  alcoholic: string;
}

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

@Component({
  selector: 'app-card',
  imports: [
    LeftButtonsComponent, ProfileButtonComponent, Button,
    Dialog, NgIf, Image, Card, NgFor, Divider, TabsModule,
    CarouselModule
  ],
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit {

  history: string[] = [];

  responsiveOptions: any[] | undefined;

  // * dialog Not Logged in
  visible: boolean = true;
  dialogHeader: string = 'Cannot access to this page';

  // * favorites
  isFavorite: boolean = false;

  // * cocktail variables
  cocktailInfo: Cocktail = {
    id: '',
    name: '',
    image: '',
    instructions: {},
    ingredientsAndMeasures: { ing: [], measure: [] },
    category: '',
    glass: '',
    alcoholic: '',
  };

  // * backend API for cocktail info
  cocktailUrl: string = 'https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private historyService: HistoryService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('params', params);
      this.cocktailInfo.id = params['cocktailId'];
    });

    // * call the cocktail API
    this.getCocktail(this.cocktailInfo.id);

    // * responsive options for the carousel
    this.responsiveOptions = [
      {
          breakpoint: '1400px',
          numVisible: 2,
          numScroll: 1
      },
      {
          breakpoint: '1199px',
          numVisible: 3,
          numScroll: 1
      },
      {
          breakpoint: '767px',
          numVisible: 2,
          numScroll: 1
      },
      {
          breakpoint: '575px',
          numVisible: 1,
          numScroll: 1
      }
    ];

    this.history = this.historyService.getHistory();


  }

  redirectHome() {
    this.router.navigate(['/home']);
  }

  userIsLogged(): boolean {
    return this.authService.isLoggedIn();
  }

  getCocktail(cocktailId: string) {
    console.log('cocktailId', cocktailId);
    this.http.get<Cocktail>(this.cocktailUrl + cocktailId).subscribe((response: any) => {
      console.log('response', response);
      const cocktailData = response.drinks[0];
      console.log('cocktailData', cocktailData);
      this.cocktailInfo = {
        id: cocktailData.idDrink,
        name: cocktailData.strDrink,
        image: cocktailData.strDrinkThumb,
        instructions: {
          en: cocktailData.strInstructions,
          it: cocktailData.strInstructionsIT ? cocktailData.strInstructionsIT : '',
          fr: cocktailData.strInstructionsFR ? cocktailData.strInstructionsFR : '',
          de: cocktailData.strInstructionsDE ? cocktailData.strInstructionsDE : '',
          es: cocktailData.strInstructionsES ? cocktailData.strInstructionsES : '',
        },
        ingredientsAndMeasures: {
          ing: Array.from({ length: 15 }, (_, i) => cocktailData[`strIngredient${i + 1}`]).filter(Boolean),
          measure: Array.from({ length: 15 }, (_, i) => cocktailData[`strMeasure${i + 1}`]).filter(Boolean),
        },
        category: cocktailData.strCategory,
        glass: cocktailData.strGlass,
        alcoholic: cocktailData.strAlcoholic ? 'Yes' : 'No',
      };
    });
  }

  displayIngredient(ingredient: string, index: number): string {
    const measure = this.cocktailInfo.ingredientsAndMeasures.measure[index];
    if (!measure) {
      return `${ingredient}  →  No measure`;
    }
    return `${ingredient}  →  ${measure}`;
  }

  manageFavorite(id: string) {
    if (this.userIsLogged()) {
      this.isFavorite = !this.isFavorite;
    //   if (this.isFavorite) {
    //     this.authService.addToFavorites(id);
    //   } else {
    //     this.authService.removeFromFavorites(id);
    //   }
    // } else {
    //   this.visible = true;
    }
  }

}
