# Component Library Documentation

## Overview

DeciFlow Frontend uses a component-based architecture with reusable Vue 3 components organized by domain. All components follow the Composition API pattern and are fully typed with TypeScript.

## Component Organization

```
components/
├── admin/           # Admin-specific components
├── approval/        # Approval workflow components
├── attachment/      # File management components
├── auth/            # Authentication components
├── common/          # Shared layout components
├── request/         # Request management components
└── ui/              # Reusable UI primitives
```

## Core Components

### Request Components

#### RequestCard

Displays a summary card for a purchase request.

**Location**: `components/request/RequestCard.vue`

**Props**:
- `request`: Request object
- `clickable`: boolean (default: true)

**Events**:
- `click`: Emitted when card is clicked

**Usage**:
```vue
<RequestCard :request="request" @click="navigateToDetail" />
```

**Features**:
- Status badge with color coding
- Request metadata (title, amount, category)
- Urgency indicator
- Click navigation to detail page

---

#### RequestStatusBadge

Displays a color-coded status badge for request states.

**Location**: `components/request/RequestStatusBadge.vue`

**Props**:
- `status`: RequestStatus enum
- `size`: 'small' | 'medium' | 'large' (default: 'medium')

**Usage**:
```vue
<RequestStatusBadge :status="request.status" size="small" />
```

**Status Colors**:
- DRAFT: Gray
- SUBMITTED: Blue
- IN_REVIEW: Yellow
- APPROVED: Green
- REJECTED: Red
- CANCELLED: Gray

---

#### RequestForm

Complex form for creating and editing purchase requests.

**Location**: `components/request/RequestForm.vue`

**Props**:
- `initialData`: Request (optional, for editing)
- `mode`: 'create' | 'edit'

**Events**:
- `submit`: Emitted with form data
- `cancel`: Emitted when user cancels

**Usage**:
```vue
<RequestForm
  :initial-data="existingRequest"
  mode="edit"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>
```

**Fields**:
- Title (required)
- Description (required)
- Category (dropdown)
- Amount (number input)
- Urgency (dropdown)
- Vendor name
- Vendor email
- Justification

**Validation**:
- Required field validation
- Email format validation
- Amount range validation
- Custom error messages

---

#### RequestList

Paginated list of requests with filtering and sorting.

**Location**: `components/request/RequestList.vue`

**Props**:
- `requests`: Request[]
- `loading`: boolean
- `pagination`: PaginationData

**Events**:
- `page-change`: Emitted with new page number
- `filter-change`: Emitted with filter params
- `refresh`: Emitted to reload data

**Usage**:
```vue
<RequestList
  :requests="requests"
  :loading="isLoading"
  :pagination="paginationData"
  @page-change="handlePageChange"
/>
```

**Features**:
- Filter by status, category, urgency
- Search by title/description
- Sort by date, amount, status
- Pagination controls
- Empty state handling

---

### Approval Components

#### ApprovalTimeline

Visual timeline of approval steps with status indicators.

**Location**: `components/approval/ApprovalTimeline.vue`

**Props**:
- `steps`: ApprovalStep[]
- `currentStep`: number

**Usage**:
```vue
<ApprovalTimeline :steps="approvalSteps" :current-step="2" />
```

**Features**:
- Step indicators (pending, approved, rejected)
- Approver information
- Approval dates
- Comments display
- Timeline visualization

---

#### ApprovalActions

Action buttons for approving/rejecting requests.

**Location**: `components/approval/ApprovalActions.vue`

**Props**:
- `requestId`: number
- `canApprove`: boolean
- `canReject`: boolean

**Events**:
- `approved`: Emitted after successful approval
- `rejected`: Emitted after successful rejection

**Usage**:
```vue
<ApprovalActions
  :request-id="request.id"
  :can-approve="userCanApprove"
  @approved="handleApproval"
/>
```

**Features**:
- Approve/reject buttons
- Comment modal
- Confirmation dialogs
- Loading states
- Error handling

---

### Attachment Components

#### AttachmentList

Displays and manages file attachments for a request.

**Location**: `components/attachment/AttachmentList.vue`

**Props**:
- `requestId`: number
- `canDelete`: boolean (default: false)

**Events**:
- `deleted`: Emitted after file deletion

**Usage**:
```vue
<AttachmentList :request-id="request.id" :can-delete="canEdit" />
```

**Features**:
- File list with metadata (name, size, uploader, date)
- Download functionality
- Delete functionality (if permitted)
- File type icons
- Empty state
- Loading states

**Tests**: 20 test cases in `AttachmentList.test.ts`

---

#### FileUpload

File upload component with drag-and-drop support.

**Location**: `components/attachment/FileUpload.vue`

**Props**:
- `requestId`: number
- `maxSize`: number (default: 10MB)
- `acceptedTypes`: string[]

**Events**:
- `uploaded`: Emitted after successful upload
- `error`: Emitted on upload failure

**Usage**:
```vue
<FileUpload
  :request-id="request.id"
  :max-size="10485760"
  :accepted-types="['pdf', 'jpg', 'png']"
  @uploaded="handleUpload"
/>
```

**Features**:
- Drag-and-drop upload
- File type validation
- Size limit validation
- Upload progress indicator
- Multiple file selection
- Preview for images

**Tests**: 16 test cases in `FileUpload.test.ts`

---

### Common Components

#### AppHeader

Main application header with navigation and user menu.

**Location**: `components/common/AppHeader.vue`

**Features**:
- Logo and branding
- Navigation links
- User profile dropdown
- Logout functionality
- Responsive menu

---

#### AppSidebar

Side navigation menu for main app sections.

**Location**: `components/common/AppSidebar.vue`

**Features**:
- Role-based menu items
- Active route highlighting
- Collapsible on mobile
- Icon + label navigation

**Menu Items**:
- Dashboard
- Requests (all users)
- Approvals (approvers only)
- Admin (admins only)

---

#### PageHeader

Reusable page header with breadcrumbs and actions.

**Location**: `components/ui/PageHeader.vue`

**Props**:
- `title`: string
- `breadcrumbs`: Breadcrumb[]
- `actions`: Action[]

**Usage**:
```vue
<PageHeader
  title="Purchase Requests"
  :breadcrumbs="[{ label: 'Home', to: '/' }, { label: 'Requests' }]"
  :actions="[{ label: 'New Request', onClick: createRequest }]"
/>
```

---

### Admin Components

#### RuleForm

Form for creating and editing approval rules.

**Location**: `components/admin/RuleForm.vue`

**Props**:
- `initialData`: ApprovalRule (optional)

**Events**:
- `submit`: Emitted with form data
- `cancel`: Emitted when cancelled

**Fields**:
- Amount min/max threshold
- Required role
- Step order
- Auto-approval conditions

---

#### UserList

List of users with role management.

**Location**: `components/admin/UserList.vue`

**Features**:
- User table with filtering
- Role assignment
- User activation/deactivation
- Pagination

---

## Component Patterns

### Props Definition

Use TypeScript interfaces for props:

```typescript
interface Props {
  request: Request
  loading?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  size: 'medium'
})
```

### Events Definition

Define events with TypeScript:

```typescript
interface Emits {
  submit: [data: FormData]
  cancel: []
}

const emit = defineEmits<Emits>()

// Usage
emit('submit', formData)
```

### Async Data Fetching

Use composables for data fetching:

```vue
<script setup lang="ts">
const api = useApi()
const { data: requests, pending, error } = await useLazyAsyncData(
  'requests',
  () => api.get('/requests')
)
</script>
```

### Form Validation

Use Naive UI form validation:

```vue
<script setup lang="ts">
const formRef = ref()
const formValue = ref({})

const rules = {
  title: {
    required: true,
    message: 'Title is required',
    trigger: 'blur'
  },
  amount: {
    type: 'number',
    required: true,
    message: 'Amount must be a number',
    trigger: 'input'
  }
}

const handleSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      // Submit
    }
  })
}
</script>

<template>
  <n-form ref="formRef" :model="formValue" :rules="rules">
    <n-form-item path="title" label="Title">
      <n-input v-model:value="formValue.title" />
    </n-form-item>
  </n-form>
</template>
```

## Testing Components

All components should have corresponding test files in `tests/component/`.

### Example Component Test

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import RequestStatusBadge from '~/components/request/RequestStatusBadge.vue'

describe('RequestStatusBadge', () => {
  it('renders with correct status', () => {
    const wrapper = mount(RequestStatusBadge, {
      props: { status: 'APPROVED' }
    })

    expect(wrapper.text()).toContain('Approved')
    expect(wrapper.classes()).toContain('status-approved')
  })

  it('changes color based on status', () => {
    const wrapper = mount(RequestStatusBadge, {
      props: { status: 'REJECTED' }
    })

    expect(wrapper.classes()).toContain('status-rejected')
  })
})
```

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Proper semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Screen reader compatibility

### Example Accessible Component

```vue
<template>
  <button
    :aria-label="ariaLabel"
    :aria-pressed="isPressed"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <slot />
  </button>
</template>
```

## Styling

Components use a combination of Tailwind CSS and Naive UI styling:

```vue
<template>
  <!-- Tailwind utility classes -->
  <div class="flex items-center gap-4 p-4 rounded-lg">
    <!-- Naive UI component -->
    <n-button type="primary" @click="handleClick">
      Submit
    </n-button>
  </div>
</template>
```

## Component Checklist

When creating a new component:

- [ ] TypeScript props and emits
- [ ] Proper prop defaults
- [ ] Accessible markup
- [ ] Responsive design
- [ ] Loading and error states
- [ ] Unit tests
- [ ] Documentation in this file
- [ ] Storybook story (if applicable)

## Related Documentation

- [Architecture](./ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)
