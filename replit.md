# Overview

This project is a pnpm workspace monorepo using TypeScript, designed for a luxury fashion marketplace called STYLINK, targeting Algeria. It connects designers, ateliers, fabric suppliers, and boutiques. The platform aims to provide a comprehensive B2B solution for professionals in the fashion industry, including project management, networking, and opportunity discovery, alongside a B2C shopping experience. The long-term vision is to become the leading digital hub for fashion professionals in the region.

# User Preferences

I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `src/data`.
Do not make changes to the file `src/contexts/AppStore.tsx`.

# System Architecture

The project utilizes a monorepo structure managed by pnpm workspaces. The frontend is built with React, Vite, and `wouter` for routing, featuring a French copy and an editorial aesthetic with a cream, charcoal, and antique-gold palette. The backend is an Express 5 API.

**UI/UX Decisions:**
- **Color Scheme:** Cream (`#F8F5EF`), charcoal (`#1E1E1E`), and antique gold for primary accents.
- **Typography:** Cormorant and Playfair serif fonts for headlines.
- **B2B Dashboard:** Features a sticky white top bar with logo, search, notifications, and avatar dropdown. A 4-tab strip (Feed, My Network, Opportunities, Messages) allows for client-side content swapping and deep-linking.
- **Product Display:** Grid layouts with filters, hover effects for galleries, and detailed product/designer profiles.

**Technical Implementations:**
- **Monorepo:** pnpm workspaces for managing multiple packages.
- **Frontend Framework:** React with Vite for fast development and `wouter` for client-side routing.
- **Backend Framework:** Express 5 for the API server.
- **Database:** PostgreSQL with Drizzle ORM for data persistence.
- **Validation:** Zod (`zod/v4`) and `drizzle-zod` for schema validation.
- **API Codegen:** Orval generates API hooks and Zod schemas from OpenAPI specifications.
- **Build Tool:** esbuild for CJS bundle generation.
- **State Management:** `AppStore` (persisted to localStorage) for managing user data, orders, projects, and notifications.
- **B2B Features:**
    - **Guarded Routes:** `B2BGuard` restricts access to business user accounts.
    - **Messaging:** Two-pane UI with file attachments, pre-filled drafts based on context (collaboration, opportunity), and conversion of chats to projects.
    - **Project Management:** Detailed project pages with header cards (status, deadline), participant management, file uploads, task checklists, and a workflow tracker with customizable stages (`design`, `atelier-prep`, `production`, `delivery`). Project statuses are dynamically derived.
    - **Networking:** `My Network` tab with role filters, connection management, and project invitation features. `PortfolioHoverGallery` for showcasing designer work.
    - **Opportunity Feed:** Role-aware opportunity composer, marketplace-style cards with urgency badges, application functionality, and applicant viewing for owners.
    - **Notifications:** In-app notification system (bell icon) with Accept/Decline buttons for project invitations, plus auto-pushed activity notifications when a participant updates a stage status (`setStageStatus`) or uploads a file (`addProjectFile`) on a multi-collaborator project.
    - **Mes projets list:** `/b2b/projects` (`B2BProjects.tsx`) — grid of every project the user participates in, with status pill, deadline, "X/4 étapes" progress bar, collaborator names, and a "Créateur" badge for owned projects. Linked from the avatar dropdown (`menu-projects`).
    - **Identity & Ownership:** `currentBusinessId` derived from the user's email for authorization checks.

**Feature Specifications:**
- **STYLINK Artifact (B2C):** Home, Shop (product grid), Designers (directory & profiles), Messages, and FashionMap.
- **B2B Platform:**
    - **Pro Dashboard:** Feed, My Network, Opportunities, Messages, Projects.
    - **Legacy B2B Pages:** Orders, Requests, Catalog, Shortlist, Opportunity Detail (still using sidebar layout).
    - **Project Workflow:** `design`, `atelier-prep`, `production`, `delivery` stages with status tracking, deadlines, assignees, comments, and stage-specific file uploads.
    - **Connection System:** Request and manage professional connections.
    - **Opportunity Management:** Create, discover, apply to, and manage business opportunities.
    - **Order Management:** Track orders through `pending`, `in-production`, `quality-check`, `completed` stages.

# External Dependencies

- **PostgreSQL:** Primary database.
- **Drizzle ORM:** Object-Relational Mapper for PostgreSQL.
- **Zod (`zod/v4`):** Schema validation library.
- **drizzle-zod:** Integration between Drizzle ORM and Zod.
- **Orval:** API client code generator from OpenAPI specifications.
- **Vite:** Frontend build tool.
- **wouter:** Small routing library for React.
- **esbuild:** JavaScript bundler.