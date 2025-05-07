import { Component, OnInit } from '@angular/core';
import { AuthService, LeftButtonsComponent, ProfileButtonComponent } from 'shared';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, FormControl, FormArray } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { FileUpload, UploadEvent } from 'primeng/fileupload';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Dialog } from 'primeng/dialog';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Fluid } from 'primeng/fluid';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';

interface Filter {
  id?: string;
  name: string;
}

@Component({
  selector: 'app-create',
  imports: [
    LeftButtonsComponent, ProfileButtonComponent,
    CommonModule, Button, Card, Divider, ReactiveFormsModule,
    FileUpload, Toast, Select, InputNumber, Dialog, FormsModule,
    Fluid, InputText, FloatLabel, TextareaModule
  ],
  standalone: true,
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  providers: [MessageService]
})
export class CreateComponent implements OnInit {

  // * dialog Not Logged in
  dialogHeaderLogIn: string = 'Cannot access to this page';
  loginVisible: boolean = true;


  // * input number group
  ingredientsNumbers!: FormGroup;
  selectedForm!: FormGroup;

  // * selected ingredients
  ingredientExists: boolean[] = [];
  showAddedIngredient: boolean[] = [];

  // * dialog for new ingredient
  ingredientDialog: boolean = false;

  //* lists
  // listsGroup!: FormGroup;

  placeholders: { [key: string]: string } = {
    ingredients: 'Select ingredients',
    measure: 'Insert measure',
    glass: 'Select glass',
    type: 'Select type',
    alcoholic: 'Select alcoholic'
  };

  filterOptions: { [key: string]: Filter[] } = {
    // ingredients: [].map(item => ({ id: item, name: item })),
    ingredients: [].map(item => ({ name: item })),
    glass: [].map(item => ({ name: item })),
    type: [].map(item => ({ name: item })),
    alcoholic: [].map(item => ({ name: item }))
  };


  // * cocktail lists
  cListAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list';
  gListAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?g=list';
  iListAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list';
  aListAPI: string = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?a=list';

  // * cocktail submission
  submissionAPI: string = 'http://localhost:5000/submission/submissions';
  messageService: any;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private http: HttpClient,
  ) {
    this.selectedForm = this.formBuilder.group({
      name: [''],
      image: [''],
      ingredientsList: this.formBuilder.array([]),
      glass: [''],
      type: [''],
      alcoholic: [''],
      instructions: ['']
    });

  }

  ngOnInit() {
    this.ingredientsNumbers = new FormGroup({
      number: this.formBuilder.control(3),
    });

    // * first time
    this.setIngredientsLength(3);
    this.ingredientExists = Array.from({ length: this.getNumberOfIngredients().length }, () => true);
    this.showAddedIngredient = Array.from({ length: this.getNumberOfIngredients().length }, () => false);

    // * when the number of ingredients changes
    this.ingredientsNumbers.get('number')?.valueChanges.subscribe((value) => {
      this.ingredientExists = Array.from({ length: value }, () => true);
      this.showAddedIngredient = Array.from({ length: value }, (_, index) =>
        index < this.showAddedIngredient.length ? this.showAddedIngredient[index] : false
      );
      this.setIngredientsLength(value);
    });

    this.callAPiLists();

  }

  callAPiLists(): void {
    this.http.get<{ drinks: { strCategory: string }[] }>(`${this.cListAPI}`).subscribe((response) => {
      this.filterOptions['type'] = response.drinks.map(item => ({ name: item.strCategory }));
    });
    this.http.get<{ drinks: { strGlass: string }[] }>(`${this.gListAPI}`).subscribe((response) => {
      this.filterOptions['glass'] = response.drinks.map(item => ({ name: item.strGlass }));
    });
    this.http.get<{ drinks: { strIngredient1: string }[] }>(`${this.iListAPI}`).subscribe((response) => {
      this.filterOptions['ingredients'] = response.drinks.map(item => ({ name: item.strIngredient1 }));
    });
    this.http.get<{ drinks: { strAlcoholic: string }[] }>(`${this.aListAPI}`).subscribe((response) => {
      this.filterOptions['alcoholic'] = response.drinks.map(item => ({ name: item.strAlcoholic }));
    });
  }

  uploadFile(event: UploadEvent) {

  }

  getNumberOfIngredients(): number[] {
    const number = this.ingredientsNumbers.get('number')?.value;
    return Array.from({ length: number });
  }

  userIsLogged() {
    return this.authService.isLoggedIn();
  }

  redirectHome() {
    this.router.navigate(['/home']);
  }

  get selectedIngredientGroup(): FormGroup {
    return this.ingredientsList.at(this.selectedIngredientIndex) as FormGroup;
  }

  get ingredientsList(): FormArray {
    return this.selectedForm.get('ingredientsList') as FormArray;
  }

  setIngredientsLength(length: number) {
    length = this.ingredientsList.length;
    if (length < this.getNumberOfIngredients().length) {
      for (let i = length; i < this.getNumberOfIngredients().length; i++) {
        this.ingredientsList.push(this.formBuilder.group({
          id: [''],
          name: [''],
          quantity: ['']
        }));
      }
    } else if (length > this.getNumberOfIngredients().length) {
      for (let i = length; i > this.getNumberOfIngredients().length; i--) {
        this.ingredientsList.removeAt(i - 1);
      }
    }
  }

  selectedIngredientIndex: number = -1;

  openIngredientDialog(index: number) {
    console.log('index', index);
    this.selectedIngredientIndex = index;
    this.ingredientDialog = true;
  }

  addIngredient() {
    this.showAddedIngredient[this.selectedIngredientIndex] = true
    this.ingredientDialog = !this.ingredientDialog;
  }

  removeIngredient(index: number) {
    // TODO: remove from the list
    const groupToReset = this.ingredientsList.at(index) as FormGroup;

    groupToReset.patchValue({
      id: '',
      name: '',
      quantity: ''
    });

    this.ingredientExists[index] = true;
    this.showAddedIngredient[index] = false;
  }

  createCocktail() {
    console.log('cocktail created!!!', this.selectedForm.value);
    this.http.post(this.submissionAPI,
      {
        name: this.selectedForm.value.name,
        instructions: this.selectedForm.value.instructions,
        glass: this.selectedForm.value.glass,
        category: this.selectedForm.value.type,
        alcoholic: this.selectedForm.value.alcoholic === 'Alcoholic' ? true : false,
        imageUrl: null,
        ingredients: this.selectedForm.value.ingredientsList.map((ingredient: any) => ({
          ingredientId: ingredient.id,
          proposedName: ingredient.name,
          quantity: ingredient.quantity
        }))
      }
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Logout successful',
          detail: 'You have been logged out',
          life: 3000,
          closable: true,
        });
      },
      error: (error: any) => {
        if (error.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'You are not authorized to perform this action',
            life: 3000,
            closable: true,
          });
        } else if (error.status === 400) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Bad request, please check your input',
            life: 3000,
            closable: true,
          });
        }
      }
    });
  }

  clearAll() {
    this.selectedForm.reset();
    this.ingredientExists = Array.from({ length: this.getNumberOfIngredients().length }, () => true);
    this.showAddedIngredient = Array.from({ length: this.getNumberOfIngredients().length }, () => false);
    this.setIngredientsLength(this.getNumberOfIngredients().length);
  }
}
