import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

/**
 * Servicio para mostrar alertas usando SweetAlert2.
 * Envuelve la librería SweetAlert2 para proporcionar métodos consistentes
 * y personalizados para mostrar notificaciones en toda la aplicación.
 */
@Injectable({
  providedIn: 'root'
})
export class AlertService {

  /**
   * Muestra una alerta de éxito
   */
  success(title: string, message?: string): Promise<any> {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: '#667eea',
      confirmButtonText: 'Aceptar',
      timer: 3000,
      timerProgressBar: true
    });
  }

  /**
   * Muestra una alerta de error
   */
  error(title: string, message?: string): Promise<any> {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonColor: '#667eea',
      confirmButtonText: 'Aceptar'
    });
  }

  /**
   * Muestra una alerta de advertencia
   */
  warning(title: string, message?: string): Promise<any> {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonColor: '#667eea',
      confirmButtonText: 'Aceptar'
    });
  }

  /**
   * Muestra una alerta informativa
   */
  info(title: string, message?: string): Promise<any> {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      confirmButtonColor: '#667eea',
      confirmButtonText: 'Aceptar'
    });
  }

  /**
   * Muestra una alerta de confirmación con botones Sí/No
   */
  confirm(title: string, message?: string, confirmButtonText: string = 'Sí, confirmar'): Promise<any> {
    return Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancelar'
    });
  }

  /**
   * Muestra un toast (notificación pequeña en la esquina)
   */
  toast(title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success'): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: icon,
      title: title
    });
  }

  /**
   * Muestra un loader mientras se ejecuta una promesa
   */
  showLoading(title: string = 'Procesando...'): void {
    Swal.fire({
      title: title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Cierra el loader
   */
  closeLoading(): void {
    Swal.close();
  }
}
