export type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  resumeUrl?: string;
  companyName?: string;
  companyLogo?: string;
  website?: string;
  createdAt: Date;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  salary?: string;
  jobType: JobType;
  experienceLevel: string;
  industry: string;
  skills: string[];
  isFeatured: boolean;
  isActive: boolean;
  postedDate: Date;
  closingDate?: Date;
  employerId: string;
  employer: {
    id: string;
    companyName?: string;
    companyLogo?: string;
    location?: string;
    website?: string;
    bio?: string;
  };
  _count?: {
    applications: number;
  };
}

export interface Application {
  id: string;
  coverLetter?: string;
  resumeUrl: string;
  status: ApplicationStatus;
  appliedDate: Date;
  candidateId: string;
  jobId: string;
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    location?: string;
    bio?: string;
    resumeUrl?: string;
  };
  job?: Job;
}
