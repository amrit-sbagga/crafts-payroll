# Engineering Decisions

## Stack Chosen

- Next.js (App Router) for integrated frontend + backend delivery speed
- TypeScript for type safety and maintainability
- Prisma ORM for developer productivity and schema clarity
- PostgreSQL for relational data and scalability
- Jest + React Testing Library for reliable automated testing

## Why Full-Stack Next.js?

Chosen to reduce operational complexity and accelerate delivery for the assessment.  
The modular structure allows APIs to be extracted later into a dedicated backend if scale requires.

## Expected Scale

Initial target: 10,000 employees.  
Design includes pagination, indexed queries, and aggregate reporting patterns.

## Quality Principles

- TDD-first workflow
- Incremental commits
- Readable modular code
- Fast deterministic tests

## Backend Architecture

Used Next.js route handlers to ship full-stack features quickly with lower operational overhead.

Prisma provides typed database access and clean migrations.

Server-side pagination and filtering were chosen for performance with large employee datasets.