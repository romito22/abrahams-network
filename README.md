# Abraham’s Network

A mobile-first, read-only personal link page with blue styling, personal and business profiles, contact cards, QR codes, and sharing.

Live: https://romito22.github.io/abrahams-network/

## Update the website

Changes are made in this repository with Abraham's assistant. Edit `src/profiles.json` for profile names, businesses, descriptions, photos and links; commit and push to `main`. GitHub Actions tests, builds and publishes the update to Pages.

There is no browser editor, login, draft storage, cloud database, or public write endpoint. Query parameters such as `?edit=1` do not enable editing. Only GitHub accounts with repository write permissions can publish changes. Visitors can view links, download contacts, and share the page.

## Local development

```sh
npm ci
npm run dev
npm test
npm run build
```

Stable `?p=ID` URLs select personal or business profiles and can be stored on an NFC card. “Save contact” downloads a `.vcf` file to import into an address book. It does not save contacts automatically. “My links” contains the clickable destinations.
