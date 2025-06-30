# URL Viewer Application

## Overview

This is a full-stack web application that combines a browser-like URL viewer with Telegram bot integration. The application allows users to view websites through an embedded iframe interface while providing automated screenshot and monitoring capabilities via a Telegram bot. The system features a cyberpunk/hacker-themed UI with real-time WebSocket communication between the web interface and Telegram bot.

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
- **WebSocket**: Native WebSocket server for real-time communication
- **External Integrations**: Puppeteer for headless browsing, Telegram Bot API

### Real-time Communication
- WebSocket server integrated with Express HTTP server
- Bidirectional communication between web interface and Telegram bot
- Real-time status updates and command synchronization

## Key Components

### URL Viewer Interface
- **Navigation Bar**: Browser-like controls with back/forward, refresh, and URL input
- **Web Frame**: Embedded iframe with auto-scroll and auto-refresh capabilities
- **Status Dashboard**: Real-time metrics display with performance monitoring
- **Status Bar**: Connection status and security indicators

### Telegram Bot Integration
- **Headless Browser**: Puppeteer-controlled browser for automated interactions
- **Screenshot Capture**: Automated screenshot functionality with configurable intervals
- **Bot Commands**: Full command set for URL navigation and automation control
- **Activity Tracking**: Comprehensive logging and statistics

### Database Schema
- **Users Table**: Basic user management (currently using in-memory storage)
- **Bot Stats Table**: Tracking bot activity, refresh/scroll counts, and automation settings

## Data Flow

1. **User Input**: URL entered in web interface or via Telegram bot commands
2. **Validation**: URL validation and normalization on both frontend and backend
3. **Navigation**: iframe navigation with load state tracking
4. **WebSocket Sync**: Real-time synchronization between web interface and bot
5. **Automation**: Auto-refresh and auto-scroll with configurable intervals
6. **Monitoring**: Performance metrics collection and display
7. **Persistence**: State persistence in localStorage and database

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **puppeteer**: Headless browser automation
- **node-telegram-bot-api**: Telegram Bot API integration
- **drizzle-orm**: Type-safe database ORM
- **ws**: WebSocket server implementation

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
4. **Environment Variables**: Required for database and Telegram credentials

### Production Configuration
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```