import { Router } from 'express';
import { getClientConfigForN8n } from '../controllers/adminController';

const router = Router();

// This endpoint is used by n8n to fetch client config
// We don't use strict user authentication here since n8n calls it, 
// but in production, we should probably protect it with an API key.
router.get('/get-client-config', getClientConfigForN8n);

export default router;
