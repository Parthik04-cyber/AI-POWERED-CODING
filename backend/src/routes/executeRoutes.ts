import express from 'express';
import * as submissionController from '../controllers/submissionController';

const router = express.Router();

router.post('/', submissionController.executeCode);

export default router;