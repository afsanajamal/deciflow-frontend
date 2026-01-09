# DeciFlow Frontend

Modern Purchase Request Management System - Frontend Application

[![Tests](https://github.com/afsanajamal/deciflow-frontend/actions/workflows/test.yml/badge.svg)](https://github.com/afsanajamal/deciflow-frontend/actions/workflows/test.yml)

## Features

- **User Authentication** - Secure token-based login with Laravel Sanctum integration
- **Role-Based Interface** - Customized dashboards for Requesters, Approvers, Dept Admins, and Super Admins
- **Request Management** - Create, edit, submit, and track purchase requests with real-time updates
- **Approval Workflows** - Interactive approval inbox with timeline visualization and comment system
- **File Attachments** - Upload and manage supporting documents with file type validation
- **Audit Trail** - Complete request history with status tracking and user actions
- **Internationalization** - Multi-language support (English/Japanese)

## Tech Stack

**Framework & Core**
- Nuxt 3 (Vue 3) - Full-stack framework with SSR support
- TypeScript - Type-safe development
- Vite - Fast build tool and dev server

**UI & Styling**
- Naive UI - Vue 3 component library
- Tailwind CSS - Utility-first CSS framework
- Vicons - Icon system (Ionicons 5)

**State & Data**
- Pinia - Vue state management
- Day.js - Date/time manipulation
- Vue I18n - Internationalization

**Testing & Quality**
- Vitest - Unit and component testing (76 tests)
- Playwright - E2E testing (20 tests)
- Vue Test Utils - Component testing utilities
- ESLint - Code linting
- TypeScript - Static type checking

**DevOps**
- GitHub Actions - CI/CD pipeline with automated testing

## Documentation

Detailed guides available in the [docs](./docs) directory:

- [Architecture](./docs/ARCHITECTURE.md) - System design and patterns
- [Components](./docs/COMPONENTS.md) - Component library and usage
- [Testing](./docs/TESTING.md) - Testing strategy and guidelines
- [Deployment](./docs/DEPLOYMENT.md) - Deployment instructions

## Requirements

- Node.js 20+
- npm or yarn package manager
- [DeciFlow Backend](https://github.com/afsanajamal/deciflow-backend) running on http://localhost:8000

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/afsanajamal/deciflow-frontend.git
cd deciflow-frontend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Configure NUXT_PUBLIC_API_BASE=http://localhost:8000/api

# 4. Start development server
npm run dev
```

Application available at: http://localhost:3000

## Demo Accounts

All passwords: `password`

| Role | Email | Access Level |
|------|-------|-------------|
| **Super Admin** | superadmin@deciflow.com | Full system access, rule management |
| **Dept Admin** | deptadmin@deciflow.com | Department oversight, approvals |
| **Approver** | approver@deciflow.com | Request approvals, comments |
| **Requester** | requester@deciflow.com | Create and track requests |

## Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm run test              # Unit/component tests (watch mode)
npm run test:run          # Unit/component tests (single run)
npm run e2e               # E2E tests with Playwright
npm run e2e:ui            # E2E tests with UI

# Code quality
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues
npm run type-check        # TypeScript type checking

# Build
npm run build             # Production build
npm run preview           # Preview production build
```

## Key Features

### Request Management
- Create and submit purchase requests with rich form validation
- Draft saving with auto-save functionality
- Request categorization (Software, Equipment, Services, Travel, Other)
- Urgency levels (Low, Normal, High, Critical)
- Amount-based approval routing

### Approval Workflow
- Inbox view for pending approvals
- One-click approve/reject with comments
- Multi-level approval chain visualization
- Real-time status updates
- Email notifications on state changes

### File Attachments
- Upload supporting documents (invoices, quotes, etc.)
- File type validation (PDF, images, documents)
- Size limit: 10MB per file
- Download and delete functionality

### Admin Features
- Approval rule configuration
- User management
- Audit log viewing
- System statistics dashboard

## Testing

The project includes comprehensive test coverage:

- **Component Tests** (76 tests): Vitest + Vue Test Utils
  - RequestStatusBadge, RequestCard, AttachmentList
  - ApprovalTimeline, FileUpload components

- **E2E Tests** (20 tests): Playwright
  - Authentication flows
  - Request creation and management
  - Approval workflows with full backend integration

Run all tests locally:
```bash
# Unit/Component tests
npm run test

# E2E tests (requires backend running)
npm run e2e
```

CI/CD automatically runs all tests on every push with full-stack integration.

## Project Structure

```
deciflow-frontend/
├── assets/              # Styles and static assets
├── components/          # Vue components
│   ├── admin/          # Admin-only components
│   ├── approval/       # Approval workflow components
│   ├── attachment/     # File upload/management
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   ├── request/        # Request-related components
│   └── ui/             # Reusable UI components
├── composables/         # Vue composables (auto-imported)
│   ├── useApi.ts       # API client wrapper
│   └── useAuth.ts      # Authentication logic
├── layouts/             # Layout components
│   ├── default.vue     # Main authenticated layout
│   └── blank.vue       # Minimal layout (login)
├── middleware/          # Route middleware
│   ├── auth.ts         # Authentication guard
│   └── role.ts         # Role-based access
├── pages/               # File-based routing
│   ├── admin/          # Admin pages
│   ├── approvals/      # Approval pages
│   ├── requests/       # Request management
│   ├── dashboard.vue   # Main dashboard
│   └── login.vue       # Login page
├── plugins/             # Nuxt plugins
│   ├── auth-hydrate.client.ts
│   └── naive-ui.ts
├── stores/              # Pinia stores
│   ├── auth.ts         # Auth state
│   └── request.ts      # Request state
├── tests/               # Test files
│   ├── component/      # Component tests
│   └── e2e/            # E2E tests
├── types/               # TypeScript types
│   ├── api.ts          # API response types
│   ├── auth.ts         # Auth types
│   └── request.ts      # Request types
└── utils/               # Utility functions
```

## Environment Variables

```env
# API Configuration
NUXT_PUBLIC_API_BASE=http://localhost:8000/api

# App Configuration
NUXT_PUBLIC_APP_NAME=DeciFlow
```

## CI/CD

The project uses GitHub Actions for continuous integration:

- **Component Tests**: Automated unit and component testing
- **E2E Tests**: Full-stack integration tests with MySQL + Laravel backend
- **Linting**: Code quality checks with ESLint
- **Type Checking**: TypeScript validation

All tests run on every push and pull request.

## Integration with Backend

The frontend connects to the [DeciFlow Backend](https://github.com/afsanajamal/deciflow-backend) Laravel API.

**API Endpoints:**
- Authentication: `/api/v1/auth/*`
- Requests: `/api/v1/requests/*`
- Approvals: `/api/v1/approvals/*`
- Admin: `/api/v1/admin/*`

See the [backend API documentation](https://github.com/afsanajamal/deciflow-backend/blob/main/docs/API_DOCUMENTATION.md) for detailed endpoint specifications.

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [DeciFlow Backend](https://github.com/afsanajamal/deciflow-backend) - Laravel API backend
