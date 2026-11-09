import type { SupabaseClient } from '@supabase/supabase-js';
import type { AccessMode, KnowledgeEntry } from '../../../src/features/ai-fin/contracts';

interface LoadKnowledgeOptions {
  preview?: boolean;
  limit?: number;
}

interface KnowledgeRow {
  id: string;
  knowledge_key: string;
  category: string;
  title: string;
  visibility: 'public' | 'owner';
  status: 'draft' | 'active' | 'retired';
  body: Record<string, unknown>;
  version_no: number;
  effective_date: string | null;
  last_reviewed_date: string | null;
  approval_source: string | null;
}

export async function loadKnowledge(
  supabase: SupabaseClient,
  mode: AccessMode,
  options: LoadKnowledgeOptions = {},
): Promise<KnowledgeEntry[]> {
  const limit = Math.max(1, Math.min(options.limit ?? 100, 200));
  const preview = mode === 'owner' && options.preview === true;

  let query = supabase
    .from('ai_fin_knowledge')
    .select(
      'id,knowledge_key,category,title,visibility,status,body,version_no,effective_date,last_reviewed_date,approval_source',
    )
    .order('category', { ascending: true })
    .order('knowledge_key', { ascending: true })
    .limit(limit);

  if (mode === 'public') {
    query = query.eq('visibility', 'public').eq('status', 'active');
  } else {
    query = query.in('visibility', ['public', 'owner']);
    query = preview ? query.in('status', ['draft', 'active']) : query.eq('status', 'active');
  }

  const { data, error } = await query;
  if (error) throw new Error('AI Fin knowledge is temporarily unavailable');

  return ((data ?? []) as KnowledgeRow[]).map((row) => ({
    id: row.id,
    knowledgeKey: row.knowledge_key,
    category: row.category,
    title: row.title,
    visibility: row.visibility,
    status: row.status,
    body: row.body,
    versionNo: row.version_no,
    effectiveDate: row.effective_date,
    lastReviewedDate: row.last_reviewed_date,
    approvalSource: row.approval_source,
  }));
}
