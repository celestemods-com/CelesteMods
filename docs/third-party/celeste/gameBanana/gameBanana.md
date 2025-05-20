# GameBanana

## Documentation

### GameBanana Website

#### Description
- The website used to host Celeste mod files and various other modding community assets.
- Mostly the mods themselves (zip files), images, and text (comments, titles, descriptions, etc).
- GameBanana hosts assets for the modding communities of many video games.

#### Link
- The portion of the site dedicated to Celeste can be found here: https://gamebanana.com/games/6460

### GameBanana API

#### Description
- GameBanana offers access to their database through multiple APIs accessible through various URL and/or subdomain schemes.
- The CelesteMods project uses this API to fetch various data and avoid hosting it as part of the website.

#### Link
- https://api.gamebanana.com/

## Definitions

### GameBanana
- The website that the Celeste modding community uses to host Celeste mods.

### GameBanana Mirrors
- "A" GameBanana Mirror is any data repository that monitors and duplicates the contents of "the" GameBanana Mirror or of GameBanana itself.
- "The" GameBanana Mirror:
  - Its URL is somewhere in this git repository.
  - Hosted by Jade/0x0ade.
  - The original GameBanana mirror.
  - Contents are managed by Maddie (who hosts [a lot of Celeste modding infrastructure and other stuff](https://maddie480.ovh/))
    - Managed by [this service](https://github.com/maddie480/EverestUpdateCheckerServer) that Maddie hosts.
    - Various indices provided.
      - These are the most important for this project.
      - Indices update automatically on timescales of less than 1 hour but more than 5 minutes.
      - https://maddie480.ovh/celeste/everest_update.yaml
      - https://maddie480.ovh/celeste/mod_search_database.yaml
- WEGFan Mirror:
  - Hosted by WEGFan.
  - https://celeste.weg.fan/
  - Works better (at all?) in mainland China.
- The CML GameBanana Mirror:
  - A GameBanana mirror hosted by @otobot1 as part of the CML project.
  - Hosted on CloudFlare's R2 storage through the CloudFlare CDN.
    - It's cheap.
    - It's fast (there are endpoints all over the world).
    - It has no per-byte data egress fees.
  - The code used to host it is present in this git repository and another hosted in the same GitHub organization as this repository.
  - It mostly piggy-backs off of Maddie's Everest Update Checker service.