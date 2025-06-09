# Directories

# Files

## route.ts
- Contains API route handlers for mirroring GameBanana data.

### GameBanana Mirror API

Provides endpoints for fetching mod data from GameBanana.

Tags: api, gamebanana, mirror

#### Fetch Mod Data
Retrieves mod data from GameBanana and serves it through CelesteMods API.

  Tags: fetch, mod-data

- Client makes a GET request to the GameBanana mirror API
- API validates the request parameters
- API fetches the requested data from GameBanana
- API processes and formats the data
- API returns the formatted data to the client
