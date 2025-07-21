# SERP Intelligence Landing Page

## Overview

This is a premium landing page application for "SERP Intelligence" - an AI-powered SEO tool that analyzes why pages rank, not just who ranks. The application is built as a modern full-stack web application with a React frontend, Express backend, and PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### December 21, 2025 - Migration Completed & Marketing Materials Created
- ✅ Successfully migrated project from Replit Agent to Replit environment
- ✅ Validated project structure follows fullstack_js guidelines
- ✅ Confirmed Express server running properly on port 5000
- ✅ Verified frontend/backend integration with shared schema
- ✅ Created comprehensive product overview document (PRODUCT_OVERVIEW.md)
- ✅ Created LinkedIn marketing post (LINKEDIN_POST.md)
- ✅ All security practices implemented with proper client/server separation

### December 21, 2025 - Database Integration Completed
- ✅ PostgreSQL database provisioned and configured
- ✅ Created database connection layer (server/db.ts) using Neon serverless
- ✅ Implemented DatabaseStorage class with full CRUD operations
- ✅ Updated storage layer with graceful fallback to in-memory storage
- ✅ Successfully pushed database schema using Drizzle migrations
- ✅ Verified database functionality with live API testing
- ✅ Maintained backwards compatibility with existing frontend code

### December 21, 2025 - Advanced Scroll Animations & Background Effects
- ✅ Implemented CSS background scroll effect with fixed attachment
- ✅ Added mix-blend-mode: difference for striking visual interactions
- ✅ Created layered gradient system with scroll-triggered animations
- ✅ Enhanced parallax floating elements with geometric shapes
- ✅ Added 12 animated particles responding to scroll motion
- ✅ Integrated smooth rotation, scaling, and opacity transforms
- ✅ Optimized performance with fixed positioning and hardware acceleration

### December 21, 2025 - F1 Racing Video & Audio Implementation
- ✅ Successfully integrated user-provided F1 racing video from iStock
- ✅ Implemented local video file serving from attached_assets directory
- ✅ Created robust fallback system with multiple video sources
- ✅ Added dual video element system for maximum compatibility
- ✅ Enhanced error handling with cascading fallback chain
- ✅ Maintained CSS-animated racing background as final fallback
- ✅ Optimized video performance with autoplay, muted, and loop properties
- ✅ Applied professional dark overlay for content readability
- ✅ Authentic F1 racing footage now displays as primary background
- ✅ Implemented heavy metal F1 racing audio system with Web Audio API
- ✅ Created high bass synthetic F1 engine sound with deep frequencies (80Hz, 120Hz)
- ✅ Added aggressive distortion effects and heavy metal kick drum beat (120 BPM)
- ✅ Built multiple harmonic layers with sawtooth/square wave distortion
- ✅ Enhanced audio controls with prominent "Start Audio" button and visual indicators
- ✅ Integrated smart audio activation with comprehensive debugging and fallbacks

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Animations**: Framer Motion for premium animations and interactions
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Storage**: In-memory storage with fallback for PostgreSQL sessions
- **Development**: Hot reload with Vite middleware integration

### Database Strategy
- **Primary Database**: PostgreSQL (Neon Database serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Connection Layer**: Neon serverless with WebSocket support
- **Graceful Fallback**: Automatic fallback to in-memory storage if database unavailable
- **Environment Variables**: DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

## Key Components

### Data Models
- **Users**: Basic user authentication system with username/password
- **Waitlist Entries**: Email collection system with source tracking (hero vs final CTA)

### Frontend Features
- Premium dark theme with crimson red accents
- Responsive design optimized for desktop and mobile
- Animated hero section with scroll-triggered effects
- Email capture forms with validation and error handling
- Toast notifications for user feedback
- Comprehensive UI component library from shadcn/ui

### Backend Features
- Waitlist management API with duplicate email prevention
- CORS and middleware setup for development
- Static file serving with Vite integration
- Error handling and logging middleware
- Health check endpoints

## Data Flow

### Waitlist Registration Flow
1. User enters email in hero or final CTA form
2. Frontend validates email format using Zod schema
3. Form submission triggers API call to `/api/waitlist`
4. Backend validates data and checks for existing email
5. If successful, entry is stored with source tracking
6. Success/error response displayed via toast notification
7. Waitlist count can be queried via `/api/waitlist/count`

### Development Data Flow
- Vite dev server proxies API requests to Express backend
- Hot reload for both frontend and backend changes
- In-memory storage used when database is not available
- Automatic fallback from PostgreSQL to memory storage

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL-compatible serverless database)
- **UI Components**: Radix UI primitives for accessibility
- **Validation**: Zod for runtime type validation
- **Animations**: Framer Motion for premium interactions
- **Icons**: Lucide React for consistent iconography

### Development Dependencies
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast production builds for backend
- **PostCSS**: CSS processing with Tailwind CSS
- **Drizzle Kit**: Database schema management and migrations

### Third-party Integrations
- **Replit Integration**: Banner and cartographer plugins for Replit environment
- **Error Overlay**: Runtime error modal for development
- **Google Fonts**: Playfair Display and Inter fonts for premium typography

## Deployment Strategy

### Production Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles Express app to `dist/index.js`
3. **Database Setup**: Drizzle migrations applied via `db:push` command
4. **Static Serving**: Express serves built frontend assets

### Environment Configuration
- **Development**: `npm run dev` starts both frontend and backend with hot reload
- **Production**: `npm run build` creates optimized builds, `npm start` runs production server
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (Neon Database recommended)
- Static file serving capability
- Environment variable support for database configuration

### Key Features for Production
- Graceful fallback to memory storage if database unavailable
- Comprehensive error handling and logging
- Optimized asset serving with proper caching headers
- Type-safe API contracts between frontend and backend