# DeciFlow Frontend

Purchase Request Management System - Frontend Application built with Nuxt 3

## Tech Stack

- **Framework**: Nuxt 3 (Vue 3)
- **Language**: TypeScript
- **State Management**: Pinia
- **UI Components**: Ant Design Vue
- **Styling**: Tailwind CSS (prefixed with `tw-`)
- **Testing**: Vitest (unit), Playwright (E2E), Vue Test Utils (component)
- **Localization**: Vue I18n (EN/JP - planned)
- **CI/CD**: GitHub Actions (planned)

## Prerequisites

- Node.js 20+
- npm or yarn
- DeciFlow Backend running on http://localhost:8000

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Prepare Nuxt
npm run postinstall
```

## Development

```bash
# Start dev server (http://localhost:3000)
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Run unit tests
npm test

# Run E2E tests (requires dev server running)
npm run e2e
```

## Project Structure

```
deciflow-frontend/
├── assets/           # Styles and static assets
├── components/       # Vue components
│   ├── common/      # Shared components
│   ├── request/     # Request-related components
│   ├── approval/    # Approval workflow components
│   ├── attachment/  # File upload components
│   ├── admin/       # Admin-only components
│   └── ui/          # Reusable UI components
├── composables/      # Vue composables (auto-imported)
├── layouts/          # Layout components
├── middleware/       # Route middleware
├── pages/            # File-based routing
├── plugins/          # Nuxt plugins
├── stores/           # Pinia stores
├── types/            # TypeScript types
└── utils/            # Utility functions
```

## Features Implemented (Phase 1 - Foundation)

✅ Project setup with Nuxt 3, TypeScript, Tailwind CSS
✅ Ant Design Vue integration
✅ Core TypeScript types (User, Request, Approval, etc.)
✅ Authentication system (login, logout, token management)
✅ Pinia store for auth state
✅ API integration layer (useApi composable)
✅ Route protection middleware (auth, guest, role-based)
✅ Login page with form validation
✅ Default layout with navigation
✅ Dashboard page

## Demo Accounts

All passwords: `password`

- **Super Admin**: superadmin@deciflow.com
- **Dept Admin**: deptadmin@deciflow.com
- **Approver**: approver@deciflow.com
- **Requester**: requester@deciflow.com

## Environment Variables

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
```

## API Integration

The frontend connects to the Laravel backend API. Ensure the backend is running before starting the frontend:

```bash
# In backend directory
php artisan serve
# API available at http://localhost:8000
```

## Next Steps (Phase 2+)

- [ ] Request management (create, edit, list, detail views)
- [ ] Approval workflow UI
- [ ] File attachments
- [ ] Admin features (rules, audit logs)
- [ ] Internationalization (EN/JP)
- [ ] Testing (unit, component, E2E)
- [ ] CI/CD pipeline

## License

ISC
