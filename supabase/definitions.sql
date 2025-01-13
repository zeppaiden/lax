--
-- Accounts
--
create table
  public.accounts (
    account_id uuid not null,
    created_at timestamp without time zone not null default now(),
    present_at timestamp without time zone not null default now(),
    is_offline boolean not null default true,
    email text not null,
    uname text not null,
    fname text not null,
    lname text not null,
    robot boolean not null default false,
    constraint accounts_pkey primary key (account_id),
    constraint accounts_email_key unique (email),
    constraint accounts_uname_key unique (uname)
  ) tablespace pg_default;

--
-- Channels
--
create table
  public.channels (
    channel_id uuid not null,
    network_id uuid not null,
    created_at timestamp without time zone not null default now(),
    created_by uuid not null,
    is_private boolean not null default false,
    name text not null,
    type public.channel_type not null default 'primary'::channel_type,
    spinoff_of uuid null,
    constraint channels_pkey primary key (channel_id),
    constraint channels_network_id_name_key unique (network_id, name),
    constraint channels_created_by_fkey foreign key (created_by) references accounts (account_id),
    constraint channels_network_id_fkey foreign key (network_id) references networks (network_id),
    constraint channels_spinoff_of_fkey foreign key (spinoff_of) references channels (channel_id)
  ) tablespace pg_default;

--
-- Channels' Accounts
--
create table
  public.channels_accounts (
    channel_id uuid not null,
    account_id uuid not null,
    created_at timestamp without time zone not null default now(),
    constraint channels_accounts_channel_id_account_id_key unique (channel_id, account_id),
    constraint channels_accounts_account_id_fkey foreign key (account_id) references accounts (account_id) on delete cascade,
    constraint channels_accounts_channel_id_fkey foreign key (channel_id) references channels (channel_id) on delete cascade
  ) tablespace pg_default;

--
-- Messages
--
create table
  public.messages (
    message_id uuid not null,
    channel_id uuid not null,
    created_at timestamp without time zone not null default now(),
    created_by uuid not null,
    updated_at timestamp without time zone null,
    content text not null,
    tvector tsvector not null,
    meta jsonb null default '{}'::jsonb,
    constraint channels_messages_pkey primary key (message_id),
    constraint channels_messages_channel_id_fkey foreign key (channel_id) references channels (channel_id) on delete cascade,
    constraint channels_messages_created_by_fkey foreign key (created_by) references accounts (account_id)
  ) tablespace pg_default;

--
-- Networks
--
create table
  public.networks (
    network_id uuid not null,
    created_at timestamp without time zone not null default now(),
    created_by uuid not null,
    name text not null,
    constraint networks_pkey primary key (network_id),
    constraint networks_created_by_name_key unique (created_by, name),
    constraint networks_created_by_fkey foreign key (created_by) references accounts (account_id)
  ) tablespace pg_default;

--
-- Networks' Accounts
--
create table
  public.networks_accounts (
    network_id uuid not null,
    account_id uuid not null,
    created_at timestamp without time zone not null default now(),
    constraint networks_accounts_network_id_account_id_key unique (network_id, account_id),
    constraint networks_accounts_account_id_fkey foreign key (account_id) references accounts (account_id),
    constraint networks_accounts_network_id_fkey foreign key (network_id) references networks (network_id)
  ) tablespace pg_default;
