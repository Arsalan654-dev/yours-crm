import { Router } from 'express';
import { getEvolutionStatus, connectEvolutionInstance, logoutEvolutionInstance } from '../controllers/evolutionController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

// Get connection status for a client's instance
router.get('/status/:clientId', getEvolutionStatus);

// Fetch base64 QR code to connect the instance
router.get('/connect/:clientId', connectEvolutionInstance);

// Logout / force disconnect the instance
router.delete('/logout/:clientId', logoutEvolutionInstance);

export default router;
