# Lax
Lax is a real-time messaging platform that reimagines traditional chat concepts with unique terminology. It focuses on providing a performant, service-oriented architecture with real-time updates by default and minimal state management.

## Tech Stack
* Next.js 13+ (Web application front-end and API)
* React (Component architecture)
* shadcn/ui (Pre-built components with TailwindCSS)
* Supabase (Authentication, data persistence, real-time)
* v0 (Unique component building)
* Vercel (Hosting)
* Jotai (Minimal state management)

## Features
* Networks (workspaces) with multiple channels
* Real-time messaging across channels
* Whispers (private messages)
* Spinoffs (message threads)
* File uploads (Payloads)
* Message reactions
* User mentions and channel references
* Full-text search
* Presence tracking
* Bot support

## Key Points
* Messages can have only one Spinoff (thread)
* Payloads are restricted to primary channels only
* Maximum file size is 10MB
* Simple permissions: creator can delete networks/channels
* Any user can create networks or channels
* Mentions support both users (@user) and channels (#channel)
* Networks can have multiple users, users can be in multiple networks
* Real-time messaging implemented via Supabase's real-time subscriptions feature
* Authentication handled through Supabase:
  * Email/password authentication
  * OAuth providers supported
* File storage (Payloads) managed through Supabase storage
* Mentions system includes a UI inbox/notifications button for viewing mentions
* Bot/Replica features:
  * Each bot is an avatar named 'Replica' tied to a single account
  * Replicas respond when mentioned using account's message history as context
  * Replica creation is opt-in only
  * Account must enable replica feature explicitly
* Rate limiting implemented at application layer, not database level
* Service boundaries follow strict domain separation matching database tables
* Replica/bot functionality integrated into messaging services, treated as special users
* TypeScript enums exactly match database custom types
* Search functionality integrated into message-related services rather than separate
* Payload constraints implemented at both service and database levels
* All service methods return QueryResult type for consistent error handling
* Services use consistent Context suffix for complex query responses
* Read operations (select*) don't throw errors, write operations do
* Mentions and reactions handled within MessageService to reduce complexity
* Whispers treated as another message type within MessageService

## Schemas
Fields are listed in the format of: `{name}; {type}; {primary/foreign key, or 'none' if n/a}; {constraints, or 'none' if n/a}; {default, or 'none' if n/a}`.

### Enums
* presence_status: ('online', 'offline', 'away')
* channel_type: ('channel', 'whisper', 'spinoff')
* mention_type: ('account', 'channel')
* payload_type: ('image', 'video', 'audio', 'file')

### Tables

* accounts
  * account_id; uuid; PK; not null; none
  * created_at; timestamp; none; not null; now()
  * present_at; timestamp; none; not null; now()
  * email; text; none; not null, unique; none
  * uname; text; none; not null, unique; none
  * fname; text; none; not null; none
  * lname; text; none; not null; none
  * robot; bool; none; not null; false
  * Constraints:
    * accounts_email_check: Valid email format
    * accounts_uname_check: Alphanumeric + underscore, 1-30 chars
    * accounts_names_check: Non-empty first and last names

* networks
  * network_id; uuid; PK; not null; none
  * created_at; timestamp; none; not null; now()
  * created_by; uuid; FK(accounts); not null; none
  * name; text; none; not null, unique with created_by; none
  * Constraints:
    * networks_name_check: Non-empty name, max 50 chars

* networks_accounts
  * network_id; uuid; FK(networks); not null; none
  * account_id; uuid; FK(accounts); not null; none
  * created_at; timestamp; none; not null; now()
  * Constraint: unique(network_id, account_id)

* channels
  * channel_id; uuid; PK; not null; none
  * network_id; uuid; FK(networks); not null; none
  * created_at; timestamp; none; not null; now()
  * created_by; uuid; FK(accounts); not null; none
  * is_private; boolean; none; not null; false
  * name; text; none; not null, unique with network_id; none
  * Constraints:
    * channels_name_check: Non-empty name, max 50 chars

* channels_accounts
  * channel_id; uuid; FK(channels); not null; none
  * account_id; uuid; FK(accounts); not null; none
  * created_at; timestamp; none; not null; now()
  * created_by; uuid; FK(accounts); not null; none
  * Constraints:
    * unique(channel_id, account_id)
    * channels_accounts_creator_access_check: Creator must be in network

* whispers
  * whisper_id; uuid; PK; not null; none
  * network_id; uuid; FK(networks); not null; none
  * created_at; timestamp; none; not null; now()
  * created_by; uuid; FK(accounts); not null; none
  * whisper_to; uuid; FK(accounts); not null; none
  * Constraints:
    * unique(network_id, created_by, whisper_to)
    * whispers_no_self_whisper_check: No self-whispers
    * whispers_same_network_check: Both users must be in network

* channels_messages
  * message_id; uuid; PK; not null; none
  * channel_id; uuid; FK(channels); not null; none
  * created_at; timestamp; none; not null; now()
  * created_by; uuid; FK(accounts); not null; none
  * replica_id; uuid; FK(replicas); null; none
  * updated_at; timestamp; none; null; none
  * content; text; none; not null; none
  * tvector; tsvector; none; not null; none
  * Constraints:
    * channels_messages_replica_owner_check: Valid replica ownership
    * channels_messages_content_check: Non-empty content
    * channels_messages_update_check: Valid update timestamp

* whispers_messages
  * message_id; uuid; PK; not null; none
  * whisper_id; uuid; FK(whispers); not null; none
  * created_at; timestamp; none; not null; now()
  * created_by; uuid; FK(accounts); not null; none
  * updated_at; timestamp; none; null; none
  * content; text; none; not null; none
  * tvector; tsvector; none; not null; none
  * Constraints:
    * whispers_messages_content_check: Non-empty content
    * whispers_messages_update_check: Valid update timestamp

* spinoffs_messages
  * message_id; uuid; PK; not null; none
  * spinoff_of; uuid; FK(channels_messages); not null; none
  * created_at; timestamp; none; not null; now()
  * created_by; uuid; FK(accounts); not null; none
  * updated_at; timestamp; none; null; none
  * content; text; none; not null; none
  * tvector; tsvector; none; not null; none
  * Constraints:
    * spinoffs_no_chains_check: No nested spinoffs
    * spinoffs_no_self_reference_check: No self-reference
    * spinoffs_messages_content_check: Non-empty content
    * spinoffs_messages_update_check: Valid update timestamp

* presences
  * presence_id; uuid; PK; not null; none
  * account_id; uuid; FK(accounts); not null, unique; none
  * created_at; timestamp; none; not null; now()
  * updated_at; timestamp; none; not null; now()
  * status; presence_status; none; not null; 'offline'
  * Constraints:
    * presences_timestamp_check: Valid timestamp order
    * presences_no_future_check: No future timestamps

* mentions
  * mention_id; uuid; PK; not null; none
  * message_id; uuid; none; not null; none
  * message_in; channel_type; none; not null; none
  * account_id; uuid; FK(accounts); not null; none
  * created_at; timestamp; none; not null; now()
  * type; mention_type; none; not null; none
  * Constraints:
    * unique(message_id, message_in, account_id)
    * mentions_message_type_check: Valid message reference
    * mentions_channel_access_check: Channel access for channel mentions

* reactions
  * reaction_id; uuid; PK; not null; none
  * message_id; uuid; none; not null; none
  * message_in; channel_type; none; not null; none
  * created_at; timestamp; none; not null; now()
  * created_by; uuid; FK(accounts); not null; none
  * emoji; text; none; not null; none
  * Constraints:
    * unique(message_id, message_in, created_by, emoji)
    * reactions_emoji_check: Valid emoji format
    * reactions_message_type_check: Valid message reference

* payloads
  * payload_id; uuid; PK; not null; none
  * message_id; uuid; none; not null; none
  * message_in; channel_type; none; not null; none
  * created_at; timestamp; none; not null; now()
  * created_by; uuid; FK(accounts); not null; none
  * url; text; none; not null; none
  * type; payload_type; none; not null; none
  * size; integer; none; not null; none
  * Constraints:
    * payloads_size_check: Size between 0 and 10MB
    * payloads_channel_only_check: Channel messages only
    * payloads_message_exists_check: Valid message reference

* replicas
  * replica_id; uuid; PK; not null; none
  * created_at; timestamp; none; not null; now()
  * created_by; uuid; FK(accounts); not null; none
  * enabled; boolean; none; not null; false
  * persona; text; none; not null; none
  * context; text[]; none; not null; '{}'::text[]
  * Constraints:
    * replicas_persona_check: Non-empty persona
    * replicas_context_size_check: Max 100 context items

### Indices
* Channel Access
  * idx_channels_accounts_account: (account_id)
  * idx_channels_accounts_channel: (channel_id)
  * idx_channels_network_name: UNIQUE (network_id, name)

* Message Access
  * idx_channels_messages_channel_created: (channel_id, created_at DESC)
  * idx_whispers_messages_whisper_created: (whisper_id, created_at DESC)
  * idx_spinoffs_messages_parent_created: (spinoff_of, created_at DESC)
  * idx_channels_messages_replica: (replica_id)

* Search
  * idx_messages_tvector_gin: GIN(tvector) for channels
  * idx_whispers_tvector_gin: GIN(tvector) for whispers
  * idx_spinoffs_tvector_gin: GIN(tvector) for spinoffs

* Social Features
  * idx_networks_accounts_account: (account_id)
  * idx_presences_account_status_updated: (account_id, status, updated_at)
  * idx_mentions_account_created: (account_id, created_at DESC)
  * idx_whispers_participant_pair: (network_id, created_by, whisper_to)
  * idx_payloads_message: (message_id, message_in)
  * idx_reactions_message: (message_id, message_in)
  * idx_network_unique_name: UNIQUE (created_by, name)

## Database Functions

### Message Management
* fn_update_message_tvector(): Updates message search vector and validates content
    * Arguments: None (trigger function)
    * Returns: trigger
    * Notes: Ensures content is not empty, updates tvector for search

* fn_cascade_delete_message(): Cascades deletion to associated entries
    * Arguments:
        * message_id: uuid
        * message_in: channel_type
    * Returns: void
    * Notes: Deletes associated reactions, mentions, and payloads

* fn_before_update_messages(): Validates message updates
    * Arguments: None (trigger function)
    * Returns: trigger
    * Notes: Validates content and timestamps, updates tvector

* fn_after_message_insert(): Processes new messages
    * Arguments: None (trigger function)
    * Returns: trigger
    * Notes: 
        * Updates presence
        * Processes @mentions and #channel references
        * Updates replica context if applicable

### Network Management
* fn_create_network(): Creates network and adds creator
    * Arguments:
        * creator_id: uuid
        * name: text
    * Returns: uuid (network_id)
    * Notes: Validates network name length (1-50 chars)

* fn_delete_network(): Cascades network deletion
    * Arguments:
        * network_id: uuid
    * Returns: void
    * Notes: Deletes channels, whispers, and memberships

* fn_validate_network_permissions(): Checks user permissions
    * Arguments:
        * account_id: uuid
        * network_id: uuid
        * permission: text
    * Returns: boolean
    * Notes: Supports 'delete_network', 'create_channel', 'invite_member'

* fn_invite_to_network(): Handles network invitations
    * Arguments:
        * inviter_id: uuid
        * invitee_id: uuid
        * network_id: uuid
    * Returns: boolean
    * Notes: Validates permissions and existing membership

### Channel Management
* fn_delete_channel(): Cascades channel deletion
    * Arguments:
        * channel_id: uuid
    * Returns: void
    * Notes: Deletes messages, spinoffs, and channel data

* fn_create_default_channel(): Creates "general" channel
    * Arguments: None (trigger function)
    * Returns: trigger
    * Notes: Creates non-private channel, adds all network members

* fn_manage_channel_membership(): Handles channel membership
    * Arguments:
        * channel_id: uuid
        * account_id: uuid
        * created_by: uuid
    * Returns: boolean
    * Notes: Validates network membership and permissions

* fn_check_channel_access(): Validates channel access
    * Arguments:
        * channel_id: uuid
        * account_id: uuid
    * Returns: boolean
    * Notes: Checks network membership and private channel access

### Presence Management
* fn_update_presence(): Updates user presence status
    * Arguments:
        * account_id: uuid
        * status: presence_status
    * Returns: void
    * Notes: Updates presence and account.present_at

* fn_get_network_presence(): Retrieves network member presence
    * Arguments:
        * network_id: uuid
    * Returns: TABLE (presence_data jsonb)
    * Notes: Includes offline users

* fn_handle_presence_timeout(): Manages inactive users
    * Arguments:
        * timeout_minutes: integer
    * Returns: void
    * Notes: Sets status to 'offline' after timeout

### Message Context and Search
* fn_get_message_context(): Retrieves message with related data
    * Arguments:
        * message_id: uuid
        * message_in: channel_type
    * Returns: jsonb
    * Notes: Includes reactions, mentions, and payloads

* fn_search_messages(): Searches messages across types
    * Arguments:
        * query: text
        * network_id: uuid
        * limit: integer
        * offset: integer
    * Returns: TABLE (message results)
    * Notes: Searches channels, whispers, and spinoffs

### Replica Management
* fn_get_replica_training_data(): Retrieves message history
    * Arguments:
        * account_id: uuid
        * limit: integer
    * Returns: text[]
    * Notes: Gets messages across all types for training

* fn_update_replica_context(): Updates replica context
    * Arguments:
        * account_id: uuid
        * message_content: text
        * max_size: integer
    * Returns: void
    * Notes: Maintains fixed-size context array

### Account Management
* fn_cascade_delete_account(): Handles account deletion
    * Arguments:
        * account_id: uuid
    * Returns: void
    * Notes: Cascades deletion across all related data

### Payload Management
* fn_validate_payload(): Validates file uploads
    * Arguments: None (trigger function)
    * Returns: trigger
    * Notes:
        * Enforces 10MB size limit
        * Restricts to channel messages only
        * Validates file types and URLs

## Database Triggers
* tr_before_update_channels_messages, tr_before_update_whispers_messages, tr_before_update_spinoffs_messages: Updates full-text search vector when message content changes
    * Tables: channels_messages, whispers_messages, spinoffs_messages
    * Function Dependencies:
        * fn_update_message_tvector()
    * Notes:
        * Executes BEFORE UPDATE ON content column
        * Validates content is not empty
        * Updates tvector for search functionality

* tr_before_insert_channels_messages, tr_before_insert_whispers_messages, tr_before_insert_spinoffs_messages: Validates and processes new messages
    * Tables: channels_messages, whispers_messages, spinoffs_messages
    * Function Dependencies:
        * fn_update_message_tvector()
    * Notes:
        * Validates content is not empty
        * Creates initial tvector for search

* tr_before_update_channels_timestamps, tr_before_update_whispers_timestamps, tr_before_update_spinoffs_timestamps: Validates message update timestamps
    * Tables: channels_messages, whispers_messages, spinoffs_messages
    * Function Dependencies:
        * fn_validate_message_timestamps()
    * Notes:
        * Ensures updated_at is after created_at
        * Only executes when updated_at is not NULL

* tr_after_update_presence_status: Updates user presence status
    * Tables: presences
    * Function Dependencies:
        * fn_update_presence()
    * Notes:
        * Updates account.present_at
        * Manages real-time presence tracking

* tr_before_update_presence_timestamps: Validates presence timestamps
    * Tables: presences
    * Function Dependencies:
        * fn_validate_presence_timestamps()
    * Notes:
        * Ensures updated_at is after created_at
        * Prevents future timestamps

* tr_before_insert_replica_message: Validates replica message creation
    * Tables: channels_messages
    * Function Dependencies:
        * fn_validate_replica_message()
    * Notes:
        * Only executes for messages with replica_id
        * Validates replica ownership and enabled status

## Database Indices
* CREATE INDEX idx_channels_messages_channel_created ON channels_messages(channel_id, created_at DESC)
    * Description: Indexes channel messages by their channel and timestamp in descending order.
    * Reason: Channel message history retrieval is the most frequent operation and needs to be lightning fast.

* CREATE INDEX idx_whispers_messages_whisper_created ON whispers_messages(whisper_id, created_at DESC)
    * Description: Indexes whisper messages by their whisper conversation and timestamp in descending order.
    * Reason: Users frequently load and scroll through their private message history.

* CREATE INDEX idx_spinoffs_messages_parent_created ON spinoffs_messages(spinoff_of, created_at DESC)
    * Description: Indexes thread replies by their parent message and timestamp in descending order.
    * Reason: Thread views need to quickly load all replies to a specific message in chronological order.

* CREATE INDEX idx_messages_tvector_gin ON channels_messages USING GIN(tvector)
    * Description: Creates a GIN index on the text search vector for channel messages.
    * Reason: Full-text search across channel messages needs to be performant for large message histories.

* CREATE INDEX idx_whispers_tvector_gin ON whispers_messages USING GIN(tvector)
    * Description: Creates a GIN index on the text search vector for whisper messages.
    * Reason: Users need to be able to search through their private message history efficiently.

* CREATE INDEX idx_spinoffs_tvector_gin ON spinoffs_messages USING GIN(tvector)
    * Description: Creates a GIN index on the text search vector for thread messages.
    * Reason: Thread messages need to be included in full-text search results.

* CREATE INDEX idx_networks_accounts_account ON networks_accounts(account_id)
    * Description: Indexes network membership by account ID.
    * Reason: Quick access to a user's networks is critical for initial load and permission checks.

* CREATE INDEX idx_presences_account_status_updated ON presences(account_id, status, updated_at)
    * Description: Indexes presence data by account, status, and last update time.
    * Reason: Real-time presence tracking requires frequent status checks and updates.

* CREATE INDEX idx_mentions_account_created ON mentions(account_id, created_at DESC)
    * Description: Indexes mentions by mentioned account and creation time in descending order.
    * Reason: The mentions inbox feature needs to quickly show users their recent mentions.

* CREATE INDEX idx_whispers_participant_pair ON whispers(network_id, created_by, whisper_to)
    * Description: Indexes whisper conversations by network and participant pairs.
    * Reason: Finding existing whisper conversations between users in a network must be efficient.

* CREATE INDEX idx_payloads_message ON payloads(message_id, message_in)
    * Description: Indexes file attachments by their associated message and message type.
    * Reason: File attachments need to be quickly retrieved when loading messages.

* CREATE UNIQUE INDEX idx_channels_network_name ON channels(network_id, name)
    * Description: Creates a unique index on channel names within networks.
    * Reason: Enforces channel name uniqueness per network while optimizing channel lookups.

* CREATE UNIQUE INDEX idx_network_unique_name ON networks(created_by, name)
    * Description: Creates a unique index on network names per creator.
    * Reason: Enforces network name uniqueness per creator while optimizing network lookups.

* CREATE INDEX idx_reactions_message ON reactions(message_id, message_in)
    * Description: Indexes reactions by their associated message and message type.
    * Reason: Message reactions need to be quickly retrieved when displaying messages.

## Services

* AccountService:
  * Reason: Core user management functionality is required for all other services.
  * Description: Manages user accounts, their creation, updates, and deletions.
  * Functionalities:
    * createAccount: Creates a new user account in the system.
      * Arguments:
        * account: Omit<Account, 'account_id' | 'created_at' | 'present_at'>
      * Returns: QueryResult<Account>
      * Throws: TRUE
    * selectAccountById: Retrieves account details by ID.
      * Arguments:
        * account_id: string
      * Returns: QueryResult<Account>
      * Throws: FALSE
    * selectAccountByEmail: Retrieves account details by email for authentication.
      * Arguments:
        * email: string
      * Returns: QueryResult<Account>
      * Throws: FALSE
    * selectAccountByUsername: Retrieves account details by username for @ mentions.
      * Arguments:
        * uname: string
      * Returns: QueryResult<Account>
      * Throws: FALSE
    * updateAccount: Updates account information.
      * Arguments:
        * account_id: string
        * data: Partial<Account>
      * Returns: QueryResult<Account>
      * Throws: TRUE
    * deleteAccount: Removes an account and all associated data.
      * Arguments:
        * account_id: string
      * Returns: QueryResult<void>
      * Throws: TRUE

* NetworkService:
  * Reason: Networks are the top-level organizational structure for the application.
  * Description: Manages workspace creation, updates, and member access.
  * Functionalities:
    * createNetwork: Creates a new network with the creator as first member.
      * Arguments:
        * created_by: string
        * name: string
      * Returns: QueryResult<Network>
      * Throws: TRUE
    * selectNetworkById: Retrieves basic network information.
      * Arguments:
        * network_id: string
      * Returns: QueryResult<Network>
      * Throws: FALSE
    * selectNetworkContext: Retrieves network with its channels.
      * Arguments:
        * network_id: string
      * Returns: QueryResult<NetworkContext>
      * Throws: FALSE
    * selectNetworksForAccount: Retrieves all networks for a user.
      * Arguments:
        * account_id: string
        * pagination: PaginationParams
      * Returns: QueryResult<NetworkContext[]>
      * Throws: FALSE
    * updateNetwork: Updates network name.
      * Arguments:
        * network_id: string
        * name: string
      * Returns: QueryResult<Network>
      * Throws: TRUE
    * deleteNetwork: Removes network and all associated data.
      * Arguments:
        * network_id: string
      * Returns: QueryResult<void>
      * Throws: TRUE
    * insertAccountToNetwork: Adds user to network.
      * Arguments:
        * network_id: string
        * account_id: string
      * Returns: QueryResult<NetworkAccount>
      * Throws: TRUE
    * removeAccountFromNetwork: Removes user from network.
      * Arguments:
        * network_id: string
        * account_id: string
      * Returns: QueryResult<void>
      * Throws: TRUE

* ChannelService:
  * Reason: Channels organize conversations within networks.
  * Description: Manages channel creation, updates, and deletions within networks.
  * Functionalities:
    * createChannel: Creates a new channel in a network.
      * Arguments:
        * network_id: string
        * created_by: string
        * name: string
      * Returns: QueryResult<Channel>
      * Throws: TRUE
    * selectChannelById: Retrieves channel information.
      * Arguments:
        * channel_id: string
      * Returns: QueryResult<Channel>
      * Throws: FALSE
    * selectChannelsInNetwork: Retrieves all channels in a network.
      * Arguments:
        * network_id: string
      * Returns: QueryResult<Channel[]>
      * Throws: FALSE
    * updateChannel: Updates channel name.
      * Arguments:
        * channel_id: string
        * name: string
      * Returns: QueryResult<Channel>
      * Throws: TRUE
    * deleteChannel: Removes channel and all messages.
      * Arguments:
        * channel_id: string
      * Returns: QueryResult<void>
      * Throws: TRUE
    * addMemberToChannel: Adds a user to a channel.
      * Arguments:
        * channel_id: string
        * account_id: string
        * created_by: string
      * Returns: QueryResult<void>
      * Throws: TRUE
    * removeMemberFromChannel: Removes a user from a channel.
      * Arguments:
        * channel_id: string
        * account_id: string
      * Returns: QueryResult<void>
      * Throws: TRUE
    * checkChannelAccess: Checks if user can access a channel.
      * Arguments:
        * channel_id: string
        * account_id: string
      * Returns: QueryResult<boolean>
      * Throws: FALSE

* MessageService:
  * Reason: Messages are the core communication medium across all contexts.
  * Description: Manages all message operations including channel messages, whispers, and spinoffs.
  * Functionalities:
    * createMessage: Creates a message in any context (channel, whisper, spinoff).
      * Arguments:
        * type: ChannelType
        * params: MessageCreateParams
      * Returns: QueryResult<MessageContext>
      * Throws: TRUE
    * selectMessageContext: Retrieves message with reactions, mentions, and payloads.
      * Arguments:
        * message_id: string
        * type: ChannelType
      * Returns: QueryResult<MessageContext>
      * Throws: FALSE
    * selectMessages: Retrieves messages based on context parameters.
      * Arguments:
        * params: MessageSelectParams
      * Returns: QueryResult<MessageContext[]>
      * Throws: FALSE
    * updateMessage: Updates message content.
      * Arguments:
        * message_id: string
        * type: ChannelType
        * content: string
      * Returns: QueryResult<MessageContext>
      * Throws: TRUE
    * deleteMessage: Removes message and associated data.
      * Arguments:
        * message_id: string
        * type: ChannelType
      * Returns: QueryResult<void>
      * Throws: TRUE
    * searchMessages: Performs full-text search across messages.
      * Arguments:
        * network_id: string
        * query: string
        * pagination: PaginationParams
      * Returns: QueryResult<MessageContext[]>
      * Throws: FALSE
    * toggleReaction: Toggles an emoji reaction on a message.
      * Arguments:
        * message_id: string
        * type: ChannelType
        * created_by: string
        * emoji: string
      * Returns: QueryResult<void>
      * Throws: TRUE
    * createWhisper: Creates a new whisper conversation.
      * Arguments:
        * network_id: string
        * created_by: string
        * whisper_to: string
      * Returns: QueryResult<WhisperContext>
      * Throws: TRUE
    * selectWhisperContext: Retrieves whisper conversation context.
      * Arguments:
        * whisper_id: string
      * Returns: QueryResult<WhisperContext>
      * Throws: FALSE

* PayloadService:
  * Reason: File attachments require specialized handling and constraints.
  * Description: Manages file uploads and their metadata across messages.
  * Functionalities:
    * createPayload: Uploads and attaches file to message.
      * Arguments:
        * message_id: string
        * created_by: string
        * file: File
      * Returns: QueryResult<Payload>
      * Throws: TRUE
    * selectPayloadById: Retrieves payload metadata.
      * Arguments:
        * payload_id: string
      * Returns: QueryResult<Payload>
      * Throws: FALSE
    * selectPayloadsForMessage: Retrieves all payloads for a message.
      * Arguments:
        * message_id: string
        * type: ChannelType
      * Returns: QueryResult<Payload[]>
      * Throws: FALSE
    * deletePayload: Removes payload and associated file.
      * Arguments:
        * payload_id: string
      * Returns: QueryResult<void>
      * Throws: TRUE

* ReplicaService:
  * Reason: Bot functionality requires specialized context management.
  * Description: Manages bot creation, context updates, and state.
  * Functionalities:
    * createReplica: Creates a new bot instance for an account.
      * Arguments:
        * created_by: string
        * persona: string
      * Returns: QueryResult<Replica>
      * Throws: TRUE
    * toggleReplica: Enables or disables a bot.
      * Arguments:
        * replica_id: string
      * Returns: QueryResult<Replica>
      * Throws: TRUE
    * updateReplicaContext: Updates bot's message context.
      * Arguments:
        * replica_id: string
        * message_content: string
      * Returns: QueryResult<void>
      * Throws: TRUE
    * selectReplicaById: Retrieves bot information.
      * Arguments:
        * replica_id: string
      * Returns: QueryResult<Replica>
      * Throws: FALSE
    * selectReplicaForAccount: Retrieves account's bot.
      * Arguments:
        * account_id: string
      * Returns: QueryResult<Replica>
      * Throws: FALSE

* PresenceService:
  * Reason: Real-time presence tracking is essential for user interaction.
  * Description: Manages user online status and presence information.
  * Functionalities:
    * updatePresence: Updates user's presence status.
      * Arguments:
        * account_id: string
        * status: PresenceStatus
      * Returns: QueryResult<void>
      * Throws: TRUE
    * selectPresenceContext: Retrieves user's presence information.
      * Arguments:
        * account_id: string
      * Returns: QueryResult<PresenceContext>
      * Throws: FALSE
    * selectNetworkPresences: Retrieves all presence states in a network.
      * Arguments:
        * network_id: string
      * Returns: QueryResult<PresenceContext[]>
      * Throws: FALSE

## Misc. Notes
* Plan to implement rate limiting for messages and file uploads
* Message parsing for mentions should happen on the server side
* Consider implementing message queue for bot interactions
