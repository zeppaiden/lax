import { QueryResult, SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import _ from 'lodash'
import {
  Message,
  ChannelType,
  TableName,
  Result,
  MessageContext,
  Channel,
  Account,
  SearchMessage
} from '@/services/types'

export class MessageService {
  private readonly supabase: SupabaseClient
  private readonly MINIMUM_MESSAGE_LENGTH = 1
  private readonly MAXIMUM_MESSAGE_LENGTH = 2000

  private readonly message_schema = z.object({
    channel_id: z.string().uuid(),
    account_id: z.string().uuid(),
    content: z.string().min(this.MINIMUM_MESSAGE_LENGTH).max(this.MAXIMUM_MESSAGE_LENGTH),
    payload: z.instanceof(File).optional()
  })

  private readonly uuid_schema = z.string().uuid()

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async createMessage(
    channel_id: string,
    account_id: string,
    content: string,
    meta: Record<string, any> = {}
  ): Promise<Result<Message>> {
    try {
      const validated_data = this.message_schema.parse({ channel_id, account_id, content })

      const { data, error } = await this.supabase.rpc('fn_create_message', {
        p_channel_id: channel_id,
        p_account_id: account_id,
        p_content: content,
        p_meta: meta
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'CREATE_FAILED',
            message: 'Failed to create message',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Message
      }
    } catch (error) {
      console.error('Message creation error:', error);
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid message data',
            context: error.errors.map(e => e.message).join(', ')
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'CREATE_FAILED',
          message: 'Failed to create message',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  } 

  async selectMessages(
    channel_id: string,
  ): Promise<Result<Message[]>> {
    try {
      this.uuid_schema.parse(channel_id)

      const { data, error } = await this.supabase
        .from(TableName.MESSAGES)
        .select()
        .eq('channel_id', channel_id)
        .order('created_at', { ascending: true })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve messages',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Message[]
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid message select parameters',
            context: error.errors.map(e => e.message).join(', ')
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred'
        }
      }
    }
  }

  async selectMessageContext(
    message_id: string,
  ): Promise<Result<MessageContext>> {
    try {
      this.uuid_schema.parse(message_id)

      const { data: message, error: message_error } = await this.supabase
        .from(TableName.MESSAGES)
        .select<'*', Message>()
        .eq('message_id', message_id)
        .single()

      if (message_error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve message',
            context: message_error.message
          }
        }
      }

      const { data: account, error: account_error } = await this.supabase
        .from(TableName.NETWORKS_ACCOUNTS)
        .select(`${TableName.ACCOUNTS}(*)`)
        .eq('account_id', message.created_by)
        .single()

      if (account_error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve account',
            context: account_error.message
          }
        }
      }

      const { data: channel, error: channel_error } = await this.supabase
        .from(TableName.CHANNELS)
        .select<'*', Channel>()
        .eq('channel_id', message.channel_id)
        .single()

      if (channel_error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve channel',
            context: channel_error.message
          }
        }
      }

      return {
        success: true,
        content: {
          message: message as Message,
          account: (account as any).accounts as Account,
          channel: channel as Channel,
        } as MessageContext
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid message ID format',
            context: error.errors.map(e => e.message).join(', ')
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred'
        }
      }
    }
  }

  async updateMessage(
    message_id: string,
    account_id: string,
    content: string
  ): Promise<Result<Message>> {
    try {
      this.uuid_schema.parse(message_id)
      this.uuid_schema.parse(account_id)
      z.string().min(this.MINIMUM_MESSAGE_LENGTH).max(this.MAXIMUM_MESSAGE_LENGTH).parse(content)

      const { data, error } = await this.supabase.rpc('fn_update_message', {
        p_message_id: message_id,
        p_account_id: account_id,
        p_content: content
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update message',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Message
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid message update data',
            context: error.errors.map(e => e.message).join(', ')
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }

  async deleteMessage(
    message_id: string,
    account_id: string
  ): Promise<Result<void>> {
    try {
      this.uuid_schema.parse(message_id)
      this.uuid_schema.parse(account_id)

      const { error } = await this.supabase.rpc('fn_cascade_delete_message', {
        p_message_id: message_id,
        p_account_id: account_id
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete message',
            context: error.message
          }
        }
      }

      return {
        success: true
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'INVALID_ID',
            message: 'Invalid message ID format',
            context: error.message
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }

  async toggleReaction(
    message_id: string,
    account_id: string,
    emoji: string
  ): Promise<Result<void>> {
    try {
      this.uuid_schema.parse(message_id)
      this.uuid_schema.parse(account_id)
      z.string().parse(emoji)

      const { data, error } = await this.supabase.rpc('fn_toggle_reaction', {
        p_message_id: message_id,
        p_account_id: account_id,
        p_emoji: emoji
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'TOGGLE_FAILED',
            message: 'Failed to toggle reaction',
            context: error.message
          }
        }
      }

      return { success: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid reaction data',
            context: error.errors.map(e => e.message).join(', ')
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'TOGGLE_FAILED',
          message: 'Failed to toggle reaction',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }

  async searchMessages(
    network_id: string,
    account_id: string,
    query: string,
    limit: number = 50
  ): Promise<Result<SearchMessage[]>> {
    try {
      this.uuid_schema.parse(network_id)
      this.uuid_schema.parse(account_id)
      z.string().min(1).max(100).parse(query)
      z.number().int().min(1).max(100).parse(limit)

      const { data, error } = await this.supabase.rpc('fn_search_messages', {
        p_network_id: network_id,
        p_account_id: account_id,
        p_query: query,
        p_limit: limit
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SEARCH_FAILED',
            message: 'Failed to search messages',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as SearchMessage[]
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            context: error.errors.map(e => e.message).join(', ')
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }
}
