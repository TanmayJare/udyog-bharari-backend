
import express from 'express';
import {
  sendOTP,
  verifyOTP,
  createVendorRegistration,
  createVisitorRegistration,
  exportRegistrationsToExcel,
  getRegistrations,
} from '../controllers/registrationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/vendor', createVendorRegistration);
router.post('/visitor', createVisitorRegistration);
router.get('/', protect, getRegistrations);
router.get('/export', protect, exportRegistrationsToExcel);

export default router;
