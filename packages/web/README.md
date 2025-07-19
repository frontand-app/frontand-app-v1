# CLOSED AI Frontend Specifications

## Overview
This is the frontend specification for the CLOSED AI platform - an open source task automation platform that allows users to run AI flows through a simple web interface.

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui components
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Authentication**: Supabase Auth

## Core Features

### 1. Flow Runner Interface
- **Auto-generated forms** from `flow.json` specifications
- **Real-time cost estimation** as users type
- **Model selection** dropdown with pricing indicators
- **Live execution status** with progress indicators
- **Results display** with syntax highlighting for JSON
- **Error handling** with user-friendly messages

### 2. Flow Library
- **Browse flows** by category and tags
- **Search functionality** with filters
- **Flow details** with description, inputs/outputs, and pricing
- **One-click run** from the library
- **Creator profiles** and flow ratings

### 3. User Dashboard
- **Execution history** with status and costs
- **Usage analytics** and spending breakdown
- **Credit balance** and top-up functionality
- **Saved flow configurations** for quick reuse

### 4. Creator Dashboard
- **Flow management** (create, edit, delete)
- **Analytics** (usage, earnings, ratings)
- **Revenue tracking** with 50/50 split visualization
- **Flow publishing** workflow

## API Contracts

### Flow Execution API
```typescript
// POST /api/flows/run
interface FlowExecutionRequest {
  flow_id: string;
  inputs: Record<string, any>;
  model_id?: string;
  gpu_type?: 'cpu' | 'l4' | 'a10g' | 'a100';
  wait_for_completion?: boolean;
}

interface FlowExecutionResponse {
  success: boolean;
  execution_id: string;
  data?: any;
  error?: string;
  cost_usd?: number;
  runtime_seconds?: number;
  status: 'running' | 'completed' | 'failed';
}
```

### Cost Estimation API
```typescript
// POST /api/flows/estimate
interface CostEstimateRequest {
  flow_id: string;
  inputs: Record<string, any>;
  model_id?: string;
  gpu_type?: string;
}

interface CostEstimateResponse {
  total_cost_usd: number;
  container_cost_usd: number;
  llm_cost_usd: number;
  estimated_runtime_seconds: number;
  model_used: string;
  gpu_type: string;
}
```

### Flow Library API
```typescript
// GET /api/flows
interface FlowListResponse {
  flows: FlowMetadata[];
  total: number;
  page: number;
  per_page: number;
}

interface FlowMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  version: string;
  created_at: string;
  updated_at: string;
  rating: number;
  usage_count: number;
  estimated_cost: {
    min_usd: number;
    max_usd: number;
    typical_usd: number;
  };
}
```

## Page Structure

### 1. Homepage (`/`)
- **Hero section** with platform overview
- **Featured flows** carousel
- **Getting started** guide
- **Recent executions** for logged-in users

### 2. Flow Runner (`/flows/[id]`)
- **Flow header** with name, description, and author
- **Model selection** with pricing comparison
- **Generated form** based on flow.json
- **Cost estimate** panel
- **Execution panel** with real-time status
- **Results display** with download options

### 3. Flow Library (`/flows`)
- **Search and filters** sidebar
- **Flow grid** with cards showing key info
- **Pagination** or infinite scroll
- **Sort options** (newest, most popular, lowest cost)

### 4. User Dashboard (`/dashboard`)
- **Overview cards** (balance, recent runs, spending)
- **Execution history** table with filters
- **Usage analytics** charts
- **Quick actions** (top-up, favorite flows)

### 5. Creator Dashboard (`/creator`)
- **Flow management** table
- **Analytics dashboard** with earnings and usage
- **New flow** creation wizard
- **Revenue tracking** with detailed breakdowns

## Component Architecture

### Core Components
```typescript
// Flow runner components
- FlowRunner: Main container component
- FlowForm: Auto-generated form from flow.json
- ModelSelector: Dropdown with pricing info
- CostEstimator: Real-time cost calculation
- ExecutionPanel: Status and progress display
- ResultsDisplay: Formatted output viewer

// Library components
- FlowCard: Individual flow display
- FlowFilters: Search and filter controls
- FlowGrid: Grid layout for flow cards
- FlowDetail: Detailed view modal/page

// Dashboard components
- DashboardCard: Metric display cards
- ExecutionHistory: Table with filters
- UsageChart: Analytics visualization
- CreditBalance: Balance display with top-up
```

### Form Generation
The frontend automatically generates forms from `flow.json` specifications:

```typescript
interface FlowParameter {
  name: string;
  type: 'string' | 'text' | 'number' | 'boolean' | 'url' | 'file' | 'json';
  required?: boolean;
  default?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
  ui?: {
    widget?: 'input' | 'textarea' | 'select' | 'checkbox' | 'file';
    placeholder?: string;
    help?: string;
  };
}
```

## Design System

### Colors
- **Primary**: Blue (#3B82F6) - actions, links, highlights
- **Secondary**: Indigo (#6366F1) - accents, secondary actions
- **Success**: Green (#10B981) - success states, positive metrics
- **Warning**: Orange (#F59E0B) - warnings, cost alerts
- **Error**: Red (#EF4444) - errors, failures
- **Gray**: Neutral grays for text and backgrounds

### Typography
- **Headings**: Inter font family, font-semibold to font-bold
- **Body**: Inter font family, font-normal
- **Code**: JetBrains Mono for JSON/code display
- **Scale**: text-xs to text-4xl following Tailwind scale

### Spacing
- **Page margins**: px-4 md:px-6 lg:px-8
- **Component spacing**: space-y-4 to space-y-8
- **Card padding**: p-4 to p-6
- **Form spacing**: space-y-4 for form fields

## State Management

### Global State (Zustand)
```typescript
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  credits: number;
  
  // Flow state
  flows: FlowMetadata[];
  currentFlow: FlowSpec | null;
  executionHistory: FlowExecution[];
  
  // UI state
  isLoading: boolean;
  errors: string[];
  
  // Actions
  setUser: (user: User) => void;
  updateCredits: (credits: number) => void;
  addExecution: (execution: FlowExecution) => void;
  setError: (error: string) => void;
  clearErrors: () => void;
}
```

### Form State (React Hook Form)
Each flow form uses React Hook Form with Zod validation:

```typescript
const formSchema = z.object({
  // Generated from flow.json inputs
  text: z.string().min(1, "Text is required"),
  num_clusters: z.number().min(2).max(20).default(5),
  language: z.enum(["en", "es", "fr", "de", "auto"]).default("en"),
});

type FormData = z.infer<typeof formSchema>;
```

## Authentication Flow

### Supabase Auth Integration
- **Sign up**: Email + password or OAuth (Google, GitHub)
- **Sign in**: Email + password or magic link
- **Session management**: Automatic token refresh
- **Protected routes**: Middleware for authenticated pages
- **User profile**: Stored in Supabase with additional fields

### Credit System
- **Initial credits**: 100 free credits on signup
- **Top-up**: Stripe integration for credit purchases
- **Usage tracking**: Deduct credits after successful execution
- **Balance display**: Real-time updates across the app

## Error Handling

### API Errors
- **Network errors**: Retry with exponential backoff
- **Validation errors**: Display field-specific messages
- **Server errors**: Show user-friendly error messages
- **Rate limiting**: Show wait time and retry option

### Form Validation
- **Real-time validation**: As user types (debounced)
- **Submit validation**: Before API calls
- **Error display**: Inline with form fields
- **Success feedback**: Confirmation messages

## Performance Optimizations

### Loading States
- **Skeleton screens**: For flow library and dashboard
- **Spinner components**: For form submissions
- **Progress bars**: For long-running executions
- **Optimistic updates**: For immediate feedback

### Caching
- **Flow metadata**: Cache in localStorage
- **User preferences**: Persist across sessions
- **API responses**: Cache with appropriate TTL
- **Static assets**: CDN with long cache headers

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
NEXT_PUBLIC_API_BASE_URL=https://api.closedai.com
```

### Build Process
1. **Type checking**: `tsc --noEmit`
2. **Linting**: `eslint . --fix`
3. **Testing**: `npm test`
4. **Build**: `npm run build`
5. **Deploy**: To Vercel or similar platform

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb config with custom rules
- **Prettier**: Consistent formatting
- **Import order**: React, libraries, components, utils

### Testing
- **Unit tests**: Jest + React Testing Library
- **Integration tests**: API endpoints
- **E2E tests**: Playwright for critical flows
- **Coverage**: Minimum 80% for components

### File Structure
```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable components
├── lib/             # Utilities and configurations
├── hooks/           # Custom React hooks
├── store/           # Zustand stores
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
└── styles/          # CSS and Tailwind config
```

## Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables**
4. **Run development server**: `npm run dev`
5. **Open browser**: `http://localhost:3000`

## API Integration

The frontend communicates with the CLOSED AI backend through RESTful APIs:

- **Base URL**: `https://api.closedai.com/v1`
- **Authentication**: Bearer token in headers
- **Content-Type**: `application/json`
- **Error format**: Standard HTTP status codes with JSON error objects

## Future Enhancements

### Phase 2 Features
- **Flow builder**: Visual drag-and-drop interface
- **Team collaboration**: Share flows within organizations
- **Advanced analytics**: Detailed usage insights
- **Custom themes**: User-configurable UI themes

### Phase 3 Features
- **Mobile app**: React Native companion
- **Webhooks**: Trigger flows from external systems
- **Monitoring**: Real-time flow health dashboards
- **A/B testing**: Compare flow performance

This specification provides a comprehensive foundation for building the CLOSED AI frontend. The modular architecture allows for incremental development while maintaining consistency across the platform. 