# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Next.js with Turbopack)
- **Build**: `npm run build`
- **Production server**: `npm start`
- **Linting**: `npm run lint`

## Architecture Overview

This is a hydration tracking PWA built with Next.js 15, TypeScript, and Tailwind CSS, implementing **Clean Architecture with Domain-Driven Design (DDD)**.

### Layer Structure

```
src/
├── domain/              # Domain layer - pure business logic
│   ├── entities/       # Core business entities (User, HydrationRecord, etc.)
│   ├── repositories/   # Repository interfaces 
│   └── value-objects/  # Value objects (HydrationSummary)
├── application/        # Application layer - use cases
│   ├── use-cases/     # Business use cases (AddHydrationRecordUseCase, etc.)
│   └── services/      # Application services (NotificationService, etc.)
├── infrastructure/    # Infrastructure layer - external concerns
│   ├── repositories/ # Repository implementations (LocalStorage, API)
│   └── di/           # Dependency injection containers
└── presentation/     # Presentation layer - UI components
    ├── components/   # React components
    └── pages/       # Next.js pages (minimal usage)
```

### Dependency Injection

- **Local Storage**: Use `container` from `@/infrastructure/di/container`
- **API (future)**: Use `apiContainer` from `@/infrastructure/di/ApiContainer`
- **Generic tracking**: Use `genericContainer` from `@/infrastructure/di/genericContainer`

The app uses a custom DI container pattern where repositories and use cases are instantiated once and accessed via getters.

### Key Domain Concepts

- **User**: Contains daily hydration goal and profile info
- **HydrationRecord**: Individual water intake entries with amount and timestamp
- **HydrationGoal**: Daily water intake targets
- **TrackerType**: Generic tracking system for habits beyond hydration

### Data Flow Pattern

1. UI components import use cases from DI container
2. Use cases orchestrate business logic using repository interfaces
3. Repository implementations handle data persistence (LocalStorage/API)
4. Domain entities enforce business rules and validation

### Key Features

- PWA with offline support and service worker
- Dual repository system (LocalStorage + API-ready)
- Smart notifications and reminders
- Weather integration for hydration recommendations
- Habit tracking beyond just hydration
- Multi-language support (Japanese primary)

## Important Implementation Notes

- All business logic resides in the domain and application layers
- UI components are thin and delegate to use cases
- Repository pattern allows switching between LocalStorage and API seamlessly
- TypeScript strict mode enabled with path aliases (`@/*` → `./src/*`)
- PWA features implemented via manifest.json and service worker

## Testing

The codebase currently lacks explicit test commands. When adding tests, determine the testing framework from dependencies and create appropriate npm scripts.