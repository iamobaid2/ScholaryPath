# ScholaryPath

Next.js (App Router) site: instant quote calculator, booking with file upload, client accounts + order tracking, Stripe payments, admin dashboard. Everything runs inside Next.js (API routes) with Firebase (Auth, Firestore, Storage).

## Run it

```bash
cp .env.example .env.local   # then fill in the keys
npm install
npm run dev
```

The site works without any keys (quote calculator, discount popup, WhatsApp/email order buttons). Accounts, orders, payments and admin light up as you add keys.

## Setup checklist

1. **Firebase**: create a project → enable **Authentication → Email/Password**, **Firestore**, **Storage**. Add a Web app and copy its config into `NEXT_PUBLIC_FIREBASE_*`. Under *Service accounts* generate a private key and fill `FIREBASE_*`.
2. Deploy the rules: `firebase deploy --only firestore:rules,storage` (files: `firestore.rules`, `storage.rules`).
3. **Admin**: put your email in `ADMIN_EMAILS`, register with it on the site, then open `/admin`.
4. **Email**: fill `SMTP_*` (Gmail: `smtp.gmail.com`, port 587, an App Password). Without SMTP, emails are logged to the server console.
5. **Stripe**: set `STRIPE_SECRET_KEY`. For the webhook, run `stripe listen --forward-to localhost:3000/api/stripe/webhook` locally (or add `https://YOUR_DOMAIN/api/stripe/webhook` for `checkout.session.completed`) and set `STRIPE_WEBHOOK_SECRET`.

## Editing prices

- Defaults: `lib/pricing-defaults.ts` (all in GBP; exchange rates at the top).
- Live: `/admin → Pricing` saves overrides to Firestore (`config/pricing`) and applies immediately.
- Labels, services, courses and add-on names: `lib/catalog.ts`. FAQ and testimonials: `lib/content.ts`.

The server recalculates every price when an order is placed, so the browser can't change what's charged.
