# MedHome Project Contributing Guidelines

## UI/UX Consistency Guidelines

### Layout Components

#### Headers and Navigation
- **Always use existing header components** based on the page context:
  - For admin pages: Use `MainLayout` which includes the admin header and sidebar
  - For public medical pages: Use `MedicMenu` component
  - For blog pages: Use `BlogHeader` when appropriate (unless embedded in another layout)

#### Sidebar Navigation
- **Always use the appropriate sidebar** for the section you're working in:
  - Admin section: Use the sidebar provided by `MainLayout` 
  - Do not create custom sidebars unless absolutely necessary and approved

### Design System

#### Colors
- **Always use the color palette defined in `tailwind.config.js`**:
  - Primary: `#3390CE` - Use for primary buttons, links, and highlighted elements
  - Secondary: `#E5CA2C` - Use for secondary actions and accents
  - Background: `#EDEDED` - Use for page backgrounds
  - Neutral colors: Use the provided neutral color scale (100-900) for text and UI elements

```js
// Color palette reference
colors: {
  background: '#EDEDED',
  primary: '#3390CE',
  secondary: '#E5CA2C',
  neutral: {
    100: '#F5F5F5', // Lightest - use for backgrounds, cards
    200: '#E5E5E5', // Light borders, dividers
    300: '#D4D4D4', // Disabled elements
    400: '#A3A3A3', // Placeholder text
    500: '#737373', // Secondary text
    600: '#525252', // Body text
    700: '#404040', // Emphasized text
    800: '#262626', // Headings
    900: '#171717', // High emphasis text
  }
}
```

#### Typography
- Use the font families defined in the tailwind configuration
- Follow the established heading hierarchy

### Component Integration

#### Page Structure
- When creating new pages, follow the established pattern for that section:
  - Admin pages should be wrapped in `<MainLayout>` component
  - Public medical pages should use `MedicMenu` and `MedicFooter`
  - Blog pages should use appropriate blog-specific components

#### Component Reuse
- Before creating a new component, check if an existing one can be reused
- If modifying an existing component, ensure changes don't break its usage elsewhere

### Best Practices

#### Code Organization
- Keep related components in their appropriate directories
- Follow the established project structure

#### Responsive Design
- Ensure all new UI components work well on mobile, tablet, and desktop views
- Use Tailwind's responsive prefixes (sm:, md:, lg:, etc.) consistently

#### Accessibility
- Maintain proper contrast ratios using the color system
- Ensure interactive elements are keyboard accessible
- Use semantic HTML elements appropriately

By following these guidelines, we maintain a consistent user experience throughout the MedHome application.

## Lesson PDF Attachment Integration

### Frontend
- When a user clicks a lesson's PDF link, the handler now receives the full lesson object (not just an index or relying on state). This ensures the correct PDF always opens, even on the first click.
- The PDF URL is constructed as `/course-content/public/:courseId/modules/:moduleId/lessons/:lessonId/attachment` and is passed to the PDF viewer, which ensures the `/api` prefix is present for backend requests.
- See `CourseContentPage.tsx` and `LessonContent.tsx` for the handler logic.

### Backend
- The backend exposes a public GET route at `/api/course-content/public/:courseId/modules/:moduleId/lessons/:lessonId/attachment` (see `courseContentRoutes.ts`).
- The controller (`viewPdfAttachment`) serves the first PDF attachment for the lesson, with proper headers for inline viewing and CORS.
- No authentication is required for this route, but access control should be handled at a higher level (e.g., only enrolled users see the link in the UI).

### Maintenance Notes
- If you add support for multiple attachments per lesson, update both the frontend handler and backend controller to allow selecting which attachment to serve.
- Always ensure the frontend and backend URL structures match.
