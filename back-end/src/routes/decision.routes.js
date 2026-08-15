import { Router } from 'express';
import { makeDecision } from '../controllers/decision.controller.js';

const router = Router();

router.post('/', makeDecision);
router.post('/decide', makeDecision);

export default router;
