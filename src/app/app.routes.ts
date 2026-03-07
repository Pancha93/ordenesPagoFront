import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { operatorGuard } from './core/guards/operator.guard';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { OrderListComponent } from './features/orders/order-list/order-list.component';
import { CreateOrderComponent } from './features/orders/create-order/create-order.component';
import { OrderDetailComponent } from './features/orders/order-detail/order-detail.component';

export const routes: Routes = [
  // Ruta por defecto redirige al dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Login (accesible sin autenticación)
  {
    path: 'login',
    component: LoginComponent
  },
  
  // Dashboard (requiere autenticación)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'orders',
        pathMatch: 'full'
      },
      {
        path: 'orders',
        component: OrderListComponent
      },
      {
        path: 'orders/create',
        component: CreateOrderComponent,
        canActivate: [operatorGuard]
      },
      {
        path: 'orders/:id',
        component: OrderDetailComponent
      }
    ]
  },
  
  // Ruta wildcard para manejar rutas no encontradas
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
