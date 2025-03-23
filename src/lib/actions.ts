'use server';

import typesense from './typesense';
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
    content: string;           // Main text content
    url: string;              // URL of the page
    'hierarchy.lvl0'?: string; // Optional h1 heading (could be used as title)
    'hierarchy.lvl1'?: string; // Optional h2 heading
    'hierarchy.lvl2'?: string; // Optional h3 heading
    'hierarchy.lvl3'?: string; // Optional h4 heading
    'hierarchy.lvl4'?: string; // Optional h5 heading
    // Add other fields as needed (e.g., tags, embedding)
}

function hitsToSources(
    hits: SearchResponseHit<InfiniAIDocument>[]
): Message['sources'] {
    return hits.slice(0, 3).map((hit) => ({
        title: hit.document['hierarchy.lvl0'] || 'Untitled', // Fallback if no h1
        excerpt: hit.document.content
            ? hit.document.content
                .split('\n')
                .slice(1, 10)
                .join('\n')
                .slice(0, 100)
            : 'No content available', // Fallback if content is missing
        url: hit.document.url || '', // Fallback if url is missing
    }));
}

export async function chat(formData: FormData) {
    const conversationId = formData.get('conversation_id');
    const message = formData.get('message');
    if (typeof message !== 'string') return;

    const conversationModelName = 'qwq-32b';

    let response = await typesense
        .collections<InfiniAIDocument>('infini_ai_docs') // Updated type
        .documents()
        .search({
            q: message,
            prefix: false,
            query_by: 'embedding',
            exclude_fields: 'embedding',
            conversation_model_id: conversationModelName,
            conversation: true,
            conversation_id:
                typeof conversationId === 'string' ? conversationId : undefined,
        });

    if (typeof response === "string") {
        response = JSON.parse(response);
    }

    return {
        id: response?.conversation?.conversation_id || 'Could not find conversation_id in response.',
        message: response?.conversation?.answer || 'Could not find answer in response.',
        sources: hitsToSources(response?.hits ?? []),
        response: response
    };
}
