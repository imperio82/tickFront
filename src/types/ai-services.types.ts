// Tipos para Servicios de IA (Gemini)

// ============================================
// VIDEO ANALYSIS TYPES
// ============================================

export interface VideoAnalysisRequest {
  videoUrl: string;
  prompt?: string;
  mimeType?: string;
  modelName?: string;
}

export interface VideoAnalysisResponse {
  success: boolean;
  analysis: string;
  metadata?: {
    videoUrl: string;
    mimeType: string;
    modelUsed: string;
    tokensUsed?: number;
    processingTime?: number;
  };
  error?: string;
}

export interface CostEstimateRequest {
  videoUrl: string;
  mimeType?: string;
}

export interface CostEstimateResponse {
  estimatedTokens: number;
  estimatedCost: number;
  currency: string;
}

// ============================================
// TEXT GENERATION TYPES
// ============================================

export interface TextGenerationRequest {
  prompt: string;
  modelName?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
}

export interface TextGenerationResponse {
  success: boolean;
  text: string;
  metadata?: {
    modelUsed: string;
    tokensUsed?: number;
    finishReason?: string;
  };
  error?: string;
}

export interface TextWithImageRequest {
  prompt: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  modelName?: string;
}

export interface TextWithImageResponse {
  success: boolean;
  text: string;
  metadata?: {
    modelUsed: string;
    tokensUsed?: number;
  };
  error?: string;
}

// ============================================
// CONVERSATION TYPES
// ============================================

export interface ConversationMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ConversationRequest {
  messages: ConversationMessage[];
  newMessage: string;
  modelName?: string;
}

export interface ConversationResponse {
  success: boolean;
  response: string;
  conversation: ConversationMessage[];
  metadata?: {
    modelUsed: string;
    tokensUsed?: number;
  };
  error?: string;
}

// ============================================
// MULTIPLE CANDIDATES TYPES
// ============================================

export interface MultipleCandidatesRequest {
  prompt: string;
  candidateCount?: number;
  modelName?: string;
  temperature?: number;
}

export interface MultipleCandidatesResponse {
  success: boolean;
  candidates: string[];
  metadata?: {
    modelUsed: string;
    totalCandidates: number;
  };
  error?: string;
}

// ============================================
// TOKEN COUNTING TYPES
// ============================================

export interface TokenCountRequest {
  text: string;
  modelName?: string;
}

export interface TokenCountResponse {
  success: boolean;
  totalTokens: number;
  metadata?: {
    modelUsed: string;
  };
  error?: string;
}

// ============================================
// MODEL INFO TYPES
// ============================================

export interface ModelInfo {
  name: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface ModelsListResponse {
  success: boolean;
  models: ModelInfo[];
  error?: string;
}

export interface ModelCheckRequest {
  modelName: string;
}

export interface ModelCheckResponse {
  success: boolean;
  available: boolean;
  modelInfo?: ModelInfo;
  error?: string;
}
