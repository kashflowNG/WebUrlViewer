# URL Viewer Application

## Overview

This is a full-stack web application that provides a browser-like URL viewer with an embedded iframe interface. The application allows users to view websites through a clean, responsive interface with auto-scroll and auto-refresh capabilities. The system features a cyberpunk/hacker-themed UI with performance monitoring and browser-like navigation controls.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom cyberpunk theme variables
- **State Management**: React hooks with localStorage persistence
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### URL Viewer Interface
- **Navigation Bar**: Browser-like controls with back/forward, refresh, and URL input
- **Web Frame**: Embedded iframe with auto-scroll and auto-refresh capabilities
- **Status Dashboard**: Real-time metrics display with performance monitoring
- **Status Bar**: Connection status and security indicators

### Database Schema
- **Users Table**: Basic user management (currently using in-memory storage)
- **Session Storage**: User session persistence and state management

## Data Flow

1. **User Input**: URL entered in web interface navigation bar
2. **Validation**: URL validation and normalization on frontend
3. **Navigation**: iframe navigation with load state tracking and browser history
4. **Automation**: Auto-refresh and auto-scroll with configurable intervals
5. **Monitoring**: Performance metrics collection and display in status dashboard
6. **Persistence**: State persistence in localStorage for session continuity

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **express**: Web application framework
- **express-session**: Session management middleware

### UI Dependencies
- **@radix-ui/react-***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router

### Development Dependencies
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Static Serving**: Express serves built frontend files
4. **Environment Variables**: Required for database connection

### Production Configuration
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: `DATABASE_URL` for database connection
- **Port**: Configurable via `PORT` environment variable (default: 5000)

### Render Deployment
- Configured for Render platform deployment
- `render.yaml` configuration for automatic deployment
- Environment variable setup through Render dashboard
- Build and start commands optimized for production

## Changelog

```
Changelog:
- June 30, 2025. Initial setup
- June 30, 2025. Removed all Telegram bot integration and WebSocket functionality per user request
- June 30, 2025. Cleaned up dependencies and simplified architecture to pure web-based URL viewer
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```