# MedHome Frontend

## 🎯 Frontend Purpose

The MedHome frontend is a React-based single-page application that provides the user interface for the medical education platform. It serves multiple user types:

- **Public Users**: Browse courses, read blogs, and access general information
- **Students**: Enroll in courses, access learning content, and interact with AI assistants
- **Instructors**: Create and manage courses, content, and student enrollments
- **Administrators**: Full platform management including user management, analytics, and system configuration

The frontend communicates with the backend API to provide a seamless, responsive user experience with real-time features and AI-powered assistance.

## 🚀 Setup & Running

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation
```bash
cd frontend
npm install
```

### Environment Configuration
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Development Server
```bash
npm run dev
```
The application will be available at http://localhost:5173

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Folder Structure

```
src/
├── components/              # Reusable UI components
│   ├── auth/               # Authentication components
│   │   ├── LoginForm.tsx   # User login form
│   │   └── RegisterForm.tsx # User registration form
│   ├── blog/               # Blog-related components
│   │   ├── BlogCard.tsx    # Blog post preview card
│   │   ├── BlogEditor.tsx  # Rich text blog editor
│   │   └── BlogHeader.tsx  # Blog page header
│   ├── common/             # Shared components
│   │   ├── Header.tsx      # Main navigation header
│   │   ├── MedicalAIBot.tsx # Public AI chat bot
│   │   └── CourseAIBot.tsx # Course-specific AI assistant
│   ├── course/             # Course-related components
│   │   ├── CourseSidebar.tsx # Course navigation sidebar
│   │   ├── CustomVideoPlayer.tsx # Video player component
│   │   ├── PDFViewer.tsx   # PDF document viewer
│   │   └── EnrollmentModal.tsx # Course enrollment modal
│   ├── enrollment/         # Enrollment management
│   ├── forms/              # Form components
│   ├── layout/             # Layout components
│   │   ├── MainLayout.tsx  # Admin dashboard layout
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   └── CourseContentManager.tsx # Course content management
│   └── ui/                 # Base UI components
├── pages/                  # Page components
│   ├── admin/              # Admin-only pages
│   │   ├── AdminDashboard.tsx # Main admin dashboard
│   │   ├── CourseManagementPage.tsx # Course management
│   │   ├── UsersListPage.tsx # User management
│   │   └── blog/           # Blog management pages
│   ├── student/            # Student-specific pages
│   │   ├── MyCoursesPage.tsx # Student's enrolled courses
│   │   └── PaymentsPage.tsx # Payment history
│   ├── blog/               # Public blog pages
│   ├── medicMaterial/      # Medical marketing pages
│   ├── AuthPage.tsx        # Authentication page
│   ├── HomePage.tsx        # Landing page
│   └── CourseDetailPage.tsx # Course information page
├── services/               # API service functions
│   ├── courseService.ts    # Course-related API calls
│   ├── authService.ts      # Authentication API calls
│   ├── blogService.ts      # Blog-related API calls
│   └── aiChatService.ts    # AI chat functionality
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication state management
├── hooks/                  # Custom React hooks
│   └── useInstructors.ts   # Instructor data hook
├── types/                  # TypeScript type definitions
│   ├── auth.ts             # Authentication types
│   ├── course.ts           # Course-related types
│   └── enrollment.ts       # Enrollment types
├── utils/                  # Utility functions
│   ├── axios.ts            # HTTP client configuration
│   ├── authUtils.ts        # Authentication utilities
│   └── courseTransformations.ts # Data transformation helpers
├── config/                 # Configuration files
│   └── cloudflare.ts       # Cloudflare video configuration
├── assets/                 # Static assets
├── App.tsx                 # Main application component
└── main.tsx               # Application entry point
```

## 🔧 Key Components

### Authentication System
- **AuthContext**: Manages user authentication state across the application
- **LoginForm/RegisterForm**: Handle user authentication and registration
- **ProtectedRoute**: Route wrapper for authenticated-only pages

### Course Management
- **CourseSidebar**: Navigation for course content with progress tracking
- **CustomVideoPlayer**: Enhanced video player with Cloudflare integration
- **PDFViewer**: Document viewer for course materials
- **CourseContentManager**: Admin interface for managing course content

### AI Integration
- **MedicalAIBot**: Public AI chat bot for general inquiries
- **CourseAIBot**: Course-specific AI assistant for enrolled students
- Both components integrate with Google Gemini API for intelligent responses

### Admin Dashboard
- **MainLayout**: Consistent admin interface layout
- **Sidebar**: Navigation for admin features
- **AdminDashboard**: Analytics and overview for administrators

### Blog System
- **BlogEditor**: Rich text editor using TipTap for blog creation
- **BlogCard**: Preview component for blog listings
- **BlogHeader**: Consistent blog page styling

## 🎨 UI/UX Guidelines

### Color Scheme
- **Primary**: `#3390CE` (Blue)
- **Secondary**: `#E5CA2C` (Yellow)
- **Background**: `#EDEDED` (Light Gray)
- **Neutral Scale**: 100-900 (Lightest to Darkest)

### Layout Components
- **Admin Pages**: Must use `MainLayout` component
- **Public Medical Pages**: Use `MedicMenu` and `MedicFooter`
- **Course Pages**: Use `CourseSidebar` for navigation

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

## 🔌 API Integration

### HTTP Client
- Uses Axios for API communication
- Configured with interceptors for authentication
- Base URL: `VITE_API_URL` environment variable

### State Management
- **React Query**: Server state management for API data
- **React Context**: Client state (authentication, UI state)
- **Local Storage**: Persistent user preferences

### Real-time Features
- Polling for real-time updates
- WebSocket-like patterns for chat functionality
- Optimistic updates for better UX

## 🧪 Development Tools

### Code Quality
- **ESLint**: Code linting with TypeScript support
- **TypeScript**: Static type checking
- **Prettier**: Code formatting (via ESLint)

### Development Experience
- **Vite**: Fast development server with HMR
- **React Query DevTools**: API state debugging
- **React DevTools**: Component debugging

### Testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Responsive images with proper formats
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: React Query caching for API responses
- **Lazy Loading**: Components loaded on demand

## 🔒 Security Considerations

- **JWT Storage**: Secure token storage in memory
- **Input Validation**: Client-side validation with React Hook Form
- **XSS Prevention**: Sanitized content rendering
- **CSRF Protection**: Token-based CSRF protection
- **Environment Variables**: Sensitive data in environment variables only
