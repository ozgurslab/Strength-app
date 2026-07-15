# Ozgur Strength Dashboard

This package is ready for GitHub Pages.

## Upload
Upload every file in this folder to the root of the GitHub repository:
- index.html
- styles.css
- data.js
- app.js
- manifest.json
- icon PNG files

Then enable GitHub Pages from the repository's main branch and root folder.

## iPhone installation
Open the published GitHub Pages URL in Safari, tap Share, then Add to Home Screen.
Remove any older home-screen shortcut first so iOS refreshes the icon.

---

# Strength Dashboard v2

A static GitHub Pages application. No framework, build process, server, or Claude-specific storage is required.

## Publish on GitHub Pages

1. Upload all four application files to the root of your repository:
   - `index.html`
   - `styles.css`
   - `data.js`
   - `app.js`
2. In GitHub, open **Settings → Pages**.
3. Select **Deploy from a branch**, then choose `main` and `/ (root)`.
4. Open the Pages URL once deployment completes.

## Change source recommendations with Claude

Ask Claude to edit only `recommendedKg` values inside `data.js`. Example:

> In data.js, increase all cable back exercise recommendedKg values by 5 kg. Do not change app.js or exercise IDs.

The dashboard also allows browser-specific recommendation changes from the Recommended Weights tab. These are stored in `localStorage` and override source values on that device.

## Storage

- Workout history: browser `localStorage`
- Personal recommendation overrides: browser `localStorage`
- Use **History → Export backup** before clearing browser data or moving devices.
