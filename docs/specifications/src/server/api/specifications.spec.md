# Directories

## routers
- Contains tRPC router definitions for different domains.

## utils
- Utility functions specific to the API implementation.

# Files

## openapi.ts
- Configuration for generating OpenAPI specifications from tRPC routers.

## root.ts
- Root tRPC router that merges all subrouters.

## trpc.ts
- Core tRPC setup and configuration.

# Common Specifications

## tRPC API Architecture

Defines the structure and behavior of the tRPC API implementation.

Tags: trpc, api, typescript

- Uses tRPC for end-to-end typesafe APIs
- Implements a router-based structure for API organization
- Includes proper input validation using Zod
- Provides error handling and error responses

#### Router Organization
Describes how API routes are organized.

  Tags: routers, organization

- API routes are grouped by domain in separate routers
- Routers are merged into a root router
- Each procedure has a specific input validator
- Procedures follow naming conventions based on their action

#### API Procedure Execution
Describes the flow of executing an API procedure.

  Tags: procedure, execution-flow

- Request is received by the tRPC handler
- Input is validated using Zod schemas
- Middleware (like authentication) is applied
- Business logic is executed
- Response is properly typed and returned to the client
