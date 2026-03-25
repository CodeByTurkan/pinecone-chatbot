import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});

const indexName = "default";
type MetaData = {
  coolness: number;
  reference: string;
};
async function listIndexes() {
  const result = await pc.listIndexes();
  console.log(result);
}

// await pc.createIndexForModel({
//   name: indexName,
//   cloud: "aws",
//   region: "us-east-1",
//   embed: {
//     model: "llama-text-embed-v2",
//     fieldMap: { text: "chunk_text" },
//   },
//   waitUntilReady: true,
// });

// listIndexes()

function getIndex() {
  return pc.index<MetaData>(indexName).namespace("new-index");
}
// getIndex();

function getEmbeddings(length: number) {
  return Array.from({ length }, () => Math.random());
}

async function upsertIndexes() {
  const embed = getEmbeddings(1024);
  const index = getIndex();
  await index.upsert({
    records: [
      {
        id: "id-1",
        values: embed,
        metadata: {
          coolness: 3,
          reference: "hey",
        },
      },
    ],
  });
}

// upsertIndexes();

async function queryIndex() {
  const index = getIndex();
  const result = await index.query({
    // query based on either id or vector 
    id: "id-1",
    topK: 1,
    includeMetadata: true
  });
  console.log(result);
  
}

queryIndex()