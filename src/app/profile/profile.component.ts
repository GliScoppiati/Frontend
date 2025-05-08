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
import { Dialog } from 'primeng/dialog';

interface Submission {
  id: string;
  name: string;
  image: string;
  status: string;
}

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
    Image, FloatLabel, InputText, Checkbox, Fieldset,
    Dialog
  ],
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {

  private gdpr: boolean = true;

  // * submissions
  submitted: Submission[] = [];
  paginatedSubmissions: Submission[] = [];

  // * dialog Not Logged in
  visible: boolean = true;
  dialogHeader: string = 'Cannot access to this page';

  // * paginator
  // TODO: fix the paginator
  paginatedFavorites: Favorite[] = [];
  rowsPerPageOptions = [5, 10, 15];
  first: number = 0;
  rows: number = 5;

  // TODO: add the update profile function
  selectedMenu: string = 'details';

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

    // * initialize the favorites in order to see them
    this.paginatedFavorites = this.favorites.slice(this.first, this.first + this.rows);

    // * get profile data
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

        // * set the user data to save them in case of discard changes
        this.user.firstName = response.firstName;
        this.user.lastName = response.lastName;
        this.user.birthDate = response.birthDate;
        this.user.email = response.email;
        this.user.username = response.username;
        this.user.alcoholAllowed = response.alcoholAllowed;
        this.user.consentProfiling = response.consentProfiling;
      },
      error: (error) => {
        console.error('Error fetching user profile data', error);
      }
    });

    // * get user's submissions
    this.authService.getSubmissions().subscribe({
      next: (response) => {
        console.log('User submissions', response);
        this.submitted = response.map((submission: any) => ({
          id: submission.id,
          name: submission.name,
          image: submission.imageUrl, // Assuming the API returns an image URL
          status: submission.status
        }));
        this.paginatedSubmissions = this.submitted.slice(this.first, this.first + this.rows);
      },
      error: (error) => {
        console.error('Error fetching user submissions', error);
      }
    });

    // * get user's favorites

  }

  selectMenu(menu: string) {
    this.selectedMenu = menu;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 5;
    if (this.selectedMenu === 'favorites')
      this.paginatedFavorites = this.favorites.slice(this.first, this.first + this.rows);
    else if (this.selectedMenu === 'submitted')
      this.paginatedSubmissions = this.submitted.slice(this.first, this.first + this.rows);
  }

  displayCardPage(id: string) {
    this.historyService.addToHistory(id);
    this.router.navigate(['/card'], { queryParams: { cocktailId: id} });
  }

  userIsLogged(): boolean {
    return this.authService.isLoggedIn();
  }

  redirectHome() {
    this.router.navigate(['/home']);
  }

  manageFavorite(id: string) {

  }

  deleteAccount() {
    this.authService.deleteProfile().subscribe({
      next: (response: any) => {
        console.log('Account deleted', response);
        this.authService.clearTokens();
        this.router.navigate(['/home']);
      },
      error: (error) => {
        if (error.status === 404)
          console.error('Account not found', error);
        else
          console.error('Error deleting account', error);
      }
    })
  }

  discardChanges() {
    this.profileForm.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      birthDate: new Date(this.user.birthDate),
      alcoholAllowed: this.user.alcoholAllowed,
      consentProfiling: this.user.consentProfiling
    });
  }

  saveChanges() {
    this.authService.updateProfile(
      this.profileForm.value.firstName,
      this.profileForm.value.lastName,
      this.profileForm.value.birthDate,
      this.profileForm.value.alcoholAllowed,
      this.gdpr,
      this.profileForm.value.consentProfiling

    ).subscribe({
      next: (response) => {
        console.log('Profile updated', response);
        this.redirectHome();
      },
      error: (error) => {
        console.error('Error updating profile', error);
      }
    }
    )

  }

}
