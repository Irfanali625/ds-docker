import { Router } from 'express';
import { PhoneValidationController } from '../controllers/phoneValidationController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const phoneValidationController = new PhoneValidationController();

router.use(authenticateToken);

router.post('/single', (req, res) =>
  phoneValidationController.validateSingle(req as any, res)
);

router.post('/bulk', (req, res) =>
  phoneValidationController.validateBulk(req as any, res)
);

router.post('/csv', upload.single('csvFile'), (req, res) =>
  phoneValidationController.validateCSV(req as any, res)
);

router.get('/history', (req, res) =>
  phoneValidationController.getHistory(req as any, res)
);

router.get('/history/:id/download', (req, res) =>
  phoneValidationController.downloadHistoryFile(req as any, res)
);

export default router;
