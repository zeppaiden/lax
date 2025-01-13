'use client'

import * as React from 'react'
import { Account, Channel, Network, ServiceManager } from "@/services";
import { createClient } from "@/utils/supabase/client";

type ServiceContextType = {
  service_manager: ServiceManager;
  current_account: Account;
  current_network: Network | null;
  current_channel: Channel | null;
  current_spinoff: Channel | null;
  setCurrentAccount: (account: Account) => void;
  setCurrentNetwork: (network: Network | null) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  setCurrentSpinoff: (spinoff: Channel | null) => void;
}

export const ServiceContext = React.createContext<ServiceContextType | undefined>(undefined);

export function useServiceContext() {
  const context = React.useContext(ServiceContext);
  if (!context) {
    throw new Error('useServiceContext must be used within a ServiceProvider');
  }
  return context;
}

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const service_manager = ServiceManager.initialize(supabase);

  const [isLoading, setIsLoading] = React.useState(true);
  const [current_account, setCurrentAccount] = React.useState<Account | null>(null);
  const [current_network, setCurrentNetwork] = React.useState<Network | null>(null);
  const [current_channel, setCurrentChannel] = React.useState<Channel | null>(null);
  const [current_spinoff, setCurrentSpinoff] = React.useState<Channel | null>(null);

  React.useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          window.location.href = '/sign-in';
          return;
        }

        let result = await service_manager.accounts.selectAccount(user.id);
        if (!result.success || !result.content) {
          result = await service_manager.accounts.createAccount(
            user.id,
            user.email || '',
            user.user_metadata.name || '',
            user.user_metadata.avatar_url || '',
            user.user_metadata.bio || '',
            user.user_metadata.location || ''
          );
        }

        if (!result.success || !result.content) {
          window.location.href = '/sign-in';
          return;
        }

        setCurrentAccount(result.content);
      } catch (error) {
        window.location.href = '/sign-in';
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!current_account) {
    return null;
  }

  return (
    <ServiceContext.Provider value={{ 
      service_manager, 
      current_account,
      current_network, 
      current_channel,
      current_spinoff,
      setCurrentAccount,
      setCurrentNetwork,
      setCurrentChannel,
      setCurrentSpinoff
    }}>
      {children}
    </ServiceContext.Provider>
  );
}
