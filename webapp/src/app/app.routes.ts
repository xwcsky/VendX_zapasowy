import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';
import { ColognesListComponent } from './shop/components/colognes-list/colognes-list.component';
import {ShopComponent} from './shop/views/shop/shop.component';
import {AdminComponent} from './admin/views/admin/admin.component';
import {PayComponent} from './payment/views/pay.component/pay.component';
import {ConfirmComponent} from './payment/views/confirm.component/confirm.component';
import {ErrorComponent} from './payment/views/error.component/error.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { breadcrumb: 'Logowanie' } },
  { path: 'payment', component: PayComponent, data: { breadcrumb: 'Płatność' } },
  { path: 'payment/confirm', component: ConfirmComponent, data: { breadcrumb: 'Potwierdzenie' } },
  { path: 'payment/error', component: ErrorComponent, data: { breadcrumb: 'Błąd płatności' } },
  
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'shop', component: ShopComponent, data: { breadcrumb: 'Sklep' } },
      { path: 'admin', component: AdminComponent, data: { breadcrumb: 'Panel admina' } },
      { path: '', redirectTo: 'shop', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
