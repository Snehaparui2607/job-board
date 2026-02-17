import { Router } from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerJobs,
  createJobValidation,
} from '../controllers/job.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getAllJobs);
router.get('/employer/my-jobs', authenticate, authorizeRoles('EMPLOYER'), getEmployerJobs);
router.get('/:id', getJobById);
router.post('/', authenticate, authorizeRoles('EMPLOYER'), createJobValidation, createJob);
router.put('/:id', authenticate, authorizeRoles('EMPLOYER'), updateJob);
router.delete('/:id', authenticate, authorizeRoles('EMPLOYER'), deleteJob);

export default router;
