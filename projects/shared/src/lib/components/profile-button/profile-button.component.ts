import { Component, OnInit, signal, effect } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, FormsModule, FormBuilder } from '@angular/forms';

@Component({
  selector: 'lib-profile-button',
  imports: [ButtonModule, Dialog, InputTextModule, AvatarModule,
            CheckboxModule, ReactiveFormsModule, FormsModule,
            PasswordModule, DividerModule, ToastModule],
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
  loginVisible: boolean = false;
  registerVisible: boolean = false;

    // Form groups
  privacyForm!: FormGroup;
  credentialsForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private messageService: MessageService) {
    this.credentialsForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
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
    this.loginVisible = !this.loginVisible;
  }

  // * This function is used to show the register form
  setRegisterVisible() {
    this.registerVisible = !this.registerVisible;
    if (this.registerVisible) {
      this.credentialsForm.reset();
      this.privacyForm.reset({ privacyCheck: false });
    }
  }

  sendLoginData() {
    console.log('Login data sent');
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

  sendRegisterData() {
    if (this.privacyForm.valid) {
      if (this.credentialsForm.invalid) {
        console.error('Please fill in all the fields');
        this.showError();
        return;
      }
      console.log('Data sent', this.credentialsForm.controls['email'].value, this.credentialsForm.controls['password'].value);
    }

    this.setRegisterVisible();
  }
}
