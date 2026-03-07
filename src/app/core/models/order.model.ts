/**
 * Enum para los estados posibles de una orden de pago
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

/**
 * Request para crear una nueva orden
 */
export interface CreateOrderRequest {
  description: string;
  amount: number;
}

/**
 * Request para filtrar órdenes
 */
export interface OrderFilterRequest {
  status?: OrderStatus;
  createdBy?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Request para rechazar una orden
 */
export interface RejectOrderRequest {
  rejectionReason: string;
}

/**
 * Response con información resumida de una orden
 */
export interface OrderResponse {
  id: number;
  description: string;
  amount: number;
  status: OrderStatus;
  createdByEmail: string;
  createdByName: string;
  hasInvoice: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response con información detallada de una orden
 */
export interface OrderDetailResponse {
  id: number;
  description: string;
  amount: number;
  status: OrderStatus;
  createdByEmail: string;
  createdByName: string;
  approvedByEmail?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  rejectedByEmail?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  hasInvoice: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response paginada de órdenes
 */
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
