import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import { z } from 'zod'
import {
  Account,
  AccountContext,
  Network,
  Result,
  TableName,
} from '@/services/types'

type AccountSubscription = {
  account_id?: string
  onAccountCreate?: (account: Account) => void
  onAccountUpdate?: (account: Account) => void
  onAccountDelete?: (account: Account) => void
  onNetworkCreate?: (network: Network) => void
  onNetworkUpdate?: (network: Network) => void
  onNetworkDelete?: (network: Network) => void
}

export class AccountService {
  private readonly supabase: SupabaseClient

  private readonly account_schema = z.object({
    account_id: z.string().uuid(),
    email: z.string().email(),
    uname: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_.]+$/),
    fname: z.string().min(1).max(50),
    lname: z.string().min(1).max(50),
    robot: z.boolean().default(false),
  })

  private readonly uuid_schema = z.string().uuid()

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async createAccount(
    account_id: string,
    email: string,
    uname: string,
    fname: string,
    lname: string,
    robot: boolean,
  ): Promise<Result<Account>> {
    try {
      const validated_data = this.account_schema.parse({ account_id, email, uname, fname, lname, robot })

      const { data, error } = await this.supabase.rpc('fn_create_account', {
        p_account_id: validated_data.account_id,
        p_email: validated_data.email,
        p_uname: validated_data.uname,
        p_fname: validated_data.fname,
        p_lname: validated_data.lname,
        p_robot: validated_data.robot
      })

      if (error) {
        return {
          success: false,
          failure: {
            code: 'CREATE_FAILED',
            message: 'Failed to create account',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Account
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid account data',
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

  async selectAccount(account_id: string): Promise<Result<Account>> {
    try {
      this.uuid_schema.parse(account_id)

      const { data, error } = await this.supabase
        .from(TableName.ACCOUNTS)
        .select()
        .eq('account_id', account_id)
        .single()

      if (error) {
        return {
          success: false,
          failure: {
            code: 'SELECT_FAILED',
            message: 'Failed to retrieve account',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Account
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

  async selectAccountContext(account_id: string): Promise<Result<AccountContext>> {
    try {
      this.uuid_schema.parse(account_id)
      
      const { data: account, error: account_error } = await this.supabase
        .from(TableName.ACCOUNTS)
        .select()
        .eq('account_id', account_id)
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

      const { data: networks, error: networks_error } = await this.supabase
        .from(TableName.NETWORKS_ACCOUNTS)
        .select(`${TableName.NETWORKS}(*)`)
        .eq('account_id', account_id)

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
        content: {
          account: account as Account,
          networks: (networks as any[]).map(n => n.networks) as Network[]
        } as AccountContext
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

  async updateAccount(
    account_id: string,
    email?: string,
    uname?: string,
    fname?: string,
    lname?: string,
    robot?: boolean,
    is_offline?: boolean
  ): Promise<Result<Account>> {
    try {
      this.uuid_schema.parse(account_id)
      this.account_schema.partial().parse({
        email,
        uname,
        fname,
        lname,
        robot,
        is_offline
      })

      const { data, error } = await this.supabase
        .from(TableName.ACCOUNTS)
        .update({
          ...(email && { email }),
          ...(uname && { uname }),
          ...(fname && { fname }),
          ...(lname && { lname }),
          ...(robot !== undefined && { robot }),
          is_offline
        })
        .eq('account_id', account_id)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          failure: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update account',
            context: error.message
          }
        }
      }

      return {
        success: true,
        content: data as Account
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          failure: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid account data',
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

  async deleteAccount(account_id: string): Promise<Result<void>> {
    try {
      this.uuid_schema.parse(account_id)

      const { error } = await this.supabase.rpc('fn_cascade_delete_account', {
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

      return { success: true }
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
    account_id,
    onAccountCreate,
    onAccountUpdate,
    onAccountDelete,
    onNetworkCreate,
    onNetworkUpdate,
    onNetworkDelete
  }: AccountSubscription): Promise<Result<RealtimeChannel>> {
    try {
      if (account_id) {
        this.uuid_schema.parse(account_id)
      }

      const subscription_channel_id = `account:${account_id || 0}:${new Date().toISOString()}`

      const subscription_channel = this.supabase
        .channel(subscription_channel_id)
        // Listen for account changes
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TableName.ACCOUNTS,
            filter: account_id ? `account_id=eq.${account_id}` : undefined
          },
          (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                onAccountCreate?.(payload.new as Account)
                break
              case 'UPDATE':
                onAccountUpdate?.(payload.new as Account)
                break
              case 'DELETE':
                onAccountDelete?.(payload.old as Account)
                break
            }
          }
        )
        // Listen for network changes through networks_accounts junction table
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TableName.NETWORKS_ACCOUNTS,
            filter: account_id ? `account_id=eq.${account_id}` : undefined
          },
          async (payload) => {
            if (payload.eventType === 'INSERT') {
              const { data: network } = await this.supabase
                .from(TableName.NETWORKS)
                .select()
                .eq('network_id', payload.new.network_id)
                .single()

              if (network) {
                onNetworkCreate?.(network as Network)
              }
            } else if (payload.eventType === 'DELETE') {
              onNetworkDelete?.(payload.old as Network)
            }
          }
        )
        // Listen for network updates
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: TableName.NETWORKS
          },
          async (payload) => {
            // Only trigger if this network is associated with our account
            if (account_id) {
              const { data } = await this.supabase
                .from(TableName.NETWORKS_ACCOUNTS)
                .select()
                .eq('account_id', account_id)
                .eq('network_id', payload.new.network_id)
                .single()

              if (data) {
                onNetworkUpdate?.(payload.new as Network)
              }
            } else {
              onNetworkUpdate?.(payload.new as Network)
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
            message: 'Invalid account ID format'
          }
        }
      }

      return {
        success: false,
        failure: {
          code: 'SUBSCRIPTION_FAILED',
          message: 'Failed to subscribe to accounts changes',
          context: error instanceof Error ? error.message : undefined
        }
      }
    }
  } 
}
