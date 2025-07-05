# MedHome

MedHome is a comprehensive medical education platform with course management, blog functionality, and administrative features.

## Project Structure

The project is divided into two main parts:
- `frontend`: React application built with TypeScript, Vite, and Tailwind CSS
- `backend`: Node.js/Express API with MongoDB database

## Development Guidelines

### UI/UX Consistency

We maintain strict UI/UX consistency throughout the application:

1. **Layout Components**:
   - Always use existing header and sidebar components
   - Admin pages must use `MainLayout` component
   - Public medical pages use `MedicMenu` and `MedicFooter`

2. **Color Scheme**:
   - Always use colors defined in `tailwind.config.js`
   - Primary: `#3390CE`
   - Secondary: `#E5CA2C`
   - Background: `#EDEDED`
   - Neutral scale: From 100 (lightest) to 900 (darkest)

For detailed guidelines, please refer to [CONTRIBUTING.md](./CONTRIBUTING.md).

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medhome
JWT_SECRET=your_jwt_secret
```

## Features

- User authentication and role-based access control
- Course management and enrollment
- Blog creation and management
- Admin dashboard with analytics
- Payment processing
- **Public AI Chat Bot**: Floating chat bot available on all public pages. Users can ask any question about courses, pricing, instructors, or registration/login help. All conversations are stored in the database and can be viewed by admins.
- **Course AI Chat Bot**: AI assistant specifically for enrolled students on course content pages. Provides medical education support with direct Gemini API integration. Features maximize/minimize functionality and real-time responses.
- **WhatsApp Chatbot**: Users can send messages to a configured WhatsApp number. Incoming messages are received via webhook and stored in the database, grouped by phone number.

### Public AI Chat Bot

- **Frontend**: Floating chat bot on public pages for unauthenticated users.
- **Backend**: All user and bot messages are stored in the database, grouped by user IP address.
- **Admin UI**: Admins can view all public AI chat conversations by IP address via the sidebar link "Public AI Chat". Each conversation shows the full message history.
- **API Endpoints**:
  - `POST /api/ai-chat`: Send a message to the AI bot (public, stores conversation)
  - `GET /api/admin/public-ai-chat/conversations`: List all conversation IPs (admin)
  - `GET /api/admin/public-ai-chat/conversations/:ipAddress`: Get all messages for a conversation (admin)

### Course AI Chat Bot

- **Purpose**: AI assistant specifically designed for enrolled students on course content pages (`/courses/{courseId}/learn`)
- **Access**: Only available to students with approved enrollment status
- **Features**:
  - Floating chat icon in bottom-right corner
  - Chat window spans full width and half height of screen
  - Maximize/minimize functionality for full-screen mode
  - Real-time responses using Gemini 1.5 Flash API
  - Medical education-focused prompts
- **Technology**: Direct frontend integration with Google Gemini API
- **No Backend Storage**: Conversations are not stored in database for privacy
- **Environment Variable**: Requires `VITE_GEMINI_API_KEY` in frontend `.env`

### WhatsApp Chatbot

- **Integration**: Users can send messages to a configured WhatsApp number. Incoming messages are received via webhook and stored in the database, grouped by phone number.
- **Bot Reply**: The system can automatically reply to incoming WhatsApp messages (currently a static reply, but can be extended to use AI).
- **Admin UI**: Admins can view all WhatsApp conversations by phone number via the sidebar link "WhatsApp Conversations". Each conversation shows the full message history.
- **API Endpoints**:
  - `POST /api/whatsapp/webhook`: Receive WhatsApp messages (webhook)
  - `GET /api/admin/whatsapp/conversations`: List all conversation phone numbers (admin)
  - `GET /api/admin/whatsapp/conversations/:phoneNumber`: Get all messages for a conversation (admin)

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
