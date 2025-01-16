import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

// Initialize the model
export const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

// Create a basic prompt template for RAG
export const ragPromptTemplate = PromptTemplate.fromTemplate(`You are a friendly AI assistant helping to answer questions in a chat channel. You should use both the provided context from similar messages and your general knowledge to provide helpful responses.

Recent Channel History:
{history}

Similar Messages Found:
{context}

User Question:
{question}

Instructions:
1. Use the recent channel history to understand the conversation flow and context
2. Reference relevant information from similar messages when applicable
3. Maintain a friendly and conversational tone
4. Be direct and concise in your response
5. If the context or history isn't particularly helpful, rely on your general knowledge
6. When using information from context, briefly mention that you found it in previous messages

Please provide a response that takes into account both the conversation history and similar messages while maintaining a natural flow:`); 
