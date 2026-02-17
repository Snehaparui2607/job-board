import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const createJobValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('jobType').isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']).withMessage('Invalid job type'),
  body('experienceLevel').notEmpty().withMessage('Experience level is required'),
  body('industry').notEmpty().withMessage('Industry is required'),
];

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      salary,
      jobType,
      experienceLevel,
      industry,
      skills,
      closingDate,
    } = req.body;

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements,
        responsibilities,
        location,
        salary,
        jobType,
        experienceLevel,
        industry,
        skills: skills || [],
        closingDate: closingDate ? new Date(closingDate) : null,
        employerId: req.userId!,
      },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            companyLogo: true,
            location: true,
          },
        },
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const getAllJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      search, 
      jobType, 
      location, 
      industry, 
      experienceLevel,
      page = '1',
      limit = '10',
      featured
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { industry: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (jobType) where.jobType = jobType;
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (industry) where.industry = { contains: industry as string, mode: 'insensitive' };
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (featured === 'true') where.isFeatured = true;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { postedDate: 'desc' },
        include: {
          employer: {
            select: {
              id: true,
              companyName: true,
              companyLogo: true,
              location: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            companyLogo: true,
            location: true,
            website: true,
            bio: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.employerId !== req.userId) {
      res.status(403).json({ error: 'Not authorized to update this job' });
      return;
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: req.body,
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            companyLogo: true,
            location: true,
          },
        },
      },
    });

    res.json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.employerId !== req.userId) {
      res.status(403).json({ error: 'Not authorized to delete this job' });
      return;
    }

    await prisma.job.delete({ where: { id } });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

export const getEmployerJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobs = await prisma.job.findMany({
      where: { employerId: req.userId },
      orderBy: { postedDate: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};
