# Job Board - Full Stack Application

A modern, feature-rich job board platform built with React, Node.js, Prisma, and NeonDB. Connect employers with talented job seekers through an intuitive, responsive interface.

![Tech Stack](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-7-purple)

## Features

### For Job Seekers (Candidates)
- Browse and search thousands of job listings
- Advanced filtering by job type, location, industry, and more
- Apply to jobs with resume and cover letter
- Track application status in real-time
- Manage profile and saved resumes
- Mobile-responsive design

### For Employers
- Post and manage job listings
- Review applications from candidates
- Update application status (Pending/Reviewed/Accepted/Rejected)
- View detailed candidate profiles and resumes
- Analytics dashboard for job postings

### General Features
- Secure JWT-based authentication
- Role-based access control (Candidate/Employer)
- Clean, modern UI with shadcn/ui components
- Fully responsive design for all devices
- RESTful API architecture
- PostgreSQL database with Prisma ORM

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **shadcn/ui** for beautiful UI components
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **PostgreSQL** (NeonDB) as database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for request validation

## Project Structure

```
job-board/
├── src/                    # Frontend source
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   └── Navbar.tsx     # Navigation component
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/             # Page components
│   │   ├── auth/          # Login & Register
│   │   ├── jobs/          # Job listings & details
│   │   └── dashboard/     # User dashboards
│   ├── services/          # API service layer
│   ├── types/             # TypeScript types
│   ├── lib/               # Utility functions
│   └── App.tsx            # Main app component
│
├── server/                 # Backend source
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & validation
│   │   ├── config/        # Database config
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── .env               # Environment variables
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or NeonDB account)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd job-board
```

2. **Install Frontend Dependencies**
```bash
npm install
```

3. **Install Backend Dependencies**
```bash
cd server
npm install
```

4. **Set up Environment Variables**

Create `server/.env` file:
```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Create `.env` file in root:
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Set up Database**

If using NeonDB:
- Sign up at https://neon.tech
- Create a new project
- Copy the connection string to `DATABASE_URL` in `server/.env`

Run Prisma migrations:
```bash
cd server
npm run prisma:migrate
```

Generate Prisma Client:
```bash
npm run prisma:generate
```

### Running the Application

1. **Start Backend Server**
```bash
cd server
npm run dev
```
Server runs on http://localhost:5000

2. **Start Frontend (in a new terminal)**
```bash
npm run dev
```
Frontend runs on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job (employer only)
- `DELETE /api/jobs/:id` - Delete job (employer only)
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs

### Applications
- `POST /api/applications` - Apply for job (candidate only)
- `GET /api/applications/candidate/my-applications` - Get candidate's applications
- `GET /api/applications/job/:jobId` - Get job applications (employer only)
- `PUT /api/applications/:id/status` - Update application status (employer only)
- `DELETE /api/applications/:id` - Withdraw application (candidate only)

### Users
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID

## Database Schema

### User Model
- id, email, password (hashed)
- firstName, lastName, role
- phoneNumber, location, bio
- resumeUrl (for candidates)
- companyName, companyLogo, website (for employers)

### Job Model
- id, title, description
- requirements, responsibilities
- location, salary, jobType
- experienceLevel, industry, skills
- isFeatured, isActive
- postedDate, closingDate
- employerId (relation to User)

### Application Model
- id, coverLetter, resumeUrl
- status (PENDING/REVIEWED/ACCEPTED/REJECTED)
- appliedDate
- candidateId (relation to User)
- jobId (relation to Job)

## Features in Detail

### Search & Filtering
- Full-text search across job titles and descriptions
- Filter by job type (Full-time, Part-time, Contract, etc.)
- Filter by location and industry
- Pagination support

### Authentication & Security
- Secure JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Protected routes on frontend and backend

### Responsive Design
- Mobile-first approach
- Works seamlessly on phones, tablets, and desktops
- Optimized UI for all screen sizes

## Deployment

### Frontend (Netlify/Vercel)
1. Build the frontend:
```bash
npm run build
```

2. Deploy `dist/` folder to Netlify or Vercel

3. Set environment variables:
   - `VITE_API_URL` = your backend URL

### Backend (Heroku/Railway/Render)
1. Push code to GitHub

2. Connect to your hosting platform

3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT`
   - `CLIENT_URL`

4. Platform will automatically build and deploy

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@jobboard.com or open an issue in the repository.

## Acknowledgments

- shadcn/ui for beautiful components
- Lucide for amazing icons
- NeonDB for serverless PostgreSQL
- Vercel for hosting inspiration

---

Built with by Your Team Name
