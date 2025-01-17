import * as React from "react";

import { SidebarMenuSub } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronRight, User } from "lucide-react";
import { NetworkAccountsItem } from "@/components/network/network-accounts-item";
import { Account } from "@/services/types";
import { useServiceContext } from "@/contexts/page";
import { toast } from "sonner";
import { useSidebar } from "@/components/ui/sidebar";

export function NetworkAccountsList() {
  const { service_manager, current_account, current_network } = useServiceContext();
  const { state } = useSidebar();
  const [accounts, setAccounts] = React.useState<Account[]>([]);

  const handleCreateAccount = React.useCallback((account: Account) => {
    setAccounts(prev => {
      if (prev.some(a => a.account_id === account.account_id)) {
        return prev;
      }
      return [...prev, account];
    });
  }, []);

  const handleUpdateAccount = React.useCallback((account: Account) => {
    setAccounts(prev => prev.map(a => 
      a.account_id === account.account_id ? account : a
    ));
  }, []);

  const handleDeleteAccount = React.useCallback((account: Account) => {
    setAccounts(prev => prev.filter(a => 
      a.account_id !== account.account_id
    ));
  }, []);

  React.useEffect(() => {
    const initialize = async () => {
      if (!current_network?.network_id) {
        console.warn('No network ID available, skipping account fetch');
        return;
      }

      try {
        const accounts_result = await service_manager.networks.selectAccounts(
          current_network.network_id
        );

        if (!accounts_result.success) {
          console.warn('Failed to fetch network accounts:', accounts_result.failure);
          toast.error(accounts_result.failure?.message, {
            description: accounts_result.failure?.context,
          });
          return;
        }

        setAccounts(accounts_result.content || []);

        // Subscribe to network events for accounts
        const subscription_result = await service_manager.networks.subscribe({
          network_id: current_network.network_id,
          onAccountCreate: handleCreateAccount,
          onAccountUpdate: handleUpdateAccount,
          onAccountDelete: handleDeleteAccount,
        });

        if (!subscription_result.success) {
          console.warn('Failed to subscribe to network accounts:', subscription_result.failure);
          toast.error(subscription_result.failure?.message, {
            description: subscription_result.failure?.context,
          });
          return;
        }

        return () => {
          subscription_result.content?.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing network accounts:', error);
        toast.error('Failed to initialize network accounts');
      }
    };

    initialize();
  }, [
    current_network?.network_id,
    handleCreateAccount,
    handleUpdateAccount,
    handleDeleteAccount
  ]);

  return (
    <Collapsible
      key="accounts"
      defaultOpen={current_network !== null}
      className="group/collapsible"
    >
      <CollapsibleTrigger asChild>
        <SidebarMenuButton tooltip="Accounts">
          <div className="flex w-full items-center gap-2">
            {state === "expanded" ? (
              <>
                <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                <span>Accounts</span>
              </>
            ) : (
              <div className="flex w-full justify-center">
                <User className="size-4" />
              </div>
            )}
          </div>
        </SidebarMenuButton>
      </CollapsibleTrigger>
      {state === "expanded" && (
        <CollapsibleContent>
          <SidebarMenuSub>
            {accounts.map(account => (
              <NetworkAccountsItem 
                key={account.account_id}
                account={account} 
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
