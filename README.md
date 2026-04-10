# Reis naar Frankrijk

SvelteKit-app voor reisplanning, gedeelde lijsten, budget en wildlife-tracking.

## Setup

1. Installeer dependencies:

```sh
npm install
```

2. Maak een `.env` op basis van `.env.example`.

3. Start de app:

```sh
npm run dev
```

## Scripts

- `npm run dev` - development server
- `npm run build` - productiebuild
- `npm run preview` - preview van productiebuild
- `npm run check` - Svelte/TS checks
- `npm run test` - unit tests (Vitest)
- `npm run test:watch` - unit tests in watch mode

## Environment Variables

- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`

## Production Readiness

Before deploying to Vercel, ensure the following are configured:

1. **Environment Variables**: Set all `PUBLIC_FIREBASE_*` variables in Vercel for predictable production behavior. The app currently has a fallback Firebase config in `src/lib/firebase.ts`, but that fallback should not be relied on for production deployments.
2. **Firestore Rules**: Deploy the rules in `firestore.rules` to your Firebase project to ensure data integrity and security.
3. **PWA**: Ensure the `static/manifest.json` and `src/service-worker.js` are correctly configured for your production domain.

## Security

Firebase Security Rules are located in `firestore.rules`. Since the app currently uses a local identity system (Dennis/Franzi), rules are scoped to the specific collections used by the app.

## Repository Structure

- `src/`: Core SvelteKit source code.
- `static/`: Static assets and PWA manifest.
- `scripts/`: Development and maintenance scripts.
  - `archive/`: Contains legacy migration and patch scripts used during earlier development phases. These are kept for reference but are not part of the active runtime.
- `firestore.rules`: Security rules for Firestore.
