import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { CreateOrderRequest } from '../../../core/models/order.model';
import { AlertService } from '../../../core/services/alert.service';

/**
 * Componente para crear una nueva orden de pago.
 * Solo accesible para usuarios con rol OPERATOR.
 */
@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent {
  orderForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router,
    private alertService: AlertService
  ) {
    this.orderForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const request: CreateOrderRequest = {
      description: this.orderForm.value.description,
      amount: parseFloat(this.orderForm.value.amount)
    };

    this.orderService.createOrder(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.alertService.success('¡Orden Creada!', 'La orden se ha creado exitosamente').then(() => {
          this.router.navigate(['/dashboard/orders', response.id]);
        });
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.message || 'Error al crear la orden';
        this.alertService.error('Error', errorMsg);
      }
    });
  }

  /**
   * Cancela y regresa a la lista
   */
  cancel(): void {
    this.router.navigate(['/dashboard/orders']);
  }

  /**
   * Verifica si un campo tiene errores
   */
  hasError(field: string): boolean {
    const control = this.orderForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(field: string): string {
    const control = this.orderForm.get(field);
    
    if (control?.hasError('required')) {
      return `El campo ${field === 'description' ? 'descripción' : 'monto'} es obligatorio`;
    }
    
    if (field === 'description') {
      if (control?.hasError('minlength')) {
        return 'La descripción debe tener al menos 5 caracteres';
      }
      if (control?.hasError('maxlength')) {
        return 'La descripción no puede exceder 500 caracteres';
      }
    }
    
    if (field === 'amount') {
      if (control?.hasError('min')) {
        return 'El monto debe ser mayor a 0';
      }
    }
    
    return '';
  }

  /**
   * Formatea el valor del monto mientras el usuario escribe
   */
  formatAmount(): void {
    const amountControl = this.orderForm.get('amount');
    if (amountControl?.value) {
      const value = parseFloat(amountControl.value);
      if (!isNaN(value)) {
        amountControl.setValue(value, { emitEvent: false });
      }
    }
  }
}
