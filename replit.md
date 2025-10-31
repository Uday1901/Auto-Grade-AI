# AutoGrade AI - Fusion Starter

A production-ready full-stack React application for automated paper evaluation with AI-powered grading. Built with Fusion Starter template featuring React Router 6 SPA mode, TypeScript, Express backend, and modern tooling.

## Project Overview

**Purpose**: AI-powered grading system that automates paper evaluation with precision, supporting step-marking, partial credit, and real-time analytics for faculty and admins.

**Tech Stack**:
- **Package Manager**: pnpm (v10.14.0)
- **Frontend**: React 18 + React Router 6 (SPA) + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express server integrated with Vite dev server
- **Testing**: Vitest
- **UI Components**: Radix UI + Lucide React icons
- **3D Graphics**: Three.js with React Three Fiber

## Recent Changes (October 31, 2025)

### Replit Environment Setup
- Configured Vite dev server to run on port 5000 (required for Replit webview)
- Updated server host to 0.0.0.0 for proper Replit proxy support
- Configured HMR (Hot Module Replacement) to work with Replit's domain and WSS protocol
- Updated production server to bind to 0.0.0.0:5000
- Set up deployment configuration for autoscale deployment
- Created workflow 'dev' running `pnpm dev`

### Backend API Integration
- Created comprehensive shared TypeScript types in `shared/api.ts` for all API contracts
- Implemented paper upload, grading, and analytics endpoints in Express backend
- Added type-safe API client utility in `client/lib/api.ts`
- Connected frontend components to backend:
  - Index.tsx uses backend for paper upload and grading with real-time progress
  - Dashboard.tsx fetches analytics data from backend API
- All endpoints tested and verified working
- Full end-to-end type safety between frontend and backend

## Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components
│   ├── Index.tsx         # Home page (AutoGrade AI landing)
│   ├── Dashboard.tsx     # Dashboard page
│   └── NotFound.tsx      # 404 page
├── components/
│   ├── layout/           # Layout components (Header, AppLayout)
│   └── ui/               # Pre-built Radix UI component library
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── App.tsx               # App entry point with SPA routing
└── global.css            # TailwindCSS theming and globals

server/                   # Express API backend
├── index.ts              # Main server setup (express config + routes)
├── routes/               # API handlers
│   └── demo.ts           # Demo route handler
└── node-build.ts         # Production server entry point

shared/                   # Shared types between client & server
└── api.ts                # Shared API interfaces

netlify/                  # Netlify deployment configuration
└── functions/            # Serverless functions

public/                   # Static assets
```

## Development

### Available Commands
```bash
pnpm dev        # Start dev server (client + server on port 5000)
pnpm build      # Production build
pnpm start      # Start production server
pnpm typecheck  # TypeScript validation
pnpm test       # Run Vitest tests
```

### Development Server
- **Port**: 5000 (both frontend and backend)
- **Hot Reload**: Automatic for both client and server code
- **API Routes**: All prefixed with `/api/`
- **HMR**: Configured for Replit environment with WSS protocol

### Key Features

#### API Endpoints

**Health & Demo**
- `GET /api/ping` - Health check endpoint (returns ping/pong message)
- `GET /api/demo` - Demo endpoint

**Paper Management**
- `POST /api/papers/upload` - Upload a new question paper with configuration
  - Request: `PaperUploadRequest` (title, course, parts)
  - Response: `PaperUploadResponse` (paperId, totalMarks)
- `GET /api/papers/:paperId` - Get paper details
  - Response: `PaperDetailsResponse` (paper configuration)
- `POST /api/papers/grade` - Start grading a paper
  - Request: `GradingRequest` (paperId)
  - Response: `GradingResponse` (gradingId, estimatedTime)
- `GET /api/papers/grade/:gradingId` - Get grading progress
  - Response: `GradingProgressResponse` (status, progress, timestamps)

**Analytics**
- `GET /api/analytics` - Get dashboard analytics data
  - Response: `AnalyticsResponse` (overview, trends, distributions)

#### Routing System
- Powered by React Router 6 in SPA mode
- Routes defined in `client/App.tsx`
- `Index.tsx` = home page
- Custom 404 page for unmatched routes

#### Styling
- TailwindCSS 3 with custom theme in `client/global.css`
- Pre-built UI components using Radix UI primitives
- `cn()` utility for conditional class merging

#### Type Safety
- Shared types between client/server in `shared/` folder
- Path aliases: `@/` for client, `@shared/` for shared

## Deployment

The application is configured for **autoscale** deployment on Replit:
- **Build**: `pnpm build` (builds both client and server)
- **Run**: `pnpm start` (runs production server on port 5000)
- **Target**: Autoscale (stateless web application)

## User Preferences

None specified yet.

## Architecture Notes

- Single-port development (5000) with Vite + Express integration
- TypeScript throughout (client, server, shared)
- Full hot reload for rapid development
- Production-ready with autoscale deployment
- Comprehensive UI component library included
- Type-safe API communication via shared interfaces
- Configured for Replit's proxy environment with proper HMR support
