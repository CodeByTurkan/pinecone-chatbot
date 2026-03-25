import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const pc = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});

const studentInfo = `Alexandra Thompson, a 19-year-old computer science sophomore with a 3.7 GPA,
is a member of the programming and chess clubs who enjoys pizza, swimming, and hiking
in her free time in hopes of working at a tech company after graduating from the University of Washington.`;

const clubInfo = `The university chess club provides an outlet for students to come together and enjoy playing
the classic strategy game of chess. Members of all skill levels are welcome, from beginners learning
the rules to experienced tournament players. The club typically meets a few times per week to play casual games,
participate in tournaments, analyze famous chess matches, and improve members' skills.`;

const universityInfo = `The University of Washington, founded in 1861 in Seattle, is a public research university
with over 45,000 students across three campuses in Seattle, Tacoma, and Bothell.
As the flagship institution of the six public universities in Washington state,
UW encompasses over 500 buildings and 20 million square feet of space,
including one of the largest library systems in the world.`;

type Info = {
  info: string;
  relevance: number;
  referance: string;
};

// convert data into vector with chunks
const dataToEmbed: Info[] = [
  {
    info: studentInfo,
    relevance: 0.9,
    referance: "student 123",
  },
  {
    info: clubInfo,
    relevance: 0.8,
    referance: "club 456",
  },
  {
    info: universityInfo,
    relevance: 0.7,
    referance: "uni 789",
  },
];

const pcIndex = pc.index<Info>("search-index").namespace("search-data");

async function storeEmbeddings() {
  const { data } = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: dataToEmbed.map((d) => d.info),
    dimensions: 1024,
  });

  const sorted = [...data].sort((a, b) => a.index - b.index);

  await pcIndex.upsert({
    records: sorted.map((row, index) => ({
      id: `id-${index}`,
      values: row.embedding,
      metadata: dataToEmbed[index],
    })),
  });
}
// storeEmbeddings();

async function queryEmbeddings(question: string) {
  const embeddingResult = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
    dimensions: 1024
  });
  const firstEmbeddingResult = embeddingResult.data[0].embedding;
  const queryResult = await pcIndex.query({
    topK: 1,
    includeMetadata: true,
    includeValues: true,
    vector: firstEmbeddingResult,
    
  });
  return queryResult
}

const question = " What does ALexandra likes to do in her free time?"
console.log(await queryEmbeddings(question));
 