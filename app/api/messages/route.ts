import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { chatModel, ragPromptTemplate } from "@/utils/langchain";
import { createClient } from '@/utils/supabase/server';
import { OpenAIEmbeddings } from "@langchain/openai";
import { z } from "zod";
import { ServiceManager } from "@/services/service-manager";
import { PineconeService } from "@/services/pinecone-service";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-large"
});

// Define request schema
const messageSchema = z.object({
    channel_id: z.string().uuid(),
    content: z.string().min(1).max(2000),
});

// Add type definitions for Pinecone response
type PineconeMatch = {
    id: string;
    score: number;
    values: number[];
    metadata: {
        channel_id: string;
        content: string;
        created_at: string;
        created_at_timestamp: string;
        created_by: string;
        has_attachments: string;
        in_response_to: string;
        is_bot_message: string;
        message_id: string;
        meta_json: string;
        network_id: string;
        updated_at: string;
        updated_at_timestamp: string;
    };
};

type PineconeResponse = {
    matches: PineconeMatch[];
    namespace: string;
    usage: {
        readUnits: number;
    };
};

export async function POST(request: Request) {
    console.log('Received RAG request');
    const supabase = await createClient();
    const service_manager = ServiceManager.initialize(supabase);
    const pineconeService = new PineconeService();

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
        const index = await pinecone.Index("messages");
        const queryResponse = await index.query({
            vector: vector,
            topK: 3,
            filter: {
                network_id: channel.network_id
            },
            includeMetadata: true,
        }) as PineconeResponse;
        console.log('Pinecone response:', JSON.stringify(queryResponse, null, 2));

        // Verify the response structure
        if (!queryResponse.matches || !Array.isArray(queryResponse.matches)) {
            console.error('Invalid Pinecone response structure:', queryResponse);
            return NextResponse.json(
                { success: false, error: 'Invalid response from similarity search' },
                { status: 500 }
            );
        }

        // Log each match for debugging
        queryResponse.matches.forEach((match, index) => {
            console.log(`Match ${index + 1}:`, {
                id: match.id,
                score: match.score,
                metadata: match.metadata
            });
        });

        // 3. Format context and generate response
        const context = queryResponse.matches
            .map((match: PineconeMatch) => {
                if (!match.metadata?.content) {
                    console.warn('Match missing content:', match);
                    return null;
                }
                // Only include non-bot messages in context to avoid repetition
                if (match.metadata.is_bot_message === "true") {
                    return null;
                }
                return `Similar message (${Math.round(match.score * 100)}% match):\n${match.metadata.content}`;
            })
            .filter(Boolean)
            .join('\n\n');
        console.log('Formatted context:', context);

        const { data: previous_messages, error: previous_messages_error } = await supabase
            .from('messages')
            .select('*')
            .eq('channel_id', channel_id)
            .order('created_at', { ascending: false })
            .limit(15);

        if (previous_messages_error) {
            console.error('Error fetching previous messages:', previous_messages_error);
            return NextResponse.json(
                { success: false, error: 'Error fetching previous messages' },
                { status: 500 }
            );
        }

        const formattedMessages = previous_messages
            .reverse() // Reverse to get chronological order
            .map((message: any) => `${message.role === 'assistant' ? 'Bot McBotface' : 'User'}: ${message.content}`)
            .join('\n\n');

        const formattedPrompt = await ragPromptTemplate.format({
            context,
            question: content,
            history: formattedMessages
        });
        console.log('Formatted prompt:', formattedPrompt);
        const response = await chatModel.invoke(formattedPrompt, {
            timeout: 30000, // 30 seconds timeout
        });
        console.log('LLM response:', response);

        return NextResponse.json({ 
            success: true, 
            response: response.content.toString() 
        });

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