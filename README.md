# Regulated Strength Method — Landing Page

This is the landing page for the Regulated Strength Method (RSM) free 8-week beta group. It's built with Next.js (App Router), TypeScript, and Tailwind CSS v4. All page copy and the signup form live in Firestore and can be edited live on the site by an admin. People sign up through a form that posts to `/api/lead`, and the route forwards each lead to a Google Sheet through a Google Apps Script webhook.

## Project structure

```
src/
  config/content.ts        Content types and the default copy (fallback + what "Seed defaults" writes)
  config/site.ts           Logo, hero photo, and SEO (settings that stay in code)
  config/theme.ts          Font, colors, spacing, type scale, radii, hero overlay, and motion
  app/layout.tsx           Loads the font and applies the theme tokens as CSS variables
  app/globals.css          Maps theme tokens to Tailwind utilities; button, field, editor, and animation styles
  app/page.tsx             Renders the landing page inside the content provider
  app/api/lead/route.ts    Validates leads against the Firestore form schema and forwards them to the sheet
  components/SiteProvider.tsx  Live Firestore content (onSnapshot), admin session, draft, save/discard
  components/LandingPage.tsx   Hero, signup section, and footer
  components/sections.tsx      Reorderable sections: checklist, cards, steps, text, FAQ
  components/LeadForm.tsx      Public form rendered from the schema, plus the thank-you state
  components/AdminLock.tsx     The small lock button in the footer
  components/edit/             Admin-only UI: inline text editing, list controls, form builder, toolbar, login
  lib/firebase.ts          Firebase app and Firestore (from the NEXT_PUBLIC_FIREBASE_* variables)
  lib/admin.ts             Auth, save, and seed (loaded only when someone opens the admin login)
  lib/content.ts           Normalizes Firestore data against the defaults; section and field helpers
  lib/content-server.ts    Server-side read of the content for /api/lead
  lib/lead.ts              Schema-based validation shared by the form and the API route
apps-script/Code.gs        Google Apps Script for the lead sheet
```

## Local setup

You need Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in the Firebase values and GOOGLE_SHEET_WEBHOOK_URL
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

## Editing the site

The page copy, pricing, sections, signup form, thank-you message, and footer are stored in one Firestore document, `siteContent/main`. Visitors' browsers subscribe to it with `onSnapshot`, so saved changes show up for everyone right away. The page always renders the defaults from `src/config/content.ts` first, then swaps in the Firestore content once it loads. If the document is missing, empty, or unreachable, the defaults stay on screen, so the page is never blank. Missing or malformed values in the document also fall back to their defaults one by one.

### Setup

1. In the [Firebase console](https://console.firebase.google.com/), open your project and register a **Web app** if you haven't. Copy its config into the `NEXT_PUBLIC_FIREBASE_*` variables in `.env.local` (and in Vercel). These values identify the project and are public by design; they are not secrets.
2. Under **Build → Firestore Database**, create the database.
3. Under **Build → Authentication → Sign-in method**, enable **Email/Password**. Add the admin account under **Users → Add user**.
4. Recommended: under **Authentication → Settings → User actions**, turn off **Enable create (sign-up)** so nobody else can create an account.
5. Publish security rules that allow anyone to read `siteContent/main` (the public page and `/api/lead` read it without signing in) and allow writes only for admins. For example:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /siteContent/{docId} {
         allow read: if true;
         allow write: if request.auth != null
           && request.auth.token.email in ["you@example.com"];
       }
     }
   }
   ```

   The site treats any signed-in user as an editor in the UI, but only the rules decide who can save. A signed-in account the rules don't allow sees "This account doesn't have permission to edit the site" when it tries to save. No Admin SDK or service account is used anywhere.

6. Open the site, click the small lock icon next to the copyright line in the footer, and log in. The first time, click **Seed defaults** in the toolbar to write the default content to Firestore. The button only appears while the document doesn't exist, and it never overwrites an existing document.

### Edit mode

Once logged in, every piece of text on the page has a dashed outline. Click it to edit it in place; press Enter or click away to finish. Sections and lists get controls:

- Each section has a label bar with move up, move down, and delete. Use **+ Add section here** between sections to insert a checklist, benefit cards, steps, text block, or FAQ.
- List items (points, benefit cards, steps, FAQ questions, thank-you next steps) have move and delete buttons, plus an **Add** button at the end of the list.
- The signup form turns into a builder. For each field you can rename the label, choose its type (short text, email, phone, dropdown, long text), mark it required, set a placeholder, and edit dropdown options. Fields can be added, removed (at least one stays), and reordered. The submit button, the "while sending" label, the error message, the privacy note, and the thank-you message are editable too.

The floating toolbar shows whether there are unsaved changes and has **Preview** (see the page as visitors do), **Discard**, **Save**, and **Log out**. Nothing is public until you click **Save**. The browser warns you before leaving the page with unsaved changes.

Regular visitors never see any of this: the only visible sign is the faint lock icon. The editor code and Firebase Auth are only downloaded after someone clicks the lock (or when a logged-in admin comes back).

### Sheet columns

Each form field has a **Sheet column** key, such as `email` or `ageRange`. That key is what `/api/lead` sends and what the Google Sheet uses as the column header. Renaming a field's label doesn't change its column, so existing data stays lined up. A new field takes its column from its label (for example "How did you hear about us?" becomes `howDidYouHearAboutUs`) until you set one by hand. If you change a field's column key, answers go to a new column from then on; the old column stays in the sheet.

### Server-side validation

`/api/lead` reads `siteContent/main` on each submission and validates the answers against the saved form schema: required fields, email and phone formats, dropdown values limited to the configured options, and length limits. Keys not in the schema are dropped. If Firestore can't be reached, the route validates against the default form in `src/config/content.ts`.

### Other settings

The logo image, hero photo, and SEO title and description stay in `src/config/site.ts`:

- `logo`: put an image in `/public` (for example `public/logo.svg`) and set `logo.src` to `"/logo.svg"`. If `src` is empty, the page shows a circular text mark instead.
- `heroBackgroundImage`: set this to an image in `/public` (for example `"/hero.jpg"`) to put a photo behind the hero. The hero text switches to light colors over the overlay.
- `seo`: the page title and meta description.

## Google Sheet webhook

The `/api/lead` route validates each signup on the server, then POSTs a flat JSON object to `GOOGLE_SHEET_WEBHOOK_URL`: a `timestamp`, then one key per form field in form order. With the default form it looks like this:

```json
{ "timestamp": "2026-09-29T22:31:49.342Z", "name": "…", "email": "…", "phone": "…", "ageRange": "40–49", "goal": "…" }
```

The Apps Script in [`apps-script/Code.gs`](apps-script/Code.gs) reads the sheet's header row, adds a column at the end for any key it hasn't seen, and writes each value under the header that matches its key. Fields you add later get their own column automatically, and removing or reordering fields never shifts existing columns. An empty sheet gets its headers from the first signup. The script also stops answers that start with `=`, `+`, `-`, or `@` from running as formulas, and it reports errors as `{"ok": false}`, which the API route treats as a failure.

1. Create a Google Sheet. Row 1 can be empty, or you can keep existing headers such as `timestamp`, `name`, `email`, `phone`, `ageRange`, `goal`; they're matched by name.
2. In the sheet, open **Extensions → Apps Script**, replace the code with the contents of `apps-script/Code.gs`, and save. To write to a tab other than the first one, set `SHEET_NAME`.
3. Click **Deploy → New deployment**, choose **Web app**, set **Execute as** to *Me* and **Who has access** to *Anyone*, then deploy.
4. Copy the web app URL (it ends in `/exec`) and set it as `GOOGLE_SHEET_WEBHOOK_URL` in `.env.local` and in Vercel.

If you already have a deployment, paste the new code and deploy a new version (**Deploy → Manage deployments → Edit → New version**) so the same URL runs the updated script.

The webhook URL is only read on the server, so it never reaches the browser. A hidden honeypot field quietly drops simple bot submissions.

Apps Script returns HTTP 200 even when the script throws an error, or when the deployment isn't set to *Anyone* (it serves a Google sign-in page). The API route treats those HTML responses as failures, so the form shows an error instead of a false "thank you". If signups fail, check the server logs for "Lead webhook failed".

To test the webhook without the form:

```bash
curl -X POST http://localhost:3000/api/lead -H "Content-Type: application/json" \
  -d '{"fields":{"name":"Test Lead","email":"test@example.com","phone":"555 010 1234","ageRange":"40–49","goal":"Other"}}'
```

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, click **Add New → Project** and import the repository. Vercel detects Next.js automatically, so you can keep the default settings.
3. Under **Environment Variables**, add `GOOGLE_SHEET_WEBHOOK_URL` and the `NEXT_PUBLIC_FIREBASE_*` variables for Production (and for Preview too, if you want test signups there). If you use a custom domain, add it under **Firebase → Authentication → Settings → Authorized domains**.
4. Click **Deploy**. If you change an environment variable later, redeploy so the change takes effect.
5. Optional: add your own domain under **Settings → Domains**.

## Not included yet

- PT Distinction integration.
- Paid pricing or checkout. The beta is free; the price text is editable on the site.
