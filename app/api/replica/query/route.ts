import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { ServiceManager } from '@/services/service-manager'
import { headers } from 'next/headers'

// Define our request body type
interface ReplicaQueryRequest {
  channel_id: string
  content: string
}

// FastAPI service URL - this should be in your environment variables
const REPLICA_SERVICE_URL = 'http://localhost:8000'

export async function POST(request: Request) {
  try {
    // Get the request headers
    const headersList = headers()
    
    // Initialize Supabase client with auth context
    const supabase = await createClient()
    const services = ServiceManager.initialize(supabase)

    // Parse the request body
    const body: ReplicaQueryRequest = await request.json()
    
    // Hard-coded replica account ID from our test account
    const REPLICA_ACCOUNT_ID = '550e8400-e29b-41d4-a716-446655440000'

    // 1. Verify channel access
    const channelResult = await services.channels.selectChannel(body.channel_id)
    if (!channelResult.success) {
      return NextResponse.json(
        { error: 'Channel not found or access denied' },
        { status: 404 }
      )
    }

    // 2. Send query to FastAPI RAG service
    const ragResponse = await fetch(`${REPLICA_SERVICE_URL}/api/replica/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel_id: body.channel_id,
        account_id: REPLICA_ACCOUNT_ID,
        content: body.content
      })
    })

    if (!ragResponse.ok) {
      console.error('RAG service error:', await ragResponse.text())
      throw new Error('Failed to get response from replica service')
    }

    const ragData = await ragResponse.json()

    // 3. Create message using MessageService
    const messageResult = await services.messages.createMessage(
      body.channel_id,
      REPLICA_ACCOUNT_ID,
      ragData.content
    )

    if (!messageResult.success) {
      console.error('Message creation error:', messageResult.failure)
      throw new Error(messageResult.failure?.message || 'Failed to create message')
    }

    // 4. Return the created message
    return NextResponse.json(messageResult.content)

  } catch (error) {
    console.error('Replica query error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process replica query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}