# Directories

## api
- Contains tRPC API routes and configurations.

## auth
- Contains authentication configuration and utilities.

## gamebananaMirror
- Contains functionality for mirroring GameBanana data.

# Files

## prisma.ts
- Configures and exports the Prisma ORM client for database operations.

### Database Client

Configures and exports the Prisma ORM client for database operations.

Tags: database, prisma, orm

- Initializes the Prisma client for database access
- Implements connection pooling and optimization
- Provides a singleton instance to avoid multiple connections
- Handles logging and error reporting for database operations

#### Client Initialization
Describes how the Prisma client is initialized.

  Tags: initialization, connection

- Prisma client is created as a singleton
- Environment variables are used for configuration
- Connection options are optimized for the deployment environment
- Client is made available for import throughout the application

#### Database Operations
Describes the pattern for database operations.

  Tags: crud, queries

- CRUD operations are performed through the Prisma client
- Transactions are used for operations that need atomicity
- Queries are optimized using Prisma's features
- Results are properly typed using Prisma's generated types

# Common Specifications

## Server Architecture

Defines the server-side architecture of the application.

Tags: architecture, server, backend

- Server components follow a modular structure
- Database access is handled through Prisma ORM
- Authentication is implemented securely
- API endpoints follow RESTful principles
- External integrations are properly abstracted

#### Data Access
Describes how server components access and manipulate data.

  Tags: data, database, prisma

- Database operations use the Prisma client
- Queries are optimized for performance
- Transactions are used when appropriate
- Data validation happens before database operations

#### Authentication Flow
Describes how user authentication works.

  Tags: auth, security

- User credentials are validated securely
- Authentication tokens are generated and validated
- Session management follows security best practices
- Protected routes check for valid authentication