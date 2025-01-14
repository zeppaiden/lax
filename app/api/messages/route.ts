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
    console.log('Received RAG request');
    const supabase = await createClient();

    try {
        // Validate request body
        const body = await request.json();
        console.log('Request body:', body);
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
        console.log('Generating embedding...');
        const vector = await embeddings.embedQuery(content);
        console.log('Embedding generated');

        // 2. Query Pinecone with the embedding
        console.log('Querying Pinecone...');
        const index = await pinecone.Index(process.env.PINECONE_INDEX!);
        const queryResponse = await index.query({
            vector: vector,
            topK: 3,
            includeMetadata: true,
        });
        console.log('Pinecone response:', queryResponse);

        // 3. Format context and generate response
        const context = queryResponse.matches
            .map((match: any) => match.metadata?.text)
            .join('\n');
        console.log('Formatted context:', context);

        const formattedPrompt = await ragPromptTemplate.format({
            context,
            question: content
        });
        console.log('Formatted prompt:', formattedPrompt);
        const response = await chatModel.invoke(formattedPrompt);
        console.log('LLM response:', response);

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
        console.error('RAG error:', error);
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