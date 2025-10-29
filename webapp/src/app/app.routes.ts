import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';
import { ColognesListComponent } from './shop/components/colognes-list/colognes-list.component';
import {ShopComponent} from './shop/views/shop/shop.component';
import {AdminComponent} from './admin/views/admin/admin.component';
import {PayComponent} from './payment/views/pay.component/pay.component';
import {ConfirmComponent} from './payment/views/confirm.component/confirm.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'payment', component: PayComponent },
  { path: 'payment/confirm', component: ConfirmComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'shop', component: ShopComponent },
      { path: 'admin', component: AdminComponent },
      { path: '', redirectTo: 'shop', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: '' },
];
