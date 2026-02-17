import { Router } from 'express';
import {
  applyForJob,
  getCandidateApplications,
  getJobApplications,
  updateApplicationStatus,
  deleteApplication,
  applyValidation,
} from '../controllers/application.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, authorizeRoles('CANDIDATE'), applyValidation, applyForJob);
router.get('/candidate/my-applications', authenticate, authorizeRoles('CANDIDATE'), getCandidateApplications);
router.get('/job/:jobId', authenticate, authorizeRoles('EMPLOYER'), getJobApplications);
router.put('/:id/status', authenticate, authorizeRoles('EMPLOYER'), updateApplicationStatus);
router.delete('/:id', authenticate, authorizeRoles('CANDIDATE'), deleteApplication);

export default router;
