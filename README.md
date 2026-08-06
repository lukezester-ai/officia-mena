# Officia MENA

Officia MENA is a modular, AI-powered Business Operating System and ERP platform specifically tailored for the MENA (Middle East and North Africa) region. It consolidates accounting, invoicing, inventory management, HR, subscriptions, banking operations, and AI-driven inbox management into a single, cohesive SaaS product.

> **Security & Readiness Disclaimer:** This project is currently in the MVP/Architecture Hardening phase. It is not yet ready for production use with real financial data. Features like Tenant Isolation, RBAC, and ZATCA compliance are actively being audited and fortified.

## 🌍 Target Markets & Regulations

- **Primary Focus**: MENA region, particularly Saudi Arabia (KSA) and UAE.
- **ZATCA (KSA)**: The system aims to support ZATCA Phase 2 compliance. 
  - *Current Status:* Basic TLV/Base64 QR code generation is implemented. Full Phase 2 (XML generation, UBL profiles, cryptographic stamping, clearance flows) is experimental/pending.
- **Multi-Tenant SaaS**: Designed to serve multiple independent businesses securely from a single deployment.

## 🏗 Architecture & Stack

Officia MENA is built on a modern, robust web stack:

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Supabase (via `next-auth` / Supabase auth)
- **Billing & Subscriptions**: Stripe
- **AI Integration**: Vercel AI SDK (Anthropic & Google providers for fallback and cost optimization)
- **Styling**: Tailwind CSS v4, Framer Motion
- **Testing**: Vitest, Zod (validation)

## 📂 Directory Structure

```text
officia-mena/
├── src/
│   ├── app/                # Next.js App Router (Public pages, Auth, Dashboard, API)
│   ├── components/         # Reusable UI components
│   ├── lib/                # Core Business Logic & Infrastructure
│   │   ├── accounting/     # Ledger, postings, chart of accounts
│   │   ├── ai/             # AI tools, prompts, providers
│   │   ├── auth/           # Supabase/NextAuth integrations
│   │   ├── billing/        # Subscription management
│   │   ├── db/             # Drizzle config and schema definitions
│   │   │   └── schema/     # Domain-driven DB schemas (tenants, users, invoices, etc.)
│   │   ├── hr/             # HR management
│   │   ├── inventory/      # Inventory and stock control
│   │   └── stripe/         # Stripe API and webhooks
├── agrinexus-law/          # Git submodule (Legal logic/Contracts)
└── tests/                  # Unit and integration tests
```

## 🚀 Getting Started

### 1. Environment Variables

Create a `.env.local` file based on the required variables (check `.env.vercel` or `.env.local.backup` if available). At a minimum, you will need:

```env
# Database
DATABASE_URL="postgres://user:password@localhost:5432/officia"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."

# AI Providers
ANTHROPIC_API_KEY="..."
GOOGLE_GENERATIVE_AI_API_KEY="..."
```

### 2. Database & Drizzle

Ensure you have a PostgreSQL instance running.

```bash
# Install dependencies
npm install

# Generate Drizzle migrations
npm run db:generate

# Apply migrations to your local DB
npm run db:migrate

# (Optional) Open Drizzle Studio to inspect data
npm run db:studio
```

### 3. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Testing & CI/CD

Run the test suite using Vitest:

```bash
# Run unit tests
npm run test

# Run typechecking
npm run typecheck

# CI Check (Lint, Typecheck, Test, Build)
npm run ci
```

## 🤖 AI Providers & Usage

The platform utilizes a dual-provider AI setup (Anthropic and Google) via the Vercel AI SDK. This allows the system to intelligently switch models based on task complexity (e.g., OCR extraction vs. financial analysis) and handle API rate limits gracefully.

*Note: AI tools currently operate without human-in-the-loop approvals for some actions. A safety governance layer is planned to prevent autonomous irreversible financial postings.*

## 💳 Stripe Webhooks

Stripe is used for tenant subscriptions. Webhooks must be configured in your Stripe Dashboard to point to `/api/webhooks/stripe` to ensure subscription statuses remain synchronized with the local database.

## 🚧 Project Status: What's Complete vs. Experimental

**✅ Complete / Solid Foundation:**
- Database domain modeling (separated by business domains like HR, Inventory, Invoices).
- Multi-tenant foundational schemas (`tenants`, `users`, `rbac`).
- Modern Next.js 15 + React 19 integration.
- Supabase Authentication flow.

**🧪 Experimental / Under Refactoring:**
- **Accounting Engine**: Large modules (`ledger.ts`, `postings.ts`) are currently monolithic and are scheduled for decomposition.
- **Tenant Isolation**: While the `tenants` table exists, strict row-level security (RLS) and application-level scoping are being audited.
- **ZATCA Phase 2**: Full XML clearance flow is pending.
- **Contracts Engine**: Currently relies on a Git submodule (`agrinexus-law`). Integration boundaries are being redefined.
