<div align="center">

<!-- Replace with your logo -->
<!-- <img src="./docs/images/logo.svg" alt="Waylink" width="120" /> -->

# Waylink

**A multi-sided marketplace platform connecting customers with Transport and Experience providers.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech)
[![Better Auth](https://img.shields.io/badge/Auth-Better_Auth-6C47FF?style=flat-square)](https://www.better-auth.com)
[![Inngest](https://img.shields.io/badge/Background_Jobs-Inngest-3B82F6?style=flat-square)](https://www.inngest.com)
[![License](https://img.shields.io/badge/License-Private-lightgrey?style=flat-square)]()

<p align="center">
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-1.png?raw=true" width="45%" alt="Waylink Screenshot 1" />
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-2.png?raw=true" width="45%" alt="Waylink Screenshot 2" />
</p>

<p align="center">
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-3.png?raw=true" width="45%" alt="Waylink Screenshot 3" />
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-4.png?raw=true" width="45%" alt="Waylink Screenshot 4" />
</p>

<p align="center">
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-5.png?raw=true" width="45%" alt="Waylink Screenshot 5" />
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-6.png?raw=true" width="45%" alt="Waylink Screenshot 6" />
</p>

<p align="center">
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-7.png?raw=true" width="45%" alt="Waylink Screenshot 7" />
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-8.png?raw=true" width="45%" alt="Waylink Screenshot 8" />
</p>

<p align="center">
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-9.png?raw=true" width="45%" alt="Waylink Screenshot 9" />
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-10.png?raw=true" width="45%" alt="Waylink Screenshot 10" />
</p>

<p align="center">
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-11.png?raw=true" width="45%" alt="Waylink Screenshot 11" />
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-12.png?raw=true" width="45%" alt="Waylink Screenshot 12" />
</p>

<p align="center">
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-13.png?raw=true" width="45%" alt="Waylink Screenshot 13" />
  <img src="https://github.com/neuro-tx/waylink/blob/main/public/demos/image-14.png?raw=true" width="45%" alt="Waylink Screenshot 14" />
</p>

</div>

---

## Table of Contents

- [Overview](#overview)
- [Product Areas](#product-areas)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Roles & Permissions](#roles--permissions)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Engineering Principles](#engineering-principles)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)

---

## Overview

**Waylink** is a full-stack SaaS marketplace that connects customers with **Transport** and **Experience** service providers. Providers list and manage their own products (rides, tours, activities), while customers discover and book them through a public storefront. An internal admin team oversees the entire platform — providers, listings, subscriptions, and platform-wide financial health.

The platform is built as a single Next.js application with three distinct, role-gated experiences sharing one codebase, one design system, and one data layer.

## Product Areas

### 🌐 Public Website

The customer-facing storefront for discovering and booking services.

- Browse Transport and Experience listings
- Search, filter, and view provider/product details
- Booking flow and checkout
- Responsive, SEO-optimized marketing and listing pages

### 🧑‍💼 Provider Dashboard

Where providers run their business on Waylink.

- Product management (multi-step creation wizard: details, variants & pricing, locations, service details, review)
- Booking management
- Subscription & plan management
- Revenue, payout, and peak-booking-hours analytics
- Reviews and provider team/staff management

### 🛡️ Admin Dashboard

Internal control center for the Waylink team.

- Provider management and moderation (approve, suspend, review)
- Product/listing moderation with destructive & non-destructive status transitions
- Platform-wide subscriptions management (plans, trials, cancellations, bulk actions)
- Financial reporting (revenue over time, revenue by plan tier, top providers by revenue)
- Platform analytics & KPIs
- User management (roles, bans, provider staff assignment)
- Notification center

## Screenshots

<!--
  Drop screenshots into /docs/images and update the paths below.
  A 2-column table keeps the README compact for a large gallery.
-->

| Public Website                                             | Provider Dashboard                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| <!-- ![Public homepage](./docs/images/public-home.png) --> | <!-- ![Provider analytics](./docs/images/provider-dashboard.png) --> |

| Admin Dashboard                                               | Financial Analytics                                               |
| ------------------------------------------------------------- | ----------------------------------------------------------------- |
| <!-- ![Admin overview](./docs/images/admin-dashboard.png) --> | <!-- ![Revenue charts](./docs/images/financial-analytics.png) --> |

## Tech Stack

| Layer              | Technology                         | Purpose                                         |
| ------------------ | ---------------------------------- | ----------------------------------------------- |
| Framework          | **Next.js 16** (App Router)        | Routing, Server Components, Server Actions, SSR |
| Language           | **TypeScript**                     | End-to-end type safety                          |
| Styling            | **Tailwind CSS**                   | Utility-first styling                           |
| UI Components      | **shadcn/ui**                      | Accessible, composable component primitives     |
| Animation          | **Framer Motion** (`motion/react`) | Micro-interactions, staggered/spring animations |
| Database           | **PostgreSQL** (via **Neon**)      | Primary data store                              |
| ORM                | **Drizzle ORM**                    | Type-safe schema, queries, and migrations       |
| Auth               | **Better Auth**                    | Sessions, roles, admin plugin, access control   |
| Background Jobs    | **Inngest**                        | Async workflows, scheduled/event-driven jobs    |
| Forms & Validation | **React Hook Form** + **Zod**      | Type-safe forms and schema validation           |
| Charts             | **Recharts**                       | Analytics visualizations                        |

## Roles & Permissions

Access control is implemented with Better Auth's `createAccessControl`, extended with a custom `provider` role alongside the built-in admin/user roles.

| Role                        | Access                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| **Customer** (default user) | Public website, browsing, bookings, own account                                                  |
| **Provider**                | Provider Dashboard — own products, bookings, subscriptions, staff, analytics                     |
| **Admin**                   | Admin Dashboard — full platform oversight: users, providers, products, subscriptions, financials |

## Architecture

Waylink follows a **server-first architecture**:

- **Server Components by default** — Client Components are opt-in, used only where interactivity requires it.
- **Server Actions for all mutations** — no ad hoc API routes for internal writes.
- **Business logic separated from UI** — service/query layers (e.g. `getRevenueOverTime`, `getPayoutSummary`, `getDashboardInsights`) live independently of the components that render them.
- **Typed data access** — all database access goes through Drizzle ORM; no raw, untyped queries.
- **Performance-conscious data fetching** — parallelized queries, `unstable_cache`, and streaming/`Suspense` boundaries throughout dashboards.
- **SEO by default** — public-facing routes implement `generateMetadata`.

> Adjust to match your actual folder layout — this reflects the current conventions in use across the admin, provider, and public areas.

## Design System

- **Theme**: dark purple/slate palette defined with `oklch()` custom CSS properties in `globals.css`, with class-based dark mode.
- **Charts**: a consistent custom palette (violet, amber-orange, emerald, slate) rather than default shadcn chart colors.
- **Interaction patterns**: Dribbble-style slide-up panels, floating action bars, and URL-driven drawer/sheet state.
- **States**: every data view ships with loading (skeleton), empty, and error states — no bare spinners or silent failures.
- **Motion**: staggered entrance animations and spring-physics transitions via Framer Motion, respecting `useReducedMotion()`.

## Engineering Principles

When contributing to Waylink, code should prioritize:

- Clean, scalable architecture
- Type-safe TypeScript throughout
- Reusable components and utilities
- Performance and readability
- Consistency with existing project structure and conventions
- Production-ready solutions over quick fixes

## Roadmap

- [ ] Public booking checkout flow
- [ ] Provider payouts automation via Inngest
- [ ] Platform-wide notification system (email + in-app)
- [ ] Multi-currency support
- [ ] Public API for provider integrations

---

<div align="center">

Built and maintained as a solo, full-stack project by nero-tx.

</div>
