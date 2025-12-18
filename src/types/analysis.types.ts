export const QueryType = {
  PROPIA: 'propia',
  INVESTIGACION: 'investigacion',
  SQL_QUERY: 'SQL_QUERY',
} as const;

export type QueryType = typeof QueryType[keyof typeof QueryType];

export const AnalysisStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type AnalysisStatus = typeof AnalysisStatus[keyof typeof AnalysisStatus];

export interface Analysis {
  id: string;
  userId: string;
  analysisResult: any; // JSON flexible
  queryType: QueryType;
  status: AnalysisStatus;
  title?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnalysisDto {
  queryType: QueryType;
  title?: string;
  description?: string;
}

export interface AnalysisStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  byQueryType: {
    [key in QueryType]?: number;
  };
}
