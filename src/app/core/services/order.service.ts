import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateOrderRequest,
  OrderFilterRequest,
  RejectOrderRequest,
  OrderResponse,
  OrderDetailResponse,
  PageResponse
} from '../models/order.model';
import { environment } from '../config/environment';

/**
 * Servicio para la gestión de órdenes de pago.
 * Consume los endpoints del backend relacionados con órdenes.
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Crea una nueva orden de pago
   */
  createOrder(request: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.API_URL, request);
  }

  /**
   * Lista órdenes con filtros y paginación
   */
  listOrders(
    filter: OrderFilterRequest = {},
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    direction: string = 'DESC'
  ): Observable<PageResponse<OrderResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    // Agregar filtros si están presentes
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.createdBy) {
      params = params.set('createdBy', filter.createdBy);
    }
    if (filter.fromDate) {
      params = params.set('fromDate', filter.fromDate);
    }
    if (filter.toDate) {
      params = params.set('toDate', filter.toDate);
    }

    return this.http.get<PageResponse<OrderResponse>>(this.API_URL, { params });
  }

  /**
   * Obtiene el detalle de una orden por ID
   */
  getOrderById(id: number): Observable<OrderDetailResponse> {
    return this.http.get<OrderDetailResponse>(`${this.API_URL}/${id}`);
  }

  /**
   * Aprueba una orden (solo ADMIN)
   */
  approveOrder(id: number): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.API_URL}/${id}/approve`, {});
  }

  /**
   * Rechaza una orden (solo ADMIN)
   */
  rejectOrder(id: number, request: RejectOrderRequest): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.API_URL}/${id}/reject`, request);
  }
}
