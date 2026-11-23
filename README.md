# AMAZ Diagnostic — Diagnostic Center Management

Powered by **AMAZ ERP Solution**

## Files in this folder

| File | What it is |
|---|---|
| `index.html` | The software itself (one file) |
| `version.json` | Current version — the software reads this to show "New version available" |
| `manifest.webmanifest`, `sw.js`, `app-icon-*.png` | Install as an app on mobile / desktop and work offline |

## Put it on GitHub Pages (one time)

1. Sign in to github.com → **New repository** → name: `amaz-diagnostic` → **Public** → Create.
2. **Add file → Upload files** → drag *all* files of this folder → **Commit changes**.
3. **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main` / `(root)` → **Save**.
4. After 1–2 minutes the software opens at
   `https://faridasbd2016-eng.github.io/Diagnostic-Center/`
5. Open `version.json` on GitHub (✏ edit) and replace `YOUR-USERNAME` with your GitHub user name.

## Releasing an update

1. Upload the new `index.html` (replace the old one).
2. Edit `version.json` → set `"version"` to the new number (for example `1.3.6`) and write short `"notes"`.
3. Every computer shows **"New version v1.3.6 is available"**:
   * opened from the GitHub link → **Update now** loads it at once;
   * opened as a file on the PC → **Download** opens the link in `"url"`.

For clients who open the file from their PC, put this address in
**Settings → Software Update**:
`https://faridasbd2016-eng.github.io/Diagnostic-Center/version.json`

## Cloud Sync

Backup and Cloud page → **Cloud server**:

* **Google Apps Script + Google Sheet** — free; copy the Apps Script code from the page.
* **Supabase** — PostgreSQL database; copy the SQL from the page, run it once in Supabase → SQL Editor, then enter the Project URL, the anon / publishable key and your Secret Key.

Never put the Supabase **service_role / secret** key in the software.

## Online report portal

Settings → Online Report Portal → portal page link =
`https://faridasbd2016-eng.github.io/Diagnostic-Center/index.html`
The QR code on each receipt then opens the patient's report from this link.

---
© AMAZ ERP Solution. The license generator is **never** uploaded here.
