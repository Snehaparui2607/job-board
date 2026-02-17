import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;

// Create PostgreSQL pool
const pool = new pg.Pool({ connectionString });

// Create adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter for Prisma 7
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create employer user
  const employerPassword = await bcrypt.hash('password123', 10);
  const employer = await prisma.user.upsert({
    where: { email: 'employer@example.com' },
    update: {},
    create: {
      email: 'employer@example.com',
      password: employerPassword,
      firstName: 'Tech',
      lastName: 'Corp',
      role: 'EMPLOYER',
      companyName: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      website: 'https://techcorp.example.com',
      bio: 'Leading technology company specializing in innovative software solutions.',
    },
  });

  console.log('✅ Created employer:', employer.email);

  // Create candidate user
  const candidatePassword = await bcrypt.hash('password123', 10);
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@example.com' },
    update: {},
    create: {
      email: 'candidate@example.com',
      password: candidatePassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CANDIDATE',
      location: 'New York, NY',
      bio: 'Experienced software developer with 5 years in web development.',
      resumeUrl: 'https://example.com/resume.pdf',
    },
  });

  console.log('✅ Created candidate:', candidate.email);

  // Create sample jobs
  const jobs = [
    {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced Full Stack Developer to join our growing team. You will work on cutting-edge web applications using modern technologies.',
      requirements: '- 5+ years of experience in web development\n- Expert in React and Node.js\n- Experience with TypeScript\n- Strong understanding of RESTful APIs\n- Experience with PostgreSQL or similar databases',
      responsibilities: '- Design and develop scalable web applications\n- Collaborate with cross-functional teams\n- Write clean, maintainable code\n- Mentor junior developers\n- Participate in code reviews',
      location: 'San Francisco, CA (Hybrid)',
      salary: '$120,000 - $160,000',
      jobType: 'FULL_TIME' as const,
      experienceLevel: 'Senior',
      industry: 'Technology',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Git'],
      isFeatured: true,
      employerId: employer.id,
    },
    {
      title: 'Frontend Developer',
      description: 'Join our team as a Frontend Developer and help build beautiful, responsive user interfaces.',
      requirements: '- 3+ years of frontend development experience\n- Proficiency in React\n- Experience with modern CSS frameworks\n- Understanding of web performance optimization',
      responsibilities: '- Develop responsive web applications\n- Implement pixel-perfect designs\n- Optimize application performance\n- Collaborate with designers and backend developers',
      location: 'Remote',
      salary: '$90,000 - $120,000',
      jobType: 'REMOTE' as const,
      experienceLevel: 'Mid-Level',
      industry: 'Technology',
      skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TailwindCSS'],
      isFeatured: true,
      employerId: employer.id,
    },
    {
      title: 'Backend Developer',
      description: 'Looking for a Backend Developer to build and maintain robust server-side applications.',
      requirements: '- 4+ years of backend development experience\n- Strong knowledge of Node.js and Express\n- Experience with database design\n- Understanding of microservices architecture',
      responsibilities: '- Design and implement APIs\n- Optimize database queries\n- Ensure application security\n- Write comprehensive tests',
      location: 'Austin, TX',
      salary: '$100,000 - $140,000',
      jobType: 'FULL_TIME' as const,
      experienceLevel: 'Mid-Level',
      industry: 'Technology',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker'],
      isFeatured: false,
      employerId: employer.id,
    },
    {
      title: 'UI/UX Designer',
      description: 'We are seeking a talented UI/UX Designer to create intuitive and engaging user experiences.',
      requirements: '- 3+ years of UI/UX design experience\n- Proficiency in Figma or similar tools\n- Strong portfolio showcasing web and mobile designs\n- Understanding of user-centered design principles',
      responsibilities: '- Create wireframes and prototypes\n- Design user interfaces\n- Conduct user research\n- Collaborate with developers',
      location: 'New York, NY',
      salary: '$85,000 - $115,000',
      jobType: 'FULL_TIME' as const,
      experienceLevel: 'Mid-Level',
      industry: 'Design',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
      isFeatured: true,
      employerId: employer.id,
    },
    {
      title: 'DevOps Engineer',
      description: 'Join our DevOps team to build and maintain our cloud infrastructure.',
      requirements: '- 4+ years of DevOps experience\n- Experience with AWS or Azure\n- Knowledge of CI/CD pipelines\n- Experience with Docker and Kubernetes',
      responsibilities: '- Manage cloud infrastructure\n- Implement CI/CD pipelines\n- Monitor system performance\n- Ensure security best practices',
      location: 'Seattle, WA',
      salary: '$110,000 - $150,000',
      jobType: 'FULL_TIME' as const,
      experienceLevel: 'Senior',
      industry: 'Technology',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Linux'],
      isFeatured: false,
      employerId: employer.id,
    },
    {
      title: 'Software Engineering Intern',
      description: 'Great opportunity for students to gain real-world software development experience.',
      requirements: '- Currently pursuing CS degree\n- Basic knowledge of programming\n- Eager to learn\n- Good communication skills',
      responsibilities: '- Work on real projects\n- Learn from senior developers\n- Participate in team meetings\n- Write and test code',
      location: 'Boston, MA',
      salary: '$25 - $35/hour',
      jobType: 'INTERNSHIP' as const,
      experienceLevel: 'Entry Level',
      industry: 'Technology',
      skills: ['JavaScript', 'Python', 'Git', 'Problem Solving'],
      isFeatured: false,
      employerId: employer.id,
    },
  ];

  for (const jobData of jobs) {
    const job = await prisma.job.create({
      data: jobData,
    });
    console.log('✅ Created job:', job.title);
  }

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('Employer: employer@example.com / password123');
  console.log('Candidate: candidate@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
