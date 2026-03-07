/**
 * Response con información de una factura
 */
export interface InvoiceResponse {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  orderId: number;
  uploadedAt: string;
}
