export type AccessMode = 'public' | 'owner';

export type ProductId =
  | 'free-wave-check'
  | 'aeo-wave-audit'
  | 'wave-scout'
  | 'sales-rider'
  | 'content-creator'
  | 'customer-care-cove'
  | 'automation-architect'
  | 'big-kahuna';

export type KnowledgeVisibility = 'public' | 'owner';
export type KnowledgeStatus = 'draft' | 'active' | 'retired';

export interface KnowledgeEntry {
  id: string;
  knowledgeKey: string;
  category: string;
  title: string;
  visibility: KnowledgeVisibility;
  status: KnowledgeStatus;
  body: Record<string, unknown>;
  versionNo: number;
  effectiveDate: string | null;
  lastReviewedDate: string | null;
  approvalSource: string | null;
}

export interface LeadDraft {
  name: string;
  email: string;
  company?: string;
  website?: string;
  problem: string;
  budgetRange?: string;
  preferredContactMethod?: string;
  consent: true;
  consentAt: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BaseChatRequest {
  message: string;
  conversation?: ConversationMessage[];
  lead?: LeadDraft;
}

export interface PublicChatRequest extends BaseChatRequest {
  mode: 'public';
  preview?: never;
}

export interface OwnerChatRequest extends BaseChatRequest {
  mode: 'owner';
  preview?: boolean;
}

export type ChatRequest = PublicChatRequest | OwnerChatRequest;

export interface ChatResponse {
  answer: string;
  recommendedProductId: ProductId | null;
  knowledgeVersion: string | null;
  leadSaved: boolean;
  escalationRequired: boolean;
  traceId?: string;
}

export interface ProductCatalogEntry {
  id: ProductId;
  name: string;
  setupPriceCents: number;
  monthlyPriceCents: number | null;
  effectiveDate: string;
  approvalSource: string;
  notes: string;
}

export type ProblemCategory =
  | 'visibility'
  | 'opportunity'
  | 'follow-up'
  | 'content'
  | 'support'
  | 'workflow'
  | 'transformation';
