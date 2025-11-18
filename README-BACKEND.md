# Backend Architecture

The backend is now structured with TypeScript, following a clean architecture pattern.

## Structure

```
src/
├── app.ts                 # Express app factory
├── server.ts              # Server entry point
├── types/                 # TypeScript interfaces
│   └── index.ts
├── models/                # Data access layer
│   ├── ProjectModel.ts
│   └── StatsModel.ts
├── services/              # Business logic layer
│   ├── ProjectService.ts
│   └── StatsService.ts
├── controllers/           # Request handlers
│   ├── ProjectController.ts
│   ├── StatsController.ts
│   └── ActionController.ts
├── routes/                # Route definitions
│   ├── projectRoutes.ts
│   ├── statsRoutes.ts
│   └── actionRoutes.ts
├── middlewares/           # Express middlewares
│   ├── errorHandler.ts
│   └── validation.ts
└── db/                    # Database client
    └── supabase.ts
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run tests
npm test
```

## API Endpoints

- `GET /api/projects` - Get all projects (with optional filters)
- `GET /api/projects/:id` - Get single project
- `GET /api/projects/leaderboard` - Get top scored projects
- `GET /api/projects/success-stories` - Get success stories
- `GET /api/stats` - Get platform statistics
- `POST /api/scrape` - Trigger scraper
- `POST /api/research/:id` - Research specific project
- `GET /health` - Health check

## Testing

Tests are written with Mocha, Chai, and Supertest:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Test files are in the `test/` directory and follow the pattern `*.test.ts`.

## Architecture Principles

1. **Separation of Concerns**: Models handle data, Services handle business logic, Controllers handle HTTP
2. **Type Safety**: Full TypeScript coverage for better developer experience
3. **Error Handling**: Centralized error handling with custom AppError class
4. **Validation**: Middleware-based validation for request data
5. **Testability**: Each layer is independently testable

