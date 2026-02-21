# natalieandjordi.com

Static wedding website for Natalie & Jordi, October 17, 2026. Deployed on GitHub Pages with a custom domain.

## Structure

```
index.html   — the entire site (HTML, CSS, JS, all inline)
CNAME        — custom domain config for GitHub Pages
```

No build tools, no frameworks, no dependencies beyond Google Fonts (loaded from CDN).

---

## Design

- **Fonts:** Cormorant Garamond (serif headings, italic) + Josefin Sans (body/UI)
- **Palette:**
  - `--navy: #1a2642`
  - `--cream: #f5f2eb`
  - `--cream-dark: #e8e4d9`
  - `--terracotta: #c45d3a`
- **Aesthetic:** Folk art / block print, hand-drawn SVG decorations

To change colors, update the CSS variables at the top of the `<style>` block in `index.html`.

---

## Deployment

The site is hosted on **GitHub Pages** from the `main` branch. Pushes to `main` deploy automatically.

The `CNAME` file tells GitHub Pages to serve the site at `natalieandjordi.com`. The DNS records on the domain registrar point to GitHub's servers.

To use your own domain, replace the contents of `CNAME` with your domain, then configure your DNS accordingly (GitHub's docs cover this well).

---

## RSVP — Google Sheets Integration

Form submissions are sent directly from the browser to a **Google Apps Script Web App**, which writes each RSVP to a Google Sheet and sends a notification email to both partners. There's no server involved.

### How it works

1. Guest fills out the form and clicks Submit.
2. The browser POSTs JSON to the Apps Script URL using `fetch()` with `mode: 'no-cors'`.
3. The Apps Script receives the data, appends a row to a Google Sheet, and sends an email.
4. The form swaps to a success message. (Because of `no-cors`, the browser can't read the response — the success state is shown unconditionally after the fetch completes.)

### Setting it up yourself

**Step 1 — Create a Google Sheet**

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. In the first row, add these headers (order matters):
   ```
   Timestamp | Name | Email | Attending | Guests | Guest Name | Dietary | Note
   ```

**Step 2 — Add the Apps Script**

1. In your sheet, open **Extensions → Apps Script**.
2. Replace all existing code with the script below.
3. Update `SHEET_NAME`, `TO_EMAIL_1`, and `TO_EMAIL_2` at the top.

```javascript
const SHEET_NAME = 'Sheet1';       // tab name in your spreadsheet
const TO_EMAIL_1 = 'partner1@example.com';
const TO_EMAIL_2 = 'partner2@example.com';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  sheet.appendRow([
    new Date(),
    data.name,
    data.email,
    data.attending,
    data.guests,
    data.guestName,
    data.dietary,
    data.note,
  ]);

  const attending = data.attending === 'yes' ? 'Joyfully Accepts' : 'Regretfully Declines';
  const subject = `RSVP from ${data.name}`;
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Attending: ${attending}`,
    `Party size: ${data.guests || '1'}`,
    data.guestName ? `Guest: ${data.guestName}` : '',
    data.dietary ? `Dietary: ${data.dietary}` : '',
    data.note ? `Note: ${data.note}` : '',
  ].filter(Boolean).join('\n');

  MailApp.sendEmail(TO_EMAIL_1, subject, body);
  MailApp.sendEmail(TO_EMAIL_2, subject, body);

  return ContentService.createTextOutput('ok');
}
```

**Step 3 — Deploy as a Web App**

1. Click **Deploy → New deployment**.
2. Set type to **Web app**.
3. Set **Execute as** to your Google account.
4. Set **Who has access** to **Anyone**.
5. Click **Deploy** and copy the Web App URL (looks like `https://script.google.com/macros/s/.../exec`).

> Every time you change the Apps Script code, you must create a **new deployment** — editing the script alone does not update the live URL's behavior.

**Step 4 — Add the URL to the site**

In `index.html`, find this line near the bottom of the `<script>` block:

```js
const APPS_SCRIPT_URL = '...';
```

Replace the value with your new Web App URL.

### Notes

- The Apps Script URL is a public endpoint — it accepts POST requests from anyone. This is intentional and how the browser-only setup works. It's not a secret credential, but be aware that it could receive spam submissions. Google's rate limits offer some protection.
- If a submission fails silently, it will still appear as a success to the guest. The email notification acts as a backup to catch any gaps in the sheet.

---

## Customizing content

All site content lives in `index.html`:

| Section | What to edit |
|---|---|
| Names & date | `<h1>` tags and `.date` paragraph in the hero |
| Venue details | The `event-card` divs in `#details` |
| Attire | Second `event-card` in `#details` |
| Our Story | Paragraphs inside `.story-content` |
| Travel & hotels | The `travel-card` divs in `#travel` |
| RSVP deadline | Paragraph below `<h2>RSVP</h2>` |
| Footer | Text inside `<footer>` |
