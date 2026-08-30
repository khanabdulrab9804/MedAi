import { randomUUID } from 'crypto';
import { ChromaClient } from 'chromadb';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { PDFParse } from 'pdf-parse';

async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return {
      text: result.text?.trim() || '',
      numpages: result.total || result.pages?.length || 0,
    };
  } finally {
    await parser.destroy();
  }
}

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const COLLECTION_NAME = process.env.CHROMA_COLLECTION || 'medai_knowledge_base';
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
const CHUNK_SIZE = Number(process.env.RAG_CHUNK_SIZE) || 1000;
const CHUNK_OVERLAP = Number(process.env.RAG_CHUNK_OVERLAP) || 200;
const TOP_K = Number(process.env.RAG_TOP_K) || 5;

let chromaClient = null;
let embeddingsModel = null;

function getChromaClient() {
  if (!chromaClient) {
    chromaClient = new ChromaClient({ path: CHROMA_URL });
  }
  return chromaClient;
}

function getEmbeddings() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  if (!embeddingsModel) {
    embeddingsModel = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: EMBEDDING_MODEL,
    });
  }
  return embeddingsModel;
}

async function getOrCreateCollection() {
  const client = getChromaClient();
  return client.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { 'hnsw:space': 'cosine' },
  });
}

async function resetCollection() {
  const client = getChromaClient();
  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
  } catch {
    // Collection may not exist on first upload
  }
  return getOrCreateCollection();
}

/**
 * Parse PDF buffer, chunk with LangChain, embed with Gemini, store in ChromaDB.
 * Replaces the entire knowledge base on each upload.
 */
export async function ingestPdfBuffer(buffer, filename = 'knowledge-base.pdf') {
  const parsed = await extractPdfText(buffer);
  const text = parsed.text;
  if (!text) {
    throw new Error('PDF contains no extractable text');
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const doc = new Document({
    pageContent: text,
    metadata: { source: filename },
  });

  const chunks = await splitter.splitDocuments([doc]);
  if (!chunks.length) {
    throw new Error('No text chunks produced from PDF');
  }

  const embeddings = getEmbeddings();
  const texts = chunks.map((c) => c.pageContent);
  const vectors = await embeddings.embedDocuments(texts);

  const collection = await resetCollection();
  const ids = chunks.map(() => randomUUID());
  const metadatas = chunks.map((c, i) => ({
    source: String(c.metadata?.source || filename),
    chunk_index: i,
  }));

  await collection.add({
    ids,
    embeddings: vectors,
    documents: texts,
    metadatas,
  });

  return {
    filename,
    chunkCount: chunks.length,
    pageCount: parsed.numpages,
    collection: COLLECTION_NAME,
  };
}

/**
 * Embed the user question and return top-k relevant chunks from ChromaDB.
 */
export async function retrieveRelevantChunks(query, k = TOP_K) {
  const collection = await getOrCreateCollection();
  const count = await collection.count();
  if (count === 0) return [];

  const embeddings = getEmbeddings();
  const queryVector = await embeddings.embedQuery(query);

  const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: Math.min(k, count),
    include: ['documents', 'metadatas', 'distances'],
  });

  const docs = results.documents?.[0] || [];
  const metas = results.metadatas?.[0] || [];
  const distances = results.distances?.[0] || [];

  return docs.map((text, i) => ({
    text,
    metadata: metas[i] || {},
    distance: distances[i],
  }));
}

export async function getKnowledgeBaseStats() {
  try {
    const collection = await getOrCreateCollection();
    const chunkCount = await collection.count();
    return {
      collection: COLLECTION_NAME,
      chromaUrl: CHROMA_URL,
      chunkCount,
      ready: chunkCount > 0,
    };
  } catch (err) {
    return {
      collection: COLLECTION_NAME,
      chromaUrl: CHROMA_URL,
      chunkCount: 0,
      ready: false,
      error: err.message,
    };
  }
}

/**
 * True when retrieved chunks actually mention a matched medicine (name or generic).
 */
export function chunksCoverMedicines(chunks, medicines) {
  if (!chunks?.length) return false;
  if (!medicines?.length) return true;

  const blob = chunks.map((c) => c.text.toLowerCase()).join('\n');
  return medicines.some((m) => {
    const name = m.name?.toLowerCase() || '';
    const generic = m.generic_name?.toLowerCase() || '';
    if (name && blob.includes(name)) return true;
    if (generic && blob.includes(generic)) return true;
    const nameParts = name.split(/\s+/).filter((p) => p.length > 2);
    if (nameParts.length > 0 && nameParts.every((p) => blob.includes(p))) return true;
    return false;
  });
}

export function formatChunksForPrompt(chunks) {
  if (!chunks?.length) return 'NO_KNOWLEDGE_BASE_CONTEXT';
  return chunks
    .map(
      (c, i) =>
        `[Chunk ${i + 1} | source: ${c.metadata?.source || 'unknown'}]\n${c.text}`
    )
    .join('\n\n---\n\n');
}
