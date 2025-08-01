import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { UsersComponent } from './pages/users/users.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './guards/auth.guard';
import { ClientsComponent } from './pages/clients/clients.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { CasesComponent } from './pages/cases/cases.component';
import { ReportsComponent } from './pages/reports/reports.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'users', component: UsersComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'cases', component: CasesComponent },
      { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: '/home', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
