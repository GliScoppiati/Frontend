import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PrimeNG } from 'primeng/config';
import { NgFor } from '@angular/common';
import { delay, firstValueFrom, Observable } from 'rxjs';
import { CardModule } from 'primeng/card';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { AuthService, LeftButtonsComponent, ProfileButtonComponent } from 'shared';

@Component({
  selector: 'app-home',
  animations: [trigger('fadeInOut', [
    transition(':enter', [
      style({opacity: 0}),
      animate('1000ms ease-out', style({opacity: 1})),
    ]),
    transition(':leave', [
      animate('1000ms ease-out', style({opacity: 0})),
    ]),
  ])],
  imports: [NgFor, CommonModule, CardModule, LeftButtonsComponent, ProfileButtonComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  firstTitle: string = 'Find the perfect cocktail for';

  titles: string[] = [
    'your birthday party',
    'your happy hour',
    'your dinner with friends',
    'your romantic dinner',
  ]
  currentTitle: string = this.titles[0];
  titleIndex: number = 0;

  isLoggedIn$: any;
  allImages: string[][] = [];
  currentImages: string[] = [];
  showImages: boolean[] = [];

  stringUrl = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
  public images: Set<string> = new Set();
  imgSize: string[] = ['/small', '/medium', '/large'];
  accessButton = 'Accedi';
  profileButtonTag = 'Profilo';
  cocktailImgs: Set<string> = new Set();

  constructor(private http: HttpClient,
              private primeng: PrimeNG,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.loggedIn$;
    console.log('isLoggedIn$', this.isLoggedIn$);
    this.primeng.ripple.set(true); // to initialize primeng

    this.pickAllDrinks().then((groupedImages) => {
      this.allImages = groupedImages;
      this.currentImages = this.allImages[0] || [];

      this.showImages = Array(this.currentImages.length).fill(false);
      setTimeout(() => {
        this.showImages = this.showImages.map(() => true);
      }, 50);


      // Start rotation
      setInterval(() => {
        this.rotateContent();
      }, 5000);
    });
  }

  // ! this is temporary since we don't have a backend yet
  // TODO: do the research to match the images with the title
  async pickAllDrinks(): Promise<string[][]> {
    const promises: Promise<string | null>[] = [];
    for (let i = 0; i < 20; i++) {
      // TODO: Add api call to the backend
      const promise = firstValueFrom(
          this.http.get<{ drinks: { strDrinkThumb: string }[] }>(this.stringUrl)
        ).then(response => {
          if (response?.drinks?.[0]) {
            return response.drinks[0].strDrinkThumb + this.imgSize[2];
          }
          return null;
        });

      promises.push(promise);
    }

    const all = await Promise.all(promises);
    const validImgs = all.filter((img): img is string => img !== null);

    const grouped: string[][] = [];
    for (let i = 0; i < validImgs.length; i++) {
      grouped.push(validImgs.slice(i, i + 10));
    }

    console.log("Grouped images", grouped);

    return grouped;
  }

  rotateContent(): void {
    this.titleIndex = (this.titleIndex + 1) % this.titles.length;
    this.currentTitle = this.titles[this.titleIndex];

    const imgIndex = this.titleIndex % this.allImages.length;
    this.currentImages = this.allImages[imgIndex] || [];

    // Trigger animation by resetting visibility
    this.showImages = Array(this.currentImages.length).fill(false);

    // Activate fade-in after small delay
    setTimeout(() => {
      this.showImages = this.showImages.map(() => true);
    }, 50);
  }



  // rotateContent(): void {
  //   this.titleIndex = (this.titleIndex + 1) % this.titles.length;
  //   this.currentTitle = this.titles[this.titleIndex];

  //   const imgIndex = this.titleIndex % this.allImages.length;
  //   this.currentImages = this.allImages[imgIndex] || [];
  // }

}
