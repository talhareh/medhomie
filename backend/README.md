# MedHome Backend API

## 🎯 Backend Purpose

The MedHome backend is a Node.js/Express API server that provides all the business logic, data management, and external service integrations for the medical education platform. It serves as the central hub for:

- **User Management**: Authentication, authorization, and user profile management
- **Course Management**: CRUD operations for courses, modules, lessons, and content
- **Enrollment System**: Student enrollment workflows and status management
- **Payment Processing**: Kuickpay integration for course purchases
- **Content Delivery**: File upload, storage, and streaming services
- **AI Integration**: AI chat functionality and external API integrations
- **Analytics**: Data aggregation and reporting for administrators
- **Communication**: Email services and WhatsApp integration

## 🚀 Setup & Running

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation
```bash
cd backend
npm install
```

### Environment Configuration
Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/medhome

# Authentication
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d

# Email Services
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Frontend/Backend URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Kuickpay
KUICKPAY_TOKEN_URL=https://testcheckout.kuickpay.com/api/KPToken
KUICKPAY_REDIRECTION_URL=https://testcheckout.kuickpay.com/api/Redirection
KUICKPAY_INSTITUTION_ID=your_institution_id
KUICKPAY_SECURED_KEY=your_secured_key
KUICKPAY_WEBHOOK_URL=http://localhost:5000/api/paypal/kuickpay/webhook

# WhatsApp Integration
WHATSAPP_WEBHOOK_SECRET=your_whatsapp_webhook_secret
WHATSAPP_VERIFY_TOKEN=your_whatsapp_verify_token

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Cloudflare (Optional)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in your `.env` file
3. The application will automatically create collections on first run

### Development Server
```bash
npm run dev
```
The API will be available at http://localhost:5000

### Production Build
```bash
npm run build
npm start
```

### Testing
```bash
npm test
npm run test:watch
npm run test:coverage
```

## 📁 Folder Structure

```
src/
├── controllers/             # Request handlers
│   ├── authController.ts    # Authentication logic
│   ├── courseController.ts  # Course management
│   ├── userController.ts    # User management
│   ├── enrollmentController.ts # Enrollment logic
│   ├── paymentController.ts # Payment processing
│   ├── blogController.ts    # Blog management
│   ├── quizController.ts    # Quiz functionality
│   ├── aiService.ts         # AI integration
│   └── whatsappController.ts # WhatsApp integration
├── models/                  # MongoDB schemas
│   ├── User.ts              # User model
│   ├── Course.ts            # Course model
│   ├── Enrollment.ts        # Enrollment model
│   ├── Payment.ts           # Payment model
│   ├── Blog.ts              # Blog model
│   ├── Quiz.ts              # Quiz model
│   └── WhatsappConversation.ts # WhatsApp model
├── routes/                  # API route definitions
│   ├── authRoutes.ts        # Authentication routes
│   ├── courseRoutes.ts      # Course routes
│   ├── userRoutes.ts        # User routes
│   ├── enrollmentRoutes.ts  # Enrollment routes
│   ├── paymentRoutes.ts     # Payment routes
│   ├── blogRoutes.ts        # Blog routes
│   ├── quizRoutes.ts        # Quiz routes
│   └── whatsappRoutes.ts    # WhatsApp routes
├── middleware/              # Custom middleware
│   ├── auth.ts              # JWT authentication
│   ├── validation.ts        # Request validation
│   └── errorHandler.ts      # Error handling
├── services/                # Business logic services
│   ├── emailService.ts      # Email functionality
│   └── aiService.ts         # AI service integration
├── utils/                   # Utility functions
│   ├── fileUpload.ts        # File upload utilities
│   ├── notification.ts      # Notification helpers
│   └── videoStreaming.ts    # Video streaming utilities
├── validators/              # Validation schemas
│   └── courseValidator.ts   # Course validation
├── types/                   # TypeScript type definitions
│   └── express.d.ts         # Express type extensions
├── config/                  # Configuration files
│   └── multer.ts            # File upload configuration
└── server.ts               # Main server file
```

## 🔌 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset
- `POST /verify-email` - Email verification

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /admin/users` - List all users (admin)
- `PUT /admin/users/:id` - Update user (admin)
- `DELETE /admin/users/:id` - Delete user (admin)

### Courses (`/api/courses`)
- `GET /` - List all courses
- `POST /` - Create course (admin/instructor)
- `GET /:id` - Get course details
- `PUT /:id` - Update course (admin/instructor)
- `DELETE /:id` - Delete course (admin)
- `POST /:id/content` - Add course content
- `GET /:id/content` - Get course content

### Enrollments (`/api/enrollments`)
- `POST /` - Enroll in course
- `GET /my-enrollments` - Get user enrollments
- `GET /admin/enrollments` - List all enrollments (admin)
- `PUT /admin/enrollments/:id` - Update enrollment status (admin)

### Payments (`/api/payments`)
- `POST /create-payment` - Create payment intent
- `POST /webhook` - PayPal webhook
- `GET /my-payments` - Get user payments
- `GET /admin/payments` - List all payments (admin)

### Kuickpay (`/api/paypal`)
- `POST /create-order/:courseId` - Create Kuickpay checkout order (authenticated)
- `POST /verify-payment` - Verify return signature and finalize payment (authenticated)
- `GET /order-status/:orderId` - Get Kuickpay order status (authenticated)
- `POST /kuickpay/webhook` - Kuickpay server-to-server webhook (public)

### Blogs (`/api/blogs`)
- `GET /` - List all blogs
- `POST /` - Create blog (admin)
- `GET /:id` - Get blog details
- `PUT /:id` - Update blog (admin)
- `DELETE /:id` - Delete blog (admin)

### AI Chat (`/api/ai-chat`)
- `POST /` - Send message to AI bot
- `GET /admin/conversations` - Get chat conversations (admin)

### WhatsApp (`/api/webhook/whatsapp`)
- `POST /` - WhatsApp webhook
- `GET /admin/conversations` - Get WhatsApp conversations (admin)

### Statistics (`/api/statistics`)
- `GET /dashboard` - Dashboard statistics (admin)
- `GET /courses` - Course analytics (admin)
- `GET /users` - User analytics (admin)

## 🔐 Authentication & Authorization

### JWT Authentication
- Uses JSON Web Tokens for stateless authentication
- Tokens include user ID, role, and expiration
- Automatic token refresh mechanism

### Role-Based Access Control
- **Student**: Access to enrolled courses, personal data
- **Instructor**: Course management, student enrollments
- **Admin**: Full system access, user management

### Middleware
- `authenticateToken`: Verifies JWT tokens
- `authorizeRole`: Checks user permissions
- `validateRequest`: Validates request data

## 📊 Database Models

### User Model
```typescript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  role: String (student|instructor|admin),
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String
  },
  isEmailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Course Model
```typescript
{
  _id: ObjectId,
  title: String,
  description: String,
  instructor: ObjectId (ref: User),
  modules: [{
    title: String,
    lessons: [{
      title: String,
      content: String,
      videoUrl: String,
      duration: Number
    }]
  }],
  price: Number,
  category: ObjectId (ref: Category),
  tags: [ObjectId] (ref: Tag),
  status: String (draft|published|archived),
  createdAt: Date,
  updatedAt: Date
}
```

### Enrollment Model
```typescript
{
  _id: ObjectId,
  student: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  status: String (pending|approved|rejected|completed),
  progress: Number,
  completedLessons: [ObjectId],
  enrolledAt: Date,
  updatedAt: Date
}
```

## 🔧 Key Features

### File Upload System
- **Multer Configuration**: Handles file uploads with size limits
- **File Types**: Images, videos, PDFs, documents
- **Storage**: Local file system with organized directories
- **Security**: File type validation and virus scanning

### Email Service
- **Mailgun Integration**: Primary email service
- **SMTP Fallback**: Nodemailer for backup
- **Templates**: HTML email templates
- **Notifications**: Welcome, password reset, course updates

### AI Integration
- **Gemini API**: Google's AI service for chat functionality
- **Context Management**: Maintains conversation context
- **Response Processing**: Formats AI responses for frontend

### Payment Processing
- **Kuickpay Integration**: Secure payment processing
- **Webhook Handling**: Payment confirmation
- **Receipt Generation**: Automatic receipt creation

### Video Streaming
- **Cloudflare Integration**: CDN for video delivery
- **Custom Streaming**: Adaptive bitrate streaming
- **Progress Tracking**: Video watch progress

## 🧪 Testing

### Test Structure
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full workflow testing

### Test Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:ci       # CI environment
```

## 🔒 Security Features

### Input Validation
- **Joi Schemas**: Request data validation
- **Sanitization**: XSS prevention
- **Type Checking**: TypeScript compilation

### Authentication Security
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Security**: Secure token generation
- **Rate Limiting**: API request throttling

### File Security
- **File Type Validation**: Whitelist approach
- **Size Limits**: Prevent large file uploads
- **Virus Scanning**: File content validation

## 📈 Performance Optimizations

### Database
- **Indexing**: Strategic database indexes
- **Pagination**: Large dataset handling
- **Caching**: Redis integration (planned)

### API Response
- **Compression**: Gzip compression
- **Caching**: Response caching headers
- **Optimization**: Efficient queries

### File Handling
- **Streaming**: Large file streaming
- **CDN**: Cloudflare integration
- **Compression**: Image optimization

## 🚀 Deployment

### Environment Variables
All sensitive configuration should be set via environment variables in production.

### Database Migration
- Automatic schema updates
- Data migration scripts
- Backup procedures

### Monitoring
- **Logging**: Structured logging
- **Error Tracking**: Error monitoring
- **Performance**: Response time monitoring

## 📚 Additional Documentation

- [API Documentation](./API.md) - Detailed API reference
- [Database Schema](./DATABASE.md) - Complete database documentation
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions 