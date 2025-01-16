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
import { PineconeService, PineconeMessage } from '@/services/pinecone-service'

export class MessageService {
  private readonly supabase: SupabaseClient
  private readonly pineconeService: PineconeService
  private readonly MINIMUM_MESSAGE_LENGTH = 1
  private readonly MAXIMUM_MESSAGE_LENGTH = 2000
  
  // Add these storage-related constants
  private readonly STORAGE_BUCKET_NS = 'sdaolyap'
  private readonly MINIMUM_FILE_SIZE = 0
  private readonly MAXIMUM_FILE_SIZE = 104857600 // 100MB

  // Update your message schema to handle file uploads
  private readonly message_schema = z.object({
    channel_id: z.string().uuid(),
    account_id: z.string().uuid(),
    content: z.string().min(this.MINIMUM_MESSAGE_LENGTH).max(this.MAXIMUM_MESSAGE_LENGTH),
    meta: z.record(z.any()).optional()
  })
  
  // Add a file upload schema
  private readonly file_schema = z.object({
    file: z.instanceof(File).refine(
      (file) => file.size >= this.MINIMUM_FILE_SIZE && file.size <= this.MAXIMUM_FILE_SIZE,
      `File size must be between ${this.MINIMUM_FILE_SIZE} and ${this.MAXIMUM_FILE_SIZE} bytes`
    ),
    channel_id: z.string().uuid()
  })

  private readonly uuid_schema = z.string().uuid()

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.pineconeService = new PineconeService()
  }

  private async syncMessageToPinecone(message: Message, network_id: string) {
    try {
      console.log('🔄 Attempting to sync message to Pinecone:', {
        message_id: message.message_id,
        channel_id: message.channel_id,
        network_id: network_id,
        content_preview: message.content.slice(0, 50) + '...'
      });

      const pineconeMessage: PineconeMessage = {
        ...message,
        network_id
      };

      const result = await this.pineconeService.syncMessage(pineconeMessage);

      if (!result.success) {
        console.error('❌ Failed to sync message to Pinecone:', result.error);
      } else {
        console.log('✅ Successfully synced message to Pinecone:', {
          message_id: message.message_id
        });
      }
    } catch (error) {
      console.error('❌ Error syncing message to Pinecone:', error);
    }
  }

  // Modify your createMessage method to handle file uploads
  async createMessage(
    channel_id: string,
    account_id: string,
    content: string,
    meta: Record<string, any> = {},
    files?: File[]
  ): Promise<Result<Message>> {
    try {
      const validated_data = this.message_schema.parse({ channel_id, account_id, content, meta })

      // Get channel info to check type and network_id
      const { data: channel, error: channel_error } = await this.supabase
        .from(TableName.CHANNELS)
        .select('*')
        .eq('channel_id', channel_id)
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

      // Handle file uploads if present
      if (files && files.length > 0) {
        const payloads = await Promise.all(files.map(async file => {
          const validated_file = this.file_schema.parse({ file, channel_id })
          const path = `${this.STORAGE_BUCKET_NS}/${channel_id}/${file.name}`

          const { data, error } = await this.supabase.storage
            .from(this.STORAGE_BUCKET_NS)
            .upload(path, file)

          if (error) {
            throw error
          }

          return {
            path,
            size: file.size,
            type: file.type,
            purl: data?.path
          }
        }))

        meta = {
          ...meta,
          payloads: payloads.map(payload => ({
            path: payload.path,
            size: payload.size,
            type: payload.type,
            purl: payload.purl
          }))
        }
        console.log('Updated meta with payloads:', meta)
      }

      console.log('Calling fn_create_message with params:', {
        p_channel_id: channel_id,
        p_account_id: account_id,
        p_content: content,
        p_meta: meta
      })

      const { data: message, error } = await this.supabase.rpc('fn_create_message', {
        p_channel_id: channel_id,
        p_account_id: account_id,
        p_content: content,
        p_meta: meta
      })

      console.log('fn_create_message result:', { message, error })

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

      // Sync message to Pinecone
      await this.syncMessageToPinecone(message as Message, channel.network_id);

      // If this is a primary channel and message starts with /ask, create an automatic response
      if (channel.type === 'primary' && content.trim().toLowerCase().startsWith('/ask')) {
        console.log('Message is /ask command in primary channel, fetching bot account')
        
        // Get Bot McBotface account
        const { data: bot, error: bot_error } = await this.supabase
          .from(TableName.ACCOUNTS)
          .select('account_id')
          .eq('account_id', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11') // Bot McBotface's ID
          .single()

        if (bot_error) {
          console.error('Failed to get bot account:', bot_error)
          return {
            success: true,
            content: message as Message
          }
        }

        // Check if bot is member of channel
        const { data: membership, error: membershipError } = await this.supabase
          .from(TableName.CHANNELS_ACCOUNTS)
          .select('*')
          .eq('channel_id', channel_id)
          .eq('account_id', bot.account_id)
          .single()

        if (membershipError) {
          console.log('Bot not in channel, adding bot...')
          // Add bot to channel
          const { error: joinError } = await this.supabase
            .from(TableName.CHANNELS_ACCOUNTS)
            .insert({
              channel_id: channel_id,
              account_id: bot.account_id
            })

          if (joinError) {
            console.error('Failed to add bot to channel:', joinError)
            return {
              success: true,
              content: message as Message
            }
          }
        }

        // Query similar messages
        console.log('Querying similar messages...')
        const result = await this.pineconeService.findSimilar(
          channel.network_id,
          content.slice(5), // Remove /ask prefix
          channel_id
        );

        if (!result.success) {
          console.error('Failed to get similar messages:', result.error)
          return {
            success: true,
            content: message as Message
          }
        }

        // Create bot response with the generated response
        const { data: botMessage, error: botError } = await this.supabase.rpc('fn_create_message', {
          p_channel_id: channel_id,
          p_account_id: bot.account_id,
          p_content: result.response || 'Sorry, I could not generate a response at this time.',
          p_meta: { is_bot: true, in_response_to: message.message_id },
          p_pvector: null
        })

        console.log('Bot response result:', { botMessage, botError })

        if (botError) {
          console.error('Failed to create bot response:', botError)
        } else {
          // Sync bot message to Pinecone
          await this.syncMessageToPinecone(botMessage as Message, channel.network_id);
        }
      }

      return {
        success: true,
        content: message as Message
      }
    } catch (error) {
      console.error('Message creation error:', error)
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

  // Add these new methods to handle file operations
  private async uploadFile(channel_id: string, file: File): Promise<Result<{ path: string, purl: string }>> {
    try {
      const validated = this.file_schema.parse({ channel_id, file })
      const path = `${validated.channel_id}/${validated.file.name}`

      console.log('Attempting to upload file:', {
        bucket: this.STORAGE_BUCKET_NS,
        path,
        fileSize: file.size,
        fileType: file.type
      })

      const { error } = await this.supabase
        .storage
        .from(this.STORAGE_BUCKET_NS)
        .upload(path, file)

      if (error) {
        console.error('Upload error:', error)
        return {
          success: false,
          failure: {
            code: 'UPLOAD_FAILED',
            message: 'Failed to upload file',
            context: error.message
          }
        }
      }

      const { data: { publicUrl } } = await this.supabase
        .storage
        .from(this.STORAGE_BUCKET_NS)
        .getPublicUrl(path)

      console.log('Upload successful:', { path, publicUrl })
      return {
        success: true,
        content: { path: path, purl: publicUrl }
      }
    } catch (error) {
      console.error('File upload error:', error)
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'File may be too large',
            context: error.errors.map(e => e.message).join(', ')
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'UPLOAD_FAILED',
          message: 'Failed to upload file',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }

  async downloadFile(path: string): Promise<Result<Blob>> {
    try {
      const { data, error } = await this.supabase
        .storage
        .from(this.STORAGE_BUCKET_NS)
        .download(path)

      if (error) {
        console.error('Download error:', error)
        return {
          success: false,
          failure: {
            code: 'DOWNLOAD_FAILED',
            message: 'Failed to download file',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: new Blob([data])
      }
    } catch (error) {
      console.error('Download error:', error)
      return {
        success: false,
        failure: {
          code: 'DOWNLOAD_FAILED',
          message: 'Failed to download file',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  }

  async getSignedUrl(path: string): Promise<Result<string>> {
    try {
      console.log('Getting signed URL for path:', path)
      
      const { data, error } = await this.supabase
        .storage
        .from(this.STORAGE_BUCKET_NS)
        .createSignedUrl(path, 3600, {
          download: true
        })
  
      if (error) {
        console.error('Signed URL error:', error)
        return {
          success: false,
          failure: {
            code: 'SIGNED_URL_FAILED',
            message: 'Failed to create signed URL',
            context: error.message
          }
        }
      }
  
      return {
        success: true,
        content: data.signedUrl
      }
    } catch (error) {
      console.error('Signed URL error:', error)
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