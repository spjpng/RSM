# Regulated Strength Method — Landing Page

This is the landing page for the Regulated Strength Method (RSM) free 8-week beta group. It's built with Next.js (App Router), TypeScript, and Tailwind CSS v4. People sign up through a form that posts to `/api/lead`, and the route forwards each lead to a Google Sheet through a Google Apps Script webhook.

## Project structure

```
src/
  config/site.ts          All copy, logo, pricing, and form options (edit this to change content)
  config/theme.ts         Font, colors, spacing, type scale, radii, hero overlay, and motion (edit this to restyle)
  app/layout.tsx          Loads the font and applies the theme tokens as CSS variables
  app/globals.css         Maps theme tokens to Tailwind utilities; button, field, and animation styles
  app/page.tsx            Landing page sections
  app/api/lead/route.ts   Validates leads and forwards them to the Google Sheet webhook
  components/LeadForm.tsx Client-side form with validation and the thank-you state
  components/Reveal.tsx   Fade-in-on-scroll wrapper (respects reduced-motion settings)
  components/Logo.tsx     Image logo or text mark, depending on the config
  lib/lead.ts             Validation shared by the form and the API route
```

## Local setup

You need Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # then set GOOGLE_SHEET_WEBHOOK_URL
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build` (production build), `npm start` (serve the build), and `npm run typecheck`.

## Changing the design

`src/config/theme.ts` holds all design tokens:

- `fontSans`: Poppins from Google Fonts, loaded with `next/font` in weights 400 (body), 600, and 700 (headings and buttons). To use another font, swap the import and keep the `--font-poppins` variable name, or update it in `globals.css`.
- `colors`: a three-color palette (cream, ink, moss) plus tints of those colors. Every text/background pair meets WCAG AA contrast (4.5:1 or better), so re-check contrast if you change a color.
- `spacing`: page gutter, section padding, and max widths. These become `px-gutter`, `py-section`, `max-w-page`, and `max-w-prose`.
- `type`: the headline and section-heading sizes and letter spacing (`text-display`, `text-h2`).
- `radius`, `motion`: card and field rounding, plus the fade-in duration, distance, and easing.
- `heroOverlay`: the gradient drawn over the hero photo. For a very bright photo, raise the alpha values.

## Changing the content

Everything in the copy lives in `src/config/site.ts`:

- `logo`: put an image in `/public` (for example `public/logo.svg`) and set `logo.src` to `"/logo.svg"`. If `src` is empty, the page shows a circular text mark instead.
- `hero.backgroundImage`: set this to an image in `/public` (for example `"/hero.jpg"`) to put a photo behind the hero. The hero text switches to light colors over the overlay.
- `pricing`: the beta label, price, and note.
- `hero`, `whoItsFor`, `includes`, `howItWorks`, `commitment`, `form`, `thankYou`, `footer`: all the page copy.
- `form.ageRanges` and `form.goals`: the dropdown options. The server accepts only these values.
- `seo`: the page title and meta description.

## Google Sheet webhook

1. Create a Google Sheet and add these headers to row 1: `submittedAt`, `name`, `email`, `phone`, `ageRange`, `goal`, `source`.
2. In the sheet, open **Extensions → Apps Script** and paste in this code:

   ```js
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     const data = JSON.parse(e.postData.contents);
     sheet.appendRow([
       data.submittedAt, data.name, data.email, data.phone,
       data.ageRange, data.goal, data.source,
     ]);
     return ContentService
       .createTextOutput(JSON.stringify({ ok: true }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Click **Deploy → New deployment**, choose **Web app**, set **Execute as** to *Me* and **Who has access** to *Anyone*, then deploy.
4. Copy the web app URL (it ends in `/exec`) and set it as `GOOGLE_SHEET_WEBHOOK_URL`.

If you edit the script later, deploy a new version (**Deploy → Manage deployments → Edit → New version**) so the same URL runs the updated code.

The webhook URL is used only on the server, so it never reaches the browser. The form also includes a hidden honeypot field that quietly drops simple bot submissions.

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, click **Add New → Project** and import the repository. Vercel detects Next.js automatically, so you can keep the default settings.
3. Under **Environment Variables**, add `GOOGLE_SHEET_WEBHOOK_URL` for Production (and for Preview too, if you want test signups there).
4. Click **Deploy**. If you change the environment variable later, redeploy so the change takes effect.
5. Optional: add your own domain under **Settings → Domains**.

## Not included yet

- PT Distinction integration.
- Paid pricing or checkout. The beta is free, and pricing lives in the config for later.
