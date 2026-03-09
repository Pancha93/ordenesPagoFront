import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import {
  CreateOrderRequest,
  OrderFilterRequest,
  RejectOrderRequest,
  OrderResponse,
  OrderDetailResponse,
  PageResponse,
  OrderStatus
} from '../models/order.model';
import { environment } from '../config/environment';

/**
 * Tests unitarios para OrderService.
 * Prueba la lógica del servicio sin involucrar el DOM.
 */
describe('OrderService - Logic Tests (No DOM)', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  const API_URL = `${environment.apiUrl}/orders`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('createOrder', () => {
    it('debe crear una orden correctamente', (done) => {
      const request: CreateOrderRequest = {
        description: 'Pago de servicios de consultoría',
        amount: 1500000
      };

      const mockResponse: OrderResponse = {
        id: 1,
        description: request.description,
        amount: request.amount,
        status: OrderStatus.PENDING,
        createdByEmail: 'operator@test.com',
        createdByName: 'Test Operator',
        hasInvoice: false,
        createdAt: '2026-03-08T10:00:00',
        updatedAt: '2026-03-08T10:00:00'
      };

      service.createOrder(request).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(response.id).toBe(1);
          expect(response.status).toBe(OrderStatus.PENDING);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });

    it('debe manejar error al crear orden', (done) => {
      const request: CreateOrderRequest = {
        description: 'Test Order',
        amount: 1000000
      };

      service.createOrder(request).subscribe({
        next: () => done.fail('Expected error'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ message: 'Validation error' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('listOrders', () => {
    it('debe listar órdenes con paginación por defecto', (done) => {
      const mockResponse: Partial<PageResponse<OrderResponse>> = {
        content: [
          {
            id: 1,
            description: 'Orden 1',
            amount: 1000000,
            status: OrderStatus.PENDING,
            createdByEmail: 'operator@test.com',
            createdByName: 'Operator',
            hasInvoice: false,
            createdAt: '2026-03-08T10:00:00',
            updatedAt: '2026-03-08T10:00:00'
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10
      };

      service.listOrders().subscribe({
        next: (response) => {
          expect(response.content.length).toBe(1);
          expect(response.totalElements).toBe(1);
          expect(response.content[0].status).toBe(OrderStatus.PENDING);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne((request) => request.url === API_URL);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('sortBy')).toBe('createdAt');
      expect(req.request.params.get('direction')).toBe('DESC');
      req.flush(mockResponse);
    });

    it('debe aplicar filtros correctamente', (done) => {
      const filter: OrderFilterRequest = {
        status: OrderStatus.APPROVED,
        fromDate: '2026-03-01',
        toDate: '2026-03-08'
      };

      const mockResponse: Partial<PageResponse<OrderResponse>> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 20
      };

      service.listOrders(filter, 0, 20).subscribe({
        next: (response) => {
          expect(response.content).toEqual([]);
          expect(response.totalElements).toBe(0);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne((request) => request.url === API_URL);
      expect(req.request.params.get('status')).toBe('APPROVED');
      expect(req.request.params.get('fromDate')).toBe('2026-03-01');
      expect(req.request.params.get('toDate')).toBe('2026-03-08');
      expect(req.request.params.get('size')).toBe('20');
      req.flush(mockResponse);
    });
  });

  describe('getOrderById', () => {
    it('debe obtener el detalle de una orden', (done) => {
      const orderId = 123;
      const mockResponse: OrderDetailResponse = {
        id: orderId,
        description: 'Orden de prueba',
        amount: 2500000,
        status: OrderStatus.PENDING,
        createdByEmail: 'operator@test.com',
        createdByName: 'Operator',
        hasInvoice: false,
        createdAt: '2026-03-08T10:00:00',
        updatedAt: '2026-03-08T10:00:00'
      };

      service.getOrderById(orderId).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(response.id).toBe(orderId);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${API_URL}/${orderId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('debe manejar error cuando la orden no existe', (done) => {
      const orderId = 99999;

      service.getOrderById(orderId).subscribe({
        next: () => done.fail('Expected error'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/${orderId}`);
      req.flush({ message: 'Order not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('approveOrder', () => {
    it('debe aprobar una orden correctamente', (done) => {
      const orderId = 100;
      const mockResponse: OrderResponse = {
        id: orderId,
        description: 'Orden aprobada',
        amount: 3000000,
        status: OrderStatus.APPROVED,
        createdByEmail: 'operator@test.com',
        createdByName: 'Operator',
        hasInvoice: true,
        createdAt: '2026-03-08T10:00:00',
        updatedAt: '2026-03-08T11:00:00'
      };

      service.approveOrder(orderId).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(response.status).toBe(OrderStatus.APPROVED);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${API_URL}/${orderId}/approve`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });

    it('debe manejar error cuando no se puede aprobar', (done) => {
      const orderId = 100;

      service.approveOrder(orderId).subscribe({
        next: () => done.fail('Expected error'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/${orderId}/approve`);
      req.flush(
        { message: 'No se puede aprobar orden en estado APPROVED' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('rejectOrder', () => {
    it('debe rechazar una orden con razón', (done) => {
      const orderId = 200;
      const rejectRequest: RejectOrderRequest = {
        rejectionReason: 'Factura incompleta'
      };

      const mockResponse: OrderResponse = {
        id: orderId,
        description: 'Orden rechazada',
        amount: 1500000,
        status: OrderStatus.REJECTED,
        createdByEmail: 'operator@test.com',
        createdByName: 'Operator',
        hasInvoice: false,
        createdAt: '2026-03-08T10:00:00',
        updatedAt: '2026-03-08T11:30:00'
      };

      service.rejectOrder(orderId, rejectRequest).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(response.status).toBe(OrderStatus.REJECTED);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${API_URL}/${orderId}/reject`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(rejectRequest);
      req.flush(mockResponse);
    });

    it('debe validar que la razón de rechazo sea requerida', (done) => {
      const orderId = 200;
      const rejectRequest: RejectOrderRequest = {
        rejectionReason: ''
      };

      service.rejectOrder(orderId, rejectRequest).subscribe({
        next: () => done.fail('Expected error'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/${orderId}/reject`);
      req.flush(
        { message: 'Rejection reason is required' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });
});
