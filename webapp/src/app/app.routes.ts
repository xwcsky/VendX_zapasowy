import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';
import { ColognesListComponent } from './shop/components/colognes-list/colognes-list.component';
import {ShopComponent} from './shop/views/shop.component/shop.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'shop', component: ShopComponent },
      { path: '', redirectTo: 'shop', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: '' },
];
