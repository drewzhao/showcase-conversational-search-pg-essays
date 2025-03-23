import 'dotenv/config';
import Typesense from 'typesense';

const typesense = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST ?? 'localhost',
      port: Number(process.env.TYPESENSE_PORT ?? 8108),
      protocol: process.env.TYPESENSE_PROTOCOL ?? 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_ADMIN_API_KEY ?? '',
  // 15 minutes
  connectionTimeoutSeconds: 15 * 60,
  // logLevel: 'debug',
});

// Commented out as the data collection "infini-ai-docs" already exists on the server
/*
async function createDataCollection(dataCollectionName: string) {
  console.log('Creating data collection')
  const data = require('./data.json');

  await typesense.collections().create({
    name: dataCollectionName,
    fields: [
      {
        name: 'title',
        type: 'string',
        facet: false,
      },
      {
        name: 'text',
        type: 'string',
        facet: false,
      },
      {
        name: 'embedding',
        type: 'float[]',
        embed: {
          from: ['title', 'text'],
          model_config: {
            model_name: 'ts/snowflake-arctic-embed-m',
          },
        },
      },
    ],
  });

  let results = await typesense.collections('pg-essays').documents().import(data);
  console.log(results);
}
*/

async function createConversationHistoryCollection(conversationStoreCollectionName: string) {
  console.log('Creating conversation history collection')

  let conversationStoreSchema = {
    name: conversationStoreCollectionName,
    fields: [
      {
        name: "conversation_id",
        type: <const> "string",
      },
      {
        name: "model_id",
        type: <const> "string",
      },
      {
        name: "role",
        type: <const> "string",
        index: false
      },
      {
        name: "message",
        type: <const> "string",
        index: false
      },
      {
        name: "timestamp",
        type: <const> "int32"
      }
    ]
  }
  const results = await typesense.collections().create(conversationStoreSchema);
  console.log(results);
}

async function indexInTypesense() {
  let results;

  // Commented out as the data collection "infini-ai-docs" already exists on the server
  /*
  let dataCollectionName = 'pg-essays';
  const dataCollectionExists = await typesense.collections(dataCollectionName).exists();
  if (dataCollectionExists && process.env.FORCE_REINDEX === 'true') {
    console.log('Deleting existing data collection')
    await typesense.collections(dataCollectionName).delete();
    await createDataCollection(dataCollectionName);
  } else if (!dataCollectionExists) {
    await createDataCollection(dataCollectionName);
  }
  */

  // Changed from 'pg-essays-conversation-store' to 'infini-ai-docs-conversation-store'
  let conversationHistoryCollectionName = 'infini-ai-docs-conversation-store';
  const conversationHistoryCollectionExists = await typesense.collections(conversationHistoryCollectionName).exists();
  if (conversationHistoryCollectionExists && process.env.FORCE_REINDEX === 'true') {
    console.log('Deleting existing conversation history collection')
    await typesense.collections(conversationHistoryCollectionName).delete();
    await createConversationHistoryCollection(conversationHistoryCollectionName);
  } else if (!conversationHistoryCollectionExists) {
    await createConversationHistoryCollection(conversationHistoryCollectionName);
  }

  // Create the LLM-powered conversation model resource
  const conversationModelName = 'qwen2.5-7b-instruct';
  // const conversationModelName = 'llama-3-8b-instruct'

  try {
    results = await typesense.conversations().models(conversationModelName).retrieve();
    console.log('Conversation model already exists, so deleting it');
    results = await typesense.conversations().models(conversationModelName).delete();
  } catch (e) {
    if (e instanceof Typesense.Errors.ObjectNotFound) {
      console.log("Conversation model not found, so creating it...");
    } else {
      console.error(e);
      throw e;
    }
  } finally {
    console.log('Creating conversation model');
    const modelCreateParameters = {
      id: conversationModelName,
      // Updated system prompt to reflect the new context
      system_prompt:
          "You are an assistant for question-answering based on Infini AI documentation. You can only make conversations based on the provided context. If a response cannot be formed strictly using the context, politely say you don't have knowledge about that topic. Do not answer questions that are not strictly on the topic of Infini AI documentation. Keep in mind that 'cuda' and 'conda' are different things, carefully look through your input and do not mix one with another. If you discern that the user has switched the topic, you need to forget anything from the previous conversation and focus on the current topic, and at the end of you reply, politely ask them to start a new blank conversation.",
      history_collection: conversationHistoryCollectionName,

      /*** OpenAI gpt-4-turbo ***/
      model_name: 'openai/qwen2.5-7b-instruct',
      openai_url: "https://cloud.infini-ai.com/maas/",
      max_bytes: 16384,
      api_key: process.env.OPENAI_API_KEY ?? '',

      /*** Llama model hosted on Cloudflare ***/
      // model_name: 'cloudflare/@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      // max_bytes: 16384,
      // account_id: process.env.CLOUDFLARE_ACCOUNT_ID ?? '',
      // api_key: process.env.CLOUDFLARE_API_KEY ?? '',
    };
    results = await typesense.conversations().models().create(modelCreateParameters);
  }
  console.log(results);
}

indexInTypesense();