# Mods Page

## Image Descriptions

### mockup.png

This image shows the table with the first row expanded. The default state of the page is to have no rows expanded.

Some changes have already been implemented in [the page](./src/pages/mods/index.tsx). If the page and this mockup differ in structure, assume the page is correct. Remaining changes are noted below.

The `More Info` button should have a different icon, and will link to the mod's individual page once that is implemented. For now, the button should be removed/hidden.

The `Submit a rating` button is in the wrong place. Mods are not rated, maps are. The button should exist for each map in the `Maps` table, in the rightmost column. For space reasons, remove the permanent label for the button and instead show a small popover on hover. The actual rating popover (the one with the stars) is mostly fine, but should have dropdowns where you select the difficulty and quality names instead of stars.