# Atlantic-Chestnut Building 3 — Installation Progress Monitor

Cloud-synced storefront installation tracker for Atlantic-Chestnut Building 3
(Monadnock). Same interface, style, and features as the Cooper Park 2 tracker,
adapted to AC3's scope (17 storefronts, SF01-SF17).

## Scope baseline
Seeded from AC3_Glass_Takeoff.xlsx (A-330.00 Storefront Elevations):
17 storefronts, 74 vision lites + 9 doors, ~3,722 sf of glass.
All units start as pending. Louvers: SF01-SF14 = yes, SF15-SF17 = window (no).

## Run locally
Open index.html. With the placeholder firebase-config.js it runs in LOCAL mode:
a setup banner shows, data is saved in your browser, Export/Import works.

## Enable cloud sync (multi-user, same as CP2)
1. Create a NEW Firebase project (do not reuse the CP2 project).
2. Enable Realtime Database and Authentication -> Email/Password.
3. Console -> Project settings -> Web app: copy config into firebase-config.js.
4. Apply firebase-database-rules.json to the Realtime Database.
5. Create user logins under Authentication -> Users (only those emails can edit).
6. Deploy the folder to Vercel (see SETUP.md) or any static host.

## Floor plan
gf-plan.png is a placeholder. Replace it with the real AC3 ground-floor plan
(same filename), then use Place mode on the Plan section to drop SF markers.

## Auxiliary pages
warehouse.html and friday-triage.html are carried over from CP2 for parity;
they use the same Firebase project and will need their own AC3 data setup.
