# Prisma ORM

## Documentation

### Prisma ORM Documentation

#### Description
- Official documentation for Prisma ORM, the Object Relational Mapping library used in this project to interact with our SQL database.

#### Link
- https://www.prisma.io/docs/orm


### Prisma Schema Reference

#### Description
- Reference documentation for the Prisma schema file format.

#### Link
- https://www.prisma.io/docs/orm/reference/prisma-schema-reference


## Definitions

### Prisma ORM
- Prisma ORM (Prisma for short) is an Object-Relational-Mapping (ORM) library.
  - We use it to interact with our MariaDB database, both in the Nextjs application and for data migrations.
- We don't use Prisma Studio.

### Prisma Schema
- Our Prisma schema file is the primary source of truth for our database schema.
  - Both the Prisma client and the MariaDB database schema are defined in the Prisma schema.
  - We use Prisma Migrate to push schema updates from the Prisma schema to the MariaDB database.
- Our Prisma schema: `prisma/schema.prisma`

### Prisma Client
- A binary that is programatically generated based on our Prisma Schema and provides a JavaScript/TypeScript API to our Nextjs application.
  - The Prisma client binary is what actually talks to the MariaDB database.
  - The Prisma client also generates and exports type definitions.
    - Generated Prisma client types: `node_modules\.prisma\client\index.d.ts`
- Don't write SQL - use the Prisma client's API instead.