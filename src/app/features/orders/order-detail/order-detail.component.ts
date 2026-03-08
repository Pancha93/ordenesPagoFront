import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { OrderDetailResponse, OrderStatus } from '../../../core/models/order.model';
import { InvoiceResponse } from '../../../core/models/invoice.model';
import { UserRole } from '../../../core/models/user.model';

/**
 * Componente para ver el detalle de una orden.
 * Permite:
 * - Ver toda la información de la orden
 * - Subir facturas (OPERATOR)
 * - Aprobar o rechazar órdenes (ADMIN)
 */
@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  orderId: number = 0;
  order: OrderDetailResponse | null = null;
  invoice: InvoiceResponse | null = null;
  
  loading = false;
  loadingInvoice = false;
  errorMessage = '';
  successMessage = '';
  
  // Para subir factura
  selectedFile: File | null = null;
  uploadingInvoice = false;
  uploadError = '';
  
  // Para rechazar orden
  showRejectModal = false;
  rejectForm: FormGroup;
  rejectingOrder = false;
  
  // Para aprobar orden
  approvingOrder = false;

  // Enums para el template
  OrderStatus = OrderStatus;
  UserRole = UserRole;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private invoiceService: InvoiceService,
    public authService: AuthService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.rejectForm = this.fb.group({
      rejectionReason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadOrder();
        this.loadInvoice();
      }
    });
  }

  /**
   * Carga el detalle de la orden
   */
  loadOrder(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.message || 'Error al cargar la orden';
        this.alertService.error('Error', errorMsg);
        this.errorMessage = errorMsg;
      }
    });
  }

  /**
   * Carga la factura si existe
   */
  loadInvoice(): void {
    this.loadingInvoice = true;
    
    this.invoiceService.getInvoiceByOrderId(this.orderId).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.loadingInvoice = false;
      },
      error: () => {
        // Si no hay factura, no mostrar error
        this.loadingInvoice = false;
      }
    });
  }

  /**
   * Maneja la selección de archivo
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        this.uploadError = 'Solo se permiten archivos PDF o imágenes (JPG, PNG)';
        this.selectedFile = null;
        return;
      }
      
      // Validar tamaño (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.uploadError = 'El archivo no debe superar los 5MB';
        this.selectedFile = null;
        return;
      }
      
      this.selectedFile = file;
      this.uploadError = '';
    }
  }

  /**
   * Sube la factura
   */
  uploadInvoice(): void {
    if (!this.selectedFile) return;
    
    this.uploadingInvoice = true;
    this.uploadError = '';
    
    this.invoiceService.uploadInvoice(this.orderId, this.selectedFile).subscribe({
      next: (invoice) => {
        this.uploadingInvoice = false;
        this.invoice = invoice;
        this.selectedFile = null;
        this.alertService.toast('Factura subida exitosamente', 'success');
        this.loadOrder(); // Recargar para actualizar hasInvoice
      },
      error: (error) => {
        this.uploadingInvoice = false;
        const errorMsg = error.error?.message || 'Error al subir la factura';
        this.alertService.error('Error al Subir Factura', errorMsg);
        this.uploadError = errorMsg;
      }
    });
  }

  /**
   * Visualiza la factura en una nueva pestaña
   */
  viewInvoice(): void {
    if (this.invoice) {
      this.invoiceService.viewInvoice(this.invoice.downloadUrl);
    }
  }

  /**
   * Descarga la factura (forzar descarga)
   */
  downloadInvoice(): void {
    if (this.invoice) {
      this.invoiceService.downloadInvoice(this.invoice.downloadUrl);
    }
  }

  /**
   * Aprueba la orden (solo ADMIN)
   */
  approveOrder(): void {
    this.alertService.confirm(
      '¿Aprobar esta orden?',
      'Esta acción aprobará la orden de pago y enviará la notificación al sistema externo.',
      'Sí, aprobar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.approvingOrder = true;
        this.errorMessage = '';
        
        this.orderService.approveOrder(this.orderId).subscribe({
          next: () => {
            this.approvingOrder = false;
            this.alertService.success('¡Orden Aprobada!', 'La orden se ha aprobado exitosamente');
            this.loadOrder();
          },
          error: (error) => {
            this.approvingOrder = false;
            const errorMsg = error.error?.message || 'Error al aprobar la orden';
            this.alertService.error('Error', errorMsg);
            this.errorMessage = errorMsg;
          }
        });
      }
    });
  }

  /**
   * Abre el modal para rechazar la orden
   */
  openRejectModal(): void {
    this.showRejectModal = true;
    this.rejectForm.reset();
  }

  /**
   * Cierra el modal de rechazo
   */
  closeRejectModal(): void {
    this.showRejectModal = false;
    this.rejectForm.reset();
  }

  /**
   * Rechaza la orden (solo ADMIN)
   */
  rejectOrder(): void {
    if (this.rejectForm.invalid) {
      this.rejectForm.markAllAsTouched();
      return;
    }
    
    this.rejectingOrder = true;
    this.errorMessage = '';
    
    this.orderService.rejectOrder(this.orderId, this.rejectForm.value).subscribe({
      next: () => {
        this.rejectingOrder = false;
        this.closeRejectModal();
        this.alertService.success('Orden Rechazada', 'La orden ha sido rechazada correctamente');
        this.loadOrder();
      },
      error: (error) => {
        this.rejectingOrder = false;
        const errorMsg = error.error?.message || 'Error al rechazar la orden';
        this.alertService.error('Error', errorMsg);
        this.errorMessage = errorMsg;
      }
    });
  }

  /**
   * Volver a la lista
   */
  goBack(): void {
    this.router.navigate(['/dashboard/orders']);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Formatea el tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /**
   * Verifica si se puede aprobar/rechazar la orden
   */
  canApproveOrReject(): boolean {
    return this.authService.isAdmin() && this.order?.status === OrderStatus.PENDING;
  }

  /**
   * Verifica si se puede subir factura (solo OPERATOR)
   */
  canUploadInvoice(): boolean {
    return this.authService.isOperator() && 
           !this.invoice && 
           this.order?.status === OrderStatus.PENDING;
  }

  /**
   * Verifica si se puede ver/descargar factura
   */
  canViewInvoice(): boolean {
    return !!this.invoice;
  }
}
