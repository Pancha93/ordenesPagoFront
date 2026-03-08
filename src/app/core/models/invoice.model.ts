/**
 * Response con información de una factura
 */
export interface InvoiceResponse {
  id: number;
  orderId: number;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  downloadUrl: string;
  uploadedByEmail: string;
  uploadedAt: string;
}
