# Quick Start Guide

Get the Job Board running locally in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- A NeonDB account (free tier works great)

## 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

## 2. Setup Database

1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy your connection string

## 3. Configure Environment Variables

Create `server/.env`:
```env
DATABASE_URL="your-neondb-connection-string-here"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Create `.env` in root:
```env
VITE_API_URL=http://localhost:5000/api
```

## 4. Setup Database Schema

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

## 5. Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 6. Access the Application

Open your browser and go to:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

## 7. Create Your First Account

1. Click "Sign Up"
2. Choose "Employer" or "Job Seeker"
3. Fill in the form
4. Start exploring!

## Test Accounts (Optional)

You can create test accounts to explore both roles:

**Employer Account:**
- Create account with role: Employer
- Post jobs from the dashboard
- Review applications

**Job Seeker Account:**
- Create account with role: Candidate
- Browse and apply to jobs
- Track your applications

## Common Issues

### Port already in use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Or change port in server/.env
PORT=5001
```

### Database connection error
- Check your DATABASE_URL is correct
- Ensure you copied the full connection string from NeonDB
- Make sure it includes `?sslmode=require` at the end

### Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions
- Explore the code and customize to your needs

## Need Help?

- Check the console for error messages
- Review the README for detailed setup
- Open an issue if you encounter problems

Happy coding!
