# Axiom Pathways — site + application form

Astro site. Green/white boxed design. Two boxes: **Home** + **Application** (3-step wizard).
Form submits straight into a Google Sheet via a Google Apps Script web app — no server, no Zapier, free.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

---

# Connect the form to Google Sheets

The website POSTs each application to a Google Apps Script **web app** URL.
That script appends one row per applicant to your sheet. Do this once.

## Step 1 — Open the script editor

1. Open your Google Sheet (the intern tracker).
2. Top menu: **Extensions → Apps Script**.

## Step 2 — Paste the webhook code

1. In Apps Script, delete any starter `function myFunction() {}`.
2. Open **`APPS_SCRIPT_WEBHOOK.gs`** from this repo, copy the **entire file**.
3. Paste it into the editor.
4. Click the **Save** icon.

What the code does:
- `doPost(e)` — receives a form submission, appends a row.
- Auto-creates a tab called **`Applications`** with a header row the first time.
- Sets each new applicant's **Status** to `Applied`.
- `doGet()` — lets you open the URL in a browser to confirm it's live.

Columns written (in order):

```
Timestamp | Name | Email | Phone | School | Grade/Year | Track |
Interest | City/Chapter | Status | Letter | Instagram | LinkedIn |
GitHub | Other Link
```

## Step 2.5 — Paste your Sheet ID (IMPORTANT)

The script writes by **Sheet ID**, not "active sheet" (more reliable — works
even if the script isn't bound to the sheet).

1. Open your **Axiom Interns** sheet.
2. Copy the ID from the URL — the long part between `/d/` and `/edit`:
   `https://docs.google.com/spreadsheets/d/`**`THIS_IS_THE_ID`**`/edit`
3. In the script, paste it here:
   ```js
   var SHEET_ID = "THIS_IS_THE_ID";
   ```
4. Save.

> If submissions previously errored with "unable to open the file," this is why
> — the old script tried `getActiveSpreadsheet()` on a sheet it couldn't open.

## Step 3 — Deploy as a web app

1. Top right: **Deploy → New deployment**.
2. Click the gear → choose **Web app**.
3. Settings:
   - **Description:** `axiom apply webhook` (anything)
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**  ← required so the website can reach it
4. Click **Deploy**.
5. **Authorize access** → pick your Google account → *Advanced* → *Go to project (unsafe)* → **Allow**.
   (It's your own script editing your own sheet — safe.)
6. Copy the **Web app URL**. It ends in **`/exec`**.

> Quick test: paste that `/exec` URL in a browser. You should see
> `{"ok":true,"service":"axiom-pathways-webhook"}`.

## Step 4 — Paste the URL into the website

1. Open **`src/pages/index.astro`**.
2. Find this line (near the bottom, in the `<script>`):

   ```js
   const WEBHOOK_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```

3. Replace the placeholder with your `/exec` URL:

   ```js
   const WEBHOOK_URL = "https://script.google.com/macros/s/AKfy.../exec";
   ```

4. Save. Restart dev (`npm run dev`) or rebuild (`npm run build`) and redeploy.

## Step 5 — Test the full flow

1. Open the site, fill the form, submit.
2. Check the **Applications** tab in your sheet — a new row appears with Status `Applied`.

---

## Editing the script later

If you change `APPS_SCRIPT_WEBHOOK.gs` after deploying:

**Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy.**

Same URL stays valid — no need to update the website.

## Notes / gotchas

- **"Who has access" must be "Anyone."** If set to "Only myself," submissions silently fail.
- The website uses `fetch(..., { mode: "no-cors" })`. The browser can't read the response, so the
  site always shows success after sending. Real confirmation = a new row in the sheet.
  (no-cors is needed because Apps Script doesn't send CORS headers.)
- Add/rename a field? Update **both**: the `HEADERS` + `appendRow` list in the `.gs` file
  **and** the matching input `name="..."` in `index.astro`.
- Data lands in the **`Applications`** tab. Add dropdowns / colors there if you want filtering.
