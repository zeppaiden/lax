export type Result<T> = {
    success: boolean;
    failure?: {
        code: string;
        message: string;
        context?: string;
    }
    content?: T;
}

export enum TableName {
  ACCOUNTS = 'accounts',
  NETWORKS = 'networks',
  CHANNELS = 'channels',
  MESSAGES = 'messages',
  NETWORKS_ACCOUNTS = 'networks_accounts',
  CHANNELS_ACCOUNTS = 'channels_accounts',
}

export enum ChannelType {
  PRIMARY = 'primary',
  WHISPER = 'whisper',
  SPINOFF = 'spinoff'
}

export enum MentionType {
  ACCOUNT = 'account',
  CHANNEL = 'channel'
}

export interface Account {
  account_id: string;
  created_at: string;
  present_at: string;
  is_offline: boolean;
  email: string;
  uname: string;
  fname: string;
  lname: string;
  robot?: boolean;
  meta?: {
    tts_voice?: string;
    [key: string]: any;
  };
}

export interface Network {
  network_id: string;
  created_at: string;
  created_by: string;
  name: string;
}

export interface Channel {
  channel_id: string;
  network_id: string;
  created_at: string;
  created_by: string;
  is_private: boolean;
  name: string;
  type: ChannelType;
}

interface MessageReaction {
  emoji: string;
  accounts: string[]; // Array of account IDs
}

interface MessageMeta {
  reactions?: MessageReaction[];
  payloads?: {
    path: string;
    purl: string;
    size: number;
    type: string;
  }[];
}

export interface Message {
  message_id: string;
  channel_id: string;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  pinned_at: string | null;
  pinned_by: string | null;
  content: string;
  tvector: string;
  meta: MessageMeta;
}

export interface NetworkAccount {
  network_id: string;
  account_id: string;
  created_at: string;
}

export interface ChannelAccount {
  channel_id: string;
  account_id: string;
  created_at: string;
}

export interface AccountContext {
  account: Account;
  networks: Network[];
}

export interface NetworkContext {
  network: Network;
  channels: Channel[];
  accounts: Account[];
}

export interface ChannelContext {
  channel: Channel;
  messages: Message[];
  accounts: Account[];
}

export interface MessageContext {
  message: Message;
  account: Account;
  channel: Channel;
}

export interface SearchMessage {
  message: Message;
  account: Account;
  channel: Channel;
  spinoff?: Channel;
  whisper?: Account;
  highlight: {
    text: string;
    positions: number[];
  };
}
