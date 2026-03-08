import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { OrderResponse, OrderStatus, OrderFilterRequest, PageResponse } from '../../../core/models/order.model';
import { UserRole } from '../../../core/models/user.model';

/**
 * Componente para listar órdenes con filtros y paginación.
 * Permite a los usuarios ver y filtrar las órdenes según su rol.
 */
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: OrderResponse[] = [];
  loading = false;
  errorMessage = '';
  
  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  // Filtros
  filters: OrderFilterRequest = {};
  statusFilter: OrderStatus | '' = '';
  
  // Ordenamiento
  sortBy = 'createdAt';
  sortDirection: 'ASC' | 'DESC' = 'DESC';

  // Enums para el template
  OrderStatus = OrderStatus;
  UserRole = UserRole;

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  /**
   * Carga las órdenes con los filtros actuales
   */
  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    // Preparar filtros
    const filter: OrderFilterRequest = {};
    if (this.statusFilter) {
      filter.status = this.statusFilter;
    }

    this.orderService.listOrders(
      filter,
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDirection
    ).subscribe({
      next: (response: PageResponse<OrderResponse>) => {
        this.orders = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.message || 'Error al cargar las órdenes';
        this.alertService.error('Error', errorMsg);
        this.errorMessage = errorMsg;
      }
    });
  }

  /**
   * Aplica los filtros y recarga las órdenes
   */
  applyFilters(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.statusFilter = '';
    this.filters = {};
    this.currentPage = 0;
    this.loadOrders();
  }

  /**
   * Cambia de página
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  /**
   * Cambia el ordenamiento
   */
  changeSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = field;
      this.sortDirection = 'DESC';
    }
    this.loadOrders();
  }

  /**
   * Obtiene la clase CSS Bootstrap según el estado
   */
  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-warning text-dark';
      case OrderStatus.APPROVED:
        return 'bg-success';
      case OrderStatus.REJECTED:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Obtiene el texto del estado
   */
  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.APPROVED:
        return 'Aprobada';
      case OrderStatus.REJECTED:
        return 'Rechazada';
      default:
        return status;
    }
  }

  /**
   * Formatea un monto
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Formatea una fecha
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Genera el array de páginas para la paginación
   */
  get pages(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages);
    
    if (end - start < maxPages) {
      start = Math.max(0, end - maxPages);
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
