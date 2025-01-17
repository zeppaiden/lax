import { Message } from '@/services/types'

export interface PineconeMessage extends Message {
  network_id: string;
}

export interface SimilarMessagesResult {
  success: boolean;
  results?: any[];
  response?: string;
  error?: string;
}

export class PineconeService {
  async syncMessage(message: PineconeMessage): Promise<{ success: boolean, error?: string }> {
    try {
      const response = await fetch('/api/messages/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Failed to sync message to Pinecone:', result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error syncing message to Pinecone:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async findSimilar(networkId: string, content: string, channelId: string): Promise<SimilarMessagesResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/messages/similar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network_id: networkId,
          content: content,
          channel_id: channelId
        })
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Failed to find similar messages:', result.error);
        return { success: false, error: result.error };
      }

      return { 
        success: true,
        results: result.results,
        response: result.response
      };
    } catch (error) {
      console.error('Error finding similar messages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateSummary(content: string): Promise<SimilarMessagesResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/messages/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Failed to generate summary:', result.error);
        return { success: false, error: result.error };
      }

      return { 
        success: true,
        response: result.response
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 