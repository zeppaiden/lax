DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS mentions;
DROP TABLE IF EXISTS reactions;
DROP TABLE IF EXISTS payloads;
DROP TABLE IF EXISTS networks;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS networks_accounts;
DROP TABLE IF EXISTS channels_accounts;
DROP TABLE IF EXISTS channels_messages;
DROP TYPE IF EXISTS channel_type;

-- Enums
CREATE TYPE channel_type AS ENUM ('primary', 'whisper', 'spinoff');

-- Tables
CREATE TABLE accounts (
    account_id uuid PRIMARY KEY NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    present_at timestamp NOT NULL DEFAULT now(),
    email text NOT NULL UNIQUE,
    uname text NOT NULL UNIQUE,
    fname text NOT NULL,
    lname text NOT NULL,
    robot boolean NOT NULL DEFAULT false
);
CREATE TABLE networks (
    network_id uuid PRIMARY KEY NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES accounts(account_id),
    name text NOT NULL,
    UNIQUE(created_by, name)
);
CREATE TABLE channels (
    channel_id uuid PRIMARY KEY NOT NULL,
    network_id uuid NOT NULL REFERENCES networks(network_id),
    created_at timestamp NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES accounts(account_id),
    is_private boolean NOT NULL DEFAULT false,
    name text NOT NULL,
    type channel_type NOT NULL DEFAULT 'primary',
    UNIQUE(network_id, name)
);
CREATE TABLE messages (
    message_id UUID PRIMARY KEY,
    channel_id UUID NOT NULL REFERENCES channels(channel_id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES accounts(account_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    content TEXT NOT NULL,
    tvector TSVECTOR,
    meta JSONB DEFAULT '{}'::JSONB
);
CREATE TABLE networks_accounts (
    network_id uuid NOT NULL REFERENCES networks(network_id),
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    created_at timestamp NOT NULL DEFAULT now(),
    UNIQUE(network_id, account_id)
);
CREATE TABLE channels_accounts (
    channel_id uuid NOT NULL REFERENCES channels(channel_id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    created_at timestamp NOT NULL DEFAULT now(),
    UNIQUE(channel_id, account_id)
);

-- Indexes
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
