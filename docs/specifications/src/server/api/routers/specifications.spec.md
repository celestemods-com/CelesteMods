# Directories

## map_mod_publisher
- Router implementations related to maps, mods, and publishers.

## review_reviewCollection_mapReview
- Router implementations related to reviews and review collections.

## tech_techVideo
- Router implementations related to technical aspects and videos.

# Files

## difficulty.ts
- tRPC router for difficulty-related endpoints.

## length.ts
- tRPC router for length-related endpoints and calculations.

## quality.ts
- tRPC router for quality assessment and ratings.

## rating.ts
- tRPC router for user ratings and score calculations.

## user.ts
- tRPC router for user-related operations and queries.

# Common Specifications

## Router Implementation

Defines the structure and behavior of tRPC routers.

Tags: trpc, routers, api

- Routers define procedural endpoints for specific domains
- Each procedure includes input validation with Zod
- Procedures are organized by their domain and functionality
- Authentication and authorization are handled at the router level

#### Procedure Structure
Describes the common structure of tRPC procedures.

  Tags: procedures, structure

- Procedures define their input schema using Zod
- Procedures include appropriate authentication checks
- Business logic is implemented within the procedure resolver
- Error handling follows a consistent pattern
- Responses are properly typed
