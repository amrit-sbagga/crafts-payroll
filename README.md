# Payroll Analytics Dashboard

Modern full-stack salary management platform for HR and payroll visibility.  
Includes employee lifecycle management, profile views, analytics dashboards, reporting, theming, and high-volume seed support.

## 1. Features

### Employee Management
- Add, edit, and delete employee records
- View dedicated employee profile page (`/employees/:id`)
- Search, sort, and filter employee data
- Server-backed pagination controls for large datasets

### Salary Insights Dashboard
- Country salary analytics
- Department analytics (headcount and average salary)
- Job title salary insights
- KPI metric cards for quick summary
- Interactive charts and graphs (bar, pie, distribution)
- Export reports (CSV/PDF)

### User Experience
- Responsive UI for desktop/tablet/mobile
- Light / Dark / System theme support
- Compact, dense data-first layouts
- Scroll-optimized dashboard workspace

### Performance
- Seed workflow supports 10,000 employees
- Efficient API pagination and sorting
- Indexed Prisma/PostgreSQL query paths
- Batched inserts in seed script for faster setup

## 2. Tech Stack

### Frontend
- Next.js (App Router) + React
- TypeScript
- Tailwind CSS
- Recharts (charting)

### Backend
- Next.js Route Handlers (`/api/*`)
- Node.js runtime

### Database
- PostgreSQL
- Prisma ORM (`@prisma/client`, Prisma migrations)
- `@prisma/adapter-pg` + `pg`

### Tooling
- Jest + React Testing Library
- ESLint + Prettier
- TSX for TypeScript scripts (seed)

## 3. Screens / Modules

- **Employee Home**: employee table, filters, sorting, pagination, CRUD actions
- **Employee Profile**: detailed profile with salary and department insights
- **Salary Insights Dashboard**: KPI cards, tabs, charts, and report export
- **Settings / Theme**: theme and density preferences

## 4. Local Setup

```bash
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?schema=public"
```

Run migrations:

```bash
npm run prisma:migrate
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Start development server:

```bash
npm run dev
```

## 5. Seed Data

Generate ~10,000 employee records:

```bash
npm run seed
```

Reset and reseed:

```bash
npm run seed:clean
```

The seed pipeline uses batched inserts for performance and predictable large-volume local testing.

## 6. Testing

Run tests:

```bash
npm test
```

The project includes meaningful unit coverage for core employee flows, API routes, seed helpers, and analytics logic.

## 7. Architecture Notes

- Feature-oriented frontend organization (`features/employees`, `features/analytics`, `shared`)
- Reusable components and hooks to reduce duplication
- Service-layer abstraction for API calls and data orchestration
- Backend service separation under module boundaries
- Indexed database fields to support analytics/filter performance

## 8. AI-Assisted Development

This project intentionally used AI development tooling for:
- UI iteration
- Refactoring support
- Test scaffolding
- Documentation drafting

All generated output was manually reviewed, validated, and refined before integration.

## 9. Future Improvements

- Payroll processing engine with approvals and audit trail
- Role-based access control (RBAC)
- Payslip generation and downloadable payroll artifacts
- Notification workflows (email/in-app)
- Multi-tenant organization support

## 10. Demo / Deployment

- Live Demo: [Add URL]
- Demo Video: [Add URL]

