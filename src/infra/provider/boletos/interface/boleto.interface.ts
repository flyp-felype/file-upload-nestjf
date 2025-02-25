export interface GenerateBoletoDto {
  amount: number;
  payerName: string;
  payerDocument: string;
  dueDate: Date;
}

export interface BoletoResponse {
  barcode: string;
  digitableLine: string;
  dueDate: Date;
  amount: number;
}
