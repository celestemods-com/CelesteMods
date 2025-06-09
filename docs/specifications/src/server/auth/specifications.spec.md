# Directories

# Files

## auth.ts
- Core authentication configuration and setup.

## discordProviderConfig.ts
- Configuration for Discord OAuth authentication provider.

## prismaAdapter.ts
- Adapter for using Prisma with the authentication system.

# Common Specifications

## Authentication System

Defines how user authentication is implemented in the application.

Tags: authentication, oauth, security

- Uses NextAuth.js for authentication management
- Implements Discord OAuth as the primary authentication provider
- Stores user information in the database using Prisma
- Manages authentication sessions securely

#### Login Flow
Describes the user login process.

  Tags: login, oauth-flow

- User initiates login through the UI
- User is redirected to Discord for authentication
- User authorizes the application on Discord
- User is redirected back with authentication token
- Application verifies the token and creates a session
- User is now authenticated in the application

#### Session Management
Describes how user sessions are managed.

  Tags: sessions, security

- Sessions are stored securely using encrypted cookies
- Session validity is checked on each request to protected routes
- Sessions expire after a configured time period
- Sessions can be manually invalidated by the user (logout)
