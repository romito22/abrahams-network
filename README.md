# Abraham’s Network

A mobile-first personal link page with blue styling, personal and business profiles, reorderable links, contact cards, QR codes, and sharing.

## Run locally

```sh
npm ci
npm run dev
npm test
npm run build
```

## Profiles and publishing

The public site reads `src/profiles.json`. Visitors see the same published profiles on every device. The default Personal profile includes links already listed in Abraham's portfolio.

Use the settings button to open the draft editor. Rename tabs, add businesses, upload photos, and add, hide, or reorder links. Draft edits stay on that browser and **do not change the public website**. Export profiles, replace `src/profiles.json` in this repository with the exported file, and commit to `main`. GitHub Actions rebuilds and publishes the site automatically. Review exported information before committing: the repository and page are public.

The editor is a local drafting tool, not an authenticated admin panel. Opening `?edit=1` does not grant permission to modify the public repository. Published profile links use stable `?p=ID` values; renaming a tab does not change its NFC destination.

“Save contact” downloads a `.vcf` file to import into a phone's address book. It does not save a contact automatically. “My links” contains the clickable destinations. The NFC card should store the public profile URL; writing the physical card requires an NFC-writing app.

## Optional cloud editing

To publish directly from the editor, configure Firebase Google Authentication and Firestore using `.env.example`, set the owner UID, and deploy `firestore.rules`. Configure the same build environment variables in the hosting workflow before using cloud mode. Without those variables the static GitHub Pages workflow above is used. Authentication and cloud publication have not been tested against a live Firebase project.

## Deployment

GitHub Pages is built by `.github/workflows/pages.yml`. Vite uses relative asset paths, so project URLs work without root-path errors.
