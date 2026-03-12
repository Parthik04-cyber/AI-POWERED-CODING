# AI-Powered Coding Interview Platform - Setup Guide

This guide will help you set up and run the AI-Powered Coding Interview Platform locally.

## Prerequisites

- Node.js (v18+) - [Download](https://nodejs.org/)
- npm (comes with Node.js)
- MongoDB (v5+) - Official [MongoDB](https://www.mongodb.com/) or use Docker
- Git - [Download](https://git-scm.com/)

## Quick Start (Recommended with Docker)

### 1. Clone or navigate to the project

```bash
cd "d:\AI-Powered Coding\ai-coding-platform"
```

### 2. Create environment files

Copy the example files and configure them:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

### 3. Update environment variables

**backend/.env** - Update these values:
```
JUDGE0_API_KEY=your_judge0_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Start with Docker Compose

```bash
docker-compose up --build
```

This will:
- Start MongoDB on port 27017
- Build and start the backend on port 5000
- Create the database automatically

### 5. Start frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## Manual Setup (Without Docker)

### Step 1: Install MongoDB

#### Option A: Local MongoDB
1. Download MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service
3. Verify it's running on `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env`

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Update .env file with your API keys
# Edit .env file and add:
# - JUDGE0_API_KEY (from https://rapidapi.com/judge0-official/api/judge0-ce)
# - OPENAI_API_KEY (from https://platform.openai.com/api-keys)

# Start development server
npm run dev
```

The server will run on `http://localhost:5000`

**Available Commands:**
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

### Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Update .env.local file (optional - defaults to localhost:5000)

# Start development server
npm run dev
```

The interface will be available at `http://localhost:3000`

**Available Commands:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting

---

## Obtaining API Keys

### Judge0 API Key
1. Go to [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Sign up or login
3. Subscribe to the free plan
4. Copy your API key
5. Add to `JUDGE0_API_KEY` in `backend/.env`

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or login
3. Go to API Keys section
4. Create a new API key
5. Add to `OPENAI_API_KEY` in `backend/.env`

---

## Project Structure

```
ai-coding-platform/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Authentication, etc
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # Main entry point
│   ├── config/              # Database connections
│   ├── package.json         # Dependencies
│   ├── tsconfig.json        # TypeScript config
│   ├── .env                 # Environment variables
│   └── Dockerfile           # Docker configuration
│
├── frontend/                # Next.js React app
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Next.js pages (routes)
│   │   ├── layouts/         # Layout components
│   │   ├── services/        # API client
│   │   ├── styles/          # CSS and Tailwind
│   │   └── utils/           # Zustand stores, helpers
│   ├── public/              # Static assets
│   ├── package.json         # Dependencies
│   ├── next.config.js       # Next.js configuration
│   ├── tailwind.config.js   # Tailwind CSS config
│   └── .env.local           # Frontend environment
│
├── docker-compose.yml       # Docker orchestration
├── README.md                # Project overview
├── .gitignore               # Git ignore rules
└── SETUP.md                 # This file
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (requires token)
- `PUT /api/auth/profile` - Update profile (requires token)

### Problems
- `GET /api/problems` - Get all problems (with pagination)
- `GET /api/problems/categories` - Get problem categories
- `GET /api/problems/stats` - Get statistics
- `GET /api/problems/:id` - Get specific problem
- `POST /api/problems` - Create problem (admin only)
- `PUT /api/problems/:id` - Update problem (admin only)
- `DELETE /api/problems/:id` - Delete problem (admin only)

### Submissions
- `POST /api/submissions` - Submit code solution
- `GET /api/submissions/leaderboard` - Get leaderboard
- `GET /api/submissions/user` - Get user's submissions
- `GET /api/submissions/problem/:problemId` - Get problem submissions
- `GET /api/submissions/:id` - Get submission details

---

## Testing the API

### Using curl

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get all problems:**
```bash
curl http://localhost:5000/api/problems
```

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the API endpoints
3. Test each endpoint

---

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh` should connect
- Check `MONGODB_URI` in `.env`
- For Atlas: Ensure IP whitelist includes your machine

### Backend Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Port Already in Use
```bash
# Kill the process using the port (example for port 5000)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### API Connection Issues
- Ensure `NEXT_PUBLIC_API_URL` is set correctly in `frontend/.env.local`
- Verify backend is running on the specified port
- Check browser console for CORS errors

---

## Development Workflow

### Backend Development
1. Make changes in `backend/src`
2. TypeScript will auto-compile
3. Changes auto-reload with `npm run dev`
4. Check console for errors

### Frontend Development
1. Make changes in `frontend/src`
2. Next.js will hot-reload
3. Check browser console for errors

### Adding a New API Endpoint

1. **Create Model** (if needed): `backend/src/models/NewModel.ts`
2. **Create Service**: `backend/src/services/newService.ts`
3. **Create Controller**: `backend/src/controllers/newController.ts`
4. **Create Routes**: Update `backend/src/routes/newRoutes.ts`
5. **Add to Server**: Update `backend/src/server.ts`
6. **Test in Frontend**: Use `frontend/src/services/api.ts`

---

## Deployment

### Deploy to Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

### Deploy Backend to Heroku
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name
git push heroku main
```

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages in console
3. Check API response in Network tab (DevTools)
4. Verify all environment variables are set correctly

---

## Next Steps

After setup, you can:
1. Create sample coding problems in the admin dashboard
2. Registration and test the platform
3. Integrate with Stripe for premium features
4. Add more programming languages
5. Implement real-time collaboration
6. Add AI-powered code analysis

Happy Coding! 🚀
