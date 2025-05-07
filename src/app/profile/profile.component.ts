import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { DatePicker } from 'primeng/datepicker';
import { Image } from 'primeng/image';
import { AuthService, HistoryService, LeftButtonsComponent, ProfileButtonComponent } from 'shared';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';
import { Fieldset } from 'primeng/fieldset';
import { Router } from '@angular/router';

interface Favorite {
  id: string;
  name: string;
  image: string;
  isFavorite: boolean;
}

@Component({
  selector: 'app-profile',
  imports: [
    LeftButtonsComponent, Button, CommonModule,
    Card, PanelModule, ProfileButtonComponent,
    ReactiveFormsModule, DatePicker, Paginator,
    Image, FloatLabel, InputText, Checkbox, Fieldset
  ],
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {

  // * paginator
  // TODO: fix the paginator
  paginatedFavorites: Favorite[] = [];
  rowsPerPageOptions = [5, 10, 15];
  first: number = 0;
  rows: number = 5;

  // TODO: add the update profile function
  selectedMenu: string = 'details';

  menuItems = [
    { key: 'details', label: 'Details', icon: 'pi pi-user' },
    { key: 'favorites', label: 'Favorites', icon: 'pi pi-heart-fill' },
  ]

  profileForm!: FormGroup;

  user = {
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    username: '',
    alcoholAllowed: false,
    consentProfiling: false,
  }

  // TODO: add the favorites from the API
  favorites: Favorite[] = [
    {
      id: '1',
      name: 'Favorite 1',
      image: 'https://www.thecocktaildb.com/images/media/drink/wyrsxu1441554538.jpg',
      isFavorite: true
    },
    {
      id: '2',
      name: 'Favorite 2',
      image: 'https://www.thecocktaildb.com/images/media/drink/wyrsxu1441554538.jpg',
      isFavorite: true
    },
    {
      id: '3',
      name: 'Favorite 3',
      image: 'https://www.thecocktaildb.com/images/media/drink/wyrsxu1441554538.jpg',
      isFavorite: true
    },
    {
      id: '4',
      name: 'Favorite 4',
      image: 'https://www.thecocktaildb.com/images/media/drink/wyrsxu1441554538.jpg',
      isFavorite: true
    },
    {
      id: '5',
      name: 'Favorite 5',
      image: 'https://www.thecocktaildb.com/images/media/drink/wyrsxu1441554538.jpg',
      isFavorite: true
    },
    {
      id: '6',
      name: 'Favorite 6',
      image: 'https://www.thecocktaildb.com/images/media/drink/wyrsxu1441554538.jpg',
      isFavorite: true
    },
    {
      id: '7',
      name: 'Favorite 7',
      image: 'https://www.thecocktaildb.com/images/media/drink/wyrsxu1441554538.jpg',
      isFavorite: true
    },
  ];


  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private historyService: HistoryService,
    private router: Router,
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      birthDate: [null],
      email: [{value: '', disabled: true}],
      username: [{value: '', disabled: true}],
      alcoholAllowed: [false],
      consentProfiling: [false],
    });
  }


  ngOnInit(): void {

    this.authService.getUserProfileData().subscribe({
      next: (response) => {
        console.log('User profile data', response);
        this.profileForm.patchValue({
          firstName: response.firstName,
          lastName: response.lastName,
          birthDate: new Date(response.birthDate),
          email: response.email,
          username: response.username,
          alcoholAllowed: response.alcoholAllowed,
          consentProfiling: response.consentProfiling,
        });
      },
      error: (error) => {
        console.error('Error fetching user profile data', error);
      }
    });

  }

  selectMenu(menu: string) {
    this.selectedMenu = menu;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 5;
    this.paginatedFavorites = this.favorites.slice(this.first, this.first + this.rows);
  }

  displayCardPage(id: string) {
    this.historyService.addToHistory(id);
    this.router.navigate(['/card'], { queryParams: { cocktailId: id} });
  }

  addToFavorites(id: string) {

  }

  deleteAccount() {

  }

  saveChanges() {

  }

}
