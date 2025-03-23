import { Client } from 'typesense';

function createTypesenseClient() {
  const host = process.env.TYPESENSE_HOST ?? 'localhost';
  const port = Number(process.env.TYPESENSE_PORT ?? 8108);
  const protocol = process.env.TYPESENSE_PROTOCOL ?? 'http';
  const apiKey = process.env.TYPESENSE_SEARCH_API_KEY;

  if (!apiKey) {
    throw new Error('TYPESENSE_SEARCH_API_KEY is required');
  }

  return new Client({
    nodes: [{ host, port, protocol }],
    apiKey,
    connectionTimeoutSeconds: 15 * 60,
    logLevel: 'debug',
  });
}

export const typesense = createTypesenseClient();