# Architecture Documentation

## Overview

DeciFlow Frontend is a modern, scalable web application built with Nuxt 3 and Vue 3, following best practices for enterprise-grade applications. The architecture emphasizes type safety, testability, and maintainability.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Client)                       │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐      │
│  │   Pages    │  │ Components │  │   Layouts    │      │
│  └──────┬─────┘  └──────┬─────┘  └──────┬───────┘      │
│         │               │                 │              │
│         └───────────────┼─────────────────┘              │
│                         │                                │
│              ┌──────────▼──────────┐                     │
│              │    Composables      │                     │
│              │  (useApi, useAuth)  │                     │
│              └──────────┬──────────┘                     │
│                         │                                │
│              ┌──────────▼──────────┐                     │
│              │   Pinia Stores      │                     │
│              │  (State Management) │                     │
│              └──────────┬──────────┘                     │
└─────────────────────────┼─────────────────────────────┘
                          │
                          │ HTTP/REST
                          │
┌─────────────────────────▼─────────────────────────────┐
│              Laravel Backend API                       │
│         (http://localhost:8000/api)                   │
└───────────────────────────────────────────────────────┘
```

## Core Architectural Patterns

### 1. Component-Based Architecture

The application follows a hierarchical component structure:

- **Pages**: Route-level components (file-based routing)
- **Layouts**: Wrapper components for page templates
- **Components**: Reusable UI components organized by domain
- **Composables**: Reusable logic and state (Vue Composition API)

### 2. State Management (Pinia)

Centralized state management using Pinia stores:

**Auth Store** (`stores/auth.ts`)
- User authentication state
- Token management
- User profile data
- Login/logout actions

**Request Store** (`stores/request.ts`)
- Request list management
- Request filtering and pagination
- CRUD operations for requests

### 3. API Layer

**Composable-Based API Client** (`composables/useApi.ts`)

```typescript
const api = useApi()

// Automatic token injection
// Error handling
// Response transformation
const { data, error } = await api.get('/requests')
```

Benefits:
- Centralized error handling
- Automatic authentication
- Type-safe requests and responses
- Retry logic for failed requests

### 4. Type System

Strong TypeScript typing throughout the application:

```
types/
├── api.ts          # API response types
├── auth.ts         # Authentication types
├── request.ts      # Request/Approval types
└── user.ts         # User types
```

Benefits:
- Compile-time error detection
- IntelliSense support
- Refactoring safety
- Self-documenting code

### 5. Routing & Navigation

**File-Based Routing** (Nuxt 3 convention)

```
pages/
├── index.vue                    → /
├── login.vue                    → /login
├── dashboard.vue                → /dashboard
├── requests/
│   ├── index.vue               → /requests
│   ├── new.vue                 → /requests/new
│   └── [id]/
│       ├── index.vue           → /requests/:id
│       └── edit.vue            → /requests/:id/edit
└── approvals/
    └── inbox.vue               → /approvals/inbox
```

**Route Protection** (Middleware)

- `auth.ts`: Requires authentication
- `guest.ts`: Redirects authenticated users
- `role.ts`: Role-based access control

### 6. Form Handling

Naive UI form components with reactive validation:

```vue
<script setup lang="ts">
const formRef = ref()
const formValue = ref({ title: '', amount: 0 })
const rules = {
  title: { required: true, message: 'Required' },
  amount: { type: 'number', required: true }
}

const handleSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      // Submit logic
    }
  })
}
</script>
```

## Project Structure

```
deciflow-frontend/
├── .github/
│   └── workflows/           # CI/CD configuration
├── .nuxt/                   # Build output (generated)
├── assets/
│   └── css/
│       └── main.css        # Global styles, Tailwind imports
├── components/
│   ├── admin/              # Admin-specific components
│   │   ├── RuleForm.vue
│   │   └── UserList.vue
│   ├── approval/           # Approval workflow
│   │   ├── ApprovalInbox.vue
│   │   └── ApprovalTimeline.vue
│   ├── attachment/         # File management
│   │   ├── AttachmentList.vue
│   │   └── FileUpload.vue
│   ├── auth/               # Authentication
│   │   └── LoginForm.vue
│   ├── common/             # Shared components
│   │   ├── AppHeader.vue
│   │   └── AppSidebar.vue
│   ├── request/            # Request management
│   │   ├── RequestCard.vue
│   │   ├── RequestForm.vue
│   │   ├── RequestList.vue
│   │   └── RequestStatusBadge.vue
│   └── ui/                 # Reusable UI primitives
│       └── PageHeader.vue
├── composables/
│   ├── useApi.ts           # API client wrapper
│   ├── useAuth.ts          # Authentication logic
│   └── useToast.ts         # Toast notifications
├── layouts/
│   ├── default.vue         # Main app layout (header + sidebar)
│   └── blank.vue           # Minimal layout (login page)
├── middleware/
│   ├── auth.ts             # Auth guard
│   ├── guest.ts            # Guest-only guard
│   └── role.ts             # Role-based guard
├── pages/                  # File-based routing
├── plugins/
│   ├── auth-hydrate.client.ts  # Restore auth on page load
│   ├── i18n.ts                 # Internationalization
│   └── naive-ui.ts             # UI library config
├── public/                 # Static assets
├── stores/
│   ├── auth.ts
│   └── request.ts
├── tests/
│   ├── component/          # Vitest component tests
│   └── e2e/                # Playwright E2E tests
├── types/                  # TypeScript definitions
├── utils/                  # Helper functions
├── nuxt.config.ts          # Nuxt configuration
├── playwright.config.ts    # Playwright configuration
├── tailwind.config.ts      # Tailwind configuration
└── vitest.config.ts        # Vitest configuration
```

## Data Flow

### 1. Page Load Flow

```
1. User navigates to /requests
2. Middleware (auth.ts) checks authentication
3. Page component mounts
4. Composable (useApi) fetches data
5. Data stored in Pinia store (optional)
6. Component renders with data
```

### 2. Form Submission Flow

```
1. User fills form and clicks submit
2. Form validation runs
3. API composable sends request
   → POST /api/v1/requests
4. Backend processes request
5. Response returns
6. Success: Redirect to detail page
   Error: Display error message
7. Pinia store updated (if needed)
```

### 3. Authentication Flow

```
1. User submits login form
2. POST /api/v1/auth/login
3. Backend returns token + user data
4. Store token in localStorage
5. Update auth store (user, isAuthenticated)
6. Redirect to dashboard
7. Subsequent requests include token header
```

## Design Patterns

### Composition API Pattern

All components use Vue 3 Composition API for better type inference and code reuse:

```typescript
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Reactive state
const count = ref(0)

// Computed properties
const doubleCount = computed(() => count.value * 2)

// Methods
const increment = () => {
  count.value++
}

// Lifecycle
onMounted(() => {
  console.log('Component mounted')
})
</script>
```

### Composable Pattern

Reusable logic extracted into composables:

```typescript
// composables/useApi.ts
export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const request = async (url: string, options = {}) => {
    return await $fetch(url, {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      ...options
    })
  }

  return { get, post, put, delete: del }
}
```

### Smart/Presentational Component Pattern

- **Smart Components** (Container): Handle data fetching and business logic
- **Presentational Components** (Dumb): Receive props, emit events, pure UI

```vue
<!-- Smart: pages/requests/index.vue -->
<script setup>
const { data: requests } = await useApi().get('/requests')
</script>

<template>
  <RequestList :requests="requests" @refresh="fetchRequests" />
</template>

<!-- Presentational: components/request/RequestList.vue -->
<script setup>
defineProps<{ requests: Request[] }>()
defineEmits<{ refresh: [] }>()
</script>
```

## Performance Optimizations

### 1. Code Splitting

- Automatic route-based code splitting (Nuxt)
- Lazy-loaded components for modals and heavy UI

### 2. Caching Strategy

- API response caching with `useFetch`
- LocalStorage for authentication token
- Pinia state persistence (optional)

### 3. Build Optimizations

- Tree-shaking unused code
- CSS purging with Tailwind
- Image optimization
- Minification and compression

## Security Considerations

### 1. XSS Prevention

- Vue automatic escaping
- Sanitization of user input
- Content Security Policy headers

### 2. CSRF Protection

- Token-based authentication (no cookies)
- CORS configuration

### 3. Authentication

- JWT tokens stored in localStorage
- Automatic token expiration handling
- Secure token transmission (HTTPS in production)

## Testing Strategy

### 1. Unit Tests (Vitest)

- Individual functions and utilities
- Composable logic
- Store actions

### 2. Component Tests (Vitest + Vue Test Utils)

- Component rendering
- User interactions
- Props and events
- Computed properties

### 3. E2E Tests (Playwright)

- Complete user workflows
- Cross-browser testing
- Backend integration tests
- Visual regression testing (optional)

## Deployment Architecture

```
┌──────────────────────┐
│   GitHub Repository   │
└──────────┬───────────┘
           │ git push
           ▼
┌──────────────────────┐
│   GitHub Actions     │
│   (CI/CD Pipeline)   │
│                      │
│  - Lint & Type Check │
│  - Component Tests   │
│  - E2E Tests         │
│  - Build Production  │
└──────────┬───────────┘
           │ deploy
           ▼
┌──────────────────────┐
│   Vercel / Netlify   │
│   (Static Hosting)   │
└──────────────────────┘
```

## Future Enhancements

1. **Server-Side Rendering (SSR)**: Enable Nuxt SSR for SEO and performance
2. **Progressive Web App (PWA)**: Add offline support and app-like experience
3. **Real-Time Updates**: WebSocket integration for live notifications
4. **State Persistence**: LocalStorage sync for Pinia stores
5. **Performance Monitoring**: Sentry integration for error tracking
6. **Analytics**: User behavior tracking with Google Analytics

## Related Documentation

- [Component Library](./COMPONENTS.md)
- [Testing Guide](./TESTING.md)
- [Deployment Guide](./DEPLOYMENT.md)
