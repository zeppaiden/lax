import { SupabaseClient } from '@supabase/supabase-js'
import { AccountService } from '@/services/account-service'
import { ChannelService } from '@/services/channel-service'
import { MessageService } from '@/services/message-service'
import { NetworkService } from '@/services/network-service'
import { PayloadService } from '@/services/payload-service'

export class ServiceManager {
  private static service_manager: ServiceManager | null = null
  
  private readonly supabase: SupabaseClient
  private readonly account_service: AccountService
  private readonly channel_service: ChannelService
  private readonly message_service: MessageService
  private readonly network_service: NetworkService
  private readonly payload_service: PayloadService

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    
    // Initialize all services
    this.account_service = new AccountService(this.supabase)
    this.channel_service = new ChannelService(this.supabase)
    this.message_service = new MessageService(this.supabase)
    this.network_service = new NetworkService(this.supabase)
    this.payload_service = new PayloadService(this.supabase)
  }

  public static initialize(supabase: SupabaseClient): ServiceManager {
    if (!ServiceManager.service_manager) {
      ServiceManager.service_manager = new ServiceManager(supabase)
    }
    return ServiceManager.service_manager
  }

  public static instance(): ServiceManager {
    if (!ServiceManager.service_manager) {
      throw new Error(
        'ServiceManager not initialized. Call initialize() first with a Supabase client.'
      )
    }
    return ServiceManager.service_manager
  }

  public get accounts(): AccountService {
    return this.account_service
  }

  public get channels(): ChannelService {
    return this.channel_service
  }

  public get messages(): MessageService {
    return this.message_service
  }

  public get networks(): NetworkService {
    return this.network_service
  }

  public get payloads(): PayloadService {
    return this.payload_service
  }

  public static reset(): void {
    ServiceManager.service_manager = null
  }
}