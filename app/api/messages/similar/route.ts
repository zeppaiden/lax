import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { z } from "zod";
import { createClient } from '@/utils/supabase/server';
import { chatModel, ragPromptTemplate } from "@/utils/langchain";

// Define request schema
const messageSchema = z.object({
  network_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  channel_id: z.string().uuid(),
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-large"
});

export async function POST(request: Request) {
  console.log('📥 Received similar messages request');
  const supabase = await createClient();

  try {
    // Validate request body
    const body = await request.json();
    console.log('Request body:', body);
    const validatedData = messageSchema.parse(body);
    const { network_id, content, channel_id } = validatedData;

    // 1. Get recent message history from the channel
    console.log('📚 Fetching recent message history...');
    const { data: recentMessages, error: historyError } = await supabase
      .from('messages')
      .select('content, created_at')
      .eq('channel_id', channel_id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (historyError) {
      console.error('Failed to fetch message history:', historyError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch message history' },
        { status: 500 }
      );
    }

    const history = recentMessages
      ?.reverse()
      ?.map(msg => msg.content)
      ?.join('\n')
      || 'No recent message history available.';

    // 2. Convert content to embedding vector
    console.log('🧮 Generating embedding...');
    const vector = await embeddings.embedQuery(content);
    console.log('✅ Generated embedding');

    // 3. Query Pinecone with the embedding
    console.log('🔍 Querying Pinecone...');
    const index = await pinecone.Index("messages");
    const queryResponse = await index.query({
      vector: vector,
      topK: 5,
      filter: {
        network_id: network_id
      },
      includeMetadata: true,
    });
    console.log('✅ Pinecone query complete');

    // 4. Format similar messages for context
    const context = queryResponse.matches
      .map(match => `${match.score?.toFixed(2)} - ${match.metadata?.content}`)
      .join('\n');

    // 5. Generate response using RAG
    console.log('🤖 Generating response...');
    const prompt = await ragPromptTemplate.format({
      question: content,
      context: context,
      history: history
    });

    const response = await chatModel.invoke(prompt);
    console.log('✅ Generated response');

    // 6. Format and return results
    const results = queryResponse.matches.map(match => ({
      score: match.score,
      message: {
        message_id: match.metadata?.message_id,
        channel_id: match.metadata?.channel_id,
        content: match.metadata?.content,
        created_at: match.metadata?.created_at,
        created_by: match.metadata?.created_by,
        updated_at: match.metadata?.updated_at,
      }
    }));

    return NextResponse.json({ 
      success: true, 
      results,
      response: response.content
    });

  } catch (error) {
    console.error('❌ Error processing similar messages request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 