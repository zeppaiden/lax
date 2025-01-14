import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { chatModel, ragPromptTemplate } from "@/utils/langchain";
import { createClient } from '@/utils/supabase/server';
import { OpenAIEmbeddings } from "@langchain/openai";
import { z } from "zod";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
});

// Define request schema
const messageSchema = z.object({
    channel_id: z.string().uuid(),
    content: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        // Validate request body
        const body = await request.json();
        const validatedData = messageSchema.parse(body);
        const { channel_id, content } = validatedData;

        // Validate channel exists and user has access
        const { data: channel, error: channelError } = await supabase
            .from('channels')
            .select('*')
            .eq('channel_id', channel_id)
            .single();

        if (channelError || !channel) {
            return NextResponse.json(
                { success: false, error: 'Channel not found or access denied' },
                { status: 404 }
            );
        }

        // 1. Convert content to embedding vector
        const vector = await embeddings.embedQuery(content);

        // 2. Query Pinecone with the embedding
        const index = await pinecone.Index(process.env.PINECONE_INDEX!);
        const queryResponse = await index.query({
            vector: vector,
            topK: 3,
            includeMetadata: true,
        });

        // 3. Format context from Pinecone results
        const context = queryResponse.matches
            .map((match: any) => match.metadata?.text)
            .join('\n');

        // 4. Generate response using LangChain
        const formattedPrompt = await ragPromptTemplate.format({
            context,
            question: content,
        });
        const response = await chatModel.invoke(formattedPrompt);

        // 5. Store response in Supabase
        const { data: messageData, error: messageError } = await supabase
            .from('messages')
            .insert({
                channel_id,
                content: response.content,
                account_id: '550e8400-e29b-41d4-a716-446655440000', // Your replica's account_id
            })
            .select();

        if (messageError) {
            console.error('Error storing message:', messageError);
            return NextResponse.json(
                { success: false, error: 'Failed to store message' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: messageData });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: error.errors },
                { status: 400 }
            );
        }

        console.error('Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}