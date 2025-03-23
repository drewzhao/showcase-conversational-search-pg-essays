'use server';

import { typesense } from './typesense'; // Changed to named import
import { SearchResponseHit } from 'typesense/lib/Typesense/Documents';

export interface Message {
  sender: 'user' | 'ai';
  message: string;
  isLoading?: boolean;
  sources: {
    title: string;
    excerpt: string;
    url: string;
  }[];
}

interface InfiniAIDocument {
  content: string;
  url: string;
  'hierarchy.lvl0'?: string;
  'hierarchy.lvl1'?: string;
  'hierarchy.lvl2'?: string;
  'hierarchy.lvl3'?: string;
  'hierarchy.lvl4'?: string;
}

function hitsToSources(
  hits: SearchResponseHit<InfiniAIDocument>[]
): Message['sources'] {
  return hits.slice(0, 3).map((hit) => ({
    title: hit.document['hierarchy.lvl0'] || 'Untitled',
    excerpt: hit.document.content
      ? hit.document.content.split('\n').slice(1, 10).join('\n').slice(0, 100)
      : 'No content available',
    url: hit.document.url || '',
  }));
}

export async function chat(formData: FormData): Promise<Message & { id: string } | undefined> {
  const conversationId = formData.get('conversation_id');
  const message = formData.get('message');
  if (typeof message !== 'string') return;

  const conversationModelName = 'qwen2.5-7b-instruct';

  try {
    const response = await typesense
      .collections<InfiniAIDocument>('infini_ai_docs')
      .documents()
      .search({
        q: message,
        prefix: false,
        query_by: 'embedding',
        exclude_fields: 'embedding',
        conversation_model_id: conversationModelName,
        conversation: true,
        conversation_id: typeof conversationId === 'string' ? conversationId : undefined,
      });

    if (!response?.conversation) throw new Error('Invalid Typesense response');

    return {
      id: response.conversation.conversation_id,
      sender: 'ai',
      message: response.conversation.answer,
      sources: hitsToSources(response.hits ?? []),
    };
  } catch (error) {
    console.error('Typesense error:', error);
    return {
      id: typeof conversationId === 'string' ? conversationId : '',
      sender: 'ai',
      message: 'Sorry, I couldn’t process your request.',
      sources: [],
    };
  }
}