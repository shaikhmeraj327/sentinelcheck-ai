export enum AnalysisStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export interface CheckExtraction {
  bankName: string;
  payerName: string;
  payerAddress?: string;
  payeeName: string;
  date: string;
  amountNumeric: string;
  amountText: string;
  checkNumber: string;
  routingNumber: string;
  accountNumber: string;
  memo: string;
  isSigned: boolean;
  micrLine?: string;
}

export interface FraudAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  flag: string;
  description: string;
}

export interface FraudAnalysis {
  riskScore: number; // 0-100
  riskLevel: 'SAFE' | 'CAUTION' | 'SUSPICIOUS' | 'CRITICAL';
  alerts: FraudAlert[];
  reasoning: string;
  digitalAlterationDetected: boolean;
}

export interface AnalysisResult {
  extraction: CheckExtraction;
  fraudAnalysis: FraudAnalysis;
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}
