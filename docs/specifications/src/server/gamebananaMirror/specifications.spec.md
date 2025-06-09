# Directories

## arrayBufferProcessing
- Utilities for processing array buffers from GameBanana API responses.

## authentication
- Authentication mechanisms for the GameBanana API.

## cloudflareApi
- Integration with Cloudflare API for the GameBanana mirror.

## yamlHandlers
- Utilities for processing YAML data from GameBanana.

# Files

## updateWebhook.ts
- Handler for GameBanana update webhooks.

# Common Specifications

## GameBanana Mirror System

Defines how the GameBanana mirror functionality works.

Tags: gamebanana, mirror, api-integration

- Mirrors mod data from GameBanana to reduce API dependencies
- Caches responses for improved performance
- Processes different data formats from GameBanana
- Maintains data integrity and synchronization

#### Data Mirroring Flow
Describes how data is mirrored from GameBanana.

  Tags: mirroring, data-sync

- Application receives a request for GameBanana data
- Checks if data exists in local cache
- If data is cached and fresh, returns cached data
- If data is missing or stale, fetches from GameBanana API
- Processes and transforms the fetched data
- Stores the processed data in the cache
- Returns the data to the client

#### Webhook Processing
Describes how update webhooks from GameBanana are processed.

  Tags: webhooks, updates

- GameBanana sends a webhook notification for updated content
- Application validates the webhook authenticity
- Application processes the updated data
- Cache is updated with the new information
- Any dependant systems are notified of the update
