import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { SplitButton } from 'primeng/splitbutton';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, FormsModule, FormBuilder } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-profile-button',
  imports: [ButtonModule, Dialog, InputTextModule, AvatarModule,
            CheckboxModule, ReactiveFormsModule, FormsModule,
            PasswordModule, DividerModule, ToastModule, NgIf, SplitButton],
  standalone: true,
  templateUrl: './profile-button.component.html',
  styleUrl: './profile-button.component.scss',
  providers: [MessageService]
})
export class ProfileButtonComponent implements OnInit {

  // TODO: fix and add things to the login form
  // TODO: add auth service for login and register

    // Button names
  registerButton: string = 'Sign Up';
  loginButton: string = 'Login';
  profileButton: string = 'Profile';

    // Messages for login and register
  messages: string[] = [
    'Please login with your credentials',
    'Please insert email and password to register',
    'I accept the terms and conditions.',
  ];

    // Booleans
  visibles: { [key: string]: boolean } = {
    isLoggedIn: false,
    loginDialogVisible: false,
    registerDialogVisible: false,
  };

  items: MenuItem[];

    // Form groups
  privacyForm!: FormGroup;
  credentialsForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router)
  {
    this.credentialsForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
    // * PROFILE BUTTON LIST
    this.items = [
      {
        label: 'Profile',
        icon: 'pi pi-fw pi-user',
        url: '/profile',
      },
      {
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
        url: '/profile/settings',
        // TODO: learn how to add settings to the url from a button on the profile page
        //   this.router.navigate(['/profile/settings']);
      },
      {
        label: 'Privacy',
        icon: 'pi pi-fw pi-shield',
        command: () => {
          // TODO: add a privacy policy dialog when this is clicked.
          // showPrivacyPolicy();
        }
      },
      {
        label: 'Logout',
        icon: 'pi pi-fw pi-sign-out',
        command: () => {
          this.authService.logout()
            .subscribe({
              next: (response: any) => {
                if (response) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Logout successful',
                    detail: 'You have been logged out',
                    life: 3000,
                    closable: true,
                  });
                }
              },
              error: (error: any) => {
                console.error('Logout failed', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Logout failed',
                  detail: 'Please try again later',
                  life: 5000,
                  closable: true,
                });
              }
            })
          this.visibles['isLoggedIn'] = false;
        }
      }
    ];
  }

  ngOnInit(): void {
    this.privacyForm = new FormGroup({
      privacyCheck: new FormControl<boolean>(false, Validators.requiredTrue)
    });
  }

  resetForm() {
    this.credentialsForm.reset();
  }

  setLoginVisible() {
    this.visibles['loginDialogVisible'] = !this.visibles['loginDialogVisible'];
    if (this.visibles['loginDialogVisible']) {
      this.credentialsForm.reset();
      this.privacyForm.reset({ privacyCheck: false });
    }
    console.log('Login form is visible', this.visibles['loginDialogVisible']);
  }

  // * This function is used to show the register form
  setRegisterVisible() {
    this.visibles['registerDialogVisible'] = !this.visibles['registerDialogVisible'];
    if (this.visibles['registerDialogVisible']) {
      this.credentialsForm.reset();
      this.privacyForm.reset({ privacyCheck: false });
    }
  }

  showError() {
    this.messageService.add({
      severity: 'warn',
      summary: 'Missing fields',
      detail: 'Please fill in all the fields',
      life: 3000,
      closable: true,
    });
  }

  checkForEmptyFields(): boolean {
    if (this.credentialsForm.invalid) {
      console.error('Please fill in all the fields');
      this.showError();
      return true;
    }
    return false;
  }

  // * LOGIN
  sendLoginData() {
    if (this.checkForEmptyFields())
      return;
    console.log('Login data sent', this.credentialsForm.controls['email'].value, this.credentialsForm.controls['password'].value);
    this.authService.login(
      this.credentialsForm.controls['email'].value,
      this.credentialsForm.controls['password'].value)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.messageService.add({
              severity: 'success',
              summary: 'Login successful',
              detail: 'You can now access your profile',
              life: 3000,
              closable: true,
            });
          }
          this.visibles['isLoggedIn'] = true;
        },
        error: (error: any) => {
          console.error('Login failed', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Login failed',
            detail: 'Please try again later',
            life: 5000,
            closable: true,
          });
        }
      });
    this.visibles['isLoggedIn'] = true;
    this.setLoginVisible();
  }


  // * REGISTRATION
  sendRegisterData() {
    if (this.checkForEmptyFields())
      return;
    console.log('Register data sent', this.credentialsForm.controls['email'].value, this.credentialsForm.controls['password'].value);
    // ! to comment for profile button check
    this.authService.register(
      this.credentialsForm.controls['email'].value,
      this.credentialsForm.controls['password'].value)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.messageService.add({
              severity: 'success',
              summary: 'Registration successful',
              detail: 'You can now access your profile',
              life: 3000,
              closable: true,
            });
          }
          this.visibles['isLoggedIn'] = true;
        },
        error: (error: any) => {
          console.error('Registration failed', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Registration failed',
            detail: 'Please try again later',
            life: 5000,
            closable: true,
          });
        }

      })
    this.visibles['isLoggedIn'] = true;
    this.setRegisterVisible();
  }
}
