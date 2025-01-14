import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Initialize the model
export const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4-turbo-preview", // or any other model you prefer
  temperature: 0.7,
});

// Create a basic prompt template for RAG
export const ragPromptTemplate = ChatPromptTemplate.fromTemplate(`
Context information is below:
--------------------
{context}
--------------------

Given the context information, please answer the following question:
Question: {question}

Answer in a helpful and informative way. If the context doesn't contain relevant information, 
say so instead of making things up.
`); 