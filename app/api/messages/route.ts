import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { chatModel, ragPromptTemplate } from "@/utils/langchain";
import { createClient } from '@/utils/supabase/server';
import { OpenAIEmbeddings } from "@langchain/openai";
import { z } from "zod";
import { ServiceManager } from "@/services/service-manager";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small"
});

// Define request schema
const messageSchema = z.object({
    channel_id: z.string().uuid(),
    content: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
    console.log('Received RAG request');
    const supabase = await createClient();
    const service_manager = ServiceManager.initialize(supabase);

    try {
        // Validate request body
        const body = await request.json();
        console.log('Request body:', body);
        const validatedData = messageSchema.parse(body);
        const { channel_id, content } = validatedData;

        // Validate channel exists and user has access
        const { data: channel, error: channel_error } = await supabase
            .from('channels')
            .select('*')
            .eq('channel_id', channel_id)
            .single();

        if (channel_error || !channel) {
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
        const index = await pinecone.Index(process.env.PINECONE_INDEX_TWO!);
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
            question: content,
            character: 'Deadpool'
        });
        console.log('Formatted prompt:', formattedPrompt);
        const response = await chatModel.invoke(formattedPrompt, {
            timeout: 30000, // 30 seconds timeout
        });
        console.log('LLM response:', response);

        // 5. Store response in Supabase
        const result = await service_manager.messages.createMessage(
            channel_id,
            'd9d2c190-fee1-4ef7-9c2e-9dfdcda17c2f', // Deadpool Replica
            response.content.toString(),
            {},
            undefined
        )
        console.log('Result:', result)

        if (!result.success) {
            console.error('Error storing message:', result.failure?.message);
            return NextResponse.json(
                { success: false, error: result.failure?.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

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