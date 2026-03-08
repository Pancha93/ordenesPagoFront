import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceResponse } from '../models/invoice.model';
import { environment } from '../config/environment';

/**
 * Servicio para la gestión de facturas.
 * Maneja la carga y consulta de facturas asociadas a órdenes.
 */
@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly API_URL = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  /**
   * Sube una factura para una orden específica
   */
  uploadInvoice(orderId: number, file: File): Observable<InvoiceResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<InvoiceResponse>(
      `${this.API_URL}/upload/${orderId}`,
      formData
    );
  }

  /**
   * Obtiene la información de la factura asociada a una orden
   */
  getInvoiceByOrderId(orderId: number): Observable<InvoiceResponse> {
    return this.http.get<InvoiceResponse>(`${this.API_URL}/order/${orderId}`);
  }

  /**
   * Visualiza una factura en una nueva pestaña (inline)
   */
  viewInvoice(downloadUrl: string): void {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  }

  /**
   * Descarga una factura forzando la descarga del archivo
   */
  downloadInvoice(downloadUrl: string): void {
    if (downloadUrl) {
      // Agregar /download al final de la URL para forzar descarga
      const forceDownloadUrl = downloadUrl + '/download';
      window.open(forceDownloadUrl, '_blank');
    }
  }
}
