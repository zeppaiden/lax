import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import _ from 'lodash'
import { 
  Network, 
  NetworkAccount, 
  Channel, 
  Result, 
  TableName,
  NetworkContext,
  Account,
} from '@/services/types'

type NetworkSubscription = {
  network_id?: string
  onNetworkCreate?: (network: Network) => void
  onNetworkUpdate?: (network: Network) => void
  onNetworkDelete?: (network: Network) => void
  onChannelCreate?: (channel: Channel) => void
  onChannelUpdate?: (channel: Channel) => void
  onChannelDelete?: (channel: Channel) => void
  onAccountCreate?: (account: Account) => void
  onAccountUpdate?: (account: Account) => void
  onAccountDelete?: (account: Account) => void
}

/**
 * Service for managing networks (workspaces) in the Lax platform.
 * Handles network creation, retrieval, updates, and member management.
 */
export class NetworkService {
  private readonly supabase: SupabaseClient

  private readonly network_schema = z.object({
    account_id: z.string().uuid(),
    name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  })

  private readonly uuid_schema = z.string().uuid()

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async createNetwork(
    account_id: string,
    name: string
  ): Promise<Result<Network>> {
    try {
      const validated_data = this.network_schema.parse({ account_id, name })

      const { data, error } = await this.supabase.rpc('fn_create_network', {
        p_account_id: validated_data.account_id,
        p_name: validated_data.name
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'CREATE_FAILED',
            message: 'Failed to create network',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Network
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid network data',
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

  /**
   * Retrieves basic network information.
   */
  async selectNetwork(network_id: string): Promise<Result<Network>> {
    try {
      this.uuid_schema.parse(network_id)

      const { data, error } = await this.supabase
        .from(TableName.NETWORKS)
        .select()
        .eq('network_id', network_id)
        .single()

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve network',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Network
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'INVALID_ID',
            message: 'Invalid network ID format'
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

  async selectNetworkContext(network_id: string): Promise<Result<NetworkContext>> {
    try {
      this.uuid_schema.parse(network_id)

      const { data: network, error: network_error } = await this.supabase
        .from(TableName.NETWORKS)
        .select()
        .eq('network_id', network_id)
        .single()

      if (network_error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve network',
            context: network_error.message
          }
        }
      }

      const { data: channels, error: channels_error } = await this.supabase
        .from(TableName.CHANNELS)
        .select()
        .eq('network_id', network_id)

      if (channels_error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve channels',
            context: channels_error.message
          }
        }
      }

      const { data: accounts, error: accounts_error } = await this.supabase
        .from(TableName.NETWORKS_ACCOUNTS)
        .select(`${TableName.ACCOUNTS}(*)`)
        .eq('network_id', network_id)

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
        content: {
          network: network as Network,
          channels: channels as Channel[],
          accounts: (accounts as any[]).map(a => a.accounts) as Account[]
        } as NetworkContext
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'INVALID_ID',
            message: 'Invalid network ID format'
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

  async selectAccounts(network_id: string): Promise<Result<Account[]>> {
    try {
      this.uuid_schema.parse(network_id)

      const { data, error } = await this.supabase
        .from(TableName.NETWORKS_ACCOUNTS)
        .select(`${TableName.ACCOUNTS}(*)`)
        .eq('network_id', network_id)

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve accounts',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: (data as any[]).map(a => a.accounts) as Account[]
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'INVALID_ID',
            message: 'Invalid network ID format'
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

  async updateNetwork(
    network_id: string,
    name: string
  ): Promise<Result<Network>> {
    try {
      this.uuid_schema.parse(network_id)
      this.network_schema.shape.name.parse(name)

      const { data, error } = await this.supabase.rpc('fn_update_network', {
        p_network_id: network_id,
        p_name: name
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update network',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Network
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input parameters',
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

  async deleteNetwork(network_id: string): Promise<Result<void>> {
    try {
      this.uuid_schema.parse(network_id)

      const { error } = await this.supabase.rpc('fn_delete_network', {
        p_network_id: network_id
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete network',
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
            message: 'Invalid network ID format'
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

  async insertAccount(
    network_id: string,
    account_id: string
  ): Promise<Result<NetworkAccount>> {
    try {
      this.uuid_schema.parse(network_id)
      this.uuid_schema.parse(account_id)

      const { data, error } = await this.supabase.rpc('fn_insert_network_account', {
        p_network_id: network_id,
        p_account_id: account_id
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'INSERT_FAILED',
            message: 'Failed to insert account',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as NetworkAccount
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input parameters',
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

  async deleteAccount(
    network_id: string,
    account_id: string
  ): Promise<Result<void>> {
    try {
      this.uuid_schema.parse(network_id)
      this.uuid_schema.parse(account_id)
  
      const { error } = await this.supabase.rpc('fn_delete_network_account', {
        p_network_id: network_id,
        p_account_id: account_id
      })
  
      if (error) {
        return {
          success: false,
          failure: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete account',
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
            code: 'VALIDATION_ERROR',
            message: 'Invalid input parameters',
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

  async selectNetworks(
    account_id: string
  ): Promise<Result<Network[]>> {
    try {
      this.uuid_schema.parse(account_id)

      const { data, error } = await this.supabase
        .from(TableName.NETWORKS_ACCOUNTS)
        .select()
        .eq('account_id', account_id)

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve networks',
            context: error.message
          }
        }
      }

      const { data: networks, error: networks_error } = await this.supabase
        .from(TableName.NETWORKS)
        .select()
        .in('network_id', data.map(n => n.network_id))

      if (networks_error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve networks',
            context: networks_error.message
          }
        }
      }

      return {
        success: true,
        content: networks as Network[]
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'INVALID_ID',
            message: 'Invalid account ID format'
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

  async inviteAccount(
    account_id: string,
    code: string
  ): Promise<Result<Network>> {
    try {
      this.uuid_schema.parse(account_id)

      const { data, error } = await this.supabase.rpc('fn_insert_network_account', {
        p_account_id: account_id,
        p_code: code
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'INSERT_FAILED',
            message: 'Failed to invite account',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Network
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'INVALID_ID',
            message: 'Invalid account ID format'
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
    network_id,
    onNetworkCreate,
    onNetworkUpdate,
    onNetworkDelete,
    onChannelCreate,
    onChannelUpdate,
    onChannelDelete,
    onAccountCreate,
    onAccountUpdate,
    onAccountDelete
  }: NetworkSubscription): Promise<Result<RealtimeChannel>> {
    try {
      if (network_id) {
        this.uuid_schema.parse(network_id)
      }

      const subscription_channel_id = `network:${network_id || 0}:${new Date().toISOString()}`

      const subscription_channel = this.supabase
        .channel(subscription_channel_id)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TableName.NETWORKS,
            filter: network_id ? `network_id=eq.${network_id}` : undefined
          },
          (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                onNetworkCreate?.(payload.new as Network)
                break
              case 'UPDATE':
                onNetworkUpdate?.(payload.new as Network)
                break
              case 'DELETE':
                onNetworkDelete?.(payload.old as Network)
                break
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TableName.CHANNELS,
            filter: network_id ? `network_id=eq.${network_id}` : undefined
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
            table: TableName.NETWORKS_ACCOUNTS,
            filter: network_id 
              ? `network_id=eq.${network_id}`
              : undefined
          },
          async (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                const { data: inserted_account } = await this.supabase
                  .from(TableName.ACCOUNTS)
                  .select()
                  .eq('account_id', payload.new.account_id)
                  .single()

                if (inserted_account) {
                  onAccountCreate?.(inserted_account as Account)
                }
                break
              case 'UPDATE':
                const { data: updated_account } = await this.supabase
                  .from(TableName.ACCOUNTS)
                  .select()
                  .eq('account_id', payload.new.account_id)
                  .single()

                if (updated_account) {
                  onAccountUpdate?.(updated_account as Account)
                }
                break
              case 'DELETE':
                onAccountDelete?.(payload.old as Account)
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
            code: 'INVALID_ID',
            message: 'Invalid network ID format'
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
