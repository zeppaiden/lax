import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import {
  Account,
  Channel,
  ChannelAccount,
  ChannelContext,
  ChannelType,
  Message,
  Result,
  TableName
} from '@/services/types'

type ChannelSubscription = {
  channel_id?: string
  onChannelCreate?: (channel: Channel) => void
  onChannelUpdate?: (channel: Channel) => void
  onChannelDelete?: (channel: Channel) => void
  onAccountCreate?: (account: Account) => void
  onAccountDelete?: (account: Account) => void
  onMessageCreate?: (message: Message) => void
  onMessageUpdate?: (message: Message) => void
  onMessageDelete?: (message: Message) => void
}

export class ChannelService {
  private readonly supabase: SupabaseClient
  private subscriptions: Map<string, RealtimeChannel> = new Map()

  private readonly channel_schema = z.object({
    network_id: z.string().uuid(),
    account_id: z.string().uuid(),
    name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/),
    is_private: z.boolean().default(false)
  })

  private readonly whisper_schema = z.object({
    network_id: z.string().uuid(),
    account_id: z.string().uuid(),
    whisper_to: z.string().uuid()
  })

  private readonly spinoff_schema = z.object({
    network_id: z.string().uuid(),
    account_id: z.string().uuid(),
    channel_id: z.string().uuid(),
    message_id: z.string().uuid()
  })

  private readonly uuid_schema = z.string().uuid()

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async createChannel(
    network_id: string,
    account_id: string,
    name: string,
    is_private: boolean = false
  ): Promise<Result<Channel>> {
    try {
      const validated_data = this.channel_schema.parse({ network_id, account_id, name, is_private })

      const { data, error } = await this.supabase.rpc('fn_create_channel', {
        p_network_id: validated_data.network_id,
        p_account_id: validated_data.account_id,
        p_name: validated_data.name,
        p_is_private: validated_data.is_private
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'CREATE_FAILED',
            message: 'Failed to create channel',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Channel
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid channel data',
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
  
  async createWhisper(
    network_id: string,
    account_id: string,
    whisper_to: string,
  ): Promise<Result<Channel>> {
    try {
      const validated_data = this.whisper_schema.parse({ network_id, account_id, whisper_to })

      const { data, error } = await this.supabase.rpc('fn_create_whisper', {
        p_network_id: validated_data.network_id,
        p_account_id: validated_data.account_id,
        p_whisper_to: validated_data.whisper_to
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'CREATE_FAILED',
            message: 'Failed to create whisper',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Channel
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid whisper data',
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

  async createSpinoff(
    network_id: string,
    account_id: string,
    channel_id: string,
    message_id: string
  ): Promise<Result<Channel>> {
    try {
      const validated_data = this.spinoff_schema.parse({ network_id, account_id, channel_id, message_id })

      const { data, error } = await this.supabase.rpc('fn_create_spinoff', {
        p_network_id: validated_data.network_id,
        p_account_id: validated_data.account_id,
        p_channel_id: validated_data.channel_id,
        p_message_id: validated_data.message_id
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'CREATE_FAILED',
            message: 'Failed to create spinoff',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Channel
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid spinoff data',
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

  async selectChannel(channel_id: string): Promise<Result<Channel>> {
    try {
      this.uuid_schema.parse(channel_id)

      const { data, error } = await this.supabase
        .from(TableName.CHANNELS)
        .select()
        .eq('channel_id', channel_id)
        .single()

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve channel',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Channel
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'INVALID_ID',
            message: 'Invalid channel ID format'
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

  async selectChannelContext(channel_id: string): Promise<Result<ChannelContext>> {
    try {
      this.uuid_schema.parse(channel_id)

      const { data: channel, error: channel_error } = await this.supabase
        .from(TableName.CHANNELS)
        .select()
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

      const { data: accounts, error: accounts_error } = await this.supabase
        .from(TableName.CHANNELS_ACCOUNTS)
        .select(`${TableName.ACCOUNTS}(*)`)
        .eq('channel_id', channel_id)

      if (accounts_error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve accounts',
            context: accounts_error.message
          }
        }
      }

      const { data: messages, error: messages_error } = await this.supabase
        .from(TableName.MESSAGES)
        .select('*')
        .eq('channel_id', channel_id)
        .order('created_at', { ascending: true })

      if (messages_error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve messages',
            context: messages_error.message
          }
        }
      }

      return {
        success: true,
        content: {
          channel: channel as Channel,
          accounts: (accounts as any[]).map(a => a.accounts) as Account[],
          messages: messages as Message[]
        } as ChannelContext
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid channel ID format',
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

  async selectChannels(network_id: string): Promise<Result<Channel[]>> {
    try {
      this.uuid_schema.parse(network_id)

      const { data, error } = await this.supabase
        .from(TableName.CHANNELS)
        .select('*')
        .eq('network_id', network_id)
        .eq('type', ChannelType.PRIMARY)
        .order('created_at', { ascending: false })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve channels',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data || []
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid network ID format',
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

  async selectWhispers(
    network_id: string,
    account_id: string
  ): Promise<Result<Channel[]>> {
    try {
      this.uuid_schema.parse(network_id)  
      this.uuid_schema.parse(account_id)

      const { data, error } = await this.supabase.rpc('fn_select_whispers', {
        p_network_id: network_id,
        p_account_id: account_id
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve whispers',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Channel[]
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid network ID format',
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

  async selectSpinoff(
    network_id: string,
    account_id: string,
    channel_id: string,
    message_id: string
  ): Promise<Result<Channel>> {
    try {
      this.uuid_schema.parse(network_id)
      this.uuid_schema.parse(account_id)
      this.uuid_schema.parse(channel_id)
      this.uuid_schema.parse(message_id)

      const { data, error } = await this.supabase.rpc('fn_select_spinoff', {
        p_network_id: network_id,
        p_account_id: account_id,
        p_channel_id: channel_id,
        p_message_id: message_id
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve spinoff',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Channel
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid spinoff data',
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

  async updateChannel(
    channel_id: string,
    name: string,
  ): Promise<Result<Channel>> {
    try {
      this.uuid_schema.parse(channel_id)
      this.channel_schema.shape.name.parse(name)

      const { data, error } = await this.supabase.rpc('fn_update_channel', {
        p_channel_id: channel_id,
        p_name: name
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update channel',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Channel
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid channel data',
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

  async deleteChannel(channel_id: string): Promise<Result<void>> {
    try {
      this.uuid_schema.parse(channel_id)

      const { error } = await this.supabase.rpc('fn_delete_channel', {
        p_channel_id: channel_id
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete channel',
            context: error.message
          }
        }
      }

      return { success: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid channel ID')
      }
      throw error
    }
  }

  async insertAccount(
    channel_id: string,
    account_id: string,
  ): Promise<Result<ChannelAccount>> {
    try {
      this.uuid_schema.parse(channel_id)
      this.uuid_schema.parse(account_id)

      const { data, error } = await this.supabase.rpc('fn_insert_channel_account', {
        p_channel_id: channel_id,
        p_account_id: account_id,
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'INSERT_FAILED',
            message: 'Failed to insert account',
            context: error?.message
          }
        }
      }

      return {
        success: true,
        content: data as ChannelAccount
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid channel account data',
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

  async selectAccounts(channel_id: string): Promise<Result<Account[]>> {
    try {
      this.uuid_schema.parse(channel_id)

      const { data: channel_accounts, error: channel_accounts_error } = await this.supabase
        .from(TableName.CHANNELS_ACCOUNTS)
        .select()
        .eq('channel_id', channel_id)

      if (channel_accounts_error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve channel accounts',
            context: channel_accounts_error.message
          }
        }
      }

      const { data: accounts, error: accounts_error } = await this.supabase
        .from(TableName.ACCOUNTS)
        .select()
        .in('account_id', channel_accounts.map(account => account.account_id))

      if (accounts_error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve accounts',
            context: accounts_error.message
          }
        }
      }

      return {
        success: true,
        content: accounts as Account[]
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid channel ID format',
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

  async subscribe({
    channel_id,
    onChannelCreate,
    onChannelUpdate,
    onChannelDelete,
    onAccountCreate,
    onAccountDelete,
    onMessageCreate,
    onMessageUpdate,
    onMessageDelete
  }: ChannelSubscription): Promise<Result<RealtimeChannel>> {
    try {
      if (channel_id) {
        this.uuid_schema.parse(channel_id)
      }

      const subscription_channel_id = `channel:${channel_id || 0}:${new Date().toISOString()}`

      const subscription_channel = this.supabase
        .channel(subscription_channel_id)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TableName.CHANNELS,
            filter: channel_id ? `channel_id=eq.${channel_id}` : undefined
          },
          (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                onChannelCreate?.(payload.new as Channel)
                break
              case 'UPDATE':
                onChannelUpdate?.(payload.new as Channel)
                break
              case 'DELETE':
                onChannelDelete?.(payload.old as Channel)
                break
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TableName.CHANNELS_ACCOUNTS,
            filter: channel_id ? `channel_id=eq.${channel_id}` : undefined
          },
          async (payload) => {
            if (payload.eventType === 'INSERT') {
              const { data: account } = await this.supabase
                .from(TableName.ACCOUNTS)
                .select()
                .eq('account_id', payload.new.account_id)
                .single()

              if (account) {
                onAccountCreate?.(account as Account)
              }
            }

            if (payload.eventType === 'DELETE') {
              onAccountDelete?.(payload.old as Account)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TableName.MESSAGES,
            filter: channel_id ? `channel_id=eq.${channel_id}` : undefined
          },
          (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                onMessageCreate?.(payload.new as Message)
                break
              case 'UPDATE':
                onMessageUpdate?.(payload.new as Message)
                break
              case 'DELETE':
                onMessageDelete?.(payload.old as Message)
                break
            }
          }
        )

      const status = await subscription_channel.subscribe()

      return {
        success: true,
        content: subscription_channel
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid channel ID format',
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
}

