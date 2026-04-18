# joyfuljuices

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Start, Hono, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **React Native** - Build mobile apps using React
- **Expo** - Tools for React Native development
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Hono** - Lightweight, performant server framework
- **workers** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **SQLite/Turso** - Database engine
- **Authentication** - Better-Auth
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses SQLite with Drizzle ORM.

1. Start the local SQLite database (optional):
   D1 local development and migrations are handled automatically by Alchemy during dev and deploy.

2. Update your `.env` file in the `apps/server` directory with the appropriate connection details if needed.

3. Apply the schema to your database:

```bash
bun run db:push
```

To generate SQL migrations for Cloudflare D1, run:

```bash
bun run db:generate
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Use the Expo Go app to run the mobile application.
The API is running at [http://localhost:3000](http://localhost:3000).

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@joyfuljuices/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Deployment (Cloudflare via Alchemy)

- Dev: bun run dev
- Deploy: bun run deploy
- Destroy: bun run destroy

This repo uses [Alchemy](https://alchemy.run/) to define Cloudflare resources in [packages/infra/alchemy.run.ts](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/packages/infra/alchemy.run.ts) instead of a hand-written `wrangler.toml`.

The Worker bindings in `alchemy.run.ts` are the effective `wrangler.toml` equivalent:

- `DB`: Cloudflare D1 binding for Drizzle + Better Auth + order data
- `CORS_ORIGIN`: allowed web origin for Hono CORS
- `BETTER_AUTH_SECRET`: Better Auth secret
- `BETTER_AUTH_URL`: Better Auth base URL
- `STRIPE_SECRET_KEY`: Stripe secret key for checkout session creation
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signature secret
- `STRIPE_SUCCESS_URL`: web success redirect after Stripe Checkout
- `STRIPE_CANCEL_URL`: web cancel redirect after Stripe Checkout

Use [apps/server/.env.example](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/apps/server/.env.example) as the local server env template.

For more details, see the guide on [Deploying to Cloudflare with Alchemy](https://www.better-t-stack.dev/docs/guides/cloudflare-alchemy).

## Git Hooks and Formatting

- Format and lint fix: `bun run check`

## Project Structure

```
joyfuljuices/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Start)
│   ├── native/      # Mobile application (React Native, Expo)
│   └── server/      # Backend API (Hono)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── auth/        # Authentication configuration & logic
│   ├── db/          # Database schema, seed data, and migrations
│   └── infra/       # Cloudflare Workers + D1 infrastructure via Alchemy
```

### Backend layout

- [apps/server/src/index.ts](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/apps/server/src/index.ts): Hono app, `/api` routing, auth middleware, Stripe webhook mount
- [apps/server/src/routes/products.ts](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/apps/server/src/routes/products.ts): product CRUD + admin seed endpoint
- [apps/server/src/routes/checkout.ts](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/apps/server/src/routes/checkout.ts): authenticated Stripe Checkout session creation + D1 checkout snapshot
- [apps/server/src/routes/orders.ts](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/apps/server/src/routes/orders.ts): customer order history + admin status updates
- [apps/server/src/routes/webhook.ts](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/apps/server/src/routes/webhook.ts): Stripe webhook handler for `checkout.session.completed`
- [packages/auth/src/index.ts](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/packages/auth/src/index.ts): Better Auth config with `customer` / `admin` role field
- [packages/db/src/schema/auth.ts](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/packages/db/src/schema/auth.ts): Better Auth tables
- [packages/db/src/schema/commerce.ts](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/packages/db/src/schema/commerce.ts): products, checkout sessions, orders, and order items
- [packages/db/src/seed.ts](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/packages/db/src/seed.ts): Joyful Juices demo catalog seed data
- [packages/db/src/migrations/0000_bent_ravenous.sql](/Users/newrgm/dev/RocktownLabs/projects/joyfuljuices/packages/db/src/migrations/0000_bent_ravenous.sql): initial D1 SQL migration

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `bun run dev:native`: Start the React Native/Expo development server
- `bun run db:push`: Push schema changes to database
- `bun run db:generate`: Generate database client/types
- `bun run check`: Run Oxlint and Oxfmt
