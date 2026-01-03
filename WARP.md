# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Sunnalytics is a Next.js-based token analytics platform that provides comprehensive cryptocurrency market data, risk analysis, and portfolio management tools. The application is a Progressive Web App (PWA) built with TypeScript, React, and modern web technologies.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build production version
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code with Prettier
npm run format
```

### Environment Setup
- Requires `NEXT_PUBLIC_API_BASE_URL` environment variable for API endpoint
- Optional `NEXT_PUBLIC_API_KEY` for authenticated API requests
- Development server runs on http://localhost:3000 by default

## Architecture Overview

### State Management
- **Zustand**: Primary state management with persistence via LocalForage
- **Global Store**: `stores/useTokenStore.ts` manages all token data, filters, search, and UI state
- **SWR**: Data fetching with automatic caching, revalidation, and error handling

### Data Flow
1. **API Layer**: `utils/api.ts` and `hooks/useTokenData.ts` handle external API communication
2. **State Layer**: Zustand store manages application state and data transformations
3. **Component Layer**: React components consume state via custom hooks
4. **Persistence**: Critical state persisted to IndexedDB via LocalForage

### Key Components Architecture

#### Core Layout
- `pages/_app.tsx`: Root application with font loading, metadata, and welcome screen logic
- `pages/index.tsx`: Main dashboard with market overview, search, filters, and data visualization
- `components/BottomNav.tsx`: Mobile-first navigation component

#### Data Components
- `components/TokenTable.tsx`: Virtualized table with sorting, filtering, and column management
- `components/TokenAnalyticsCard.tsx`: Card-based token display for mobile views
- `components/AnalyticsDashboard.tsx`: Comprehensive analytics and charts

#### Filter System
- `components/AdvancedFilters.tsx`: Multi-criteria filtering interface
- `components/FilterDrawer.tsx`: Mobile-optimized filter sidebar
- State-driven filter application in `useTokenStore.applyFilters()`

### Performance Optimizations
- **React Window**: Virtualization for large token lists
- **SWR**: Intelligent caching and background updates
- **Debounced Search**: 300ms debounce on search inputs
- **PWA**: Service worker for offline functionality and fast loading
- **Next.js Optimizations**: SWC minification, image optimization, package import optimization

### Styling System
- **Tailwind CSS**: Utility-first styling with dark theme
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Font System**: Inter (primary) and Roboto Mono (code/data) via `utils/fonts.ts`

## Key Technical Patterns

### Token Data Structure
```typescript
interface Token {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  category: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  volumeMarketCapRatio?: number;
  circulatingSupplyPercentage?: number;
  isVolumeHealthy?: boolean;
  isCirculatingSupplyGood?: boolean;
  pumpDumpRiskScore?: number;
  liquidityScore?: number;
  // ... additional metrics
}
```

### State Management Pattern
- Single source of truth in Zustand store
- Derived state through computed properties
- Actions co-located with state
- Persistence middleware for critical data

### Component Patterns
- Functional components with hooks
- Memoization for performance-critical components
- Custom hooks for reusable logic
- Responsive design with conditional rendering

## File Organization

```
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── pages/              # Next.js pages (file-based routing)
├── stores/             # Zustand state management
├── styles/             # Global CSS and Tailwind
├── utils/              # Utility functions and API helpers
└── public/             # Static assets and PWA files
```

## Development Guidelines

### Component Development
- Use TypeScript interfaces for all props and data structures
- Implement responsive design patterns (mobile-first)
- Utilize Tailwind utility classes for styling
- Memoize expensive computations and components where needed

### State Management
- Add new state to `useTokenStore.ts` when needed
- Use computed properties for derived state
- Implement proper TypeScript typing for all state
- Consider persistence requirements for new state

### API Integration
- Use SWR for data fetching with proper error handling
- Implement retry logic and proper loading states
- Handle authentication through headers in API utilities
- Follow the established fetcher pattern in `utils/api.ts`

### Performance Considerations
- Virtualize large lists using React Window
- Debounce user inputs for search and filters
- Use React.memo for expensive components
- Optimize images and use Next.js Image component when applicable

## Common Development Tasks

### Adding New Token Metrics
1. Update Token interface in relevant files
2. Modify API response mapping in `useTokenStore.fetchTokens()`
3. Add display logic to table/card components
4. Update filter logic if filterable

### Creating New Pages
1. Add page file in `pages/` directory
2. Update navigation in `components/BottomNav.tsx`
3. Consider mobile-responsive design patterns
4. Implement proper SEO metadata

### Modifying Filters
1. Update `FilterState` interface in `useTokenStore.ts`
2. Modify filter UI components
3. Update `applyFilters()` logic
4. Test filter combinations thoroughly

## Important Notes

- The application expects an external API at `NEXT_PUBLIC_API_BASE_URL`
- PWA functionality is disabled in development for faster reloads
- Welcome screen logic based on user inactivity (10-minute threshold)
- All monetary values should be formatted using the established `formatNumber` utilities
- Dark theme is the primary UI theme with yellow accent colors