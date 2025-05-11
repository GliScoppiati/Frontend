import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AdminService, LeftButtonsComponent, ProfileButtonComponent, SearchService, SearchInput } from 'shared';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Router } from '@angular/router';
import { Image } from 'primeng/image';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { HttpClient } from '@angular/common/http';
import { Card } from 'primeng/card';
import { Paginator } from 'primeng/paginator';
import { forkJoin } from 'rxjs';
import { Toast } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

interface Submission {
  id: string;
  name: string;
  instructions: string;
  glass: string;
  category: string;
  image: string;
  status: string;
  createdAt: string;
  isAlcoholic: boolean;
  ingredients: Ingredient[];
}

interface showDialog {
  ingredient: boolean;
  instructions: boolean;
}

interface Cocktail {
  id: string;
  name: string;
  image: string;
  openDialog: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  isAdmin: boolean;
  isBanned: boolean;
  alcoholAllowed: boolean;
  consentGdpr: boolean;
  consentProfiling: boolean;
  createdAt: string;
  lastLogin: string;
  openDialog: boolean;
}

// ?submission section
// ?users section
// ?users stats
// ?cocktail stats
// ?manage cocktails with research
// * reload db

@Component({
  selector: 'app-admin',
  imports: [
    Dialog, CommonModule, Button, TableModule,
    LeftButtonsComponent, ProfileButtonComponent,
    TagModule, Image, FloatLabel, ReactiveFormsModule,
    InputText, Card, Paginator, Toast, ConfirmDialog,
    MessageModule
   ],
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class AdminComponent implements OnInit {

  // * cocktail paginator
  paginatedResults: Cocktail[] = [];
  rowsPerPageOptions = [12, 18, 24];
  first: number = 0;
  rows: number = 12;

  // TODO: RELOAD DA FARE IMPORTANTE !!!!!!!

  // * db management
  private taskDatabaseId: string = '';
  statusDialog: boolean = false;
  statusResponse = {
    status: '',
    startedAt: '',
    completedAt: '',
    insertedCount: 0,
  }

  // ? cocktail import buttons
  // ! import db e status task -> quando importDb e' completato chiamare import ingredient da submission service
  // ! tutta la cartella data import da cocktail service
  // ! ultimo ma piu' importante reload da search service/admin

  // * not admin dialog
  visible: boolean = true;
  dialogHeader: string = 'Cannot access to this page';

  // * tab buttons menu
  selectedMenu: string = 'pendingSubmissions';

  // * pending submissions
  cocktailSubmissions: Submission[] = [];

  // * boolean array for buttons
  showDialogs: showDialog[] = [];

  // * search form
  searchForm!: FormGroup;
  filters: SearchInput[] = [];

  // * cocktails
  cocktailResults: Cocktail[] = [];

  // * users
  userProfiles: UserProfile[] = [];

  // * SUBMISSION API
  private approveSubmissionAPI: string = 'http://localhost:5000/submission/admin/approve/';
  private rejectSubmissionAPI: string = 'http://localhost:5000/submission/admin/reject/';

  // * USER PROFILE API
  private userProfilesAPI: string = 'http://localhost:5000/userprofile/api/admin/profiles';
  private userProfileStatsAPI: string = 'http://localhost:5000/userprofile/api/admin/stats';

  private userAPI: string = 'http://localhost:5000/auth/api/admin/users';
  private userStatsAPI: string = 'http://localhost:5000/auth/api/admin/stats';

  private forceLogoutAPI: string = 'http://localhost:5000/auth/api/admin/force-logout/';

  // * COCKTAIL API JUST FOR ADMIN
  private cocktailAPI: string = 'http://localhost:5000/cocktail/single/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private searchService: SearchService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private adminService: AdminService
  ) {
    this.searchForm = this.formBuilder.group({
      filterName: '',
    });
  }

  // * INIT
  ngOnInit(): void {
    this.getPendingSubmissions();

    this.searchBarChanges();

    this.getUserProfiles();
  }

  // * SUBMISSION FUNCTIONS ----------------

  getPendingSubmissions(): void {
    this.authService.getPendingSubmissions().subscribe({
      next: (res: any) => {
        this.cocktailSubmissions = res.map((submission: any) => ({
          id: submission.submissionId,
          name: submission.name,
          instructions: submission.instructions,
          glass: submission.glass,
          category: submission.category,
          image: submission.imageUrl,
          status: submission.status,
          createdAt: submission.createdAt,
          isAlcoholic: submission.isAlcoholic,
          instructionsVisible: false,
          ingredients: submission.ingredients.map((ingredient: any) => ({
            id: ingredient.ingredientId,
            name: ingredient.proposedName,
            quantity: ingredient.quantity
          }))
        }));

        this.showDialogs = res.map(() => ({
          ingredient: false,
          instructions: false
        }));
      }
    });
  }

  getStatusSeverity(status: string): "warn" | "success" | "danger" {
    if (status === 'Approved') {
      return "success";
    } else if (status === 'Rejected') {
      return "danger";
    }
    return "warn";
  }


  approveSubmission(submissionId: string): void {
    this.http.patch(`${this.approveSubmissionAPI}${submissionId}`, {})
    .subscribe({
        next: () => {
          this.refreshList();
        },
        error: (err) => {
          console.error('Error approving submission', err);
        }
      });
    }

    rejectSubmission(submissionId: string): void {
    this.http.patch(`${this.rejectSubmissionAPI}${submissionId}`, {})
    .subscribe({
        next: () => {
          this.refreshList();
        },
        error: (err) => {
          console.error('Error rejecting submission', err);
        }
      });
    }

    setVisible(section: string, index: number): void {
    if (section === 'ingredient') {
      this.showDialogs[index].ingredient = !this.showDialogs[index].ingredient;
    } else if (section === 'instructions') {
      this.showDialogs[index].instructions = !this.showDialogs[index].instructions;
    }
  }

  // * ----------------------------------

  // * REGULAR FUNCTIONS (COMMON USED)---

  refreshList(): void {
    if (this.selectedMenu === 'pendingSubmissions')
      this.getPendingSubmissions();
    else if (this.selectedMenu === 'userManagement')
      this.getUserProfiles();
  }

  selectMenu(menu: string): void {
    this.selectedMenu = menu;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  redirectHome(): void {
    this.router.navigate(['/home']);
  }

  // * ----------------------------------

  // * COCKTAIL MANAGEMENT FUNCTIONS ----

  searchBarChanges(): void {
    this.searchForm.valueChanges
    .pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter((value => value.filterName && value.filterName.trim().length > 0))
    )
    .subscribe((value) => {
      this.filters[0] = {
        filterName: value.filterName,
        filterType: 'cocktail'
      };
      this.searchService.searchCocktailsForAdmin(this.filters)
        .subscribe((res: any) => {
          this.cocktailResults = res.map((cocktail: any) => ({
            id: cocktail.cocktailId,
            name: cocktail.name,
            image: cocktail.imageUrl,
            openDialog: false
          }));
          this.paginatedResults = this.cocktailResults.slice(this.first, this.first + this.rows);
        });
      });
  }

  onPageChange(event: any): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    if (this.selectedMenu === 'cocktailManagement')
      this.paginatedResults = this.cocktailResults.slice(this.first, this.first + this.rows);
  }

  editCocktail(cocktailId: string): void {

  }

  deleteCocktail(id: string): void {
    this.http.delete(`${this.cocktailAPI}${id}`)
      .subscribe({
        next: () => {
          this.searchBarChanges();
        },
        error: (err) => {
          console.error('Error deleting cocktail', err);
        }
      })
  }

  // * ----------------------------------

  // * USER MANAGEMENT FUNCTIONS --------

  getUserProfiles(): void {
    forkJoin({
      profiles: this.http.get(this.userProfilesAPI),
      users: this.http.get(this.userAPI)
    }).subscribe({
      next: ({ profiles, users }: any) => {
        this.userProfiles = users.map((user: any) => {
          const profile = profiles.find((p: any) => p.userId === user.id);
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            isBanned: user.isDeleted,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            // Merge from profile if found
            firstName: profile?.firstName,
            lastName: profile?.lastName,
            birthDate: profile?.birthDate,
            alcoholAllowed: profile?.alcoholAllowed,
            consentGdpr: profile?.consentGdpr,
            consentProfiling: profile?.consentProfiling,
            openDialog: false
          };
        });
      },
      error: (err) => {
        console.error('Error fetching user data', err);
      }
    });
  }

  confirmBan(userId: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to ban this user?',
      header: 'Confirm Ban',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ban',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        console.log('User banned', userId);
        this.deleteUser(userId);
      }
    });
  }

  confirmChangeRole(userId: string, isAdmin: boolean): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to ${isAdmin ? 'revoke admin rights from' : 'grant admin rights to'} this user?`,
      header: 'Confirm Role Change',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: isAdmin ? 'Revoke' : 'Grant',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: isAdmin ? 'p-button-danger' : 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
      this.changeRole(userId, !isAdmin);
      }
    });
  }

  changeRole(userId: string, makeAdmin: boolean): void {
    this.adminService.changeRole(userId, makeAdmin).subscribe({
      next: (res: any) => {
        this.refreshList();
      },
      error: (err) => {
        console.error('Error changing user role', err);
      }
    });
  }


  deleteUser(userId: string): void {
    // * ORDER MATTERS
    // * 1. Delete user profile
    // * 2. Delete user
    // * 3. Force logout user if logged in
    this.http.delete(`${this.userProfilesAPI}/${userId}`)
      .subscribe({
        next: () => {
          this.http.delete(`${this.userAPI}/${userId}`)
            .subscribe({
              next: () => {
                this.http.post(`${this.forceLogoutAPI}${userId}`, {})
                  .subscribe({
                    next: () => {
                      console.log('User deleted and logged out successfully');
                      this.refreshList();
                    },
                    error: (err) => {
                      if (err.status === 404) {
                        this.refreshList();
                      } else
                        console.error('Error logging out user', err);
                    }
                  });
              },
              error: (err) => {
                console.error('Error deleting user', err);
              }
            });
        },
        error: (err) => {
          console.error('Error deleting user profile', err);
        }
      });
  }

  // * ----------------------------------

  // * USER STATS FUNCTIONS -------------



  // * ----------------------------------

  // * DB MANAGEMENT FUNCTIONS ---------

  importDB(): void {
    this.adminService.importDb().subscribe({
      next: (res: any) => {
        this.taskDatabaseId = res.taskId;
      },
      error: (err) => {
        console.error('Error importing database', err);
      }
    });
  }

  getStatusTask(): void {
    this.adminService.getImportDbStatus(this.taskDatabaseId)
      .subscribe({
        next: (res: any) => {
          this.statusResponse.startedAt = res.startedAt;
          this.statusResponse.status = res.status;
          this.statusResponse.completedAt = res.completedAt;
          this.statusResponse.insertedCount = res.insertedCount;
        },
        error: (err) => {
          console.error('Error getting status task', err);
        }
      });
  }

  importSubmissionIngredients(): void {
    // ? need a body?
    this.adminService.importNewIngredients().subscribe({
      next: (res: any) => {
        console.log('Submission ingredients imported', res);
      },
      error: (err) => {
        console.error('Error importing submission ingredients', err);
      }
    });
  }

  importIngredients(): void {
    this.adminService.importIngredients().subscribe({
      next: (res: any) => {
        console.log('Ingredients imported', res);
      },
      error: (err) => {
        console.error('Error importing ingredients', err);
      }
    });
  }

  importCocktails(): void {
    this.adminService.importCocktails().subscribe({
      next: (res: any) => {
        console.log('Cocktails imported', res);
      },
      error: (err) => {
        console.error('Error importing cocktails', err);
      }
    });
  }

  importCocktailsWithIngredients(): void {
    this.adminService.importIngredientsMap().subscribe({
      next: (res: any) => {
        console.log('Cocktails with ingredients imported', res);
      },
      error: (err) => {
        console.error('Error importing cocktails with ingredients', err);
      }
    });
  }

  importAll(): void {
    this.adminService.importAll().subscribe({
      next: (res: any) => {
        console.log('All imported', res);
      },
      error: (err) => {
        console.error('Error importing all', err);
      }
    });
  }

  reloadSearchDatabase(): void {
    this.adminService.reloadSearchDb().subscribe({
      next: (res: any) => {
        console.log('Search database reloaded', res);
      },
      error: (err) => {
        console.error('Error reloading search database', err);
      }
    });
  }

}
