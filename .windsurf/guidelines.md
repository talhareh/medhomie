# MedHome Project Guidelines

## Project Overview
MedHome is a medical education platform with both frontend and backend components.It is a clone of udemy focused on advanced specialized medical certifications and courses

## Architecture
- Frontend: React/TypeScript application in `/frontend`
- Backend: Node.js/TypeScript server in `/backend`

## Code Style Guidelines
- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components modular and reusable

## File Structure
- Place new frontend pages in `/frontend/src/pages`
- Place shared components in `/frontend/src/components`
- Place backend routes in `/backend/src/routes`
- Keep utility functions in `/frontend/src/utils` or `/backend/src/utils`

## Best Practices
- Write unit tests for critical functionality
- Handle errors appropriately
- Use proper TypeScript types and interfaces
- Follow REST API conventions
- Keep components small and focused
- Use proper state management practices

## Git Workflow
- Write clear commit messages
- Create feature branches for new features
- Keep commits atomic and focused

## Security Guidelines
- Never expose sensitive credentials in code
- Validate all user inputs
- Use proper authentication and authorization
- Follow security best practices for medical data

## User Roles and Access Control
### User Roles
- **Admin**: Full system access, can manage all resources
  - Can create/edit/delete courses
  - Can manage all users
  - Can access analytics and system settings
- **Instructor**: Course management capabilities
  - Can create and manage their own courses
  - Can interact with enrolled students
  - Can view course analytics
- **Student**: Basic platform access
  - Can enroll in courses
  - Can view purchased courses
  - Can submit assignments and participate in discussions
- **Guest**: Limited public access
  - Can view course catalog
  - Can register/login
  - Can view public course previews

### Access Control Rules
- Use role-based middleware in `/backend/src/middleware/auth.ts`
- Protected routes should use `requireAuth` middleware
- Role-specific routes should use `requireRole` middleware
- Frontend routes in `/frontend/src/routes` should implement corresponding guards
- Use `hasPermission` utility for granular feature access
- Implement route protection in both frontend and backend

### API Security
- All protected endpoints must validate JWT tokens
- Role validation required for sensitive operations
- Rate limiting applied to public endpoints
- Sanitize all user inputs
- Log all access attempts for sensitive operations

## Course Structure
### Hierarchy
- **Course**: Top-level container
  - Title, description, thumbnail, price, category
  - Instructor information
  - Course requirements and objectives
  - Certificate details (if applicable)

- **Modules**: Main organizational units within a course
  - Sequential ordering (module 1, 2, 3, etc.)
  - Module title and description
  - Learning objectives
  - Estimated completion time

- **Lessons**: Individual learning units within modules
  - Video/text content
  - Attachments and resources
  - Quiz or assessment (optional)
  - Assignment submission (if applicable)

### Content Types
- **Video Lessons**
  - Maximum duration: 20 minutes
  - Must include captions/subtitles
  - Supported formats: MP4, WebM
  - Resolution: minimum 720p

- **Text Lessons**
  - Rich text content with markdown support
  - Code snippets (for technical content)
  - Images and diagrams
  - External references and links

- **Assessments**
  - Multiple choice questions
  - True/False questions
  - Short answer questions
  - File submission assignments
  - Practical exercises

### Progress Tracking
- Course progress tracked by completed lessons
- Module completion requirements
- Minimum passing score for assessments
- Certificate generation criteria

### Database Schema
- Courses stored in `courses` collection
- Modules stored in `modules` collection with `courseId` reference
- Lessons stored in `lessons` collection with `moduleId` reference
- Progress tracked in `userProgress` collection

# Mandatory Development Practices
1. ALWAYS read existing relevant files completely to the end before writing any new code
2. ALWAYS check existing files before creating new ones

## API and Frontend Guidelines
1. Always use axios.ts in frontend before creating API calls
2. When adding new features, notify if it will cause changes to other routes in the frontend
