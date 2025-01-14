# TODO Items

## IMMEDIATE
- [ ] Add `meta` columns to the tables in the database
  - These columns should be used for storing metadata about the row
  - These columns should be used for storing information that is not part of the row's data
  - These columns should not be used excessively, if possible
  - This is a hack to allow for more flexibility in the database and maintain developer velocity

- [ ] Replicas (AI avatars corresponding to real accounts)
  - [ ] The replica's messages should have a bot badge or effect
  - [ ] The replica's behavior should be customizable via a settings menu or page
    - [ ] The user should be able to toggle the replica for each network
    - [ ] The user should be able to toggle automatic replica interaction (with other users) for each network
    - [ ] The user should be able to add custom instructions or prompts to the replica's behavior
    - [ ] The user should be able to toggle a "fun mode" for the replica's behavior
      - [ ] Fun mode should make the replica's behavior more random and unpredictable, and make the replica's messages more creative and imaginative
        - The fun mode should still keep the replica's behavior consistent with the user's instructions, prompts, and context
      - [ ] Fun mode should be able to be toggled for each network
    - [ ] The user should be able to customize the replica's appearance
      - [ ] The replica's appearance should be customizable via a settings menu or page
      - [ ] The replica's appearance should be able to be toggled for each network
      - [ ] If the voice is enabled for the network, audio is included in the replica's video messages
      - [ ] If the voice is disabled for the network, the replica's video messages should be silent
        - Ideally, the video messages will know whether the user has enabled voice for the network and adjust the video accordingly
        - For example, if the user has enabled voice for the network, the video messages will include audio
        - For example, if the user has disabled voice for the network, the avatar's mouth will not be animated
    - [ ] The user should be able to customize the replica's voice
      - [ ] The replica's voice should be customizable via a settings menu or page
      - [ ] The replica's voice should be able to be toggled for each network
  - [ ] The replica's behavior should be able to learn from a corpus of messages
    - [ ] User's past messages across all networks should be included in the corpus of context
    - [ ] User's past messages should include messages they've sent, even if they've been deleted
    - [ ] If enabled, the replica's behavior should be effected by third-party's messages
      - [ ] X (formerly known as Twitter)
      - [ ] Discord
    - [ ] The replica's behavior should capture how they interact with other users generally (optional)
    - [ ] The replica's behavior should capture how they interact with other users specifically (optional)
      - The user might not like some users over others, so the replica should learn to avoid interacting with those users
  - [ ] The replica should be allowed certain commands to be run by the application
    - [ ] The replica can send messages to other users
    - [ ] The replica can send messages with mentions
    - [ ] The replica can interact with others' messages (e.g., reactions, replies) (optional)
    - [ ] The replica can send messages formatted with markdown (optional)
      - This includes the normal markdown formatting, as well as code blocks, links, lists, etc.
    - [ ] The replica can send media (optional)
      - [ ] Images
        - For example, GPT can now generate images
      - [ ] Videos 
        - These will be videos of an avatar speaking the message
        - The avatar should be able to be customized
        - The avatar, if not customized, should be match what the user's behavior indicates
        - The avatar should be able to be animated with various gestures
        - The animation should be able to be customized
        - The animations should match the message's tone and content and the user's behavior
      - [ ] Audio
        - These will be audio of a synthesized voice speaking the message
        - The voice should be able to be customized
        - The voice, if not customized, should be match what the user's behavior indicates

- [ ] Fix payloads not being downloadable after being uploaded and sent
  - [ ] Fix the payloads' path to be `{network_id}/{channel_id}/{message_id}/{timestamp}.{extension}`
  - Currently, the payloads are uploading properly, being sent without issue, are arriving in the Supabase storage bucket, but are not able to be downloaded. When downloading, the filename is automatically '404' and the file is not found.
  - The suspicion as of now is that the signing path is incorrect.

## General

- [ ] Switch to using S3 for payload storage.
  - [ ] The payloads should be stored in the S3 bucket with the path `{network_id}/{channel_id}/{message_id}/{timestamp}.{extension}`

- [ ] Switch to using a custom SMTP server for email
  - Currently, Supabase rate-limits emails, causing authentication issues when trying to sign in or sign up with email.

- [ ] Message formatting
  - [ ] Messages should be formatted with markdown
    - [ ] Bold
    - [ ] Italics
    - [ ] Underline
    - [ ] Strikethrough
    - [ ] Code
    - [ ] Code block
      - [ ] The code block should be formatted with the language of the code
    - [ ] Link
    - [ ] List
    - [ ] Quote (optional)
    - [ ] Heading (optional)
    - [ ] Horizontal rule (optional)
    - [ ] Table (optional)
    - [ ] Reaction
  - [ ] The MessageInputArea should have a button for each of the core message formatting options
    - [ ] Bold
    - [ ] Italics
    - [ ] Underline
    - [ ] Code block
      - [ ] Clicking on the code block button should display a dropdown menu with the languages of the supported code block types
    - [ ] Emoji
  - [ ] The message formatting options should be displayed above/below the message input area
  - [ ] While creating a message in the MessageInputArea, the text should be transformed into the appropriate message formatting (optional)
    - [ ] Bold
    - [ ] Italics
    - [ ] Underline
    - [ ] Code block
      - [ ] The code block should be formatted and highlighted with the language of the code
    - [ ] Link
    - [ ] List
    - [ ] Emoji (optional)
    - For example, if the user types '*' and then a character, the '*' and following text should be transformed into a bold formatting
    - For example, if the user types '`' and then a normal ascii character, the '`' and following text should be transformed into a code block formatting
    - For example, if the user types '```' and then shift+enter, the '```' and following text should be transformed into a code block formatting
      - If the user specifies the language of the code block after the '```' (e.g., '```python'), the code block should be formatted and highlighted with the language of the code
    - For example, if the user types '[' and then a character, the '[' and following text should be transformed into a link formatting
    - For example, if the user types '1.' and then a character, the '1.' and following text should be transformed into a list formatting
    - For example, if the user types ':' and then a character, the ':' should display possible emoji options. When the user finishes typing to emoji and ends it with a ':', the emoji should replace that ':<text>:' if it matches an emoji (optional)
    - Use Anthropic's input markdown formatting as a reference


- [ ] Editing messages
  - [ ] Messages should be editable
  - [ ] Removing a mention from a message should remove any display effects for the mentioned account

- [ ] Mentioning accounts
  - [ ] Mentioning an account should display the account's name in message with a mention effect (e.g., use the shadcn badge component to make it look like a badge and differentiate color)
  - [ ] Replying to a message should display the message with a reply effect (e.g., highlight the message with a different color)

- [ ] Mentioning channels
  - [ ] Mentioning a channel should display the channel's name in message with a mention effect (e.g., use the shadcn badge component to make it look like a badge and differentiate color)
  - [ ] Clicking on the channel's name in the message should set the current channel to the channel
    - [ ] If the channel can be accessed by the user, the channel name in the message should appear as the channel's name
    - [ ] If the channel cannot be accessed by the user, the channel name in the message should appear as 'No Access' with a lock icon

- [ ] Network Options
  - [ ] Each network should have a network options button to the right of the network's name in the AccountNetworksList
  - [ ] Clicking on the network options button should display a dropdown menu with the following options:
    - [ ] Leave network
    - [ ] Delete network (requires being the network's owner)
    - [ ] Manage network (requires being the network's owner)
      - [ ] Edit the network's name
      - [ ] Edit the network's description
      - [ ] Edit the network's image
      - [ ] Remove accounts from the network
      - [ ] Invite accounts to the network
        - [ ] The user should be able to invite accounts by their account's code
        - [ ] The user should be able to invite accounts by their account's username
        - [ ] The user should be able to invite accounts by their account's email\

- [ ] Channel Options
  - [ ] The channels header should have a channels options button to the right in the channels header of the AppSidebar 
  - [ ] Clicking on the channels options button should display a dropdown menu with the following options:
    - [ ] Create channel
      - [ ] When creating a channel, the user should be able to select from a scrollable list of the network's accounts to add to the channel
    - [ ] Delete channel (requires being the network's owner)
    - [ ] Manage channel
      - [ ] Edit the channel's name (requires being the network's owner)
      - [ ] Edit the channel's description (requires being the network's owner)
      - [ ] Edit the channel's image (requires being the network's owner)
      - [ ] Remove accounts from the channel (requires being the network's owner)
      - [ ] Invite accounts to the channel
        - [ ] The user should only be able to invite accounts from the network's accounts
          - Unlike friend or network invitations, channel invitations should only be able to be sent to accounts in the network since the channel is a subset of the network
  - [ ] Each channel should have a button for a user to leave the channel

- [ ] Whispers
  - [ ] The user should be able to send whispers to other accounts
  - [ ] Creating a whisper should show a scrollable list of the network's accounts
    - [ ] The whisper creation sends an invite to the selected account if they're not already friends
    - [ ] The whisper creation creates the channel immediately if the selected account is already friends with the user
  - [ ] The user should be able to leave a whisper (details TBD)
  - [ ] The user should be able to create a whisper with themselves (i.e., note to self)

- [ ] Spinoffs
  - [ ] The spinoff button in the MessageBubbleMenubar should indicate the number of messages in the spinoff

- [ ] Searching
  - [ ] Searching for accounts
    - [ ] Searching for accounts should display the accounts in a list
    - [ ] Clicking on an account should display the account's profile in a modal and allow the user to be invited to a network, channel, etc.
  - [ ] Searching for channels
    - [ ] Searching for channels should display the channels in a list
    - [ ] Clicking on a channel should set the current channel to the channel
  - [ ] Searching for networks
    - [ ] Searching for networks should display the networks in a list
    - [ ] Clicking on a network should set the current network to the network
  - [ ] Searching for messages
    - [ ] The messages returned should be clickable and takes the user to the message
      - [ ] Scroll to the message in the message bubbles list

- [ ] Media
  - [ ] Common media types should be displayed in the message bubbles area
    - [ ] Images should be displayed as their image preview, not the normal download icon
    - [ ] Videos should be displayed with a media player, not the normal download icon
    - [ ] Audio should be displayed with a media player, not the normal download icon
  - [ ] Support for recording audio and video from the message input area using the device's microphone and/or camera

- [ ] Friends
  - [ ] The user should be able to add friends to their friends list
    - [ ] The user should be able to add friends by their account's code
    - [ ] The user should be able to add friends by their account's username
    - [ ] The user should be able to add friends by their account's email
    - [ ] The user should be able to add friends from accounts in shared networks
  - [ ] The user should be able to remove friends from their friends list

- [ ] Notifications
  - [ ] The user should be able to toggle notifications for each network
  - [ ] The user should be able to toggle notifications for each channel (optional)
  - [ ] The user should be able to toggle notifications for each account (optional)
    - If off, the user should not receive notifications from that account's messages (mute the account)
  - [ ] If the user receives a friend request, the user should be able to accept or reject the friend request
  - [ ] If the user receives a network invitation, the user should be able to accept or reject the network invitation

- [ ] Account settings
  - [ ] The MessageArea should be replaced with the account settings page.
  - [ ] The user should be able to edit their account's name
  - [ ] The user should be able to edit their account's username
  - [ ] The user should be able to edit their account's email
  - [ ] The user should be able to edit their account's image
  - [ ] The user should be able to edit their account's status
  - [ ] The user should be able to edit their account's bio

- [ ] Polls in messages
  - [ ] The user should be able to create a poll in a message
  - [ ] The poll should have a creation UI in the MessageInputArea
  - [ ] The poll should have a display UI in the MessageBubblesList
  - [ ] The poll should not be editable
  - [ ] The poll should only allow users to vote once
  - [ ] The poll should have a 'Show Results' button that displays the results of the poll for a user
    - [ ] Clicking the 'Show Results' button should display the results of the poll in a modal
    - [ ] Each option should appear with the number of votes it received and the percentage of the total votes
    - [ ] Once the 'Show Results' button is clicked, the user can't vote on the poll anymore
  - [ ] The poll should have a 'End Poll' button for the poll creator that ends the poll and displays the results (optional)

- [ ] More OAuth providers
  - [ ] Slack
  - [ ] Google

- [ ] Add a proper loading screen/effect when rendering the page for the first time

## Bugs
- [ ] Only allow N number of payloads to be attached to a message
- [ ] The selected network and channel should be distinguishable from the other networks and channels
- [ ] Should be able to send an empty message with a payload
- [ ] Payloads should be downloadable
  - Currently has a 404 error
- [ ] Accounts' statuses in the NetworkAccountsList should update in real-time to account status changes
- [x] When a new user joins a network, the old messages in the channel are displayed with said user's name, not the user's name who sent the message originally
  - Need to confirm this bug exists
- [ ] Account's status should immediately be set to online when logging in for the first time
  - This should already be handled by the database having `is_offline` set to `false` by default
  - Double-check the default for the `is_offline` column in the database
- [ ] The MessageInputArea's text input should be focused when the MessageInputArea is mounted and after a message is sent
- [ ] Changing networks
  - [ ] The selected channel (and spinoff, if applicable) should be cleared
    - They might already be, but double-check
  - [ ] The breadcrumbs' channel and spinoff should be cleared when switching networks
    - This might be an issue of the channel and spinoff not being cleared when switching networks, rather than a breadcrumb issue
  - [ ] The MessageInputArea should be cleared when switching networks
  - [ ] The MessageBubblesList should be cleared when switching networks
- [ ] The reaction menu is improperly rendered outside of the page when using the reaction feature for a message at the top of the page
  - [ ] Messages above a certain height should have the reaction menu rendered upwards of the page
  - [ ] Messages below a certain height should have the reaction menu rendered downwards of the page
- [ ] When spinning off a message that already has reactions, the reactions aren't being displayed in the spinoff's version of the message
  - If the spinoffs are still receiving their own copy of the original message to satisfy the database constraints, then we need to make sure the entire message is being copied, meta and all

## Misc.
- [ ] Keyboard shortcuts when creating a message
  - [ ] When creating a message, the user should be able to use the keyboard shortcuts to format the message
    - [ ] Bold with CMD+B
    - [ ] Italics with CMD+I
    - [ ] Underline with CMD+U

- [ ] Change the default font of the UI to something more modern
  - Anthropic's font for the Claude interface is really nice

- [ ] Toast information notifications
  - [ ] Add a toast notification when a network is switched to
  - [ ] Add a toast notification when a channel is switched to
  - [ ] Add a toast notification when a message is edited
  - [ ] Add a toast notification when a message is deleted

- [ ] Loading states
  - [ ] Add a loading state to the message bubbles area
  - [ ] Add a loading state to the message input area
  - [ ] Add a loading state to the networks list
  - [ ] Add a loading state to the channels list
  - [ ] Add a loading state to the whispers list
  - [ ] Add a loading state to the accounts list

- [ ] Transitions
  - [ ] Add a transition when transitioning between networks
  - [ ] Add a transition when transitioning between channels
    - [ ] The messages area should have a transition between the old messages and the new messages
      - For example, a simple skeleton loader could be displayed while the messages are being transitioned
      - For example, a simple spinner could be displayed while the messages are being transitioned
  - [ ] Add a transition when transitioning between channel and spinoff
  - [ ] Add a transition when a message appears in the message bubbles area

  - [ ] Animations
    - [ ] Add an animation when a message appears in the message area
    - [ ] Add an animation when a message is sent
    - [ ] Add an animation when a message is deleted
    - [ ] Add an animation when a message is edited
    - [ ] Add an animation when a channel is selected
    - [ ] Add an animation when a network is selected
    - [ ] Add an animation when a payload is uploaded
    - [ ] Add an animation when a payload is downloaded
    - [ ] Add an animation when a payload is removed from the message input area
    - [ ] Add an animation when a reaction is added to a message
    - [ ] Add an animation when a reaction is removed from a message
    - [ ] Add an animation when a reaction's count is updated
    - [ ] Add an animation when to users when someone else is typing

- [ ] Code blocks shown in the MessageBubblesList area should be runnable and show the output

- [ ] If there are more than N number of payloads attached to a message, the payloads should be hidden in a component (e.g., dropdown menu)

- [ ] Add message scrolling virtualization

- [ ] Undo/Redo
  - [ ] After deleting a message, the user should be able to undo the deletion via the toast notification (if possible)
    - [ ] Add a `deleted_at` column to the `messages` table to store the timestamp of when the message was deleted
      - If the `deleted_at` column is null, the message has not been deleted before
      - If the `deleted_at` column is not null, the message has been deleted before
  - [ ] Deleting a message should not actually delete the message from the database, but instead set the `deleted_at` column to the current timestamp
    - [ ] Add a `deleted_at` column to the `messages` table to store the timestamp of when the message was deleted
    - [ ] After deletion, update the `deleted_at` column to the current timestamp

- [ ] Message changes
  - [ ] After editing a message, the `updated_at` column should be set to the current timestamp
  - [ ] After editing a message, the message should be displayed with a edited badge or effect

- [ ] Replicas
  - [ ] Network owners should be able to add global network replicas (i.e., replicas that are automatically added to all channels in the network upon any channel creation, and automatically added to existing channels)
    - [ ] The global network replicas should be able to be turned on or off
    - [ ] The global network replicas should automatically have all network's histories as context

- [ ] Whispers
  - [ ] Should be separated from channels logic in the database
  - [ ] Should be maintained across network switches

- [ ] Accounts
  - [ ] Clicking on an account's name in the NetworkAccountsList should display the account's profile in a modal
    - [ ] The account's profile should display the account's name, username, and email
    - [ ] The account's profile should display the account's shared networks
  - [ ] The account's profile should have a button to invite the account to a network
  - [ ] The account's profile should have a button to invite the account to a channel
  - [ ] The account's profile should have a button to invite the account to a whisper
  - [ ] The account's profile should have a button to add the account as a friend

- [ ] Voice channels
  - [ ] The user should be able to create a voice channel
  - [ ] The user should be able to join a voice channel
  - [ ] The user should be able to leave a voice channel
  - [ ] The user should be able to mute
  - [ ] The user should be able to deafen

- [ ] The `Result` type should include a `context` field with the database's raw information for the result
  - [ ] The `context` field should *ONLY BE USED FOR DEVELOPMENT AND DEBUGGING*

- [ ] Developer mode 
  - [ ] A hardcoded boolean flag should be set in the code to enable/disable the developer mode
  - [ ] If developer mode is enabled, the user should be able to see the developer information in the UI (details TBD)
  - [ ] If developer mode is enabled, toasts should have a copy button to copy the JSON representation of the toast

- [ ] GIF support
- [ ] Message effects
  - For example, 'Invisible Ink', 'Slam', 'Confetti', 'Loud', 'Lasers'
  - The idea mimics Apple's iMessage effects

- [ ] Read receipts

- [ ] Profile pages for accounts
  - [ ] The profile page should have a button to invite the account to a network
  - [ ] The profile page should have a button to invite the account to a channel
  - [ ] The profile page should have a button to invite the account to a whisper
  - [ ] The profile page should have a button to add the account as a friend
  - [ ] The profile page should be customizable by the account owner
    - [ ] The account owner should be able to edit the account's name
    - [ ] The account owner should be able to edit the account's username
    - [ ] The account owner should be able to edit the account's email
    - [ ] The account owner should be able to edit the account's image
    - [ ] The account owner should be able to edit the account's status
    - [ ] The account owner should be able to edit the account's bio

- [ ] Users can select their theme
  - [ ] Changes the colors of the UI
  - [ ] Changes the radius of elements in the UI
  - [ ] Changes the font of the UI (optional)

- [ ] When the user drags something on the page, an upload payload area should be displayed


- [ ] Users should be able to pin networks in their sidebar's networks list (details TBD)
- [ ] Users should be able to pin channels in their sidebar's channels list (details TBD)
- [ ] Users should be able to pin messages (details TBD)

- [ ] Optimistic rendering of messages when sent
  - [ ] The message should be displayed in the message bubbles area before the message is actually sent
  - [ ] If the message fails to send, the message should be replaced
    - [ ] A toast notification should be displayed to the user indicating the message failed to send
    - [ ] The message should say "Message failed to send" (or something similar; details TBD)
    - [ ] The toast notification should have a button to retry the message

- [ ] Shortcut/command support
  - [ ] Users can create custom shortcuts/commands for the application
  - [ ] These commands can be called via `/<command>` in the message input area
  - [ ] UI is TBD

- [ ] Custom emotes???