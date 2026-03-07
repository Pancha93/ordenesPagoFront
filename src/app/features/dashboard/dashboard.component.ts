import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CurrentUser, UserRole } from '../../core/models/user.model';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  roles: UserRole[];
}

/**
 * Componente Dashboard.
 * Layout principal de la aplicación con menú de navegación dinámico según el rol.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: CurrentUser | null = null;
  menuOpen = true;

  // Menú de navegación con restricciones por rol
  menuItems: MenuItem[] = [
    {
      label: 'Órdenes',
      route: '/dashboard/orders',
      icon: '📋',
      roles: [UserRole.ADMIN, UserRole.OPERATOR]
    },
    {
      label: 'Crear Orden',
      route: '/dashboard/orders/create',
      icon: '➕',
      roles: [UserRole.OPERATOR]
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  /**
   * Verifica si un item del menú debe mostrarse según el rol del usuario
   */
  shouldShowMenuItem(item: MenuItem): boolean {
    if (!this.currentUser) {
      return false;
    }
    return item.roles.includes(this.currentUser.role);
  }

  /**
   * Obtiene los items del menú filtrados por rol
   */
  get filteredMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => this.shouldShowMenuItem(item));
  }

  /**
   * Toggle del menú lateral
   */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Obtiene el badge del rol
   */
  getRoleBadgeClass(): string {
    return this.currentUser?.role === UserRole.ADMIN ? 'badge-admin' : 'badge-operator';
  }

  /**
   * Obtiene el texto del rol
   */
  getRoleText(): string {
    return this.currentUser?.role === UserRole.ADMIN ? 'Administrador' : 'Operador';
  }
}
