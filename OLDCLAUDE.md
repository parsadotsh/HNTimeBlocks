# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HNTimeBlocks is a React-based web application that displays Hacker News stories organized into 6-hour UTC time blocks. It uses a full-stack TypeScript architecture with Express.js backend and React frontend.

## Architecture

### Full-Stack Structure
- **Frontend**: React with TypeScript in `client/` directory
- **Backend**: Express.js server in `server/` directory  
- **Shared**: Common schemas and types in `shared/` directory
- **Database**: PostgreSQL with Drizzle ORM (configured but minimal usage)

### Key Technologies
- **Frontend**: React 18, Wouter (routing), TanStack Query, shadcn/ui components, Tailwind CSS
- **Backend**: Express.js, TypeScript, Vite (dev server)
- **Data**: Fetches from Algolia HN API directly, no persistent storage for stories
- **Build**: Vite for client, ESBuild for server

### Application Logic
The app generates 28 time blocks (7 days × 4 six-hour blocks) and fetches stories from Algolia HN API for each block. Stories are sorted by points descending. The most recent 3 blocks are highlighted as "recent".

## Development Commands

```bash
# Start development server (both client and server)
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push
```

## File Structure Patterns

### Import Aliases
- `@/*` → `client/src/*` (frontend code)
- `@shared/*` → `shared/*` (shared schemas/types)

### Component Organization
- UI components in `client/src/components/ui/` (shadcn/ui based)
- Business components in `client/src/components/`
- Pages in `client/src/pages/`
- Hooks in `client/src/hooks/`
- Utilities in `client/src/lib/`

### Server Structure
- Main server file: `server/index.ts`
- Route definitions: `server/routes.ts`
- Vite integration: `server/vite.ts`

## Key Implementation Details

### Time Blocks Generation
The `generateTimeBlocks()` function in `client/src/lib/time-blocks.ts` creates time blocks for the past 7 days, with 4 six-hour blocks per day (00:00-06:00, 06:00-12:00, 12:00-18:00, 18:00-24:00 UTC).

### Story Fetching
Stories are fetched directly from Algolia HN API using the `fetchStoriesForTimeBlock()` function, filtered by timestamp and sorted by points.

### State Management
- React Query for server state and caching
- Local state with React hooks
- Settings stored in localStorage via `use-settings` hook

### Styling
- Tailwind CSS with custom HN-inspired colors
- shadcn/ui component library (New York style)
- Custom CSS variables for consistent theming

## Development Notes

- Server runs on port 5000 (both development and production)
- Vite dev server integrated with Express in development
- Stories refresh every 10 minutes via React Query
- No authentication or user accounts implemented
- Database schema exists but primarily unused (ready for future features)