import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { z } from "zod";

// Expanded message schema to include all relevant fields
const messageSchema = z.object({
  message_id: z.string().uuid(),
  channel_id: z.string().uuid(),
  network_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  content: z.string(),
  meta: z.record(z.any()).optional()
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-large"
});

export async function POST(request: Request) {
  console.log('📥 Received message sync request');
  
  try {
    const body = await request.json();
    console.log('🔍 Validating message:', {
      message_id: body.message_id,
      channel_id: body.channel_id,
      network_id: body.network_id,
      content_preview: body.content?.slice(0, 50) + '...'
    });
    
    const message = messageSchema.parse(body);
    console.log('✅ Message validation successful');

    // Get the Pinecone index
    console.log('🔄 Connecting to Pinecone index "messages"...');
    const index = await pinecone.Index("messages");
    console.log('✅ Connected to Pinecone index');

    // Generate embedding for the message content
    console.log('🧮 Generating embedding for message content...');
    const vector = await embeddings.embedQuery(message.content);
    console.log('✅ Generated embedding vector');

    // Upsert the message to Pinecone with comprehensive metadata
    console.log('📤 Upserting message to Pinecone...');
    await index.upsert([{
      id: message.message_id,
      values: vector,
      metadata: {
        // Message core data
        message_id: message.message_id,
        channel_id: message.channel_id,
        network_id: message.network_id,
        created_by: message.created_by,
        created_at: message.created_at,
        updated_at: message.updated_at || '',
        content: message.content,
        
        // Additional metadata if present
        meta_json: JSON.stringify(message.meta || {}),
        
        // Timestamps for searching
        created_at_timestamp: new Date(message.created_at).getTime(),
        updated_at_timestamp: message.updated_at ? new Date(message.updated_at).getTime() : 0,
        
        // Searchable flags
        has_attachments: (message.meta?.payloads ? message.meta.payloads.length > 0 : false).toString(),
        is_bot_message: (message.meta?.is_bot || false).toString(),
        in_response_to: message.meta?.in_response_to || ''
      }
    }]);
    console.log('✅ Successfully upserted message to Pinecone');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Failed to sync message to Pinecone:', {
      error: error instanceof Error ? error.message : error,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
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