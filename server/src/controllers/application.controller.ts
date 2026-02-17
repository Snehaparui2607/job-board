import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendNewApplicationNotification, sendApplicationStatusNotification } from '../utils/email.service.js';

export const applyValidation = [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('resumeUrl').notEmpty().withMessage('Resume is required'),
];

export const applyForJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { jobId, coverLetter, resumeUrl } = req.body;

    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: req.userId!,
          jobId,
        },
      },
    });

    if (existingApplication) {
      res.status(400).json({ error: 'Already applied for this job' });
      return;
    }

    const application = await prisma.application.create({
      data: {
        candidateId: req.userId!,
        jobId,
        coverLetter,
        resumeUrl,
      },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                companyName: true,
                companyLogo: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send email notification to employer (async, non-blocking)
    if (application.job.employer.email) {
      const employerName = application.job.employer.companyName || 
        `${application.job.employer.firstName} ${application.job.employer.lastName}`;
      const candidateName = `${application.candidate.firstName} ${application.candidate.lastName}`;
      
      sendNewApplicationNotification(
        application.job.employer.email,
        employerName,
        candidateName,
        application.job.title,
        application.id
      ).catch(err => console.error('Failed to send email:', err));
    }

    res.status(201).json(application);
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

export const getCandidateApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await prisma.application.findMany({
      where: { candidateId: req.userId },
      orderBy: { appliedDate: 'desc' },
      include: {
        job: {
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
        },
      },
    });

    res.json(applications);
  } catch (error) {
    console.error('Get candidate applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const getJobApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    // Verify job belongs to employer
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.employerId !== req.userId) {
      res.status(403).json({ error: 'Not authorized to view these applications' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      orderBy: { appliedDate: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            location: true,
            bio: true,
            resumeUrl: true,
          },
        },
      },
    });

    res.json(applications);
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (application.job.employerId !== req.userId) {
      res.status(403).json({ error: 'Not authorized to update this application' });
      return;
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        job: {
          include: {
            employer: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    // Send email notification to candidate about status change (async, non-blocking)
    if (updatedApplication.candidate.email) {
      const candidateName = `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`;
      const companyName = updatedApplication.job.employer.companyName || 'the employer';
      
      sendApplicationStatusNotification(
        updatedApplication.candidate.email,
        candidateName,
        updatedApplication.job.title,
        companyName,
        status as 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
      ).catch(err => console.error('Failed to send email:', err));
    }

    res.json(updatedApplication);
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

export const deleteApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({ where: { id } });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (application.candidateId !== req.userId) {
      res.status(403).json({ error: 'Not authorized to delete this application' });
      return;
    }

    await prisma.application.delete({ where: { id } });

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
};
