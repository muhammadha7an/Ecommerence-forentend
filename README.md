# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Newsletter subscriptions

The homepage and footer newsletter forms both post to one endpoint, `POST /api/subscribers`
(public). Subscribers are stored in the `subscribers` MongoDB collection (unique, lowercase email;
duplicates return `409`). Admins can view them at `/admin/subscribers`, which reads the
admin-protected `GET /api/admin/subscribers`; the admin dashboard shows the active total.

A confirmation email is sent with the same SMTP settings used for password resets. Set these in
`backend/.env` (never in the frontend):

```
EMAIL_USER=your-smtp-email
EMAIL_PASSWORD=your-smtp-password-or-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
EMAIL_FROM="Aura <your-smtp-email>"   # optional
```

If email is not configured or sending fails, the subscription is still saved and the API
responds with `emailSent: false`.

## UI structure

Styles are organised as a design system: `src/style/global/` (tokens, base, shared `ui-*`
primitives), `src/style/components/`, `src/style/pages/` and `src/style/dashboard/console.css`
(shared by the customer portal and admin panel). Each page imports its own stylesheet, and all
icons are inline SVGs from `src/components/Icon.jsx`, so no icon library is needed.

## Shipping, stock and checkout

- Shipping rules live in **Admin → Settings → Shipping** (free-shipping threshold, fee, method name).
  The storefront reads them from `GET /api/settings/public`; nothing is hardcoded.
- `backend/services/shippingService.js` is the single source of truth. At checkout the server
  re-reads every product from MongoDB (price, sale price, stock), recalculates subtotal + shipping and
  sends exactly those amounts to Stripe. Prices or totals sent by the browser are ignored.
- Out-of-stock products cannot be added anywhere in the UI, quantities are capped at the available
  stock, and `POST /api/create-checkout-session` rejects anything above current stock (HTTP 409 with
  the available quantity per product).
- Stock is deducted once, atomically, when the paid order is recorded. If another customer bought the
  last units while a payment was in progress, the order is still saved (the customer has paid) and is
  flagged with a stock warning for the admin.

## Emails

`backend/services/emailService.js` + `backend/templates/` send: order confirmation (customer + admin),
order status changes (only when the status really changes), welcome email on sign-up, contact form
confirmation + admin copy, and newsletter confirmation. Wording can be edited or switched off in
**Admin → Settings → Email Templates**. SMTP credentials stay in `backend/.env`.

## Image uploads

`POST /api/upload?folder=products|categories` saves images to `backend/uploads/<folder>/` and returns
`/uploads/<folder>/<file>`, which Express serves. **Vercel's filesystem is read-only**, so on Vercel set
the `CLOUDINARY_*` variables; the upload service then switches to Cloudinary automatically
(`UPLOAD_STORAGE=local|cloudinary` forces a driver). Image URLs, `/uploads/...` paths and files in the
frontend `public/` folder are all displayed correctly.

## Admin sign-in

The `.env` admin username/password keep working until the admin sets their own email/password in
**Admin → Settings → Admin Profile**. After that, sign in with the new email (or display name) and
password; the `.env` password is no longer accepted and older sessions are signed out.
