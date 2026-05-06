# Engineering Decisions

## Objective

Build a minimal yet production-minded salary management platform that remains performant and maintainable for an organization with 10,000 employees.

The solution prioritizes delivery speed, clean architecture, scalability, and strong user experience.

---

# 1. Technology Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript

## Backend

- Next.js Route Handlers for integrated API delivery

## Database

- PostgreSQL

## ORM

- Prisma

## Visualization

- Recharts

## Testing

- Jest / React Testing Library (or project equivalent)

---

# 2. Why Full-Stack Next.js?

A unified Next.js architecture was selected to reduce operational complexity during the assessment.

Benefits:

- Single codebase for frontend + backend
- Faster delivery velocity
- Shared TypeScript types
- Easier local setup
- Lower deployment overhead

If future scale required separation, APIs can be extracted into dedicated backend services.

---

# 3. Data Modeling Decisions

Core Employee model includes:

- Full Name
- Job Title
- Country
- Department
- Salary
- Timestamps

Additional profile enrichment was added for better UX and future extensibility.

Indexes were added on commonly queried fields:

- country
- jobTitle
- department

This improves filtering and analytics queries at scale.

---

# 4. Scalability for 10,000 Employees

The assignment explicitly targets 10,000 employees.

To support this efficiently:

- Batched seed inserts
- Indexed query fields
- Pagination for employee tables
- Sorting/filtering controls
- Backend-side aggregations for analytics
- Frontend rendering optimizations

The seed process was optimized for fast local execution.

---

# 5. Backend API Design

Route handlers were organized by feature responsibility.

Patterns used:

- Thin request handlers
- Service-layer business logic
- Clear response contracts
- Reusable query logic
- Predictable error handling

Analytics calculations were intentionally performed server-side instead of client-side.

Reasons:

- Better performance
- Smaller client payloads
- Consistent calculations
- Easier future reporting/export APIs

---

# 6. Frontend Architecture

The frontend was refactored into modular feature-based boundaries.

Examples:

- features/employees
- features/analytics
- shared/components
- shared/hooks
- shared/utils

Benefits:

- Smaller components
- Better reuse
- Easier onboarding
- Cleaner maintenance
- Faster feature iteration

---

# 7. UX / Product Decisions

The goal was not only CRUD functionality, but a usable HR product.

Implemented decisions:

- Compact dashboard layouts
- Low-scroll information density
- Sortable tables
- Adjustable pagination
- Theme system (Light / Dark / System)
- Export reporting
- Employee profile views
- Responsive layouts

---

# 8. Analytics Decisions

The insights dashboard focuses on actionable salary visibility.

Implemented metrics:

- Country salary ranges
- Average compensation by job title
- Department comparisons
- Salary distribution charts
- KPI summary cards

This better aligns with HR manager workflows than raw data tables alone.

---

# 9. Quality Principles

Development followed:

- TDD-oriented iteration
- Incremental commits
- Refactor after functionality
- Deterministic testing
- Human-reviewed AI assistance
- Maintainability over shortcuts

---

# 10. Tradeoffs Accepted

Given assessment time constraints:

- Chose integrated Next.js backend over separate microservices
- Focused on practical analytics over enterprise complexity
- Prioritized UX clarity over excessive feature breadth

These decisions maximize signal while keeping scope realistic.

---

# 11. Local Development Notes

Before running locally:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```